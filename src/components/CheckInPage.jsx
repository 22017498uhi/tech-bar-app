import React, { useState, useEffect } from 'react';

import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc } from "firebase/firestore";

const CheckInPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [reasons, setReasons] = useState([]);
    const [selectedReason, setSelectedReason] = useState('');

    useEffect(() => {
        // Fetch users from Firestore (replace 'users' with your actual collection)

        let usersQuery = query(collection(firestore, "users"));

        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {

            const userArray = snapshot.docs.map((doc) => doc.data().displayName);
            setUsers(userArray);

            console.log(userArray);

        });

        let reasonsQuery = query(collection(firestore, "reasons"));

        // Fetch reasons from Firestore (replace 'reasons' with your actual collection)
        const unsubscribeReasons = onSnapshot(reasonsQuery, (snapshot) => {
            const reasonArray = snapshot.docs.map((doc) => doc.data().Label);
            setReasons(reasonArray);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeReasons();
        };
    }, []);

    const handleCheckIn = async () => {
        if (selectedUser === '' || selectedReason === '') return;

        //Add Check in into database
        addDoc(collection(firestore, "checkIns"), ({
            user: selectedUser,
            reason: selectedReason,
            timestamp: new Date(),
        })).then(() => {
            // reset the values
            setSelectedUser('');
            setSelectedReason('');
        })




    };

    return (
        <div>
            <h2>Check-In</h2>
            <label>Select User:</label>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                <option value="">Select User</option>
                {users.map((user) => (
                    <option key={user} value={user}>
                        {user}
                    </option>
                ))}
            </select>

            <br />

            <label>Select Reason for Visit:</label>
            <select value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
                <option value="">Select Reason</option>
                {reasons.map((reason) => (
                    <option key={reason} value={reason}>
                        {reason}
                    </option>
                ))}
            </select>

            <br />

            <button onClick={handleCheckIn}>Check-In</button>
        </div>
    );
};

export default CheckInPage;
