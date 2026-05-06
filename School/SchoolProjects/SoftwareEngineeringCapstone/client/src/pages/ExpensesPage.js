import React, { useState, useEffect, useRef } from 'react';
import { getExpenses, getBookings, getSavedExcursions } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import '../styles/main.css';

function ExpensesPage({ tripId, tripDestination }) {
    const [bookings, setBookings] = useState([]);
    const [excursions, setExcursions] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [message, setMessage] = useState(null);


    const [reportTitle, setReportTitle] = useState('');
    const [selectedCategories, setSelectedCategories] = useState(new Set(['All']));
    const [reportGenerated, setReportGenerated] = useState(false);
    const [reportTimestamp, setReportTimestamp] = useState('');
    const [snapshotCategories, setSnapshotCategories] = useState(new Set(['All']));
    const reportRef = useRef(null);

    useEffect(() => {
        if (tripId) loadAll();
    }, [tripId]);

    async function loadAll() {
        try {
            const [bookingData, excursionData, expenseData] = await Promise.all([
                getBookings(tripId),
                getSavedExcursions(tripId),
                getExpenses(tripId),
            ]);
            setBookings(bookingData || []);
            setExcursions(excursionData || []);
            setExpenses(expenseData || []);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load trip data.' });
            console.error(err);
        }
    }


    const bookingRows = bookings.map(b => {
        let details = {};
        try { details = JSON.parse(b.details); } catch (_) {}

        let label = '';
        if (b.type === 'hotel') {
            label = `Hotel: ${details.name || details.destination || 'Hotel Booking'}`;
        } else if (b.type === 'transportation') {
            label = `Flight: ${details.airline || ''}${details.flightNumber ? ` ${details.flightNumber}` : ''}`.trim() || 'Transportation';
        } else {
            label = b.type.charAt(0).toUpperCase() + b.type.slice(1);
        }

        return {
            key: `booking-${b.id}`,
            category: b.type === 'hotel' ? 'Hotel' : 'Transportation',
            label,
            date: b.bookingDate || '—',
            cost: parseFloat(b.cost) || 0,
        };
    });


    const excursionRows = excursions.map(e => ({
        key: `excursion-${e.id}`,
        category: 'Excursion',
        label: e.name,
        date: e.date || '—',
        cost: parseFloat(e.cost) || 0,
    }));


    const expenseRows = expenses.map(e => ({
        key: `expense-${e.id}`,
        category: e.category,
        label: e.note || e.category,
        date: e.date ? new Date(e.date).toLocaleDateString() : '—',
        cost: parseFloat(e.amount) || 0,
    }));

    const allRows = [...bookingRows, ...excursionRows, ...expenseRows];
    const hasAnything = allRows.length > 0;


    const categoryOptions = [
        'All',
        'Hotel',
        'Transportation',
        'Excursion',
        ...new Set(expenseRows.map(r => r.category)),
    ].filter(Boolean);


    const handleCategoryToggle = (cat) => {
        setSelectedCategories(prev => {
            const next = new Set(prev);
            if (cat === 'All') {

                return new Set(['All']);
            }

            next.delete('All');
            if (next.has(cat)) {
                next.delete(cat);

                if (next.size === 0) return new Set(['All']);
            } else {
                next.add(cat);
            }
            return next;
        });

        setReportGenerated(false);
    };


    const isAll = selectedCategories.has('All');
    const filteredBookingRows  = isAll ? bookingRows  : bookingRows.filter(r => selectedCategories.has(r.category));
    const filteredExcursionRows = isAll ? excursionRows : excursionRows.filter(r => selectedCategories.has(r.category));
    const filteredExpenseRows  = isAll ? expenseRows  : expenseRows.filter(r => selectedCategories.has(r.category));
    const filteredAllRows = [...filteredBookingRows, ...filteredExcursionRows, ...filteredExpenseRows];
    const filteredTotal = filteredAllRows.reduce((sum, r) => sum + r.cost, 0);


    const handleGenerateReport = () => {
        if (!hasAnything) {
            setMessage({ type: 'error', text: 'No trip data to generate a report from.' });
            return;
        }
        if (filteredAllRows.length === 0) {
            setMessage({ type: 'error', text: 'No items found for the selected categories.' });
            return;
        }

        const now = new Date();
        setReportTimestamp(now.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }));
        setSnapshotCategories(new Set(selectedCategories));
        setReportGenerated(true);
        setMessage({ type: 'success', text: 'Report generated successfully!' });

        setTimeout(() => {
            reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleClearReport = () => {
        setReportGenerated(false);
        setReportTitle('');
        setSelectedCategories(new Set(['All']));
        setReportTimestamp('');
    };


    const handleSaveReport = () => {
        const title = reportTitle || `${tripDestination || 'Trip'} Expense Report`;



        const style = document.createElement('style');
        style.id = 'print-report-style';
        style.innerHTML = `
            @media print {
                body * { visibility: hidden !important; }
                #printable-report, #printable-report * { visibility: visible !important; }
                #printable-report {
                    position: fixed !important;
                    top: 0; left: 0;
                    width: 100%;
                    padding: 32px;
                    background: #ffffff !important;
                    color: #000000 !important;
                }
                #printable-report h2,
                #printable-report p,
                #printable-report td,
                #printable-report th {
                    color: #000000 !important;
                    background: transparent !important;
                    opacity: 1 !important;
                }
                #printable-report table {
                    width: 100%;
                    border-collapse: collapse;
                }
                #printable-report th,
                #printable-report td {
                    border: 1px solid #cccccc;
                    padding: 6px 10px;
                    font-size: 12px;
                }
                #printable-report th {
                    background: #f0f0f0 !important;
                    font-weight: bold;
                }
                #printable-report .section-header td {
                    background: #e8e8e8 !important;
                    font-weight: bold;
                }
                #printable-report .save-btn { display: none !important; }
            }
        `;
        document.head.appendChild(style);


        const prevTitle = document.title;
        document.title = title;

        window.print();


        document.title = prevTitle;
        document.getElementById('print-report-style')?.remove();
    };


    const sectionHeaderStyle = {
        fontWeight: 'bold',
        background: '#ffffff22',
        textAlign: 'center',
    };


    const categoryLabel = snapshotCategories.has('All')
        ? 'All Categories'
        : Array.from(snapshotCategories).join(', ');

    const totalLabel = snapshotCategories.has('All')
        ? 'Grand Total'
        : `${Array.from(snapshotCategories).join(' + ')} Total`;

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
                        Expenses for {tripDestination || 'Your Trip'}
                    </h1>

                    {}
                    {!hasAnything ? (
                        <p className="alert alert-info">
                            No bookings, excursions, or expenses added to this trip yet.
                        </p>
                    ) : (
                        <div className="plain-section">
                            <table className="trip-table">
                                <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Item</th>
                                    <th>Date</th>
                                    <th>Cost (USD)</th>
                                </tr>
                                </thead>
                                <tbody>
                                {bookingRows.length > 0 && (
                                    <>
                                        <tr><td colSpan={4} style={sectionHeaderStyle}>Bookings</td></tr>
                                        {bookingRows.map(r => (
                                            <tr key={r.key}>
                                                <td>{r.category}</td>
                                                <td>{r.label}</td>
                                                <td>{r.date}</td>
                                                <td><b>${r.cost.toFixed(2)}</b></td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                                {excursionRows.length > 0 && (
                                    <>
                                        <tr><td colSpan={4} style={sectionHeaderStyle}>Excursions</td></tr>
                                        {excursionRows.map(r => (
                                            <tr key={r.key}>
                                                <td>{r.category}</td>
                                                <td>{r.label}</td>
                                                <td>{r.date}</td>
                                                <td><b>${r.cost.toFixed(2)}</b></td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                                {expenseRows.length > 0 && (
                                    <>
                                        <tr><td colSpan={4} style={sectionHeaderStyle}>Other Expenses</td></tr>
                                        {expenseRows.map(r => (
                                            <tr key={r.key}>
                                                <td>{r.category}</td>
                                                <td>{r.label}</td>
                                                <td>{r.date}</td>
                                                <td><b>${r.cost.toFixed(2)}</b></td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                                <tr style={{ borderTop: '2px solid #333' }}>
                                    <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold', paddingRight: '12px' }}>
                                        Grand Total
                                    </td>
                                    <td><b>${allRows.reduce((s, r) => s + r.cost, 0).toFixed(2)}</b></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {}
                    <div style={{ marginTop: '2rem' }}>
                        <h2>Generate Report</h2>

                        <div className="booking-form-container" style={{ maxWidth: '480px' }}>
                            <div className="form-group">
                                <label>Report Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={`${tripDestination || 'Trip'} Expense Report`}
                                    value={reportTitle}
                                    onChange={e => setReportTitle(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Include Categories</label>
                                <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', marginTop: '8px' }}>
                                    {categoryOptions.map(cat => {
                                        const checked = selectedCategories.has(cat);
                                        return (
                                            <label
                                                key={cat}
                                                onClick={() => handleCategoryToggle(cat)}
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
                                                    borderRadius: '4px',
                                                    border: '2px solid #f0e6a2',
                                                    background: checked ? '#f0e6a2' : 'transparent',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    transition: 'background 0.15s ease',
                                                }}>
                                                    {checked && (
                                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#b99830" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    )}
                                                </span>
                                                {cat}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleGenerateReport}
                                    disabled={!hasAnything}
                                >
                                    Generate Report
                                </button>
                                {reportGenerated && (
                                    <>
                                        <button type="button" onClick={handleSaveReport} className="btn btn-primary">
                                            Save Report
                                        </button>
                                        <button type="button" onClick={handleClearReport}>
                                            Clear Report
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {}
                    {reportGenerated && (
                        <div
                            id="printable-report"
                            ref={reportRef}
                            style={{
                                marginTop: '2rem',
                                padding: '1.5rem',
                                background: 'rgba(255,255,255,0.08)',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.2)',
                            }}
                        >
                            <h2 style={{ marginBottom: '4px' }}>
                                {reportTitle || `${tripDestination || 'Trip'} Expense Report`}
                            </h2>
                            <p style={{ fontSize: '0.85rem', opacity: 0.75, marginBottom: '4px' }}>
                                Trip: {tripDestination || 'Your Trip'}
                            </p>
                            <p style={{ fontSize: '0.85rem', opacity: 0.75, marginBottom: '4px' }}>
                                Categories Included: {categoryLabel}
                            </p>
                            <p style={{ fontSize: '0.85rem', opacity: 0.75, marginBottom: '1.25rem' }}>
                                Report Generated: {reportTimestamp}
                            </p>

                            <div className="plain-section">
                                <table className="trip-table">
                                    <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Item</th>
                                        <th>Date</th>
                                        <th>Cost (USD)</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredBookingRows.length > 0 && (
                                        <>
                                            <tr className="section-header"><td colSpan={4} style={sectionHeaderStyle}>Bookings</td></tr>
                                            {filteredBookingRows.map(r => (
                                                <tr key={r.key}>
                                                    <td>{r.category}</td>
                                                    <td>{r.label}</td>
                                                    <td>{r.date}</td>
                                                    <td><b>${r.cost.toFixed(2)}</b></td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                    {filteredExcursionRows.length > 0 && (
                                        <>
                                            <tr className="section-header"><td colSpan={4} style={sectionHeaderStyle}>Excursions</td></tr>
                                            {filteredExcursionRows.map(r => (
                                                <tr key={r.key}>
                                                    <td>{r.category}</td>
                                                    <td>{r.label}</td>
                                                    <td>{r.date}</td>
                                                    <td><b>${r.cost.toFixed(2)}</b></td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                    {filteredExpenseRows.length > 0 && (
                                        <>
                                            <tr className="section-header"><td colSpan={4} style={sectionHeaderStyle}>Other Expenses</td></tr>
                                            {filteredExpenseRows.map(r => (
                                                <tr key={r.key}>
                                                    <td>{r.category}</td>
                                                    <td>{r.label}</td>
                                                    <td>{r.date}</td>
                                                    <td><b>${r.cost.toFixed(2)}</b></td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                    <tr style={{ borderTop: '2px solid #333' }}>
                                        <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold', paddingRight: '12px' }}>
                                            {totalLabel}
                                        </td>
                                        <td><b>${filteredTotal.toFixed(2)}</b></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ExpensesPage;