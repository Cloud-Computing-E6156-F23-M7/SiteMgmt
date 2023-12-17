import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeedbackComponent = () => {
    const [feedbacks, setFeedbacks] = useState([]); // Store all feedbacks
    const [displayedFeedbacks, setDisplayedFeedbacks] = useState([]); // Store feedbacks to be displayed
    const [searchFeedbackId, setSearchFeedbackId] = useState(''); // Search ID
    const [newFeedback, setNewFeedback] = useState({ name: '', email: '', text: '' }); // New feedback form state
    const [formError, setFormError] = useState(null); // Error for feedback form

    // Fetch all feedbacks initially
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/admin/feedback/`)
            .then(response => {
                setFeedbacks(response.data);
                setDisplayedFeedbacks(response.data);
            })
            .catch(error => console.error('Error:', error));
    }, []);

    // // Update displayed feedbacks based on search input
    // useEffect(() => {
    //     if (searchFeedbackId) {
    //         const foundFeedback = feedbacks.filter(feedback => feedback.feedback_id.toString() === searchFeedbackId.trim());
    //         setDisplayedFeedbacks(foundFeedback);
    //     } else {
    //         setDisplayedFeedbacks(feedbacks);
    //     }
    // }, [searchFeedbackId, feedbacks]);

    const fetchFeedbacks = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/feedback/`);
            if (response.status === 200) {
                setFeedbacks(response.data); // Update the feedbacks state with the fetched data
            } else {
                // Handle non-successful status codes
                setFormError('Error occurred while fetching feedbacks.');
            }
        } catch (error) {
            // Handle errors from the server
            setFormError('Error occurred while fetching feedbacks.');
        }
    };

    // Handle input change for new feedback
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewFeedback({ ...newFeedback, [name]: value });
    };

    // Handle adding new feedback
    const handleFeedbackSubmit = (event) => {
        event.preventDefault();
        setFormError(null); // Resetting any previous errors

        axios.post(`${process.env.REACT_APP_API_URL}/feedback/`, newFeedback)
            .then(response => {
                if (response.status === 200 || response.status === 201) {
                    setNewFeedback({ name: '', email: '', text: '' }); // Reset form fields
                    document.getElementById("refresh").click();
                    fetchFeedbacks(); // Fetch all feedbacks again to update the list
                } else {
                    // Handle non-successful status codes
                    setFormError('Feedback submission was not successful.');
                }
            })
            .catch(error => {
                // Handle errors from the server
                setFormError('Error occurred while adding feedback: ' + error.message);
            });
    };

    return (
    <div>
        <h5 class="card-title">Feedback form</h5>
        <p class="card-text">Add any feedback by typing your text in the form below.</p>

        <form onSubmit={handleFeedbackSubmit} className="feedback-form">
            <div class="mb-3">
                <label class="form-label">Name</label>
                <input 
                    type="text" 
                    class="form-control" 
                    placeholder="John Smith"
                    id="name"
                    name="name"
                    value={newFeedback.name}
                    onChange={handleInputChange}
                ></input>
            </div>
            <div class="mb-3">
                <label class="form-label">Email address</label>
                <input 
                    type="email" 
                    class="form-control" 
                    placeholder="name@example.com"
                    id="email"
                    name="email"
                    value={newFeedback.email}
                    onChange={handleInputChange}
                ></input>
            </div>
            <div class="mb-3">
                <label class="form-label">Feedback text</label>
                <textarea 
                    class="form-control" 
                    rows="3"
                    id="text"
                    name="text"
                    value={newFeedback.text}
                    onChange={handleInputChange}>
                </textarea>
            </div>

            <button class="btn btn-primary" type="submit">Add Feedback</button>
        </form>

        {/* Display form error, if any */}
        {formError && <p className="error-message">{formError}</p>}
    </div>
    );
};

export default FeedbackComponent;
