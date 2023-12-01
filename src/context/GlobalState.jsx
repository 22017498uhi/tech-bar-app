import React from "react";
import Context from "./context";

export default class GlobalState extends React.Component {
    state = {
        loggedInUser: {}
    }


    updateLoggedInUser = (userObj) => {
        this.setState({
            loggedInUser: userObj
        })
    }

    render(){
        return (
            <Context.Provider
            value={{
                loggedInUser: this.state.loggedInUser,
                updateLoggedInUser: this.updateLoggedInUser
            }}
            >
                {this.props.children}
            </Context.Provider>
        )
    }

}