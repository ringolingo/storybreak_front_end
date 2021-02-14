import React from 'react';
import { GoogleLogout } from 'react-google-login';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Logout = () => {
    const onSuccess = () => {
        alert('you have logged out');
        console.log('logged out');
    };

    return (
        <div>
            <GoogleLogout 
                clientId={clientId}
                buttonText="Logout"
                onLogoutSuccess={onSuccess}
            />
        </div>
    )
}

export default Logout;