import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/main.css';

function Navbar() {
    const location = useLocation();
    const [activeTripId, setActiveTripId] = useState(null);

    useEffect(() => {
        const match = location.pathname.match(/\/(?:bookings|excursions|expenses|edit-trip)\/(\d+)/);

        if (match) {
            const idFromUrl = match[1];
            setActiveTripId(idFromUrl);
            localStorage.setItem('activeTripId', idFromUrl);
        } else {
            const stored = localStorage.getItem('activeTripId');
            if (stored) {
                setActiveTripId(stored);
            }
        }
    }, [location.pathname]);

    return (
        <nav className="modern-navbar">
            <div className="modern-logo">Vacation Planner</div>
            <ul className="modern-nav-list nav-right">
                <li><Link to="/" className="nav-link">Trips</Link></li>
                {activeTripId ? (
                    <>
                        <li><Link to={`/bookings/${activeTripId}`} className="nav-link">Bookings</Link></li>
                        <li><Link to={`/excursions/${activeTripId}`} className="nav-link">Excursions</Link></li>
                        <li><Link to={`/expenses/${activeTripId}`} className="nav-link">Expenses</Link></li>
                    </>
                ) : (
                    <>
                        <li><span className="nav-link" style={{ opacity: 0.4, cursor: 'default' }}>Bookings</span></li>
                        <li><span className="nav-link" style={{ opacity: 0.4, cursor: 'default' }}>Excursions</span></li>
                        <li><span className="nav-link" style={{ opacity: 0.4, cursor: 'default' }}>Expenses</span></li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;