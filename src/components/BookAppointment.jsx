import React, { useState, useEffect, useContext } from 'react';
import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc, Timestamp, getCountFromServer, updateDoc } from "firebase/firestore";

import { AppointmentPicker } from 'react-appointment-picker';

import Modal from 'react-bootstrap/Modal';
import Toast from 'react-bootstrap/Toast';

import { Form, Button, ToastContainer } from 'react-bootstrap';

import moment from 'moment';

import appContext from '../context/context';


function BookAppointment() {
    const { selectedAppLocation, loggedInUser } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components

    const [reasons, setReasons] = useState([]);
    const [selectedReason, setSelectedReason] = useState('');
    const [selectedAptType , setSelectedAptType] = useState('in_person');

    //stores list of upcoming appointments of the user
    const [aptList, setAptList] = useState([]);

    const [aptDate, setAptDate] = useState('');
    const [aptDateDisplay, setAptDateDisplay] = useState('');

    const [aptBookedMsg, setAptBookedMsg] = useState(false);
    const [aptCancelMsg, setAptCancelMsg] = useState(false);



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

        //Fetch user's Appointments
        const userRef = doc(firestore, "users", loggedInUser.email);

        let queueQuery = query(collection(firestore, "checkIns"), where("user", "==", userRef),
            where('stage', '==', 'in_queue'), where('isAppointment', '==', true));

        const unsubsribeCheckIns = onSnapshot(queueQuery, (snapshot) => {
            let promises = [];
            let aptDataArr = [];

            var finalAptDataObj = {};

            const apptArr = snapshot.docs.forEach(async (doc) => {


                let reasonDoc = getDoc(doc.data().reason);
                promises.push(reasonDoc);

                finalAptDataObj = {
                    id: doc.id,
                    ...doc.data(),
                    timestampDate: doc.data().timestamp.toDate(),
                    reasonDetails: await reasonDoc.then((d) => d.data())
                }

                finalAptDataObj.aptDateDisplay = moment(finalAptDataObj.timestampDate).format('dddd, MMM D, yyyy hh:mm A');

                aptDataArr.push(finalAptDataObj);
            });

            Promise.all(promises).then((d) => {

                setTimeout(() => {

                    console.log(aptDataArr);

                    //filter records - show only future appointments
                    aptDataArr = aptDataArr.filter((ele) => {
                        var today = new Date();

                        var todayVal = today.valueOf();
                        var timeStamp = ele.timestampDate.valueOf();

                        return (timeStamp > todayVal);

                    })

                    //sort the chatrooms newest to oldest. firebase doesnot support sort when query is on differnt field. i.e user
                    aptDataArr.sort((a, b) => {
                        return ((new Date(a.timestampDate).valueOf()) - (new Date(b.timestampDate).valueOf()));
                    })

                    setAptList(aptDataArr);


                })
            })




        });

        console.log(aptList);


        return () => {
            unsubsribeCheckIns();
            unsubscribeReasons();
        };
    }, []);


    var aa = new Date();
    aa.setHours(9);
    aa.setMinutes(0);
    aa.setSeconds(0);
    aa.setMilliseconds(0);

    var days = [];

    function loadDays() {

        days = [];

        console.log('app date: ' + aptDate);

        //populate days for the appointment popup
        //iterate 5 times as we will show 5 days in popup

        for (let i = 1; i < 6; i++) {
            var dayArr = [null, null, null, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null];

            for (let j = 1; j < 9; j++) {
                var dayObj = { id: aa.valueOf(), number: j, periods: 4, isSelected: (aa.valueOf() == aptDate) };
                dayArr.push(dayObj);
                aa.setHours(aa.getHours() + 1);
            }
            days.push(dayArr);

            //move to next day 9 AM
            aa.setDate(aa.getDate() + 1);
            aa.setHours(9);
            aa.setMinutes(0);
            aa.setSeconds(0);
            aa.setMilliseconds(0);
        }

        console.log(days);
    }

    loadDays();


    function showAptPopup() {
        loadDays();
        setShowPopup(true);
    }




    const handleClose = () => setShowPopup(false);

    function addAppointmentCallback({ addedAppointment: { day, number, time, id }, addCb }) {

        setAptDate(id);

        addCb(day, number, time, id);

    }

    function removeAppointmentCallback({ day, number, time, id }, removeCb) {
        setAptDateDisplay('');
        setAptDate('');
        removeCb(day, number);
    }


    function processAppointment() {
        if (aptDate)
            setAptDateDisplay(moment(aptDate).format('dddd, MMM D, yyyy hh:mm A'));
        else
            setAptDateDisplay('');

        setShowPopup(false);

    }

    //store apt in firebase
    function storeAptFirebase() {
        //we will utilize same collection as checkins
        //this will have extra flag "isAppointment : true"
        //Add Check in into database

        console.log(loggedInUser);

        addDoc(collection(firestore, "checkIns"), ({
            location: doc(firestore, "locations", selectedAppLocation.id),
            user: doc(firestore, "users", loggedInUser.email),
            reason: doc(firestore, "reasons", selectedReason),
            appointment_type: selectedAptType,
            stage: 'in_queue',
            isAppointment: true,
            timestamp: Timestamp.fromDate(new Date(aptDate)) //store selected apt datetime,
        })).then(async () => {
            // reset the values
            setAptDate('');
            setAptDateDisplay('');
            setSelectedReason('');
            setSelectedAptType('in_person');
            setAptBookedMsg(true);

            //hide appt message after 3 seconds
            setTimeout(() => {
                setAptBookedMsg(false);
            }, 3000);
        })

    }

    //cancel appointment in firebase
    async function cancelAppointment(aptId) {
        //take the apt/checkin Id and cancel it

        const checkInRef = doc(firestore, "checkIns", aptId);

        // Set the "capital" field of the city 'DC'
        await updateDoc(checkInRef, {
            stage: 'cancelled'
        });

        setAptCancelMsg(true);

        //hide appt message after 3 seconds
        setTimeout(() => {
            setAptCancelMsg(false);
        }, 3000);
    }

    

    return (
        <div className='tb-appointment-component  mx-5 mb-5'>
            <div className='pb-3 col-md-6'>
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
                        onClick={showAptPopup}><i class="ri-calendar-2-line"></i></span>

                </div>

                <div className='mt-3 mb-1'>Appointment type</div>

                <Form.Check
                    inline
                    label="In-person"
                    name="inperson"
                    type="radio"
                    id="inperson"
                    value="in_person"
                    onChange={()=>{setSelectedAptType('in_person')}}
                    checked={selectedAptType == 'in_person'}
                />

                <Form.Check
                    inline
                    label="Remote"
                    name="remote"
                    type="radio"
                    id="remote"
                    value="remote"
                    onChange={()=>{setSelectedAptType('remote')}}
                    checked={selectedAptType == 'remote'}
                />

                {/* <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="inlineRadioOptions" id="inperson" value="in_person" checked/>
                    <label class="form-check-label" for="inperson">In-person</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="inlineRadioOptions" id="remote" value="remote" />
                    <label class="form-check-label" for="remote">Remote</label>
                </div> */}


                <div className='mt-4'>
                    <button className='btn btn-primary shadow' disabled={!(aptDate && selectedReason)} onClick={storeAptFirebase}>Schedule appointment</button>
                </div>

                {aptBookedMsg && <div class="alert alert-success mt-4" role="alert">
                    Your appointment has been booked!
                </div>}

            </div>


            {/* Upcoming Appointment section */}

            <div className='pt-2 col-md-6'>
                <hr />
                <h4 className='mb-3'>Your upcoming appointments</h4>

                {aptCancelMsg && <div class="alert alert-success mt-4" role="alert">
                    Your appointment has been cancelled!
                </div>}

                {aptList.length == 0 && <div className='alert alert-light'>
                    You do not have any upcoming appointments!
                </div>}


                {aptList && aptList.map((aptObj, index) => (
                    <div className='card px-3 py-3 mb-2'>
                        <div className='d-flex justify-content-between'>
                            <div><span><b>Reason:</b> </span> <span>{aptObj.reasonDetails.Label}</span></div>
                            <div>{aptObj?.appointment_type == 'remote'? <span class="badge text-bg-dark">Remote</span> : <span class="badge text-bg-dark">In-person</span>} </div>
                            
                        </div>
                        <div>
                            <div class="input-group mt-3" >
                                <input type="text" value={aptObj.aptDateDisplay} readOnly disabled class="form-control not-allowed-cursor " aria-label="Select an appointment" placeholder='Select an appointment' />
                                <span className="input-group-text"
                                ><i class="ri-calendar-2-line"></i></span>
                            </div>
                            <div className='d-flex justify-content-between mt-3'>
                                <div className='mt-2 ms-1'>
                                    Duration: 1Hour
                                </div>
                                <div className='text-end'>
                                    <button className='btn btn-danger' onClick={() => { cancelAppointment(aptObj.id) }}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}


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
                            selectedByDefault={true}
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