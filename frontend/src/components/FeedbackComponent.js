import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedbackComponent.css'; // Import the CSS file

const FeedbackComponent = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [newFeedback, setNewFeedback] = useState({ name: '', email: '', text: '' });
    const [formError, setFormError] = useState(null); // Error related to the Feedback Form
    const [searchFeedbackId, setSearchFeedbackId] = useState('');
    const [searchedFeedback, setSearchedFeedback] = useState(null);
    const [searchError, setSearchError] = useState(null); // Error related to the Search Feedback

    const handleSearchInputChange = (event) => {
        setSearchFeedbackId(event.target.value);
    };

    const handleSearchFeedback = (event) => {
        event.preventDefault();
        setSearchError(null);

        // Perform the search by feedback ID
        axios.get(`${process.env.REACT_APP_API_URL}/feedback/${searchFeedbackId}`)
            .then(response => {
                setSearchedFeedback(response.data);
            })
            .catch(error => {
                setSearchError('Feedback not found');
                setSearchedFeedback(null);
            });
    };

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/feedback/`)
            .then(response => setFeedbacks(response.data))
            .catch(error => console.error('Error:', error));
    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewFeedback({ ...newFeedback, [name]: value });
    };

    const handleAddFeedback = (event) => {
        event.preventDefault();
        if (!newFeedback.text || !newFeedback.email) {
            setFormError('Text and Email are mandatory fields.');
            return;
        }

        axios.post(`${process.env.REACT_APP_API_URL}/feedback/`, newFeedback)
            .then(() => {
                setNewFeedback({ name: '', email: '', text: '' });
                setFormError(null);
                // Show success notification
                alert('Feedback added successfully!');
                // Refresh the feedbacks list after adding a new feedback
                axios.get(`${process.env.REACT_APP_API_URL}/feedback/`)
                    .then(response => setFeedbacks(response.data))
                    .catch(error => console.error('Error:', error));
            })
            .catch(error => {
                setFormError('Error adding feedback.');
                // Show error notification
                alert('Error adding feedback. Please try again.');
                console.error('Error:', error);
            });
    };

    return (
        <div>
            <h2>Feedback</h2>
            <h3>Feedback Form</h3>
            {formError && <p className="error-message">{formError}</p>}
            {/* Form for adding new feedback */}
            <form onSubmit={handleAddFeedback} className="feedback-container">
                <div className="feedback-container">
                    <label className="feedback-label">
                        Name:
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={newFeedback.name}
                        onChange={handleInputChange}
                        className="feedback-input"
                    />
                </div>
                <div className="feedback-container">
                    <label className="feedback-label">
                        Email:
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={newFeedback.email}
                        onChange={handleInputChange}
                        className="feedback-input"
                        required
                    />
                </div>
                <div className="feedback-container">
                    <label className="feedback-label">
                        Text:
                    </label>
                    <textarea
                        name="text"
                        value={newFeedback.text}
                        onChange={handleInputChange}
                        className="feedback-textarea"
                        required
                    />
                </div>
                <button type="submit">Add Feedback</button>
            </form>
            {/* Render existing feedbacks here */}
            <h3>Search Feedback</h3>
            <form onSubmit={handleSearchFeedback} className="feedback-container">
                <div className="feedback-container">
                    <label className="feedback-label">
                        Search Feedback by ID:
                    </label>
                    <input
                        type="number"
                        name="searchFeedbackId"
                        value={searchFeedbackId}
                        onChange={handleSearchInputChange}
                        className="feedback-input"
                    />
                </div>
                <div>
                    <button type="submit">Search</button>
                </div>
            </form>
            {searchedFeedback && (
                <div>
                    <h3>Searched Result</h3>
                    <p>Feedback ID: {searchedFeedback.feedback_id}</p>
                    <p>Name: {searchedFeedback.name}</p>
                    <p>Email: {searchedFeedback.email}</p>
                    <p>Text: {searchedFeedback.text}</p>
                </div>
            )}
            {searchError && <p className="error-message">{searchError}</p>}
        </div>
    );
};

export default FeedbackComponent;

