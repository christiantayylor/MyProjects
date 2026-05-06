import React, { useState, useEffect } from 'react';
import { fetchExcursions, createExcursion, getSavedExcursions } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import '../styles/main.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ExcursionsPage({ tripId, tripDestination }) {
    const [searchForm, setSearchForm] = useState({
        city: '',
        startDate: null,
        endDate: null,
        orderBy: 'trending',
    });
    const [excursionResults, setExcursionResults] = useState([]);
    const [savedExcursions, setSavedExcursions] = useState([]);
    const [selectedExcursion, setSelectedExcursion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (tripId) {
            loadSavedExcursions();
        } else {
            setMessage({ type: 'error', text: 'Trip ID is undefined.' });
        }
    }, [tripId]);

    async function loadSavedExcursions() {
        try {
            const data = await getSavedExcursions(tripId);
            setSavedExcursions(data);
        } catch (err) {
            console.error('Failed to load saved excursions:', err);
        }
    }

    const handleSearch = async () => {
        const { city, startDate, endDate, orderBy } = searchForm;

        if (!city.trim()) {
            setMessage({ type: 'error', text: 'Please enter a city.' });
            return;
        }
        if (!startDate) {
            setMessage({ type: 'error', text: 'Please select a start date.' });
            return;
        }
        if (!endDate) {
            setMessage({ type: 'error', text: 'Please select an end date.' });
            return;
        }
        if (endDate < startDate) {
            setMessage({ type: 'error', text: 'End date must be on or after the start date.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        setExcursionResults([]);
        setSelectedExcursion(null);
        setSearched(false);

        try {
            const results = await fetchExcursions(city, startDate, endDate, orderBy);
            setExcursionResults(results);
            setSearched(true);

            if (results.length === 0) {
                setMessage({ type: 'info', text: `No excursions found for "${city}". Try different dates or a nearby city.` });
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to fetch excursions. Please try again.' });
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExcursion = async () => {
        if (!selectedExcursion) {
            setMessage({ type: 'error', text: 'Please select an excursion first.' });
            return;
        }

        const excursionData = {
            tripId: tripId,
            name: selectedExcursion.title,
            description: selectedExcursion.description || '',
            date: searchForm.startDate
                ? searchForm.startDate.toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
            cost: selectedExcursion.price != null ? parseFloat(selectedExcursion.price) : 0,
        };

        console.log('Saving excursion with data:', JSON.stringify(excursionData, null, 2));
        try {
            await createExcursion(excursionData);
            setMessage({ type: 'success', text: `"${selectedExcursion.title}" added to your trip!` });
            setSelectedExcursion(null);
            loadSavedExcursions();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to add excursion to your trip.' });
            console.error(err);
        }
    };

    const updateField = (field, value) => {
        setSearchForm(prev => ({ ...prev, [field]: value }));
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

                <div className="card modern-card">
                    <h1 className="page-title">
                        Excursions for {tripDestination || 'Your Trip'}
                    </h1>

                    {}
                    {savedExcursions.length === 0 && (
                        <p className="alert alert-info">No excursions added to this trip yet.</p>
                    )}

                    {savedExcursions.length > 0 && (
                        <div className="plain-section">
                            <table className="trip-table">
                                <thead>
                                <tr>
                                    <th>Excursion</th>
                                    <th>Description</th>
                                    <th>Date</th>
                                    <th>Cost (USD)</th>
                                </tr>
                                </thead>
                                <tbody>
                                {savedExcursions.map((exc) => (
                                    <tr key={exc.id}>
                                        <td><b>{exc.name}</b></td>
                                        <td>{exc.description || '—'}</td>
                                        <td><b>{exc.date || '—'}</b></td>
                                        <td><b>{exc.cost != null ? `$${parseFloat(exc.cost).toFixed(2)}` : '—'}</b></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {}
                    <div className="booking-forms">
                        <div className="booking-form-container">
                            <h2>Find Excursions</h2>

                            <div className="form-group">
                                <label htmlFor="city">City</label>
                                <input
                                    type="text"
                                    id="city"
                                    value={searchForm.city}
                                    onChange={(e) => updateField('city', e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="e.g. Paris, Tokyo, New York"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Start Date</label>
                                <DatePicker
                                    selected={searchForm.startDate}
                                    onChange={(date) => updateField('startDate', date)}
                                    minDate={new Date()}
                                    placeholderText="Select start date"
                                    dateFormat="yyyy-MM-dd"
                                    popperPlacement="bottom-start"
                                    customInput={<input type="text" className="custom-datepicker" readOnly />}
                                />
                            </div>

                            <div className="form-group">
                                <label>End Date</label>
                                <DatePicker
                                    selected={searchForm.endDate}
                                    onChange={(date) => updateField('endDate', date)}
                                    minDate={searchForm.startDate || new Date()}
                                    placeholderText="Select end date"
                                    dateFormat="yyyy-MM-dd"
                                    popperPlacement="bottom-start"
                                    customInput={<input type="text" className="custom-datepicker" readOnly />}
                                />
                            </div>

                            <div className="form-group">
                                <label>Sort By</label>
                                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '12px 24px', marginTop: '8px' }}>
                                    {[
                                        { value: 'trending', label: 'Trending' },
                                        { value: 'attr_book_score', label: 'Top Rated' },
                                        { value: 'lowest_price', label: 'Lowest Price' },
                                    ].map(opt => {
                                        const checked = searchForm.orderBy === opt.value;
                                        return (
                                            <label
                                                key={opt.value}
                                                onClick={() => updateField('orderBy', opt.value)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    color: '#f0e6a2',
                                                    cursor: 'pointer',
                                                    userSelect: 'none',
                                                    fontSize: '0.95rem',
                                                }}
                                            >
                                                <span style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    borderRadius: '50%',
                                                    border: '2px solid #f0e6a2',
                                                    background: checked ? '#f0e6a2' : 'transparent',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    transition: 'background 0.15s ease',
                                                }}>
                                                    {checked && (
                                                        <span style={{
                                                            width: '7px',
                                                            height: '7px',
                                                            borderRadius: '50%',
                                                            background: '#b99830',
                                                        }} />
                                                    )}
                                                </span>
                                                {opt.label}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSearch}
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : 'Find Excursions'}
                            </button>

                            <button
                                type="button"
                                onClick={handleAddExcursion}
                                disabled={!selectedExcursion}
                                style={{ marginLeft: '10px' }}
                            >
                                Add to Trip
                            </button>
                        </div>

                        {}
                        {loading && (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p>Finding excursions in {searchForm.city}...</p>
                            </div>
                        )}

                        {!loading && searched && excursionResults.length > 0 && (
                            <div className="hotels-scroll">
                                <h3>
                                    {excursionResults.length} Excursion{excursionResults.length !== 1 ? 's' : ''} found in {searchForm.city}
                                    {selectedExcursion && (
                                        <span style={{ fontSize: '0.9rem', fontWeight: 'normal', marginLeft: '12px', color: '#555' }}>
                                            — Selected: <strong>{selectedExcursion.title}</strong>
                                        </span>
                                    )}
                                </h3>
                                <div className="hotel-options-container">
                                    {excursionResults.map((excursion, index) => (
                                        <div
                                            key={excursion.id || index}
                                            className={`hotel-card ${selectedExcursion?.id === excursion.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedExcursion(
                                                selectedExcursion?.id === excursion.id ? null : excursion
                                            )}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {excursion.imageUrl && (
                                                <img
                                                    src={excursion.imageUrl}
                                                    alt={excursion.title}
                                                    className="hotel-photo"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            )}
                                            <div className="hotel-info">
                                                <strong>{excursion.title}</strong>
                                                {excursion.description && (
                                                    <div style={{ fontSize: '0.85rem', color: '#555', margin: '4px 0' }}>
                                                        {excursion.description}
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px', fontSize: '0.85rem' }}>
                                                    {excursion.duration && <span>⏱ {excursion.duration}</span>}
                                                    {excursion.rating && (
                                                        <span>
                                                            ⭐ {Number(excursion.rating).toFixed(1)}
                                                            {excursion.reviewCount && ` (${excursion.reviewCount} reviews)`}
                                                        </span>
                                                    )}
                                                </div>
                                                {excursion.price != null && (
                                                    <div>From <strong>USD {Number(excursion.price).toFixed(2)}</strong></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExcursionsPage;