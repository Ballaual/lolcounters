import React from 'react';
import { Link } from 'react-router-dom';

const Navigation = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/status">Status</Link>
                </li>
                <li>
                    <Link to="/changes">Changes</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navigation;
