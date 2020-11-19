import React, { Component } from 'react';

import AuthContext from '../context/auth-context';

class profile extends Component {
    static contextType = AuthContext;


    render() {
        return (
            <h1> {this.context.isAuth ? 'You are logged in!' : 'Not logged in!'}</h1 >
        );
    }
}




export default profile;