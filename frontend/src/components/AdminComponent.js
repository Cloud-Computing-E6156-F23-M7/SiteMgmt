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

    useEffect(() => {
        if (searchId) {
            const foundAdmin = allAdmins.find(admin => admin.admin_id.toString() === searchId);
            setAdmins(foundAdmin ? [foundAdmin] : []);
        } else {
            setAdmins(allAdmins);
        }
    }, [searchId, allAdmins]);

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
            fetchAdmins(); // Fetch updated list of admins
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
            <h2>Admins</h2>
            {error && <p>{error}</p>}
            <ul>
                {admins.map(admin => (
                    <li key={admin.admin_id}>
                        {admin.admin_id}. {admin.email} - {admin.isDeleted ? 'Deactivated' : 'Active'}
                        {!admin.isDeleted && (
                            <button onClick={() => deleteAdmin(admin.admin_id)} style={{ marginLeft: '10px' }}>Deactivate</button>
                        )}
                        <form onSubmit={(event) => handleUpdateSubmit(admin.admin_id, event)}>
                            <input
                                type="email"
                                placeholder="New Email"
                                value={updateEmails[admin.admin_id] || ''}
                                onChange={(e) => handleUpdateEmailChange(admin.admin_id, e)}
                            />
                            <button type="submit">Update Email</button>
                        </form>
                    </li>
                ))}
            </ul>

            <h3>Add New/Re-activate Admin</h3>
            <form onSubmit={handleAddSubmit}>
                <label>
                    Email:
                    <input type="email" value={newAdminEmail} onChange={handleNewEmailChange} required />
                </label>
                <button type="submit">Add/Activate Admin</button>
            </form>

            <h3>Search Admin by ID</h3>
            <form onSubmit={(e) => e.preventDefault()}>
                <label>
                    Admin ID:
                    <input type="text" value={searchId} onChange={handleSearchIdChange} required />
                </label>
            </form>
        </div>
    );
};

export default AdminComponent;
