import React from 'react';

const StatusPage = ({ serverStatus }) => {
    return (
        <div className="status-page">
            <h2>Server Status</h2>
            <p>Der aktuelle Serverstatus ist: {serverStatus}</p>
        </div>
    );
};

export default StatusPage;
