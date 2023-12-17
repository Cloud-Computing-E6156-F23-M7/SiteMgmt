import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminTableComponent = () => {
    const [admins, setAdmins] = useState([]);
    const [allAdmins, setAllAdmins] = useState([]);  // To store all admins
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [updateEmails, setUpdateEmails] = useState({});
    const [searchId, setSearchId] = useState('');

    useEffect(() => {
        fetchAdmins();
    }, []);

    // useEffect(() => {
    //     if (searchId) {
    //         const foundAdmin = allAdmins.find(admin => admin.adminId.toString() === searchId);
    //         setAdmins(foundAdmin ? [foundAdmin] : []);
    //     } else {
    //         // Updated to filter out deactivated (deleted) admins
    //         setAdmins(allAdmins.filter(admin => !admin.isDeleted));
    //     }
    //     }, [searchId, allAdmins]);

    const fetchAdmins = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/`);
            setAdmins(response.data);
            setAllAdmins(response.data);  // Update allAdmins with the fetched data
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const deleteAdmin = async (adminId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/admin/${adminId}/`);
            fetchAdmins(); // Fetch updated list of admins after deletion
        } catch (err) {
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

    const handleUpdateSubmit = (adminId, event) => {
        event.preventDefault();
        updateAdminEmail(adminId, updateEmails[adminId]);
    };

    // const handleSearchIdChange = (event) => {
    //     setSearchId(event.target.value);
    // };

    return (
        <div>
            {/*<div class="input-group mb-3">*/}
            {/*    <input type="text" value={searchId} onChange={handleSearchIdChange} class="form-control" placeholder="Search email by ID"></input>*/}
            {/*    <button class="btn btn-outline-secondary" type="button" id="button-addon2">Search</button>*/}
            {/*</div>*/}

            <button id="refresh" style={{display:'none'}} onClick={fetchAdmins}>Refresh</button>

            <table class="table">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Email</th>
                        <th scope="col">Status</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {admins.map(admin => (
                    <tr key={admin.adminId}>
                        <td>{admin.adminId}</td>
                        <td>{admin.email}</td>
                        <td>{admin.isDeleted ? <span class="badge text-bg-danger">Deactivated</span> : <span class="badge text-bg-success">Active</span>} 
                        </td>
                        <td>
                            <form onSubmit={(event) => handleUpdateSubmit(admin.adminId, event)}>

                            <div class="container">
                                <div class="row">
                                    <div class="col">
                                        <div class="input-group">
                                            <input type="email" 
                                            class="form-control" 
                                            placeholder="New email"
                                            value={updateEmails[admin.adminId] || ''}
                                            onChange={(e) => handleUpdateEmailChange(admin.adminId, e)}></input>

                                            <button class="btn btn-outline-secondary" type="submit" id="button-addon2">Update</button>
                                        </div>
                                    </div>
                                    <div class="col">
                                        {!admin.isDeleted && (
                                            <button type="button" class="btn btn-outline-danger" onClick={() => deleteAdmin(admin.adminId)}>Deactivate</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            </form>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            
        </div>
    );
};

export default AdminTableComponent;
