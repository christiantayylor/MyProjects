import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link } from 'react-router-dom';
import TripsPage from './pages/TripsPage';
import BookingsPage from './pages/BookingsPage';
import ExcursionsPage from './pages/ExcursionsPage';
import ExpensesPage from './pages/ExpensesPage';
import EditTrip from './pages/EditTrip';
import Navbar from './components/Navbar';
import { getTripDetails } from './services/api';


function TripLayout({ activeTab, children }) {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [tripDetails, setTripDetails] = React.useState(null);

    React.useEffect(() => {
        if (tripId && tripId !== 'null') {
            getTripDetails(tripId)
                .then(data => setTripDetails(data))
                .catch(() => {});
        }
    }, [tripId]);

    return (
        <div className="app-background">
            <div className="container modern-container">
                {tripDetails && (
                    <div className="card modern-card" style={{ marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                        <h2 style={{ marginBottom: '4px' }}>{tripDetails.destination}</h2>
                        <p className="trip-dates" style={{ marginBottom: '12px' }}>
                            {tripDetails.startDate} → {tripDetails.endDate}
                            <button
                                onClick={() => navigate(`/edit-trip/${tripId}`)}
                                className="edit-button"
                                style={{ marginLeft: '10px' }}
                            >
                                Edit Trip
                            </button>
                        </p>
                        <div className="nav-tabs modern-tabs">
                            {['bookings', 'excursions', 'expenses'].map(tab => (
                                <Link
                                    key={tab}
                                    to={`/${tab}/${tripId}`}
                                    className={activeTab === tab ? 'active modern-tab' : 'modern-tab'}
                                    style={{
                                        textDecoration: 'none',
                                        color: activeTab === tab ? '#ffffff' : '#f0e6a2',
                                        backgroundColor: activeTab === tab ? '#ffffff22' : 'transparent',
                                        border: activeTab === tab ? '1px solid #ffffff55' : '1px solid transparent',
                                        borderRadius: '20px',
                                        padding: '6px 14px',
                                        transition: 'all 0.2s ease',
                                        fontSize: 'inherit',
                                    }}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}



function BookingsRoute() {
    const { tripId } = useParams();
    return (
        <TripLayout activeTab="bookings">
            <BookingsPage tripId={parseInt(tripId, 10)} />
        </TripLayout>
    );
}

function ExcursionsRoute() {
    const { tripId } = useParams();
    const [tripDestination, setTripDestination] = React.useState('');

    React.useEffect(() => {
        if (tripId && tripId !== 'null') {
            getTripDetails(tripId)
                .then(data => setTripDestination(data?.destination || ''))
                .catch(() => {});
        }
    }, [tripId]);

    return (
        <TripLayout activeTab="excursions">
            <ExcursionsPage
                tripId={parseInt(tripId, 10)}
                tripDestination={tripDestination}
            />
        </TripLayout>
    );
}

function ExpensesRoute() {
    const { tripId } = useParams();
    const [tripDestination, setTripDestination] = React.useState('');

    React.useEffect(() => {
        if (tripId && tripId !== 'null') {
            getTripDetails(tripId)
                .then(data => setTripDestination(data?.destination || ''))
                .catch(() => {});
        }
    }, [tripId]);

    return (
        <TripLayout activeTab="expenses">
            <ExpensesPage
                tripId={parseInt(tripId, 10)}
                tripDestination={tripDestination}
            />
        </TripLayout>
    );
}



function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<TripsPage />} />
                <Route path="/bookings/:tripId" element={<BookingsRoute />} />
                <Route path="/excursions/:tripId" element={<ExcursionsRoute />} />
                <Route path="/expenses/:tripId" element={<ExpensesRoute />} />
                <Route path="/edit-trip/:tripId" element={<EditTrip />} />
            </Routes>
        </Router>
    );
}

export default App;