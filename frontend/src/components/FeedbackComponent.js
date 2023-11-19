// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './FeedbackComponent.css'; // Import the CSS file
//
// const FeedbackComponent = () => {
//     const [feedbacks, setFeedbacks] = useState([]);
//     const [newFeedback, setNewFeedback] = useState({ name: '', email: '', text: '' });
//     const [formError, setFormError] = useState(null); // Error related to the Feedback Form
//     const [searchFeedbackId, setSearchFeedbackId] = useState('');
//     const [searchedFeedback, setSearchedFeedback] = useState(null);
//     const [searchError, setSearchError] = useState(null); // Error related to the Search Feedback
//
//     const handleSearchInputChange = (event) => {
//         setSearchFeedbackId(event.target.value);
//     };
//
//     const handleSearchFeedback = (event) => {
//         event.preventDefault();
//         setSearchError(null);
//
//         // Perform the search by feedback ID
//         axios.get(`${process.env.REACT_APP_API_URL}/feedback/${searchFeedbackId}`)
//             .then(response => {
//                 setSearchedFeedback(response.data);
//             })
//             .catch(error => {
//                 setSearchError('Feedback not found');
//                 setSearchedFeedback(null);
//             });
//     };
//
//     useEffect(() => {
//         axios.get(`${process.env.REACT_APP_API_URL}/admin/feedback/`)
//             .then(response => setFeedbacks(response.data))
//             .catch(error => console.error('Error:', error));
//     }, []);
//
//     const handleInputChange = (event) => {
//         const { name, value } = event.target;
//         setNewFeedback({ ...newFeedback, [name]: value });
//     };
//
//     const handleAddFeedback = (event) => {
//         event.preventDefault();
//         if (!newFeedback.text || !newFeedback.email) {
//             setFormError('Text and Email are mandatory fields.');
//             return;
//         }
//
//         axios.post(`${process.env.REACT_APP_API_URL}/feedback/`, newFeedback)
//             .then(() => {
//                 setNewFeedback({ name: '', email: '', text: '' });
//                 setFormError(null);
//                 // Show success notification
//                 alert('Feedback added successfully!');
//                 // Refresh the feedbacks list after adding a new feedback
//                 axios.get(`${process.env.REACT_APP_API_URL}/feedback/`)
//                     .then(response => setFeedbacks(response.data))
//                     .catch(error => console.error('Error:', error));
//             })
//             .catch(error => {
//                 setFormError('Error adding feedback.');
//                 // Show error notification
//                 alert('Error adding feedback. Please try again.');
//                 console.error('Error:', error);
//             });
//     };
//
//     return (
//         <div>
//             <h2>Feedback</h2>
//             <h3>Feedback Form</h3>
//             {formError && <p className="error-message">{formError}</p>}
//             {/* Form for adding new feedback */}
//             <form onSubmit={handleAddFeedback} className="feedback-container">
//                 <div className="feedback-container">
//                     <label className="feedback-label">
//                         Name:
//                     </label>
//                     <input
//                         type="text"
//                         name="name"
//                         value={newFeedback.name}
//                         onChange={handleInputChange}
//                         className="feedback-input"
//                     />
//                 </div>
//                 <div className="feedback-container">
//                     <label className="feedback-label">
//                         Email:
//                     </label>
//                     <input
//                         type="email"
//                         name="email"
//                         value={newFeedback.email}
//                         onChange={handleInputChange}
//                         className="feedback-input"
//                         required
//                     />
//                 </div>
//                 <div className="feedback-container">
//                     <label className="feedback-label">
//                         Text:
//                     </label>
//                     <textarea
//                         name="text"
//                         value={newFeedback.text}
//                         onChange={handleInputChange}
//                         className="feedback-textarea"
//                         required
//                     />
//                 </div>
//                 <button type="submit">Add Feedback</button>
//             </form>
//             {/* Render existing feedbacks here */}
//             <h3>Search Feedback</h3>
//             <form onSubmit={handleSearchFeedback} className="feedback-container">
//                 <div className="feedback-container">
//                     <label className="feedback-label">
//                         Search Feedback by ID:
//                     </label>
//                     <input
//                         type="number"
//                         name="searchFeedbackId"
//                         value={searchFeedbackId}
//                         onChange={handleSearchInputChange}
//                         className="feedback-input"
//                     />
//                 </div>
//                 <div>
//                     <button type="submit">Search</button>
//                 </div>
//             </form>
//             {searchedFeedback && (
//                 <div>
//                     <h3>Searched Result</h3>
//                     <p>Feedback ID: {searchedFeedback.feedback_id}</p>
//                     <p>Name: {searchedFeedback.name}</p>
//                     <p>Email: {searchedFeedback.email}</p>
//                     <p>Text: {searchedFeedback.text}</p>
//                 </div>
//             )}
//             {searchError && <p className="error-message">{searchError}</p>}
//         </div>
//     );
// };
//
// export default FeedbackComponent;

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
        axios.get(`${process.env.REACT_APP_API_URL}/admin/feedback`)
            .then(response => {
                setFeedbacks(response.data);
                setDisplayedFeedbacks(response.data);
            })
            .catch(error => console.error('Error:', error));
    }, []);

    // Update displayed feedbacks based on search input
    useEffect(() => {
        if (searchFeedbackId) {
            const foundFeedback = feedbacks.filter(feedback => feedback.feedback_id.toString() === searchFeedbackId);
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

    // Search input change handler
    const handleSearchInputChange = (event) => {
        setSearchFeedbackId(event.target.value);
    };

    return (
    <div className="feedback-section">
        {/* Feedback List */}
        <div className="feedback-list">
            <h3>Feedbacks</h3>
            <ol className="feedback-items" start={displayedFeedbacks.length > 0 ? displayedFeedbacks[0].feedback_id : 1}>
                {displayedFeedbacks.map(feedback => (
                    <li key={feedback.feedback_id} className="feedback-item">
                        <p>Name: {feedback.name}</p>
                        <p>Email: {feedback.email}</p>
                        <p>Text: {feedback.text}</p>
                        <p>Submission Date: {feedback.submission_date}</p>
                        <p>Is Deleted: {feedback.isDeleted ? 'Yes' : 'No'}</p>
                        <p>Actioned By: {feedback.actioned_by || 'N/A'}</p>
                        <p>Action Date: {feedback.action_date || 'N/A'}</p>
                        <p>Action Comment: {feedback.action_comment || 'N/A'}</p>
                    </li>
                ))}
            </ol>
        </div>

        {/* Feedback Form */}
        <h3>Add New Feedback</h3>
            <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                <div className="feedback-form-group">
                    <label htmlFor="name" className="feedback-label">Name: </label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        value={newFeedback.name}
                        onChange={handleInputChange}
                        className="feedback-input"
                    />
                </div>
                <div className="feedback-form-group">
                    <p><label htmlFor="email" className="feedback-label">Email: </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={newFeedback.email}
                        onChange={handleInputChange}
                        className="feedback-input"
                    /></p>
                </div>
                <div className="feedback-form-group">
                    <label htmlFor="text" className="feedback-label">Text: </label>
                    <textarea
                        id="text"
                        name="text"
                        value={newFeedback.text}
                        onChange={handleInputChange}
                        className="feedback-textarea"
                    />
                </div>
                <p></p>
                <button type="submit" className="feedback-submit-btn">Add Feedback</button>
                <p></p>
        </form>

        {/* Feedback Search */}
        <h3>Search Feedback by ID</h3>
        <div className="feedback-search">
            <label>Feedback ID: </label>
            <input
                type="text"
                value={searchFeedbackId}
                onChange={handleSearchInputChange}
                className="feedback-search-input"
            />
        </div>

        {/* Display form error, if any */}
        {formError && <p className="error-message">{formError}</p>}
    </div>
    );
};

export default FeedbackComponent;
