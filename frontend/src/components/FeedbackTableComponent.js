import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeedbackTableComponent = () => {
    const [feedbacks, setFeedbacks] = useState([]); // Store all feedbacks
    const [displayedFeedbacks, setDisplayedFeedbacks] = useState([]); // Store feedbacks to be displayed
    const [searchFeedbackId, setSearchFeedbackId] = useState(''); // Search ID
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

    // Update displayed feedbacks based on search input
    useEffect(() => {
        if (searchFeedbackId) {
            const foundFeedback = feedbacks.filter(feedback => feedback.feedback_id.toString() === searchFeedbackId.trim());
            setDisplayedFeedbacks(foundFeedback);
        } else {
            setDisplayedFeedbacks(feedbacks);
        }
    }, [searchFeedbackId, feedbacks]);

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

    // // Search input change handler
    // const handleSearchInputChange = (event) => {
    //     setSearchFeedbackId(event.target.value);
    // };

    return (
    <div className="feedback-section">
        <div>
            {/*/!* Feedback Search *!/*/}
            {/*<div class="input-group mb-3">*/}
            {/*    <input type="text" value={searchFeedbackId} onChange={handleSearchInputChange} class="form-control" placeholder="Search feedback by text"></input>*/}
            {/*    <button class="btn btn-outline-secondary" type="button" id="button-addon2">Search</button>*/}
            {/*</div>*/}

            <button id="refresh" style={{display:'none'}} onClick={fetchFeedbacks}>Refresh</button>

            {/* Feedback Table */}
            <table class="table">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Text</th>
                        <th scope="col">Submission Date</th>
                        <th scope="col">Actioned By</th>
                        <th scope="col">Action Date</th>
                        <th scope="col">Action Comment</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedFeedbacks.map(feedback => (
                        <tr key={feedback.actionDate}>
                        <td>{feedback.feedbackId}</td>
                        <td>{feedback.name}</td>
                        <td>{feedback.email}</td>
                        <td>{feedback.text}</td>
                        <td>{feedback.submissionDate}</td>
                        <td>{feedback.actionedBy || 'N/A'}</td>
                        <td>{feedback.actionDate || 'N/A'}</td>
                        <td>{feedback.actionComment || 'N/A'}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Display form error, if any */}
        {formError && <p className="error-message">{formError}</p>}
    </div>
    );
};

export default FeedbackTableComponent;
