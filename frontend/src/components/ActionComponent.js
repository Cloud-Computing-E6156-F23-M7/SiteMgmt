import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionTableComponent from "./ActionTableComponent";

const ActionComponent = () => {
    const [actions, setActions] = useState([]);
    const [newAction, setNewAction] = useState({ adminId: '', feedbackId: '', comment: '' });
    const [updateAction, setUpdateAction] = useState({ actionId: '', comment: '' });
    const [searchActionId, setSearchActionId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchActions();
    }, []);

    // useEffect(() => {
    //     if (searchActionId) {
    //         const foundAction = actions.filter(action => action.actionId.toString() === searchActionId);
    //         setActions(foundAction);
    //     } else {
    //         fetchActions();
    //     }
    // }, [searchActionId, actions]);

    // Function to fetch all actions
    const fetchActions = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/admin/action/`)
            .then(response => {
                setActions(response.data);
                setError(null);
            })
            .catch(error => {
                console.error('Error fetching actions:', error);
                setError('Failed to fetch actions');
            });
    };
    const handleInputChange = (event, type) => {
        const { name, value } = event.target;
        if (type === 'new') {
            setNewAction({ ...newAction, [name]: value });
        } else if (type === 'update') {
            setUpdateAction({ ...updateAction, [name]: value });
        }
    };

    const handleAddAction = (event) => {
    event.preventDefault();
    console.log('Attempting to add action:', newAction); // Debugging
    axios.post(`${process.env.REACT_APP_API_URL}/admin/${newAction.adminId}/feedback/${newAction.feedbackId}/`,
        { comment: newAction.comment })
        .then(response => {
            console.log('Add action response:', response); // Debugging
            fetchActions();
            document.getElementById("refresh").click();
            setNewAction({ adminId: '', feedbackId: '', comment: '' });
        })
        .catch(error => {
            console.error('Error adding action:', error);
            setError('Failed to add action');
            console.log('Failed request details:', error.response); // Additional debugging
        });
    };


    const handleUpdateAction = (event) => {
        event.preventDefault();
        axios.put(`${process.env.REACT_APP_API_URL}/admin/action/${updateAction.actionId}/`, { comment: updateAction.comment })
        .then(() => {
            fetchActions(); // Refresh the actions list
            document.getElementById("refresh").click();
            setUpdateAction({ actionId: '', comment: '' }); // Reset the form
        })
        .catch(error => {
            console.error('Error updating action:', error);
            setError('Failed to update action');
        });
};

//     const handleDeleteAction = (actionId) => {
//         axios.delete(`${process.env.REACT_APP_API_URL}/admin/action/${actionId}/`)
//         .then(() => {
//             fetchActions(); // Refresh the actions list
//         })
//         .catch(error => {
//             console.error('Error deleting action:', error);
//             setError('Failed to delete action');
//         });
// };


    return (
        <div>
            <h5 class="card-title">Action form</h5>
            <p class="card-text">Add any action by typing your text in the form below.</p>

            {/* Form to Add New Action */}
            <form onSubmit={handleAddAction} className="action-form">
                <div className="mb-3">
                    <label class="form-label">Admin ID</label>
                    <input
                        type="number"
                        class="form-control"
                        id="adminId"
                        name="adminId"
                        value={newAction.adminId}
                        onChange={(e) => handleInputChange(e, 'new')}></input>
                </div>
                <div className="mb-3">
                    <label class="form-label">Feedback ID</label>
                    <input
                        type="number"
                        class="form-control"
                        id="feedbackId"
                        name="feedbackId"
                        value={newAction.feedbackId}
                        onChange={(e) => handleInputChange(e, 'new')}></input>
                </div>
                <div className="mb-3">
                    <label class="form-label">Comment</label>
                    <textarea
                        class="form-control"
                        rows="3"
                        id="comment"
                        name="comment"
                        value={newAction.comment}
                        onChange={(e) => handleInputChange(e, 'new')}></textarea>
                </div>
                <button className="btn btn-primary" type="submit">Add Action</button>
            </form>
            <br></br>
            <h5 className="card-title">Update Action</h5>
            {/* Form to Update an Action */}
            <form onSubmit={handleUpdateAction} className="action-form">
                <div className="mb-3">
                    <label class="form-label">Action ID</label>
                    <input
                        type="number"
                        class="form-control"
                        id="updateActionId"
                        name="actionId"
                        value={updateAction.actionId}
                        onChange={(e) => handleInputChange(e, 'update')} />
                </div>
                <div class="mb-3">
                    <label class="form-label">New Comment</label>
                    <textarea
                        id="updateComment"
                        class="form-control"
                        name="comment"
                        value={updateAction.comment}
                        onChange={(e) => handleInputChange(e, 'update')}></textarea>
                </div>
                <button class="btn btn-primary" type="submit">Update Action</button>
            </form>
        </div>
    );
};

export default ActionComponent;

