import json, os, re, boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import func
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from botocore.exceptions import NoCredentialsError, ClientError

### Set up the databases ###

class DbConfig(object):
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://admin:weareteamm7@malariastat.czmrkezas6nx.us-east-2.rds.amazonaws.com:3306/SiteMgmt_db'
    SQLALCHEMY_BINDS = {
        'sitemgmt_db': SQLALCHEMY_DATABASE_URI,  # default bind
    }
    SQLALCHEMY_TRACK_MODIFICATIONS = False

app = Flask(__name__)
app.config.from_object(DbConfig)
app.json.sort_keys = False
db = SQLAlchemy(app)
CORS(app)

class Admin(db.Model):
    __bind_key__ = 'sitemgmt_db'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    isDeleted = db.Column(db.Integer, default=False, nullable=False)    # soft deletion only

    actions = db.relationship('Action', back_populates='admin')

    def serialize(self):
        return {
            'adminId': self.id,
            'email': self.email,
            'isDeleted': self.isDeleted
        }

class Feedback(db.Model):
    __bind_key__ = 'sitemgmt_db'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    text = db.Column(db.Text, nullable=False)
    submission_date = db.Column(db.DateTime(timezone=True), default=func.now())
    isDeleted = db.Column(db.Integer, default=False, nullable=False)    # soft deletion only

    actions = db.relationship('Action', back_populates='feedback')

    def serialize(self):
        return{
            'feedbackId': self.id,
            'name': self.name,
            'email': self.email,
            'text': self.text,
            'submissionDate': self.submission_date,
            'isDeleted': self.isDeleted
        }

class Action(db.Model):
    __bind_key__ = 'sitemgmt_db'
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)
    feedback_id = db.Column(db.Integer, db.ForeignKey('feedback.id'), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    action_date = db.Column(db.DateTime(timezone=True), default=func.now())

    admin = db.relationship('Admin', back_populates='actions')
    feedback = db.relationship('Feedback', back_populates='actions')

    def serialize(self):
        return{
            'actionId': self.id,
            'adminId': self.admin_id,
            'feedbackId': self.feedback_id,
            'comment': self.comment,
            'actionDate': self.action_date
        }    

def publish_to_sns(message: str):
    topic_arn = 'arn:aws:sns:us-east-2:073127164341:delete_admin'
    sns = boto3.client('sns', region_name='us-east-2')  

    response = sns.publish(
        TopicArn=topic_arn,
        Message=message
    )

    return response

# NOTE: This route is needed for the default EB health check route
@app.route('/')  
def home():
    return "Ok"

### Reset database ###

@app.route('/api/reset/sitemgmt/', methods=['PUT'])
def reset_sitemgmt_db():
    engine = db.get_engine(app, bind='sitemgmt_db')
    if engine:
        metadata = db.MetaData()
        metadata.reflect(bind=engine)
        metadata.drop_all(bind=engine)
        metadata.create_all(bind=engine)
        return "Successfully reset the sitemgmt database"
    else:
        return "Error resetting the sitemgmt database", 501

### Admin resource ###

@app.route('/api/admin/', methods=['GET'])
def get_all_admin():
    admin_list = Admin.query.all()
    return jsonify([admin.serialize() for admin in admin_list])

@app.route('/api/admin/<int:admin_id>/', methods=['GET'])
def get_admin(admin_id):
    admin = db.session.get(Admin, admin_id)

    if not admin:
        return "Admin not found", 404
    if admin.isDeleted == True:
        return "Admin not activated", 400
    
    return jsonify(admin.serialize())

@app.route('/api/admin/check/', methods=['POST'])
def check_email():
    email = request.json.get('email')

    if email is None:
        return "Email cannot be null", 400

    email = email.lower()
    admin = Admin.query.filter(func.lower(Admin.email) == email).first()

    if not admin:
        return "Email not found", 404
    if admin.isDeleted == True:
        return "Admin not activated", 400
    
    return jsonify(admin.serialize())

@app.route('/api/admin/', methods=['POST'])
def add_admin():
    email = request.json.get('email')
    
    if email is None:
        return "Email cannot be null", 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return "Invalid email format", 400
    else:
        email = email.lower()

    admin = Admin.query.filter(func.lower(Admin.email) == email).first()
    
    if not admin:
        new_admin = Admin(email=email)
        db.session.add(new_admin)
        db.session.commit()
        return "Successfully added an admin", 201
    else:
        if admin.isDeleted == True:
            admin.isDeleted = False
            db.session.commit()
            return "Successfully reactivated a deleted admin"
        else:
            return "admin already exists and is activated", 400

@app.route('/api/admin/<int:admin_id>/', methods=['DELETE'])
def delete_admin(admin_id):
    admin = db.session.get(Admin, admin_id)

    if admin:
        admin.isDeleted = True
        try:
            db.session.commit()
            try:
                publish_to_sns(f'Admin {admin.email} has been deleted')
            except (NoCredentialsError, ClientError) as e:
                print(f"An error occurred while publishing to SNS: {e}")
            return "Successfully deactivated an admin"
        except (IntegrityError, SQLAlchemyError):
            db.session.rollback()
            return "Error deactivating an admin", 501
    else:
        return "Admin not found", 404

@app.route('/api/admin/<int:admin_id>/', methods=['PUT'])
def update_admin(admin_id):
    admin = db.session.get(Admin, admin_id)
    new_email = request.json.get('email')

    if admin:
        if not new_email:
            if admin.isDeleted == True:
                admin.isDeleted = False
                db.session.commit()
                return "Successfully reactivated a deleted admin"
            else:
                return "Email cannot be null", 400

        if not re.match(r"[^@]+@[^@]+\.[^@]+", new_email):
            return "Invalid email format", 400
        else:
            new_email = new_email.lower()

        if Admin.query.filter(func.lower(Admin.email) == new_email).first():
            return "Email already exists", 400

        admin.email = new_email

        if admin.isDeleted == True:
            admin.isDeleted = False
            db.session.commit()
            return "Successfully activated an admin and updated the email"
        else:
            db.session.commit()
            return "Successfully updated an admin email"

    else:
        return "Admin not found", 404

### Feedback resource ###

@app.route('/api/feedback/', methods=['POST'])
def add_feedback():
    feedback = request.get_json()
    text = feedback.get('text')
    email = feedback.get('email')

    if text is None:
        return "Text cannot be null", 400
        
    if email:
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return "Invalid email format", 400
        else:
            email = email.lower()

    new_feedback = Feedback(
        name=feedback.get('name'), 
        email=email,
        text=text
        )

    db.session.add(new_feedback)
    db.session.commit()

    return "Successfully submitted feedback", 201

@app.route('/api/feedback/<int:feedback_id>/')
def get_feedback(feedback_id):
    feedback = Feedback.query.filter_by(id=feedback_id, isDeleted=False).first()

    if not feedback:
        return "Feedback not found or deleted", 404
    else:
        return jsonify(feedback.serialize())

@app.route('/api/feedback/<int:feedback_id>/', methods=['PUT'])
def update_feedback(feedback_id):
    feedback = Feedback.query.filter_by(id=feedback_id, isDeleted=False).first()
    if not feedback:
        return "Feedback not found or deleted", 404

    new_feedback_data = request.get_json()
    if not new_feedback_data:
        return "No data provided", 400
    
    new_email = new_feedback_data.get('email')
    if new_email: 
        if not re.match(r"[^@]+@[^@]+\.[^@]+", new_email):
            return "Invalid email format", 400
        else:
            new_email = new_email.lower()

    feedback.name = new_feedback_data.get('name') \
        if new_feedback_data.get('name') else feedback.name
    feedback.email = new_email \
        if new_email else feedback.email
    feedback.text = new_feedback_data.get('text') \
        if new_feedback_data.get('text') else feedback.text

    try:
        db.session.commit()
        return "Successfully updated feedback"
    except (IntegrityError, SQLAlchemyError):
        db.session.rollback()
        return "Error updating feedback", 501

@app.route('/api/feedback/<int:feedback_id>/', methods=['DELETE'])
def delete_feedback(feedback_id):
    feedback = Feedback.query.filter_by(id=feedback_id, isDeleted=False).first()

    if feedback:
        feedback.isDeleted = True
        feedback.name = '<Anonymized for deletion>'
        feedback.email = '<Anonymized for deletion>'
        try:
            db.session.commit()
            return "Successfully deleted feedback"
        except (IntegrityError, SQLAlchemyError):
            db.session.rollback()
            return "Error deleting feedback", 501
    else:
        return "Feedback not found or already deleted", 404

### Feedback resource only authorized for admin ###

@app.route('/api/admin/feedbackonly/')
def get_all_feedback_only():
    feedback_list = Feedback.query.filter_by(isDeleted=False).all()
    return jsonify([feedback.serialize() for feedback in feedback_list])

@app.route('/api/admin/feedback/')
def get_all_feedback():
    feedback_list = db.session.query(Feedback, Action, Admin) \
        .select_from(Feedback) \
        .join(Action, isouter=True) \
        .join(Admin, isouter=True) \
        .all()

    feedback_entries = [{
        'feedbackId': feedback.id,
        'submissionDate': feedback.submission_date,
        'name': feedback.name,
        'email': feedback.email,
        'text': feedback.text,
        'isDeleted': feedback.isDeleted,
        'actionedBy': admin.email if admin else None,
        'actionDate': action.action_date if action else None,
        'actionComment': action.comment if action else None
    } for feedback, action, admin in feedback_list]
    
    return jsonify(feedback_entries)

@app.route('/api/admin/feedback/<int:feedback_id>/action/')
def get_feedback_action(feedback_id):
    feedback = Feedback.query.filter_by(id=feedback_id, isDeleted=False).first()

    if not feedback:
        return "Feedback not found or deleted", 404

    action_list = Action.query.filter_by(feedback_id=feedback_id).all()

    return jsonify([action.serialize() for action in action_list])

### Action resource only authorized for admin ###

@app.route('/api/admin/action/<int:action_id>/')
def get_action(action_id):
    action = db.session.get(Action, action_id)

    if not action:
        return "Action not found", 404
    else:
        return jsonify(action.serialize())

@app.route('/api/admin/<int:admin_id>/action/')
def get_admin_action(admin_id):
    admin = Admin.query.filter_by(id=admin_id, isDeleted=False).first()

    if not admin:
        return "Admin not found or deleted", 404

    action_list = Action.query.filter_by(admin_id=admin_id).all()

    return jsonify([action.serialize() for action in action_list])

@app.route('/api/admin/action/')
def get_all_action():
    action_list = db.session.query(Action, Feedback, Admin) \
        .select_from(Action) \
        .join(Feedback, isouter=True) \
        .join(Admin, isouter=True) \
        .all()

    actions = [{
        'actionId': action.id,
        'adminId': action.admin_id if admin else None,
        'admin': admin.email if admin else None,
        'actionDate': action.action_date,
        'actionComment': action.comment,
        'feedbackId': feedback.id if feedback else None,
        'feedbackSubmissionDate': feedback.submission_date if feedback else None,
        'feedbackName': feedback.name if feedback else None,
        'feedbackEmail': feedback.email if feedback else None,
        'feedbackText': feedback.text if feedback else None
    } for action, feedback, admin in action_list]
    
    return jsonify(actions)

@app.route('/api/admin/<int:admin_id>/feedback/<int:feedback_id>/', methods=['POST'])
def add_action(admin_id, feedback_id):
    comment = request.json.get('comment')
    if not comment:
        return "Comment cannot be null", 400

    admin = db.session.get(Admin, admin_id)
    if not (admin and db.session.get(Feedback, feedback_id)):
        return "admin_id or feedback_id not found", 404
    if admin.isDeleted == True:
        return "admin is deactivated", 400

    new_action = Action(
        admin_id=admin_id,
        feedback_id=feedback_id,
        comment=comment
        )

    db.session.add(new_action)
    db.session.commit()

    return "Successfully added a feedback action", 201

@app.route('/api/admin/action/<int:action_id>/', methods=['PUT'])
def update_action(action_id):
    action = db.session.get(Action, action_id)
    if not action:
        return "Action not found", 404

    new_comment = request.json.get('comment')
    if not new_comment:
        return "Comment cannot be null", 400

    action.comment = new_comment

    try:
        db.session.commit()
        return "Successfully updated action"
    except (IntegrityError, SQLAlchemyError):
        db.session.rollback()
        return "Error updating action", 501

@app.route('/api/admin/action/<int:action_id>/', methods=['DELETE'])
def delete_action(action_id):
    action = db.session.get(Action, action_id)

    if action:
        db.session.delete(action)
        try:
            db.session.commit()
            return "Successfully deleted action"
        except (IntegrityError, SQLAlchemyError):
            db.session.rollback()
            return "Error deleting action", 501
    else:
        return "Action not found", 404

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    app.run(debug=True, port=8080)
