import React, { useState, useEffect, useContext } from 'react';
import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc, Timestamp, getCountFromServer } from "firebase/firestore";

import { AppointmentPicker } from 'react-appointment-picker';

import Modal from 'react-bootstrap/Modal';

import { Button } from 'react-bootstrap';

import moment from 'moment';

import appContext from '../context/context';


function BookAppointment() {
    const { selectedAppLocation } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components

    const [reasons, setReasons] = useState([]);
    const [selectedReason, setSelectedReason] = useState('');

    const [aptDate, setAptDate] = useState('Select an appointment');
    const [aptDateDisplay, setAptDateDisplay] = useState('');



    const [showPopup, setShowPopup] = useState(false);



    const loading = false;

    useEffect(() => {

        let reasonsQuery = query(collection(firestore, "reasons"));

        // Fetch reasons from Firestore (replace 'reasons' with your actual collection)
        const unsubscribeReasons = onSnapshot(reasonsQuery, (snapshot) => {
            const reasonArray = snapshot.docs.map((doc) => {
                return { ...doc.data(), id: doc.id };
            });
            setReasons(reasonArray);
        });

        return () => {
            unsubscribeReasons();
        };
    }, []);
    //
    //console.log(moment(new Date()).valueOf());
    // console.log(new Date().valueOf());

    var aa = new Date();
    aa.setHours(9);
    aa.setMinutes(0);
    aa.setSeconds(0);

    var days = [];
    //populate days for the appointment popup
    //iterate 5 times as we will show 5 days in popup

    for (let i = 1; i < 6; i++) {
        var dayArr = [null, null, null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null];

        for (let j = 1; j < 9; j++) {
            var dayObj = { id: aa.valueOf(), number: j, periods: 4 };
            dayArr.push(dayObj);
            aa.setHours(aa.getHours() + 1);
        }
        days.push(dayArr);

        //move to next day 9 AM
        aa.setDate(aa.getDate() + 1);
        aa.setHours(9);
        aa.setMinutes(0);
        aa.setSeconds(0);
    }

    // console.log(days);




    // const days = [
    //     [null, null, null, null, null, null, null, null, null, null, null, null,
    //         null, null, null, null, null, null, null, null, null, null, null, null,
    //         null, null, null, null, null, null, null, null, null, null, null, null,
    //         { id: 1, number: 1, periods: 4 },
    //         { id: 2, number: 2, periods: 4 },
    //         { id: 3, number: 3, periods: 4 },
    //         { id: 4, number: 4, periods: 4 },
    //         { id: 5, number: 5, periods: 4 },
    //         { id: 6, number: 6, periods: 4 },
    //         { id: 7, number: 7, periods: 4 },
    //         { id: 8, number: 8, periods: 4 },
    //         null, null, null, null, null, null, null, null, null, null, null, null,
    //         null, null, null, null, null, null, null, null, null, null, null, null,
    //         null, null, null, null, null
    //     ],
    //     [null, null, null, null, null, null, null, null, null, null, null, null,
    //         null, null, null, null, null, null, null, null, null, null, null, null,
    //         null, null, null, null, null, null, null, null, null, null, null, null,
    //         { id: 9, number: 1, periods: 4 },
    //         { id: 10, number: 2, periods: 4 },
    //         { id: 11, number: 3, periods: 4 },
    //         { id: 12, number: 4, periods: 4 },
    //         { id: 13, number: 5, periods: 4 },
    //         { id: 14, number: 6, periods: 4 },
    //         { id: 15, number: 7, periods: 4 },
    //         { id: 16, number: 8, periods: 4 }
    //     ],
    //     [null, null, null, null, null, null, null, null, null, null, null, null,
    //         null, null, null, null, null, null, null, null, null, null, null, null,
    //         null, null, null, null, null, null, null, null, null, null, null, null,
    //         { id: 17, number: 1, periods: 4 },
    //         { id: 18, number: 2, periods: 4 },
    //         { id: 19, number: 3, periods: 4 },
    //         { id: 20, number: 4, periods: 4 },
    //         { id: 21, number: 5, periods: 4 },
    //         { id: 22, number: 6, periods: 4 },
    //         { id: 23, number: 7, periods: 4 },
    //         { id: 24, number: 8, periods: 4 }
    //     ],
    //     [null, null, null, null, null, null, null, null, null, null, null, null,
    //         null, null, null, null, null, null, null, null, null, null, null, null,
    //         null, null, null, null, null, null, null, null, null, null, null, null,
    //         { id: 17, number: 1, periods: 4 },
    //         { id: 18, number: 2, periods: 4 },
    //         { id: 19, number: 3, periods: 4 },
    //         { id: 20, number: 4, periods: 4 },
    //         { id: 21, number: 5, periods: 4 },
    //         { id: 22, number: 6, periods: 4 },
    //         { id: 23, number: 7, periods: 4 },
    //         { id: 24, number: 8, periods: 4 }
    //     ],
    //     [null, null, null, null, null, null, null, null, null, null, null, null,
    //         null, null, null, null, null, null, null, null, null, null, null, null,
    //         null, null, null, null, null, null, null, null, null, null, null, null,
    //         { id: 17, number: 1, periods: 4 },
    //         { id: 18, number: 2, periods: 4 },
    //         { id: 19, number: 3, periods: 4 },
    //         { id: 20, number: 4, periods: 4 },
    //         { id: 21, number: 5, periods: 4 },
    //         { id: 22, number: 6, periods: 4 },
    //         { id: 23, number: 7, periods: 4 },
    //         { id: 24, number: 8, periods: 4 }
    //     ]
    // ];

    const handleClose = () => setShowPopup(false);

    function addAppointmentCallback({ addedAppointment: { day, number, time, id }, addCb }) {

        setAptDate(id);

        addCb(day, number, time, id);

    }

    function removeAppointmentCallback({ day, number, time, id }, removeCb) {
        setAptDateDisplay('Select an appointment');
        setAptDate('');
        removeCb(day, number);
    }


    function processAppointment() {

        setAptDateDisplay(moment(aptDate).format('dddd, MMM D, yyyy hh:mm A'));

        setShowPopup(false);
    }


    return (
        <div className='tb-appointment-component col-md-6 mx-5 mb-5'>
            <h3> Schedule an appointment</h3>

            <label class="form-label mt-3" >What is your reason for visiting?</label>
            <select required className='form-select shadow-sm' value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
                <option value="">--Select--</option>
                {reasons.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                        {reason.Label}
                    </option>
                ))}
            </select>

            <div class="input-group mt-4" >
                <input type="text" value={aptDateDisplay} readOnly class="form-control not-allowed-cursor " aria-label="Select an appointment" placeholder='Select an appointment' />
                <span role='button' className="input-group-text shadow" title='Select an appointment'
                    onClick={() => { setShowPopup(true) }}><i class="ri-calendar-2-line"></i></span>

            </div>

            <div className='mt-5'>
                <button className='btn btn-primary shadow'>Schedule appointment</button>
            </div>

            <Modal show={showPopup} backdrop="static" keyboard={false} onHide={handleClose} size='lg' contentClassName="tb-apt-modal" >

                <Modal.Header closeButton>
                    <Modal.Title>Select appointment</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className='d-flex'>
                        <AppointmentPicker
                            addAppointmentCallback={addAppointmentCallback}
                            removeAppointmentCallback={removeAppointmentCallback}
                            initialDay={new Date(new Date().toISOString().slice(0, 10))} //pass current date without time
                            days={days}
                            maxReservableAppointments={1}
                            alpha={false}
                            visible={true}
                            selectedByDefault={false}
                            loading={loading}
                        />
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="success" onClick={processAppointment}>
                        Select
                    </Button>
                </Modal.Footer>

            </Modal>

        </div>
    )
}

export default BookAppointment;