import React from 'react';
import packageJson from '../../package.json';
import '../styles/Footer.css';

import cookieImage from '../assets/cookies.png';

function Footer({ onCookieClick }) {
    const buildId = process.env.REACT_APP_GIT_COMMIT || 'unknown';
    const branch = process.env.REACT_APP_GIT_BRANCH || 'unknown';
    const repoUrl = 'https://github.com/Ballaual/lolcounters';
    const commitUrl = buildId !== 'unknown' ? `${repoUrl}/commit/${buildId}` : '#';

    return (
        <footer className="footer">
            <div className="footer-line">
                Idea by Justdom | Made by Ballaual | v. {packageJson.version}
            </div>
            <div className="footer-line">
                Build: {buildId !== 'unknown' ? (
                    <a href={commitUrl} className="commit-link" target="_blank" rel="noopener noreferrer">
                        {buildId}
                    </a>
                ) : 'unknown'} | Branch: {branch}
            </div>
            {/* Cookie Image */}
            <div className="cookie-container">
                <img
                    src={cookieImage}
                    alt="Cookie Settings"
                    className="cookie-button"
                    onClick={onCookieClick}
                    width={32}
                    height={32}
                />
            </div>
        </footer>
    );
}

export default Footer;
