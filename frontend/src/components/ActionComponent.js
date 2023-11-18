import React, { useState, useEffect } from 'react';
import axios from 'axios';
// TODO
const ActionComponent = () => {
    const [actions, setActions] = useState([]);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/admin/action/`)
            .then(response => setActions(response.data))
            .catch(error => console.error('Error:', error));
    }, []);

    return (
        <div>
            <h2>Actions</h2>
            {/* Render actions here */}
        </div>
    );
};

export default ActionComponent;
