import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActionTableComponent = () => {
    const [actions, setActions] = useState([]); // Store all actions
    const [displayedActions, setDisplayedActions] = useState([]); // Store actions to be displayed
    // const [searchActionId, setSearchActionId] = useState(''); // Search ID
    const [formError, setFormError] = useState(null); // Error for action form

    // Fetch all actions initially
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/admin/action/`)
            .then(response => {
                setActions(response.data);
                setDisplayedActions(response.data);
            })
            .catch(error => console.error('Error:', error));
    }, []);

    const refreshData = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/admin/action/`)
            .then(response => {
                setActions(response.data);
                setDisplayedActions(response.data);
            })
            .catch(error => console.error('Error:', error));
    };

    // // Update displayed actions based on search input
    // useEffect(() => {
    //     if (searchActionId) {
    //         const foundAction = actions.filter(action => action.id.toString() === searchActionId.trim());
    //         setDisplayedActions(foundAction);
    //     } else {
    //         setDisplayedActions(actions);
    //     }
    // }, [searchActionId, actions]);

    // const fetchActions = async () => {
    //     try {
    //         const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/action/`);
    //         if (response.status === 200) {
    //             setActions(response.data); // Update the actions state with the fetched data
    //         } else {
    //             // Handle non-successful status codes
    //             setFormError('Error occurred while fetching actions');
    //         }
    //     } catch (error) {
    //         // Handle errors from the server
    //         setFormError('Error occurred while fetching actions');
    //     }
    // };

    // // Search input change handler
    // const handleSearchInputChange = (event) => {
    //     setSearchActionId(event.target.value);
    // };

    return (
    <div className="action-section">
        <div>
            {/*/!* Action Search *!/*/}
            {/*<div class="input-group mb-3">*/}
            {/*    <input type="text" value={searchActionId} onChange={handleSearchInputChange} class="form-control" placeholder="Search action by text"></input>*/}
            {/*    <button class="btn btn-outline-secondary" type="button" id="button-addon2">Search</button>*/}
            {/*</div>*/}

            <button id="refresh" style={{display:'none'}} onClick={refreshData}>Refresh</button>

            {/* Action Table */}
            <table class="table">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Admin ID</th>
                        <th scope="col">Feedback ID</th>
                        <th scope="col">Comment</th>
                        <th scope="col">Action Date</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedActions.map(action => (
                    <tr key={action.actionId}>
                        <td>{action.actionId}</td>
                        <td>{action.adminId}</td>
                        <td>{action.feedbackId}</td>
                        <td>{action.actionComment || 'N/A'}</td>
                        <td>{action.actionDate || 'N/A'}</td>
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

export default ActionTableComponent;
