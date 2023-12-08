import React, { useState, useEffect, useContext } from 'react';

import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc, Timestamp, getCountFromServer } from "firebase/firestore";


import Modal from 'react-bootstrap/Modal';

import appContext from '../context/context';


const CheckInPage = () => {
    const { selectedAppLocation } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [reasons, setReasons] = useState([]);
    const [selectedReason, setSelectedReason] = useState('');

    const [positionInQueue, setPositionInQueue] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

    const [showPopup, setShowPopup] = useState(false);






    useEffect(() => {
        // Fetch users from Firestore (replace 'users' with your actual collection)



        let usersQuery = query(collection(firestore, "users"));

        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {

            const userArray = snapshot.docs.map((doc) => {
                return { ...doc.data(), id: doc.id };
            });
            setUsers(userArray);

        });

        let reasonsQuery = query(collection(firestore, "reasons"));

        // Fetch reasons from Firestore (replace 'reasons' with your actual collection)
        const unsubscribeReasons = onSnapshot(reasonsQuery, (snapshot) => {
            const reasonArray = snapshot.docs.map((doc) => {
                return { ...doc.data(), id: doc.id };
            });
            setReasons(reasonArray);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeReasons();
        };
    }, []);

    const handleCheckIn = async () => {
        if (selectedUser === '' || selectedReason === '') {
            setErrorMessage('Please fill in all fields.');
            return;
        }

        //Add Check in into database
        addDoc(collection(firestore, "checkIns"), ({
            location: doc(firestore, "locations", selectedAppLocation.id),
            user: doc(firestore, "users", selectedUser),
            reason: doc(firestore, "reasons", selectedReason),
            stage: 'in_queue',
            timestamp: Timestamp.fromDate(new Date()) //store current time,
        })).then(async () => {
            // reset the values
            setSelectedUser('');
            setSelectedReason('');
            setErrorMessage('');


            //find position in queue
            const locationRef = doc(firestore, "locations", selectedAppLocation?.id);

            let queueQuery = query(collection(firestore, "checkIns"), where("location", "==", locationRef));

            const snapCheckins = await getCountFromServer(queueQuery);


            setPositionInQueue(snapCheckins.data().count);

            //show confiramtion popup
            setShowPopup(true);

            //hide popup after 5 seconds
            setTimeoutToCloseModal(5000);

            
        })

    };

    function setTimeoutToCloseModal(time){
        setTimeout(()=> {
            setShowPopup(false);
        },time)
    }

    return (
        <div className='container mt-5'>
            <div className='row justify-content-center'>
                <div className='col-md-9'>
                    {/* brand logo */}
                    <div className='mb-5 text-center'>
                        <img src='/logo-no-background.png' height={52} width={300}></img>
                    </div>
                    <h5 className='mb-4 text-center'>Welcome! Please check in below to add yourself to the queue.</h5>
                    <label className="form-label">Select User:</label>
                    <select required className='form-select shadow-sm' value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
                        <option value="">--Select--</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.displayName}
                            </option>
                        ))}
                    </select>

                    <br />

                    <label class="form-label">Select Reason for Visit:</label>
                    <select required className='form-select shadow-sm' value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
                        <option value="">--Select--</option>
                        {reasons.map((reason) => (
                            <option key={reason.id} value={reason.id}>
                                {reason.Label}
                            </option>
                        ))}
                    </select>

                    <br />
                    <div className='text-center'>
                        <button className='btn btn-success btn-lg shadow' onClick={handleCheckIn}>Check-In</button>
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    </div>
                </div>
            </div>

            {/* User checkin to queue confirmation message */}
            <Modal show={showPopup} backdrop="static" keyboard={false} >
                {/*<Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                        </Modal.Header> */}
                <Modal.Body>
                    <div className='text-center mt-5'>
                        <b>Thanks for checking in!</b> you are...
                    </div>
                    <div className='tb-queue-pos text-center mt-3  text-success display-1'>
                        <b>#{positionInQueue}</b>
                    </div>
                    <div className=' text-center'>
                        <button className='btn btn-outline-secondary mt-5 mb-5' onClick={() => { setShowPopup(false) }}>Return to main screen</button>
                    </div>
                </Modal.Body>


            </Modal>

        </div>
    );
};

export default CheckInPage;
