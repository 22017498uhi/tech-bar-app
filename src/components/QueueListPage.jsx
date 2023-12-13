import React, { useState, useEffect, useContext } from 'react';

import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc } from "firebase/firestore";

import appContext from '../context/context';

import moment from 'moment';


const CheckInList = () => {

  const { selectedAppLocation } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components

  const [checkIns, setCheckIns] = useState([]);

  const [servings, setServings] = useState([]);

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');


  //get current date and time - update every second
    setInterval(() => {
      setCurrentDate (moment().format('dddd, MMM Do '));
      setCurrentTime (moment().format('h:mm a'));
    }, 1000);
  

  
    
  

  useEffect(() => {

    //console.log(selectedAppLocation?.id);

    const locationRef = doc(firestore, "locations", selectedAppLocation?.id);

    let queueQuery = query(collection(firestore, "checkIns"), where("location", "==", locationRef), where('stage', 'in', ['serving', 'in_queue']));


    const unsubscribe = onSnapshot(queueQuery, (snapshot) => {

      let promises = [];
      let queueDataArr = [];


      snapshot.docs.forEach(async (doc) => {
        var finalQueueDataObj = {};

        let userDoc = getDoc(doc.data().user);
        let reasonDoc = getDoc(doc.data().reason);
        let agentDoc;

            if (doc.data().agent)
                agentDoc = getDoc(doc.data().agent);


        promises.push(userDoc);
        promises.push(reasonDoc);
        if (agentDoc)
                promises.push(agentDoc);


        finalQueueDataObj = {
          id: doc.id,
          ...doc.data(),
          timestampDate: doc.data().timestamp.toDate(),
          userDetails: await userDoc.then((d) => d.data()),
          reasonDetails: await reasonDoc.then((d) => d.data())
          
        }

        //fetch agent details if present
        if (agentDoc)
          finalQueueDataObj.agentDetails = await agentDoc.then((d) => d.data())


        queueDataArr.push(finalQueueDataObj);
        //return { id: doc.id, ...doc.data() }
      });

      Promise.all(promises).then((d) => {

        setTimeout(() => {

          console.log(queueDataArr);

          //filter records - keep only today's records
          //so that we dont show future appointments in queue
          queueDataArr =  queueDataArr.filter((ele) => {
            var today = new Date();
            today.setHours(23);

            var todayVal = today.valueOf();
            var timeStamp = ele.timestampDate.valueOf();

            return (timeStamp < todayVal );

          })

          //sort the chatrooms newest to oldest. firebase doesnot support sort when query is on differnt field. i.e user
          queueDataArr.sort((a, b) => {
            return ((new Date(a.timestampDate).valueOf()) - (new Date(b.timestampDate).valueOf()));
          })


          //find all checkins with "in_queue" stage
          let inQueueArr = queueDataArr.filter((ele) => {
            return ele.stage == 'in_queue';
          })
          setCheckIns(inQueueArr);

          //Now find all checkins with "serving" stage
          let servingsArr = queueDataArr.filter((ele) => {
            return ele.stage == 'serving';
          })
          setServings(servingsArr);

        })
      })



    });



    return () => unsubscribe();
  }, []);

  return (
    <div className='tb-queuepage-container' >
      {/* Location and Time section */}
      <div className='d-flex justify-content-between ms-5 me-5 mt-3 '>
        <div>
          <label>Location:</label>
          <div className='h5'>{selectedAppLocation.label}</div>
        </div>

        <div className='text-end'>
          <label >{currentDate}</label>
          <div className='h5'>{currentTime}</div>
        </div>
      </div>

      {/* Brand and Welcome Section */}
      <div>
        <div className='mb-5 text-center'>
          <img src='/logo-no-background.png' height={52} width={300}></img>
          <div className='text-center mt-3 h3'>Wellcome to {selectedAppLocation.label} Tech Bar!</div>
        </div>
      </div>

      {/* Queue list Section */}
      <div className='tb-queuelist-container'>
        <section className='left-content'>
          <div className='d-flex flex-nowrap justify-content-between tb-table-header'>
            <h2 className='h4'>Now serving</h2>
            <h2 className='h4'>Agent</h2>
          </div>
          <div className='ps-4 pe-4 serving-list'>
          
            {servings && servings.map((checkIn,index) => (

              <div key={checkIn.id} >
                <div className='d-flex justify-content-between align-items-center mb-4'>
                 
                  <span className='display-6'>{index+1}. {checkIn.userDetails.displayName}</span>
                  <span className='agent-name'>{checkIn?.agentDetails?.displayName}</span>
                </div>
              </div>
            ))}
          
          </div>

        </section>
        <section className='right-content'>
          <div className='d-flex flex-nowrap justify-content-between tb-table-header'>
            <h2 className='h4'>Up next <span className='queue-count'><i>({checkIns.length} visitors in queue)</i></span></h2>
            <h2 className='h4'>Time</h2>
          </div>
          <div className='ps-4'>
          
            {checkIns && checkIns.map((checkIn,index) => (

              <div key={checkIn.id} >
                <div className='d-flex justify-content-between align-items-center mb-4'>
                 
                  <span className='display-6'>{index+1}. {checkIn.userDetails.displayName}</span>

                  {/* special calendar icon display to differntiate appointments */}
                  {checkIn?.isAppointment && <span className='checkin-time badge rounded-pill text-bg-light'><span><i class="ri-calendar-2-line"></i></span> { moment( checkIn.timestamp.toDate() ).format('hh:mm a')}</span>}

                  {/* Normal display if its a checkin */}
                  {!checkIn?.isAppointment && <span className='checkin-time'>{ moment( checkIn.timestamp.toDate() ).format('hh:mm a')}</span>}
                </div>
              </div>
            ))}
          
          </div>

        </section>
      </div>



    </div>
  );
};

export default CheckInList;
