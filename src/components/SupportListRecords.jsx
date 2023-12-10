import React, { useState, useEffect, useContext } from 'react';

import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc } from "firebase/firestore";

import appContext from '../context/context';

import moment from 'moment';


function SupportListRecords(props) {
    const { loggedInUser, selectedAppLocation } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components
    
    
    const [recordList, setRecordList] = useState([]);


   
    useEffect(() => {

        let unsubscribeFb;

        const locationRef = doc(firestore, "locations", selectedAppLocation?.id);
        const userRef = doc(firestore, "users", loggedInUser.email);

            let queueQuery;

            if (props.selectedNavMenu == 'assigned_me') {
                queueQuery = query(collection(firestore, "checkIns"), where("location", "==", locationRef), where("agent", "==", userRef));
            } else if (props.selectedNavMenu == 'open_unassigned') {
                queueQuery = query(collection(firestore, "checkIns"), where("location", "==", locationRef), where("stage", "==", "in_queue"));
            } else if (props.selectedNavMenu == 'future_apt') {
                queueQuery = query(collection(firestore, "checkIns"), where("location", "==", locationRef), where('isAppointment', '==', true));
            } else {
                queueQuery = query(collection(firestore, "checkIns"), where("location", "==", locationRef));
            }


            unsubscribeFb = onSnapshot(queueQuery, (snapshot) => {

                let promises = [];
                let queueDataArr = [];


                snapshot.docs.forEach(async (doc) => {
                    var finalQueueDataObj = {};

                    let userDoc = getDoc(doc.data().user);
                    let reasonDoc = getDoc(doc.data().reason);
                    let locationDoc = getDoc(doc.data().location);


                    promises.push(userDoc);
                    promises.push(reasonDoc);
                    promises.push(locationDoc);


                    finalQueueDataObj = {
                        id: doc.id,
                        ...doc.data(),
                        timestampDate: doc.data().timestamp.toDate(),
                        userDetails: await userDoc.then((d) => d.data()),
                        reasonDetails: await reasonDoc.then((d) => d.data()),
                        locationDetails: await locationDoc.then((d) => d.data())
                    }


                    queueDataArr.push(finalQueueDataObj);
                    //return { id: doc.id, ...doc.data() }
                });

                Promise.all(promises).then((d) => {

                    setTimeout(() => {

                        //if future appointment menu is selected then filter records based on timestamp
                        if (props.selectedNavMenu == 'future_apt') {
                            queueDataArr = queueDataArr.filter((ele) => {
                                var today = new Date();

                                var todayVal = today.valueOf();
                                var timeStamp = ele.timestampDate.valueOf();

                                return (timeStamp > todayVal);

                            })
                        }


                        if (props.selectedNavMenu == 'assigned_me' || props.selectedNavMenu == 'all') {
                            //sort the newest to oldest. firebase doesnot support sort when query is on differnt field. i.e user
                            queueDataArr.sort((b, a) => {
                                return ((new Date(a.timestampDate).valueOf()) - (new Date(b.timestampDate).valueOf()));
                            })
                        } else {
                            //sort the oldest to newest. firebase doesnot support sort when query is on differnt field. i.e user
                            queueDataArr.sort((a, b) => {
                                return ((new Date(a.timestampDate).valueOf()) - (new Date(b.timestampDate).valueOf()));
                            })
                        }


                        setRecordList(queueDataArr);
                    })
                })

            });

            return () => unsubscribeFb();
        

    }, [props.selectedNavMenu]);

    return (
        <div>
            <div>
                <div className="mx-4 my-3">
                    <h3>Assigned to me</h3>
                </div>
                <div className="">
                    <table className="table table-responsive table-striped table-hover table-borderless">
                        <thead >
                            <tr>
                                <th scope="col"></th>
                                <th scope="col">#</th>
                                <th scope="col">User</th>
                                <th scope="col">Reason</th>
                                <th scope="col">Type</th>
                                <th scope="col">Stage</th>
                                <th scope="col">Timestamp</th>
                            </tr>
                        </thead>

                        <tbody >
                            {recordList && recordList.map((record, index) => (
                                <tr>
                                    <td></td>
                                    <td>
                                        {index + 1}
                                    </td>
                                    <td>
                                        {record.userDetails.displayName}
                                    </td>
                                    <td>
                                        {record.reasonDetails.Label}
                                    </td>
                                    <td>
                                        {record.isAppointment == true && <span className='badge rounded-pill text-bg-dark'>Appointment</span>}
                                        {!record.isAppointment && <span className='badge rounded-pill text-bg-dark'>Check-in</span>}
                                    </td>
                                    <td>
                                        {record.stage == 'in_queue' && <span className='badge text-bg-primary'>In Queue</span>}
                                        {record.stage == 'cancelled' && <span className='badge text-bg-secondary'>Cancelled</span>}
                                        {record.stage == 'serving' && <span className='badge text-bg-info'>Serving</span>}
                                        {record.stage == 'completed' && <span className='badge text-bg-success'>Completed</span>}
                                    </td>

                                    <td>
                                        {moment(record.timestamp.toDate()).format('hh:mm a - Do MMM YY ')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    )

}

export default SupportListRecords;