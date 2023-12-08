import React, { useState, useEffect, useContext } from 'react';

import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc, Timestamp, getCountFromServer } from "firebase/firestore";


import appContext from '../context/context';

function SurveyPage() {

    const { selectedAppLocation } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components

    const [selectedSmiley, setSelectedSmiley] = useState('');

    function saveFeedback(type) {

        //if selected smiley is already there
        //then return, in case use selects multiple smiley one after another
        if(selectedSmiley)
            return;

        //update state so that UI/smileys are updated
        setSelectedSmiley(type);

        //now save the feedback to firebase
        
        addDoc(collection(firestore, "feedbacks"), ({
            location: doc(firestore, "locations", selectedAppLocation.id),
            value: type,
            timestamp: Timestamp.fromDate(new Date()) //store current time,
        })).then(async () => {

            setTimeout(() => {
                setSelectedSmiley('');
            },5000)
            
        });


    }


    return (
        <div className='container' style={{ marginTop: '20%' }}>

            <div className='row justify-content-center'>
                <div className={`col-md-9`}>

                    {/* brand logo */}
                    <div className='mb-5 text-center'>
                        <img src='/logo-no-background.png' height={52} width={300}></img>
                    </div>

                    <h5 className='mb-4 text-center'>Thanks for visiting us today.</h5>
                    <h6 className='mt-4 text-center'>Please rate your overall experience.</h6>

                    <div className='d-flex flex-wrap justify-content-center'>
                        <div role='button' className='smiley-wrapper mx-4 my-4' onClick={() => { saveFeedback('positive') }}>
                            {selectedSmiley != 'positive' && <img style={{ opacity: !selectedSmiley ? '1' : '0.2' }} className='img' src='happy-smiley.svg'></img>}
                            {selectedSmiley == 'positive' && <img  className='img' src='happy-selected-smiley.svg'></img>}
                            {selectedSmiley == 'positive' && <div className='text-center border border-2 px-3 py-2 rounded'>Awesome! Good to know.</div>}
                        </div>
                        <div role='button' className='smiley-wrapper  mx-4 my-4' onClick={() => { saveFeedback('neutral') }}>
                            {selectedSmiley != 'neutral' && <img style={{ opacity: !selectedSmiley ? '1' : '0.2' }} className='img' src='ok-smiley.svg'></img>}
                            {selectedSmiley == 'neutral' && <img  className='img' src='ok-selected-smiley.svg'></img>}
                            {selectedSmiley == 'neutral' && <div className='text-center border border-2 px-3 py-2 rounded'>Got it! Good to know.</div>}

                        </div>
                        <div role='button' className='smiley-wrapper  mx-4 my-4' onClick={() => { saveFeedback('negative') }}>
                            {selectedSmiley != 'negative' && <img style={{ opacity: !selectedSmiley  ? '1' : '0.2' }} className='img' src='sad-smiley.svg'></img>}
                            {selectedSmiley == 'negative' && <img  className='img' src='sad-selected-smiley.svg'></img>}
                            {selectedSmiley == 'negative' && <div className='text-center border border-2 px-3 py-2 rounded'>Sorry to hear.</div>}

                        </div>
                    </div>

                    {selectedSmiley && <div class="alert alert-primary" role="alert">
                    Your response has been submitted. Thanks for taking the survey!
                    </div>}

                </div>
            </div>

        </div>
    )
}

export default SurveyPage;