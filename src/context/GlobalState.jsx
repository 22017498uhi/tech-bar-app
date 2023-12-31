import React from "react";
import Context from "./context";

export default class GlobalState extends React.Component {
    state = {
        loggedInUser: {},
        selectedAppLocation: {}
    }

    updateLoggedInUser = (userObj) => {
        this.setState({
            loggedInUser: userObj
        })
    }

    updateSelectedAppLocation = (locationObj) => {
        this.setState({
            selectedAppLocation: locationObj
        })
    }

    render() {
        return (
            <Context.Provider
                value={{
                    loggedInUser: this.state.loggedInUser,
                    updateLoggedInUser: this.updateLoggedInUser,
                    selectedAppLocation: this.state.selectedAppLocation,
                    updateSelectedAppLocation: this.updateSelectedAppLocation
                }}
            >
                {this.props.children}
            </Context.Provider>
        )
    }

}