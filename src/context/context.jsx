import React from 'react';

export default React.createContext({

    loggedInUser: {},
    updateLoggedInUser: (userObj) => {},

    selectedAppLocation: {},
    updateSelectedAppLocation: (locationObj) => {}

})