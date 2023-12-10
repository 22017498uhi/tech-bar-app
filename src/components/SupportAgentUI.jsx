import React, { useState, useEffect, useContext } from 'react';

import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc } from "firebase/firestore";

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

    //Nav menu Items
    const navMenuItems = {};
    navMenuItems.assigned_me = 'Assigned to me';
    navMenuItems.open_unassigned = 'Open - Unassigned';
    navMenuItems.future_apt = 'Future Appointments';
    navMenuItems.all = 'All';
    

    useEffect(() => {

       
    }, []);

    function selectFeature(featureName) {
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



    return (
        <div className="support-agent-ui-comp">
            <div className="left">

                {/* Icon Sidebar */}
                <div className="sidebar">
                    <div className="wrapper mt-3">
                        <div role='button' className={`icon-items my-2 ${selectedFeature == 'inbox' ? 'selected' : ''}`} onClick={() => { selectFeature('inbox') }}><i class="ri-inbox-2-line"></i></div>
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
                        {selectedFeature == 'inbox' && <div>
                            Inbox Content
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
                {/* List of Records section - show only if any record is not selected */}
                {selectedFeature == 'list' &&  !selectedCheckInRecord && 
                    <SupportListRecords selectedNavMenu={selectedNavMenu} navMenuDisplayName={selectedNavMenuDisplayName} setSelectedCheckInRecord={setSelectedCheckInRecord}></SupportListRecords>
                }

                {/* If record is opened either from inbox or list, show its details */}
                {selectedCheckInRecord && 
                    <SupportRecordDetails recordId={selectedCheckInRecord}></SupportRecordDetails>}
            </div>

        </div>
    )

}


export default SupportAgentUI;