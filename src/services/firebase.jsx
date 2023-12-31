// Import the functions 
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
    apiKey: "AIzaSyBmCi_owa30qr0HuebZlo23eFdlqlINel4",
    authDomain: "tech-bar-app.firebaseapp.com",
    projectId: "tech-bar-app",
    storageBucket: "tech-bar-app.appspot.com",
    messagingSenderId: "325681733034",
    appId: "1:325681733034:web:b9a6c768a1f65901389fd3"
  };

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth();
const analytics = getAnalytics(app);
const storage = getStorage(app);
const db = getDatabase(app);


export { app, firestore, auth, analytics, storage, db };