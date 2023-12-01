import React, { useState, useEffect } from 'react';

import { firestore, auth } from "../services/firebase";

import { collection, onSnapshot, query, doc, getDoc, where, addDoc } from "firebase/firestore";

const CheckInList = () => {
  const [checkIns, setCheckIns] = useState([]);

  useEffect(() => {

    let queueQuery = query(collection(firestore, "checkIns"));

    const unsubscribe = onSnapshot(queueQuery, (snapshot) => {

        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCheckIns(data);
      });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Check-In List</h2>
      <ul>
        {checkIns.map((checkIn) => (
          <li key={checkIn.id}>
            <strong>User:</strong> {checkIn.user},{' '}
            <strong>Reason:</strong> {checkIn.reason},{' '}
            <strong>Timestamp:</strong> {checkIn.timestamp.toDate().toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CheckInList;
