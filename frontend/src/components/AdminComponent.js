import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminComponent = () => {
    const [admins, setAdmins] = useState([]);
    const [allAdmins, setAllAdmins] = useState([]);  // To store all admins
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [updateEmails, setUpdateEmails] = useState({});
    const [searchId, setSearchId] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAdmins();
    }, []);


    // useEffect(() => {
    // if (searchId) {
    //     const foundAdmin = allAdmins.find(admin => admin.admin_id.toString() === searchId);
    //     setAdmins(foundAdmin ? [foundAdmin] : []);
    // } else {
    //     // Updated to filter out deactivated (deleted) admins
    //     setAdmins(allAdmins.filter(admin => !admin.isDeleted));
    // }
    // }, [searchId, allAdmins]);


    const fetchAdmins = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/`);
            setAdmins(response.data);
            setAllAdmins(response.data);  // Update allAdmins with the fetched data
            setError(null);
        } catch (err) {
            setError('Error fetching data');
            console.error('Error:', err);
        }
    };

    const addAdmin = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/admin/`, { email: newAdminEmail });
            setNewAdminEmail('');
            document.getElementById("refresh").click();
            await fetchAdmins(); // Fetch updated list of admins
        } catch (err) {
            setError('Error adding admin');
            console.error('Error:', err);
        }
    };

    const deleteAdmin = async (adminId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/admin/${adminId}/`);
            fetchAdmins(); // Fetch updated list of admins after deletion
        } catch (err) {
            setError('Error deleting admin');
            console.error('Error:', err);
        }
    };

    const updateAdminEmail = async (adminId, email) => {
    try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/admin/${adminId}/`, { email: email });
        if (response.status === 200) {
            setUpdateEmails({ ...updateEmails, [adminId]: '' });
            fetchAdmins(); // Fetch updated list of admins
        } else {
            throw new Error('Failed to update admin email');
        }
    } catch (err) {
        setError('Error updating admin email');
        console.error('Error:', err);
    }
};

    const handleNewEmailChange = (event) => {
        setNewAdminEmail(event.target.value);
    };

    const handleUpdateEmailChange = (adminId, event) => {
        setUpdateEmails(prevState => ({
            ...prevState,
            [adminId]: event.target.value
        }));
    };

    const handleSearchIdChange = (event) => {
        setSearchId(event.target.value);
    };

    const handleAddSubmit = (event) => {
        event.preventDefault();
        addAdmin();
    };

    const handleUpdateSubmit = (adminId, event) => {
        event.preventDefault();
        updateAdminEmail(adminId, updateEmails[adminId]);
    };

    return (
        <div>
        <h5 class="card-title">Admin controls</h5>
        <p class="card-text">Add new admins or reactivate admins with admin privileges. Only admins can add other admins. You can also search admins by ID.</p>

        <form onSubmit={handleAddSubmit}>
            <div class="input-group mb-3">
                <input type="email" value={newAdminEmail} onChange={handleNewEmailChange} class="form-control" placeholder="User's email" aria-label="Recipient's username" aria-describedby="basic-addon2"></input>
                <button class="btn btn-outline-secondary" type="submit">Add or Activate</button>
            </div>

        </form>
        {error && <p>{error}</p>}

        </div>
    );
};

export default AdminComponent;
