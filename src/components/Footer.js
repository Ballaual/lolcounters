import React from 'react';
import packageJson from '../../package.json';

function Footer() {
    const buildId = process.env.REACT_APP_GIT_COMMIT || 'unknown';
    const branch = process.env.REACT_APP_GIT_BRANCH || 'unknown';
    const repoUrl = 'https://github.com/Ballaual/lolcounters';
    const commitUrl = buildId !== 'unknown' ? `${repoUrl}/commit/${buildId}` : '#';

    return (
        <footer className="footer">
            Idea by Justdom | Made by Ballaual |
            v. {packageJson.version} |
            Build: {buildId !== 'unknown' ? (
                <a href={commitUrl} target="_blank" rel="noopener noreferrer">
                    {buildId}
                </a>
            ) : 'unknown'} |
            Branch: {branch}
        </footer>
    );
}

export default Footer;
