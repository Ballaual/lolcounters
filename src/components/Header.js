import React from 'react';

function Header({ theme, toggleTheme }) {
    return (
        <header className="header">
            <div className="logo"></div>
            <span className="header-title">Counterpick Analyzer</span>
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
