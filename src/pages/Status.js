import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Header, Footer, CookiePopup } from '../components';
import { loadThemeFromCookies, loadCookiePreferences, handleCookiesAcceptance } from '../utils/manageCookies';

// Server URL as a constant
const SERVER_URL = 'https://ballaual.de:54321';

function Status() {
    const [serverStatus, setServerStatus] = useState('Offline');
    const [theme, setTheme] = useState('light');
    const [showCookiePopup, setShowCookiePopup] = useState(false);
    const [cookiesAccepted, setCookiesAccepted] = useState(Cookies.get('cookiesAccepted') === 'true');

    // Initial loading of theme and cookies
    useEffect(() => {
        document.title = "Server Status";

        loadThemeFromCookies(setTheme);
        loadCookiePreferences(setCookiesAccepted, setShowCookiePopup);
    }, []);

    // Toggle theme and save to cookies if accepted
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.body.classList.remove(theme);
        document.body.classList.add(newTheme);
        if (cookiesAccepted) {
            Cookies.set('theme', newTheme);
        }
    };

    // Handle cookie acceptance
    const handleCookiesAcceptanceWrapper = (accept) => {
        handleCookiesAcceptance(accept, setCookiesAccepted, setShowCookiePopup);
    };

    // Check server status periodically
    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                const response = await fetch(`${SERVER_URL}/status`);
                if (response.ok) {
                    setServerStatus('Online');
                } else {
                    setServerStatus('Offline');
                }
            } catch (error) {
                setServerStatus('Offline');
            }
        };

        checkServerStatus();

        const interval = setInterval(checkServerStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`app ${theme}`}>
            <Header theme={theme} toggleTheme={toggleTheme} />

            <div className="main-content">
                <h2>Server Status</h2>
                <div className="status-container">
                    Backend:
                    <div className={`server-status ${serverStatus.toLowerCase()}`}>
                        {serverStatus}
                    </div>
                </div>
            </div>

            <Footer />

            <CookiePopup
                show={showCookiePopup}
                onAccept={() => handleCookiesAcceptanceWrapper(true)}
                onDecline={() => handleCookiesAcceptanceWrapper(false)}
                onClose={() => setShowCookiePopup(false)}
            />
        </div>
    );
}

export default Status;
