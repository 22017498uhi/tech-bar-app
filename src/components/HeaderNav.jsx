import React, { useState, useEffect, useContext } from 'react';

import { Nav, Navbar } from 'react-bootstrap'

import { firestore, auth } from "../services/firebase";
import { doc, getDocFromServer } from "firebase/firestore";

import { NavLink, useLocation  } from 'react-router-dom';

import appContext from '../context/context';


function HeaderNav() {

   
    const { updateLoggedInUser, hideHeader } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components
    
    const fetchLoggedInUserFirebase = async () => {

        auth.onAuthStateChanged(async (user) => {
            if (user) {

                setTimeout(async() => {
                    const userRef = doc(firestore, "users", user.email); //email is unique id for users collection
                    const userDoc = await getDocFromServer(userRef);
    
                    
                    if (userDoc.exists()) {
                        console.log('userABCD')
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

    // function checkIfHeaderHidden (){

    //     //hide header for below 3 pages.
    // if(location.pathname == '/usercheckin' || location.pathname == '/queuelist' || location.pathname == '/survey')
    //     setHideHeader(true);

    // } 

    useEffect(() => {
        
        fetchLoggedInUserFirebase();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    


    return (
        <div>
            {!hideHeader && <div>

                <Navbar className='mb-2 px-5 d-flex justify-content-between' style={{backgroundColor:'#ecf0f1'}} expand="lg">
                   
                    <Navbar.Brand as={NavLink} to='/home'><img src='/logo-no-background.png' width="150" height="28"></img></Navbar.Brand>
                        <Nav className="d-flex flex-row justify-content-end"  activeKey="/home">

                            {/* <Nav.Item>
                                <Nav.Link className='me-2' as={NavLink} to='/queuelist' eventKey="agent-console">
                                    Queue List
                                </Nav.Link>
                            </Nav.Item>

                            <Nav.Item>
                                <Nav.Link className='me-2' as={NavLink} to='/usercheckin' eventKey="user-checkin">
                                    User CheckIn
                                </Nav.Link>
                            </Nav.Item> */}

                            <Nav.Item>
                                <Nav.Link className='text-danger ms-2' onClick={() => {
                                    auth.signOut();
                                }}>
                                    Logout
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    
                </Navbar>

            </div> }

        </div>
    )
}

export default HeaderNav;