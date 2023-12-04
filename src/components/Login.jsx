//import firebase from "firebase/app";
import React, { useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { firestore, auth } from "../services/firebase";

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function Login() {

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [isSignUp, setIsSignUp] = useState(true);


    const handleLogin = async () => {
        try {

            // Basic form validation
            if (!email || !password) {
                setErrorMessage('Please fill in all fields.');
                return;
            }

            await signInWithEmailAndPassword(auth, email, password);
            console.log('User logged in successfully!');

        } catch (error) {
            setErrorMessage(error.message);
            console.error('Error logging in:', error.message);
        }
    };

    const handleSignUp = () => {
        try {

            // Basic form validation
            if (!displayName || !email || !password || !confirmPassword) {
                setErrorMessage('Please fill in all fields.');
                return;
            }
            // Check if passwords match
            if (password !== confirmPassword) {
                setErrorMessage("Passwords don't match.");
                return;
            }

            //await createUserWithEmailAndPassword(auth, email, password);

            // Create user account
            createUserWithEmailAndPassword(auth, email, password).then((resp) => {
                console.log('User registered successfully!');

                if (resp.user) {

                    //create user in firestore
                    const userObj = {
                        displayName: displayName,
                        email: resp.user.email,
                        photoURL: resp.user.photoURL
                    }

                    //setDoc - add if not there.. if already there ignore, if any change, update existing record.
                    setDoc(doc(firestore, "users",
                        resp.user.email), (userObj), { merge: true });
                }

            }).catch((error) => {
                setErrorMessage(error.message);
                console.error('Error signing up:', error.message);
            })

        } catch (error) {

        }
    };


    return (
        <div style={{ display: 'flex', flex: 1, height: '100vh' }}>
            <div style={{
                display: 'flex',
                flex: 1,
                justifyContent: 'center',
                alignItems: 'flex-start',
                minWidth: 300
            }}>

                <div>

                    {isSignUp && <h4 className='text-center'>Sign Up</h4>}
                    {!isSignUp && <h4 className='text-center'>Login</h4>}
                    <hr />

                    {/* Sign Up form */}
                    {isSignUp && <div>
                        <div className="mb-3">
                            <label htmlFor="displayname" className="form-label">Display name</label>
                            <input type="text" required className="form-control" id="displayname" placeholder="Enter your display name" 
                                value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

                        </div>
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="form-label">Email</label>
                            <input type="email" required className="form-control" id="exampleInputEmail1" placeholder="Enter your email" aria-describedby="emailHelp"
                                value={email} onChange={(e) => setEmail(e.target.value)} />

                        </div>
                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                            <input type="password" required className="form-control" id="exampleInputPassword1" placeholder="Enter password"
                                value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">Confirm Password</label>
                            <input type="password" required className="form-control" id="exampleInputPassword2" placeholder="Enter password again"
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>

                        <button className="btn btn-primary tb-full-width" onClick={handleSignUp}>Sign Up</button>
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    </div>}


                    {/* Login form */}
                    {!isSignUp && <div>
                        <div className="mb-3">
                            <label htmlFor="exampleInputEmail1" className="form-label">Email</label>
                            <input type="email" className="form-control" id="exampleInputEmail1" placeholder="Enter your email" aria-describedby="emailHelp"
                                value={email} onChange={(e) => setEmail(e.target.value)} />

                        </div>
                        <div className="mb-3">
                            <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                            <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Enter password"
                                value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <button className="btn btn-primary tb-full-width" onClick={handleLogin}>Sign In</button>
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    </div>}






                    <p className="hr-lines"> OR </p>

                    <div>
                        <button className="btn btn-primary tb-full-width" onClick={async () => {
                            const auth = getAuth();
                            const provider = new GoogleAuthProvider();
                            signInWithPopup(auth, provider).then((resp) => {
                                if (resp.user) {

                                    //create user in firestore
                                    const userObj = {
                                        displayName: resp.user.displayName,
                                        email: resp.user.email,
                                        photoURL: resp.user.photoURL
                                    }

                                    //setDoc - add if not there.. if already there ignore, if any change, update existing record.
                                    setDoc(doc(firestore, "users",
                                        resp.user.email), (userObj), { merge: true });
                                }
                            })

                        }}>
                            <span className='me-2'><i className="ri-google-fill"></i></span><span>Continue with Google</span>
                        </button>
                    </div>

                    {/* sign in message */}
                    {isSignUp && <div className='mt-3'>
                        <div className='d-flex align-items-center'><span>Already have an account? </span><button className="btn btn-link" onClick={() => { setIsSignUp(false) }} >Log in</button></div>
                    </div>}

                    {/* sign up message */}
                    {!isSignUp && <div className='mt-3'>
                        <div className='d-flex align-items-center'><span>Don't have the account?</span> <button className="btn btn-link" onClick={() => { setIsSignUp(true) }} >Sign Up</button></div>
                    </div>}



                </div>

            </div>
        </div>
    )
}

export default Login;