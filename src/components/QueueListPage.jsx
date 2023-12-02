import React, { useState, useEffect } from 'react';

import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc } from "firebase/firestore";

const CheckInList = () => {
  const [checkIns, setCheckIns] = useState([]);

  useEffect(() => {

    let queueQuery = query(collection(firestore, "checkIns"));

   
    const unsubscribe = onSnapshot(queueQuery, (snapshot) => {

        let promises = [];
        let queueDataArr = [];
    

         snapshot.docs.forEach(async (doc) => {
            var finalQueueDataObj = {};

            let userDoc = getDoc(doc.data().user);
            let reasonDoc = getDoc(doc.data().reason);
            

            promises.push(userDoc);
            promises.push(reasonDoc);
            

            finalQueueDataObj = {
                id: doc.id,
                ...doc.data(),
                timestampDate: doc.data().timestamp.toDate(),
                userDetails: await userDoc.then((d) => d.data()),
                reasonDetails: await reasonDoc.then((d) => d.data())
            }


            queueDataArr.push(finalQueueDataObj) ;
           //return { id: doc.id, ...doc.data() }
        });

        Promise.all(promises).then((d) => {
            
             setTimeout(() => {
                
            console.log(queueDataArr);
             //sort the chatrooms newest to oldest. firebase doesnot support sort when query is on differnt field. i.e user
             queueDataArr.sort((a, b) => {
                return ((new Date(a.timestampDate).valueOf()) - (new Date(b.timestampDate).valueOf()));
            })

  
            setCheckIns(queueDataArr);

             })
          })

        
       
      });

      

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Check-In List</h2>
      <ul>
        {checkIns && checkIns.map((checkIn) => (
            
          <li key={checkIn.id}>
            <strong>User:</strong> {checkIn.userDetails.displayName},{' '}
            <strong>Reason:</strong> {checkIn.reasonDetails.Label},{' '}
            <strong>Timestamp:</strong> {checkIn.timestamp.toDate().toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CheckInList;
