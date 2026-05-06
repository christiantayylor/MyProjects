import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripDetails, updateTrip, deleteTrip } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/main.css';

const EditTrip = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [tripData, setTripData] = useState({ destination: '', startDate: null, endDate: null });
    const [message, setMessage] = useState(null);
    const [userInput, setUserInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const today = new Date();

    useEffect(() => {
        loadTripDetails();
    }, [tripId]);

    async function loadTripDetails() {
        try {
            const data = await getTripDetails(tripId);
            setTripData({
                destination: data.destination,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
            });
            setUserInput(data.destination);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load trip details.' });
        }
    }

    useEffect(() => {
        if (!userInput || userInput === tripData.destination) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const delay = setTimeout(async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/cities?q=${encodeURIComponent(userInput)}`
                );
                setSuggestions(response.data);
                setShowSuggestions(response.data.length > 0);
            } catch (err) {
                console.error('Error fetching city suggestions:', err);
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [userInput]);

    function handleSuggestionClick(s) {
        setUserInput(s);
        setShowSuggestions(false);
    }

    function handleBlur() {
        setTimeout(() => setShowSuggestions(false), 300);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!tripData.startDate || !tripData.endDate) {
            setMessage({ type: 'error', text: 'Please select both a start and end date.' });
            return;
        }

        const updatedTripData = {
            destination: userInput,
            startDate: tripData.startDate.toISOString().split('T')[0],
            endDate: tripData.endDate.toISOString().split('T')[0],
        };

        try {
            const response = await updateTrip(tripId, updatedTripData);
            if (response && response.message === 'Trip updated successfully') {
                setMessage({ type: 'success', text: 'Trip updated successfully!' });
                navigate('/');
            } else {
                setMessage({ type: 'error', text: 'Failed to update trip.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update trip.' });
            console.error('Error during update trip:', err);
        }
    }

    const handleDeleteTrip = async () => {
        const confirmation = window.confirm('Are you sure you want to delete this trip?');
        if (confirmation) {
            try {
                await deleteTrip(tripId);
                setMessage({ type: 'success', text: 'Trip deleted successfully!' });
                navigate('/');
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to delete trip.' });
                console.error(err);
            }
        }
    };

    return (
        <div className="app-background">
            <div className="container modern-container">
                <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 2000 }}>
                    <AlertBanner
                        message={message?.text}
                        type={message?.type}
                        onClose={() => setMessage(null)}
                    />
                </div>

                <div className="card modern-card" style={{ maxWidth: '480px', margin: '0 auto' }}>
                    <h1 className="page-title">Edit Trip</h1>

                    <form onSubmit={handleSubmit} className="edit-trip-form">

                        <div className="form-group">
                            <label>Resolved Destination</label>
                            <input
                                type="text"
                                value={userInput}
                                readOnly
                                className="form-control"
                            />
                        </div>

                        <div className="form-group trip-form-field" style={{ position: 'relative', zIndex: 10 }}>
                            <label>Enter City</label>
                            <input
                                type="text"
                                value={userInput}
                                onChange={e => setUserInput(e.target.value)}
                                onFocus={() => userInput && setShowSuggestions(suggestions.length > 0)}
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
                                selected={tripData.startDate}
                                onChange={(date) => setTripData({ ...tripData, startDate: date, endDate: null })}
                                minDate={today}
                                placeholderText="Select start date"
                                dateFormat="yyyy-MM-dd"
                                popperPlacement="bottom-start"
                                portalId="root"
                                customInput={<input type="text" className="custom-datepicker" readOnly />}
                            />
                        </div>

                        <div className="form-group" style={{ position: 'relative', zIndex: 1 }}>
                            <label>End Date</label>
                            <DatePicker
                                selected={tripData.endDate}
                                onChange={(date) => setTripData({ ...tripData, endDate: date })}
                                minDate={tripData.startDate || today}
                                placeholderText="Select end date"
                                dateFormat="yyyy-MM-dd"
                                popperPlacement="bottom-start"
                                portalId="root"
                                customInput={<input type="text" className="custom-datepicker" readOnly />}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            <button type="submit" className="btn btn-primary">
                                Update Trip
                            </button>
                            <button type="button" onClick={handleDeleteTrip} className="btn btn-danger">
                                Delete Trip
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTrip;