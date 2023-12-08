import React, { useState, useEffect, useContext } from 'react';
import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc, Timestamp } from "firebase/firestore";


import appContext from '../context/context';
import ScreenUserSelection from './ScreenUserSelection';
import BookAppointment from './BookAppointment';


function Home() {

    const { loggedInUser, selectedAppLocation, updateSelectedAppLocation } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components

    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');


    useEffect(() => {



        console.log(selectedAppLocation);


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
    }, []);


    function setLocationState(locatonId) {

        //find location Obj with this Id
        let selectedLocationObj = locations.find((ele) => {
            return ele.id == locatonId;
        })

        if (selectedLocationObj)
            updateSelectedAppLocation(selectedLocationObj);
        else //if no location passed means we are clearing selected location
            updateSelectedAppLocation({});

    }



    return (
        <div className='container mt-5'>
            <div className='row justify-content-center'>

                {/* Location selection Section */}
                <div className='col-md-10'>

                    {/* Appointment User Message */}
                    <div className='mb-2'>
                        <h1>Welcome to Tech Bar!</h1>

                    </div>

                    {!selectedAppLocation?.id && <div className="tb-location-section">



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

                    {selectedAppLocation?.id && <div className="tb-content-section card mt-5">

                        {/* show this if current user is a screen user
                i.e user used for tablet and big tv for checkin, queue list and survey */}
                        <div className='card-header'>
                            <div>
                                <span className="fs-3 me-2">{selectedAppLocation.label}</span>
                                <span ><a href='#' className="tb-small-font" onClick={setLocationState}>Change location</a></span>
                            </div>
                        </div>

                        <div className='card-body'>
                        {/* Screen user Section */}
                        <div className='tb-screen-user-section mt-3'>

                            {loggedInUser?.screenUser && selectedAppLocation?.id && <ScreenUserSelection></ScreenUserSelection>}
                        </div>

                        {/* Normal user Appointment Section */}
                        <div className='tb-appointment-section'>

                            {!loggedInUser?.screenUser && selectedAppLocation?.id && <BookAppointment></BookAppointment>}
                        </div>

                        </div>

                    </div>}



                </div>






            </div>
        </div>


    )
}

export default Home;