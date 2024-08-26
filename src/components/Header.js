import React from 'react';
import { Link } from 'react-router-dom';

function Header({ theme, toggleTheme }) {
    return (
        <header className="header">
            <div className="logo"></div>
            <span className="header-title">Counterpick Analyzer</span>
            {/* <nav className="navigation">
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/status">Server Status</Link></li>
                    <li><Link to="/changes">Changelog</Link></li>
                </ul>
            </nav> */}
            <div className="theme-switcher">
                <label>{theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</label>
                <label className="switch">
                    <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                    <span className="slider round"></span>
                </label>
            </div>
        </header>
    );
}

export default Header;
