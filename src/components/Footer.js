import React from 'react';
import packageJson from '../../package.json';

function Footer() {
    return (
        <footer className="footer">
            Idea by Justdom | Made by Ballaual | v. {packageJson.version}
        </footer>
    );
}

export default Footer;
