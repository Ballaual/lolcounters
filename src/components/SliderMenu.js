import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SliderMenu.css';

function SliderMenu({ isOpen, toggleMenu }) {
    return (
        <div className={`slider-menu ${isOpen ? 'open' : ''}`}>
            <button className="close-btn" onClick={toggleMenu}>×</button>
            <nav>
                <ul>
                    <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
                    {/* <li><Link to="/status" onClick={toggleMenu}>Status</Link></li> */}
                    {/* <li><Link to="/imprint" onClick={toggleMenu}>Imprint</Link></li> */}
                </ul>
            </nav>
        </div>
    );
}

export default SliderMenu;
