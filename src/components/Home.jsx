import React, { useState, useEffect, useContext } from 'react';
import { firestore } from "../services/firebase";

import { collection, onSnapshot, query } from "firebase/firestore";

import appContext from '../context/context';
import ScreenUserSelection from './ScreenUserSelection';
import BookAppointment from './BookAppointment';
import SupportAgentUI from './SupportAgentUI';


function Home() {

    const { loggedInUser, selectedAppLocation, updateSelectedAppLocation } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components

    const [locations, setLocations] = useState([]);
    const [selectedLocation] = useState('');


    useEffect(() => {


        let locationsQuery = query(collection(firestore, "locations"));

        // Fetch locations from Firestore
        const unsubscribeLocations = onSnapshot(locationsQuery, (snapshot) => {
            const locationsArr = snapshot.docs.map((doc) => {
                return { ...doc.data(), id: doc.id };
            });
            setLocations(locationsArr);
        });

        return () => {
            unsubscribeLocations();
        };

        // eslint-disable-next-line
    }, []);


    function setLocationState(locatonId) {

        //find location Obj with this Id
        let selectedLocationObj = locations.find((ele) => {
            return ele.id === locatonId;
        })

        if (selectedLocationObj)
            updateSelectedAppLocation(selectedLocationObj);
        else //if no location passed means we are clearing selected location
            updateSelectedAppLocation({});

    }



    return (
        <div className='container-fluid mt-3 px-5'>
            <div className='row justify-content-center'>

                {/* Location selection Section */}
                <div className='col-md-12'>

                    {/* Appointment User Message */}
                    <div className='mb-2'>
                        {!loggedInUser?.supportAgent === true && <h1>Welcome to Tech Bar!</h1>}
                        {loggedInUser?.supportAgent === true && <h3>Tech Bar Support</h3>}

                    </div>

                    {!selectedAppLocation?.id && <div className="tb-location-section col-md-4">

                        <label className='mt-3 mb-1 form-label h5'>Please select location of the Tech Bar:</label>
                        <select required className='form-select shadow-sm' value={selectedLocation} onChange={(e) => setLocationState(e.target.value)}>
                            <option value="">--Select--</option>
                            {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {location.label}
                                </option>
                            ))}
                        </select>
                    </div>}

                    {selectedAppLocation?.id && <div className="tb-content-section card mt-3">

                        {/* show this if current user is a screen user
                i.e user used for tablet and big tv for checkin, queue list and survey */}
                        <div className='card-header'>
                            <div>
                                <span className="fs-3 me-1">{selectedAppLocation.label}</span>
                                <span ><button className="tb-small-font btn btn-link" onClick={setLocationState}>Change location</button></span>
                            </div>
                        </div>

                        <div className=''>
                            {/* Screen user Section */}
                            {loggedInUser?.screenUser && selectedAppLocation?.id && <div className='tb-screen-user-section mt-3 card-body'>
                                <ScreenUserSelection></ScreenUserSelection>
                            </div>}

                            {/* Normal user Appointment Section - show if its not screen user or support agent */}
                            {(!loggedInUser?.screenUser && !loggedInUser?.supportAgent) && selectedAppLocation?.id && <div className='tb-appointment-section mt-3 card-body'>
                                <BookAppointment></BookAppointment>
                            </div>}

                            {/* Support Agent Section */}
                            {loggedInUser?.supportAgent && selectedAppLocation?.id && <div className='tb-supportagent-section'>
                                <SupportAgentUI></SupportAgentUI>
                            </div>}

                        </div>

                    </div>}

                </div>
            </div>
        </div>


    )
}

export default Home;