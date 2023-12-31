import React, { useEffect, useContext } from 'react';

import { Nav, Navbar } from 'react-bootstrap'

import { firestore, auth } from "../services/firebase";
import { doc, getDocFromServer } from "firebase/firestore";

import { NavLink } from 'react-router-dom';

import appContext from '../context/context';


function HeaderNav() {

    const { updateLoggedInUser, hideHeader } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components

    const fetchLoggedInUserFirebase = async () => {

        auth.onAuthStateChanged(async (user) => {
            if (user) {

                setTimeout(async () => {
                    const userRef = doc(firestore, "users", user.email); //email is unique id for users collection
                    const userDoc = await getDocFromServer(userRef);


                    if (userDoc.exists()) {
                        updateLoggedInUser(userDoc.data())
                    }
                });

            } else {
                //logout
                //clear global state
                updateLoggedInUser({})
            }
        })
    }

    useEffect(() => {

        fetchLoggedInUserFirebase();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    return (
        <div>
            {!hideHeader && <div>

                <Navbar className='mb-2 px-5 d-flex justify-content-between' style={{ backgroundColor: '#ecf0f1' }} expand="lg">

                    <Navbar.Brand as={NavLink} to='/home'><img src='/logo-no-background.png' width="150" height="28" alt='Tech Bar Logo'></img></Navbar.Brand>
                    <Nav className="d-flex flex-row justify-content-end" activeKey="/home">

                        <Nav.Item>
                            <Nav.Link className='text-danger ms-2' onClick={() => {
                                auth.signOut();
                            }}>
                                Logout
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>

                </Navbar>

            </div>}

        </div>
    )
}

export default HeaderNav;