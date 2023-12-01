import React, { useEffect, useContext } from 'react';


import appContext from '../context/context';


function UserHome() {

    const { loggedInUser } = useContext(appContext); //updates logged in user when auth state changes, logged in user is used by other components


    console.log(loggedInUser);

    return (
        <div>
            Home Sweet Home!!!
        </div>
    )
}

export default UserHome;