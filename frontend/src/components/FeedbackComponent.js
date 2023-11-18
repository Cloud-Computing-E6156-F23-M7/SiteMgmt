import React, { useState, useEffect } from 'react';
import axios from 'axios';
// TODO
const FeedbackComponent = () => {
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/feedback/`)
            .then(response => setFeedbacks(response.data))
            .catch(error => console.error('Error:', error));
    }, []);

    return (
        <div>
            <h2>Feedback</h2>
            {/* Render feedbacks here */}
        </div>
    );
};

export default FeedbackComponent;
