import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getTrips, createTrip } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import Footer from '../components/Footer';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import '../styles/main.css';

function TripsPage() {
    const [trips, setTrips] = useState([]);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();


    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState('');
    const userId = 1;
    const today = new Date();

    useEffect(() => {
        loadTrips();
    }, []);


    useEffect(() => {
        if (!destination) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const delay = setTimeout(async () => {
            try {
                const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                const response = await axios.get(
    `${API_URL}/api/cities?q=${encodeURIComponent(destination)}`
        );
                setSuggestions(response.data);
                setShowSuggestions(true);
            } catch (err) {
                console.error('Error fetching city suggestions:', err);
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [destination]);

    async function loadTrips() {
        try {
            const data = await getTrips();
            setTrips(data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load trips. Check your network or backend.' });
            console.error(err);
        }
    }

    async function handleAddTrip(e) {
        e.preventDefault();

        const finalDestination = selectedDestination || destination;
        if (!finalDestination || !startDate || !endDate) {
            setMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }

        try {
            await createTrip({
                destination: finalDestination,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                userId,
            });
            setMessage({ type: 'success', text: 'Trip added successfully!' });

            setDestination('');
            setStartDate(null);
            setEndDate(null);
            setSuggestions([]);
            setShowSuggestions(false);
            setSelectedDestination('');
            loadTrips();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to add trip.' });
            console.error(err);
        }
    }

    function handleSuggestionClick(s) {
        setDestination(s);
        setSelectedDestination(s);
        setShowSuggestions(false);
    }

    function handleBlur() {
        setTimeout(() => setShowSuggestions(false), 300);
    }

    function handleSelectTrip(tripId) {
        localStorage.setItem('activeTripId', tripId);
        navigate(`/bookings/${tripId}`);
    }

    function handleEditTrip(e, tripId) {
        e.stopPropagation();
        navigate(`/edit-trip/${tripId}`);
    }

    return (
        <div className="app-background">
            <div className="container modern-container">
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2000,
                    pointerEvents: 'none'
                }}>
                    <div style={{ pointerEvents: 'auto' }}>
                        <AlertBanner
                            message={message?.text}
                            type={message?.type}
                            onClose={() => setMessage(null)}
                        />
                    </div>
                </div>

                <h1 className="page-title">Your Trips</h1>

                {trips.length === 0 && (
                    <p className="alert alert-info">No trips yet. Add one below!</p>
                )}

                {}
                {trips.map(trip => (
                    <div
                        key={trip.id}
                        className="card modern-card"
                        onClick={() => handleSelectTrip(trip.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h2 style={{ marginBottom: '4px' }}>{trip.destination}</h2>
                                <p className="trip-dates">
                                    {trip.startDate} → {trip.endDate}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                <button
                                    onClick={(e) => handleEditTrip(e, trip.id)}
                                    className="edit-button"
                                >
                                    Edit Trip
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleSelectTrip(trip.id); }}
                                    className="btn btn-primary"
                                    style={{ fontSize: '0.85rem', padding: '4px 12px' }}
                                >
                                    View Trip
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {}
                <div className="card modern-card">
                    <h2>Add a New Trip</h2>
                    <form onSubmit={handleAddTrip}>

                        <div className="form-group trip-form-field" style={{ position: 'relative', zIndex: 10 }}>
                            <label>Destination</label>
                            <input
                                type="text"
                                value={destination}
                                onChange={e => {
                                    setDestination(e.target.value);
                                    setSelectedDestination('');
                                }}
                                onFocus={() => destination && setShowSuggestions(true)}
                                onBlur={handleBlur}
                                placeholder="Start typing a city..."
                                className="form-control"
                                required
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul
                                    className="autocomplete-suggestions"
                                    style={{
                                        position: 'absolute',
                                        zIndex: 9999,
                                        background: 'white',
                                        width: '100%',
                                    }}
                                >
                                    {suggestions.map((s, i) => (
                                        <li key={i} onMouseDown={() => handleSuggestionClick(s)}>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="form-group" style={{ position: 'relative', zIndex: 1 }}>
                            <label>Start Date</label>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => {
                                    setStartDate(date);
                                    if (endDate && date > endDate) setEndDate(null);
                                }}
                                minDate={today}
                                placeholderText="Select start date"
                                dateFormat="yyyy-MM-dd"
                                popperPlacement="bottom-start"
                                portalId="root"
                                onKeyDown={(e) => e.preventDefault()}
                                customInput={<input type="text" className="custom-datepicker" readOnly />}
                            />
                        </div>

                        <div className="form-group" style={{ position: 'relative', zIndex: 1 }}>
                            <label>End Date</label>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                minDate={startDate || today}
                                placeholderText="Select end date"
                                dateFormat="yyyy-MM-dd"
                                popperPlacement="bottom-start"
                                portalId="root"
                                onKeyDown={(e) => e.preventDefault()}
                                customInput={<input type="text" className="custom-datepicker" readOnly />}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary">Add Trip</button>
                    </form>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default TripsPage;