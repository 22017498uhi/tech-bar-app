import React, { useState, useEffect, useContext } from 'react';

import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc, getDocs, getCountFromServer, updateDoc } from "firebase/firestore";

import appContext from '../context/context';

import moment from 'moment';
import SupportListRecords from './SupportListRecords';
import SupportRecordDetails from './SupportRecordDetails';


function SupportAgentUI() {

    const { loggedInUser, selectedAppLocation } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components


    const [selectedFeature, setSelectedFeature] = useState('inbox');

    //stores id of selected navigation menu
    const [selectedNavMenu, setSelectedNavMenu] = useState('assigned_me');

    //stores display Name of selected navigation menu
    const [selectedNavMenuDisplayName, setSelectedNavMenuDisplayName] = useState('Assigned to me');

    const [selectedCheckInRecord, setSelectedCheckInRecord] = useState('');

    const [inboxRecords, setInboxRecords] = useState([]);

    const [agentCurrentRecordCount, setAgentCurrentRecordCount] = useState(0);

    const [rerender, setRerender] = useState(false);

    //Nav menu Items
    const navMenuItems = {};
    navMenuItems.assigned_me = 'Assigned to me';
    navMenuItems.open_unassigned = 'Open - Unassigned';
    navMenuItems.future_apt = 'Future Appointments';
    navMenuItems.all = 'All';

    //limit - number of records which is offered to Agent at a time
    const AGENT_CAPACITY = 1;




    useEffect( () => {

        const locationRef = doc(firestore, "locations", selectedAppLocation?.id);
        const userRef = doc(firestore, "users", loggedInUser.email);

        let promises = [];

        //Fetch active/serving records assigned to the agent
        let agentRecordsQuery = query(collection(firestore, "checkIns"), where("location", "==", locationRef),where("agent", "==", userRef), where("stage", "==", "serving"));
        var agentRecSnap =   getCountFromServer(agentRecordsQuery);

        promises.push(agentRecSnap);


        let unsubscribeFb;

        
        let queueQuery = query(collection(firestore, "checkIns"), where("location", "==", locationRef), where("stage", "==", "in_queue"));


        unsubscribeFb = onSnapshot(queueQuery, (snapshot) => {

            // promises = [];
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
               
            });

            Promise.all(promises).then((d) => {

                console.log(d[0].data().count);

                    //set current records assigned to the agent
                    setAgentCurrentRecordCount(d[0].data().count);


                setTimeout(() => {
                    
                    //sort the oldest to newest. firebase doesnot support sort when query is on differnt field. i.e user
                    queueDataArr.sort((a, b) => {
                        return ((new Date(a.timestampDate).valueOf()) - (new Date(b.timestampDate).valueOf()));
                    })

                    console.log( 'rec ocunt'+ agentCurrentRecordCount);

                    //push only if agent has capacity, company current records with agent limit set at APP level
                    if(agentCurrentRecordCount < AGENT_CAPACITY)
                        setInboxRecords(queueDataArr);
                },500)
            })

        });

        return () => unsubscribeFb();


    }, [rerender]);

    function selectFeature(featureName) {

        //close the opened record details
        setSelectedCheckInRecord('');

        setSelectedFeature(featureName);

    }

    function selectNavMenu(menuName) {

        //clear the recordid if any, coz user clicked on menu item
        //we dont want to show record detail
        setSelectedCheckInRecord('');

        //set displayName
        setSelectedNavMenuDisplayName(navMenuItems[menuName]);
        //set menu state 
        setSelectedNavMenu(menuName);
    }

    //trigger reredner when user closed their record, this is so that our inbox feature becomes realtime.
    function triggerRerender(){

        //clear the selected record
        setSelectedCheckInRecord('');


        setRerender(!rerender);
    }

    //open the accepted record and assign to logged in agent
    async function acceptRecord(){
        //lets first assign to agent.
        const checkinRef = doc(firestore, 'checkIns', inboxRecords[0].id);

        await updateDoc(checkinRef, {
            agent: doc(firestore, 'users', loggedInUser.email),
            stage: 'serving'
        });


        triggerRerender();


        //Now Open the record
        //assuming here that agent always accepts first record.
        //this LOGIC needs to be re-coded when we allow agent to work on multiple records.
        setSelectedCheckInRecord(inboxRecords[0].id);
    }



    return (
        <div className="support-agent-ui-comp">
            <div className="left">

                {/* Icon Sidebar */}
                <div className="sidebar">
                    <div className="wrapper mt-3">
                        <div role='button' className={`icon-items position-relative my-2 ${selectedFeature == 'inbox' ? 'selected' : ''}`} onClick={() => { selectFeature('inbox') }}><span><i class="ri-inbox-2-line"></i></span>
                        { (inboxRecords.length>0) && (agentCurrentRecordCount < AGENT_CAPACITY)  && <span class="position-absolute top-10 start-100 translate-middle badge rounded-pill bg-danger">{AGENT_CAPACITY}</span> } </div>
                        <div role='button' className={`icon-items my-2 ${selectedFeature == 'list' ? 'selected' : ''}`} onClick={() => { selectFeature('list') }}><i class="ri-list-check"></i></div>
                        <div role='button' className={`icon-items my-2 ${selectedFeature == 'reports' ? 'selected' : ''}`} onClick={() => { selectFeature('reports') }}><i class="ri-line-chart-line"></i></div>
                    </div>
                </div>

                {/* Side Navigation */}
                <div className="navigation">
                    <div className="wrapper">
                        {/* List Content  */}
                        {selectedFeature == 'list' && <div className="mt-4">
                            {/* <small className="text-body-secondary">
                                Work
                            </small> */}
                            <div role='button' onClick={() => { selectNavMenu('assigned_me') }}
                                className={`nav-menu-items my-3 ${selectedNavMenu == 'assigned_me' ? 'selected' : ''} `}>
                                <span><i class="ri-account-box-line"></i></span>  <span>Assigned to me</span>
                            </div>
                            <div role='button' onClick={() => { selectNavMenu('open_unassigned') }}
                                className={`nav-menu-items my-3 ${selectedNavMenu == 'open_unassigned' ? 'selected' : ''} `}>
                                <span><i class="ri-layout-left-2-line"></i></span>  <span>Open - Unassigned</span>
                            </div>
                            <div role='button' onClick={() => { selectNavMenu('future_apt') }}
                                className={`nav-menu-items my-3 ${selectedNavMenu == 'future_apt' ? 'selected' : ''} `}>
                                <span><i class="ri-calendar-schedule-line"></i></span>  <span>Future Appointments</span>
                            </div>
                            <div role='button' onClick={() => { selectNavMenu('all') }}
                                className={`nav-menu-items my-3 ${selectedNavMenu == 'all' ? 'selected' : ''} `}>
                                <span><i class="ri-file-list-line"></i></span>  <span>All</span>
                            </div>
                        </div>}

                        {/* Inbox Content */}
                        {selectedFeature == 'inbox' &&
                            <div>
                              { ( (inboxRecords.length> 0) && (agentCurrentRecordCount < AGENT_CAPACITY) ) ?  <div className='card my-2'>
                                    {/* <h3>{agentCurrentRecordCount}</h3>
                                    <h4>inbox record {inboxRecords.length}</h4> */}
                                    <div className='card-body'>
                                    {inboxRecords[0].isAppointment && <small><span><i class="ri-calendar-event-line"></i> </span><span>Appointment</span></small>}
                                    {!inboxRecords[0].isAppointment && <small><span><i class="ri-user-received-2-line"></i> </span><span>Check-in</span></small>}
                                        <h5>{inboxRecords[0].reasonDetails.Label}</h5>
                                        <div>{inboxRecords[0].userDetails.displayName}</div>
                                    </div>
                                    <div className='mx-3'>
                                        <hr className='mb-0 mt-0' />
                                    </div>
                                    <div className='mb-2 mt-2 text-center'>
                                        <button className='btn btn-sm btn-outline-success px-5' onClick={acceptRecord}>Accept</button>
                                    </div>
                                </div> :
                                // Show empty state message
                                <div>
                                    <div className='tb-empty-inbox text-center mt-5'>
                                        <div className='fs-1' style={{color:'#8789fe'}}>
                                        <i class="ri-file-list-2-line"></i>
                                            </div>
                                            <div>
                                               <b>No inbox items</b> 
                                                </div>
                                                <small>
                                                    Work items will appear here, once they are assgined to you.
                                                    </small>
                                    </div>
                                </div> }
                            </div>}

                        {/* Reports Content */}
                        {selectedFeature == 'reports' && <div>
                            Reports Content
                        </div>}

                    </div>
                </div>

            </div>

            {/* Main content Pane */}
            <div className="right-side">

                {/* Empty message when inbox is selected and no record is open */}
                {selectedFeature == 'inbox' && !selectedCheckInRecord &&
                    <div className='flex-grow-1 inbox-empty  d-flex justify-content-center align-items-center'>
                        <div className='flex-grow-1 text-center'>
                            <div className='display-2 text-primary'>
                                <i class="ri-inbox-line"></i>
                            </div>
                            <div className='display-6 text-primary'>
                                <b>Please check your inbox!</b>
                            </div>
                            <div>Click on a card from the Inbox to see its details.</div>
                        </div>



                    </div>}


                {/* List of Records section - show only if any record is not selected */}
                {selectedFeature == 'list' && !selectedCheckInRecord &&
                    <SupportListRecords selectedNavMenu={selectedNavMenu} navMenuDisplayName={selectedNavMenuDisplayName} setSelectedCheckInRecord={setSelectedCheckInRecord}></SupportListRecords>
                }

                {/* If record is opened either from inbox or list, show its details */}
                {selectedCheckInRecord &&
                    <SupportRecordDetails recordId={selectedCheckInRecord} triggerRerender={triggerRerender}></SupportRecordDetails>}
            </div>

        </div>
    )

}


export default SupportAgentUI;