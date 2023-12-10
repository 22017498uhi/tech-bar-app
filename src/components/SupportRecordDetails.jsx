import React, { useState, useEffect, useContext } from 'react';

import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc } from "firebase/firestore";

import appContext from '../context/context';

import moment from 'moment';





function SupportRecordDetails(props) {

    const [recordDetails, setRecordDetails] = useState('');


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

            if(doc.data().agent)
                 agentDoc = getDoc(doc.data().agent);


            promises.push(userDoc);
            promises.push(reasonDoc);
            promises.push(locationDoc);

            if(agentDoc)
                promises.push(agentDoc);


            finalRecordDataObj = {
                id: doc.id,
                ...doc.data(),
                timestampDate: doc.data().timestamp.toDate(),
                userDetails: await userDoc.then((d) => d.data()),
                reasonDetails: await reasonDoc.then((d) => d.data()),
                locationDetails: await locationDoc.then((d) => d.data())
                
            }

            //fetch agent details if present
            if(agentDoc)
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
    }, []);


    return (
        <div>

            {/* Form Header Section */}
            <h3 className='px-5 mt-4 mb-2'>Record Details</h3>


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
                        <textarea class="form-control form-control-sm" id="resnotes" rows="3"></textarea>
                    
                    </div>

                </div>
            }
        </div>
    )
}


export default SupportRecordDetails;