import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SliderMenu from './SliderMenu';

function Header({ theme, toggleTheme }) {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!isMenuOpen);
    };

    return (
        <header className="header">
            <button className="menu-btn" onClick={toggleMenu}>
                ☰
            </button>
            <Link to="/" className="logo"></Link>
            <span className="header-title">Counterpick Analyzer</span>
            <div className="theme-switcher">
                <label>{theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</label>
                <label className="switch">
                    <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                    <span className="slider round"></span>
                </label>
            </div>
            <SliderMenu isOpen={isMenuOpen} toggleMenu={toggleMenu} />
        </header>
    );
}

export default Header;
