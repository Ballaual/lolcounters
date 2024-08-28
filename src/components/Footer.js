import React from 'react';
import packageJson from '../../package.json';
import '../styles/Footer.css';

function Footer() {
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
        </footer>
    );
}

export default Footer;
