import React from 'react';

function CookiePopup({ show, onAccept, onDecline, onClose }) {
    if (!show) return null;

    return (
        <div className="cookie-popup">
            <div className="cookie-popup-content">
                <button className="close-popup" onClick={onClose}>×</button>
                <h2>Cookie Settings</h2>
                <p>Do you accept cookies for improved user experience?</p>
                <button className="btn accept" onClick={onAccept}>Accept</button>
                <button className="btn decline" onClick={onDecline}>Decline</button>
            </div>
        </div>
    );
}

export default CookiePopup;
