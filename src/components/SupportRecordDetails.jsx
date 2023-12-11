import React, { useState, useEffect, useContext } from 'react';

import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc, updateDoc } from "firebase/firestore";

import appContext from '../context/context';

import moment from 'moment';





function SupportRecordDetails(props) {

    const { loggedInUser, selectedAppLocation } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components



    const [recordDetails, setRecordDetails] = useState('');

    const [resNotes, setResNotes] = useState('');

    const [formMsg, setFormMsg] = useState('');

    const [formMsgError, setFormMsgError] = useState('');



    useEffect(() => {

        console.log('gte single record FB');

        const recordRef = doc(firestore, 'checkIns', props.recordId);
        const unsubscribeFb = onSnapshot(recordRef, async (doc) => {

            

            let promises = [];

            var finalRecordDataObj = {};

            let userDoc = getDoc(doc.data().user);
            let reasonDoc = getDoc(doc.data().reason);
            let locationDoc = getDoc(doc.data().location);
            let agentDoc;

            if (doc.data().agent)
                agentDoc = getDoc(doc.data().agent);


            promises.push(userDoc);
            promises.push(reasonDoc);
            promises.push(locationDoc);

            if (agentDoc)
                promises.push(agentDoc);


            finalRecordDataObj = {
                id: doc.id,
                ...doc.data(),
                timestampDate: doc.data().timestamp.toDate(),
                userDetails: await userDoc.then((d) => d.data()),
                reasonDetails: await reasonDoc.then((d) => d.data()),
                locationDetails: await locationDoc.then((d) => d.data())

            }

             //set resnotes state if value there
             if (finalRecordDataObj.resolutionNotes)
                setResNotes(finalRecordDataObj.resolutionNotes);
         



            //fetch agent details if present
            if (agentDoc)
                finalRecordDataObj.agentDetails = await agentDoc.then((d) => d.data())

            //populate type - Appointment or Check-in
            finalRecordDataObj.type = finalRecordDataObj.isAppointment ? 'Appointment' : 'Check-in';

            //populate Stage Text
            if (finalRecordDataObj.stage == 'in_queue')
                finalRecordDataObj.stageText = 'In Queue';
            else if (finalRecordDataObj.stage == 'serving')
                finalRecordDataObj.stageText = 'Serving';
            else if (finalRecordDataObj.stage == 'completed')
                finalRecordDataObj.stageText = 'Completed';
            else if (finalRecordDataObj.stage == 'cancelled')
                finalRecordDataObj.stageText = 'Cancelled';

            console.log(finalRecordDataObj);

            Promise.all(promises).then((d) => {

                setTimeout(() => {

                   

                    setRecordDetails(finalRecordDataObj);

                    console.log(finalRecordDataObj);
                })

            });

        });

        return () => unsubscribeFb();
    }, [props.recordId]);

    //assign the record to the agent
    async function acceptTheRecord() {

        setFormMsg('');
        setFormMsgError('');

        const checkinRef = doc(firestore, 'checkIns', props.recordId);

        await updateDoc(checkinRef, {
            agent: doc(firestore, 'users', loggedInUser.email),
            stage: 'serving'
        });

        setFormMsg('Record assigned to you.');

        //hide msg after few seconds
        setTimeout(() => {
            setFormMsg('');
        }, 2000);
    }

    //save the record - i.e res notes , all other things readonly
    async function saveTheRecord() {

        setFormMsg('');
        setFormMsgError('');

        const checkinRef = doc(firestore, 'checkIns', props.recordId);

        await updateDoc(checkinRef, {
            resolutionNotes: resNotes
        });

        setFormMsg('Record saved.');

        //hide msg after few seconds
        setTimeout(() => {
            setFormMsg('');
        }, 2000);
    }

    //complete the record - set agent if not there
    async function completeTheRecord() {

        setFormMsg('');
        setFormMsgError('');

        if (!resNotes) {
            setFormMsgError('Resolution notes required!');
            return;
        }

        const checkinRef = doc(firestore, 'checkIns', props.recordId);

        await updateDoc(checkinRef, {
            agent: doc(firestore, 'users', loggedInUser.email),
            stage: 'completed'
        });

        

        setFormMsg('Record closed.');

        //hide msg after few seconds
        setTimeout(() => {
            //clear fields
            //setResNotes('');

            setFormMsg('');


            //inform outer Component so that it refreshes inbox
            //and prompts them to take new record
            props.triggerRerender();
        }, 2000);
    }

    const handleResNotesChange = (event) => {
        setResNotes(event.target.value);
    };




    return (
        <div>

            {/* Form Header Section */}
            <div className='d-flex justify-content-between mx-5 mt-3'>
                {/* Title Part */}
                <div className='d-flex justify-content-start align-items-center'>
                    <h3 className='me-2'>Record Details</h3>
                    <span className='badge rounded-pill text-bg-dark'>{recordDetails.type}</span>
                </div>
                {/* Buttons Part - only if not complete or cancelled */}
                {recordDetails.stage != 'cancelled' && recordDetails.stage != 'completed' && <div>
                    {!recordDetails.agentDetails && <button className='btn btn-outline-primary me-3' onClick={acceptTheRecord} >Accept</button>}
                    <button className='btn btn-outline-primary me-3' onClick={saveTheRecord}>Save</button>
                    <button className='btn btn-outline-primary' onClick={completeTheRecord}>Complete</button>
                </div>}
            </div>

            {/* Alert Message - Info */}
            {formMsg && <div className='mx-5 mt-2 alert alert-primary py-1' role="alert">
                {formMsg}
            </div>}

            {/* Alert Message - Error */}
            {formMsgError && <div className='mx-5 mt-2 alert alert-danger py-1' role="alert">
                {formMsgError}
            </div>}



            {recordDetails &&
                <div>
                    <div className='px-4 mt-4 d-flex justify-content-start'>

                        {/* Left Column */}

                        <div className='tb-left-column flex-fill mx-4'>
                            <div class="mb-3">
                                <label class="form-label">User</label>
                                <input type="text" value={recordDetails.userDetails.displayName} disabled class="form-control form-control-sm" />

                            </div>
                            <div class="mb-3">
                                <label class="form-label">Reason</label>
                                <input type="text" value={recordDetails.reasonDetails.Label} disabled class="form-control form-control-sm" />
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Support agent</label>
                                <input type="text" value={recordDetails?.agentDetails?.displayName} disabled class="form-control form-control-sm" />
                            </div>

                        </div>

                        <div className='tb-right-column flex-fill mx-4'>
                            <div class="mb-3">
                                <label class="form-label">Stage</label>
                                <input type="text" value={recordDetails.stageText} readonly disabled class="form-control form-control-sm" />

                            </div>
                            <div class="mb-3">
                                <label class="form-label">Location</label>
                                <input type="text" value={recordDetails.locationDetails.label} readonly disabled class="form-control form-control-sm" />

                            </div>
                            <div class="mb-3">
                                <label class="form-label">Timestamp</label>
                                <input type="text" value={moment(recordDetails.timestamp.toDate()).format('hh:mm a - Do MMM YY ')} disabled class="form-control form-control-sm" />
                            </div>

                        </div>

                    </div>
                    {/* Resolution notes */}
                    <div className='px-4 mx-4'>

                        <label for="resnotes" class="form-label">Resolution notes</label>
                        <textarea value={resNotes} onChange={handleResNotesChange} class="form-control form-control-sm" disabled={(recordDetails.stage == 'completed' || recordDetails.stage == 'cancelled') ? true : false} id="resnotes" rows="3"></textarea>

                    </div>

                </div>
            }
        </div>
    )
}


export default SupportRecordDetails;