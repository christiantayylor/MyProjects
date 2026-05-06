import React, { useState, useEffect } from 'react';
import { getBookings, createBooking, deleteBooking, getTripDetails, fetchHotels, fetchTransportation } from '../services/api';
import AlertBanner from '../components/AlertBanner';
import Footer from '../components/Footer';
import '../styles/main.css';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker'; // Ensure this import is present
import 'react-datepicker/dist/react-datepicker.css';

function BookingsPage({ tripId }) {
    const [bookings, setBookings] = useState([]);
    const [tripDetails, setTripDetails] = useState(null);
    const [message, setMessage] = useState(null);
    const [hotelData, setHotelData] = useState({ destination: '', checkIn: '', checkOut: '' });
    const [transportationData, setTransportationData] = useState({ departureCity: '', destinationCity: '', departureDate: null });
    const [hotelOptions, setHotelOptions] = useState([]);
    const [transportationOptions, setTransportationOptions] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedTransportation, setSelectedTransportation] = useState(null);
    const [departureAirportCode, setDepartureAirportCode] = useState(null);
    const [destinationAirportCode, setDestinationAirportCode] = useState(null);
    const [manualDestinationCity, setManualDestinationCity] = useState('');
    const [savedDestinationCities, setSavedDestinationCities] = useState([]);

    useEffect(() => {
        if (tripId) {
            loadBookings();
            loadTripDetails();
        } else {
            setMessage({ type: 'error', text: 'Trip ID is undefined.' });
        }
    }, [tripId]);

    async function loadBookings() {
        try {
            const data = await getBookings(tripId);
            setBookings(data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load bookings.' });
            console.error(err);
        }
    }

    async function loadTripDetails() {
        try {
            const tripData = await getTripDetails(tripId);
            setTripDetails(tripData);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load trip details.' });
            console.error(err);
        }
    }

    const handleAddBooking = async (data) => {
        try {
            await createBooking(data);
            setMessage({ type: 'success', text: 'Booking added successfully!' });
            loadBookings();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to add booking.' });
            console.error(err);
        }
    };

    const handleBookHotel = async () => {
        if (!selectedHotel) {
            setMessage({ type: 'error', text: 'Please select a hotel before booking.' });
            return;
        }

        const bookingData = {
            tripId, // Ensure this is correct
            type: 'hotel',
            details: {
                name: selectedHotel.name, // Providing the hotel name
                destination: hotelData.destination, // Pass the destination
                checkIn: hotelData.checkIn.toISOString(),
                checkOut: hotelData.checkOut.toISOString(),
            },
            bookingDate: `${hotelData.checkIn.toLocaleDateString()} → ${hotelData.checkOut.toLocaleDateString()}`, // Format booking date
            cost: parseFloat(selectedHotel.price), // Ensure this is a number
        };

        console.log("Booking Data:", JSON.stringify(bookingData, null, 2));

        try {
            await handleAddBooking(bookingData); // Call the function to add the booking
            setSelectedHotel(null); // Reset selection after booking
        } catch (err) {
            console.error('Failed to book hotel:', err);
            setMessage({ type: 'error', text: 'Error booking hotel.' });
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        const confirmation = window.confirm("Are you sure you want to delete this booking?");
        if (!confirmation) return;

        try {
            const result = await deleteBooking(bookingId);

            if (result.success) {
                setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingId));
                setMessage({ type: 'success', text: 'Booking deleted successfully!' });
            }
        } catch (err) {
            console.error('Error during deletion:', err);
            setMessage({ type: 'error', text: 'Failed to delete booking.' });
        }
    };

    const handleAirportCodeLookup = async (city) => {
    try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/airports/search?query=${encodeURIComponent(city)}`);
        const data = await response.json();
        return data.result.length > 0 ? data.result[0].iata : null;
    } catch (error) {
        console.error("Error fetching airport code:", error);
        return null;
    }
};

    const handleTransportationSearch = async () => {
        try {

            console.log("Transportation Data before searching:", transportationData);
            console.log("Departure Date Object:", transportationData.departureDate);

            const destinationCity = transportationData.destinationCity;


            const departureAirport = await handleAirportCodeLookup(transportationData.departureCity);
            const destinationAirport = await handleAirportCodeLookup(transportationData.destinationCity);

            setManualDestinationCity(destinationCity);

            setDepartureAirportCode(departureAirport);
            setDestinationAirportCode(destinationAirport);

            console.log("Departure Airport Code:", departureAirport);
            console.log("Destination Airport Code:", destinationAirport);

            if (!departureAirport || !destinationAirport) {
                setMessage({ type: 'error', text: 'Could not find airport codes for the entered cities.' });
                return;
            }


            const results = await fetchTransportation(
                departureAirport,
                destinationAirport,
                transportationData.departureDate
            );

            console.log('Transportation API Results:', results);


            if (!results || results.length === 0) {
                console.log(`No flights found for ${departureAirport}. Checking alternative airports...`);


                const alternativeAirports = await getAlternativeAirports(transportationData.departureCity);

                let foundFlights = false; // Flag to track if we found any flights


                for (const altAirport of alternativeAirports) {
                    console.log(`Trying alternative airport: ${altAirport}`);

                    const altResults = await fetchTransportation(
                        altAirport,
                        destinationAirport,
                        transportationData.departureDate
                    );

                    console.log(`Results from alternative airport ${altAirport}:`, altResults);

                    if (altResults && altResults.length > 0) {
                        setTransportationOptions(altResults); // Update with found alternatives
                        foundFlights = true; // Set the flag to true
                        break; // Exit loop if flights are found
                    }
                }


                if (!foundFlights) {
                    console.log("Trying nearby dates for transportation options...");


                    const nearbyResults = await Promise.all([
                        fetchTransportation(departureAirport, destinationAirport,
                            new Date(transportationData.departureDate.setDate(transportationData.departureDate.getDate() + 1)).toISOString().split('T')[0]
                        ),
                        fetchTransportation(departureAirport, destinationAirport,
                            new Date(transportationData.departureDate.setDate(transportationData.departureDate.getDate() - 1)).toISOString().split('T')[0]
                        )
                    ]);


                    nearbyResults.forEach(nr => {
                        if (nr && nr.length > 0) {
                            setTransportationOptions(prev => [...prev, ...nr]); // Append nearby results to previous options
                            foundFlights = true; // Set the flag to true
                        }
                    });

                    if (!foundFlights) {
                        setMessage({ type: 'info', text: 'No transportation options found for the selected route and dates.' });
                    }
                }
            } else {

                setTransportationOptions(results);
            }
        } catch (error) {
            console.error("Error fetching transportation:", error);
            setMessage({ type: 'error', text: 'Failed to search for transportation.' });
        }
    };

    const handleHotelSearch = async () => {
        try {
            const results = await fetchHotels(hotelData.destination, hotelData.checkIn, hotelData.checkOut, 'USD', 'imperial');
            setHotelOptions(results.result || []);
        } catch (error) {
            console.error("Error fetching hotels:", error);
            setMessage({ type: 'error', text: 'Failed to search for hotels.' });
        }
    };

    const handleHotelSubmit = (e) => {
        e.preventDefault();
        handleAddBooking({ type: 'hotel', details: hotelData });
        setHotelData({ destination: '', checkIn: '', checkOut: '' });
    };

    const handleTransportationSubmit = async (e) => { // Add async keyword here
        e.preventDefault();
        if (!selectedTransportation) {
            setMessage({ type: 'error', text: 'Please select a transportation option before booking.' });
            return; // Exit the function if no transportation is selected
        }

        setSavedDestinationCities(prev => [...prev, manualDestinationCity]);

        const bookingData = {
            tripId,
            type: 'transportation',
            details: {
                airline: selectedTransportation.airline,
                flightNumber: selectedTransportation.flightNumber,
                departureDate: selectedTransportation.departureDate,
                destinationCity: manualDestinationCity,
                price: selectedTransportation.price,
            },
            bookingDate: `${new Date(transportationData.departureDate).toLocaleDateString()}`, // Format booking date
            cost: parseFloat(selectedTransportation.price), // Ensure this is a number
        };

        console.log("Booking Data:", JSON.stringify(bookingData, null, 2));

        try {
            await handleAddBooking(bookingData); // Call the function to add the booking
            setSelectedTransportation(null); // Reset selection after booking
            setMessage({ type: 'success', text: 'Transportation booked successfully!' }); // Optional feedback to user
        } catch (err) {
            console.error('Failed to book transportation:', err);
            setMessage({ type: 'error', text: 'Error booking transportation.' });
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

                <div className="card modern-card">
                    <h1 className="page-title">Bookings</h1>

                    {}
                    {bookings.length === 0 && <p className="alert alert-info">No bookings yet.</p>}

                    {bookings.length > 0 && (
                        <div className="plain-section">
                            <table className="trip-table">
                                <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Booking Details</th>
                                    <th>Cost ($)</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {bookings.map((booking, index) => {
                                    const details = JSON.parse(booking.details);
                                    return (
                                        <tr key={booking.id}>
                                            <td><b>{booking.type.charAt(0).toUpperCase() + booking.type.slice(1)}</b></td> {}
                                            <td>
                                                {booking.type === 'transportation'
                                                    ? <>
                                                        <b>Airline:</b> {details.airline || "N/A"}<br />
                                                        <b>Flight No:</b> {details.flightNumber || "N/A"}<br />
                                                        <b>Destination:</b> {savedDestinationCities[index] || "N/A"}<br />
                                                    </>
                                                    : <>
                                                        <b>Hotel Name:</b> {details.name || "N/A"}<br />
                                                        <b>Destination:</b> {details.destination || "N/A"}<br />
                                                        <b>Check-in:</b> {new Date(details.checkIn).toLocaleDateString() || "N/A"}<br />
                                                        <b>Check-out:</b> {new Date(details.checkOut).toLocaleDateString() || "N/A"}
                                                    </>
                                                }
                                            </td>
                                            <td><b>{booking.cost.toFixed(2)}</b></td> {}
                                            <td><b>{booking.bookingDate}</b></td> {}
                                            <td>
                                                <button onClick={() => handleDeleteBooking(booking.id)} className="btn btn-danger">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                        )}

                    {}
                    <div className="booking-forms">
                        <div className="booking-form-container">
                            <h2>Hotel Booking</h2>
                            <form onSubmit={handleHotelSubmit}>
                                <input
                                    type="text"
                                    placeholder="Hotel Destination"
                                    value={hotelData.destination}
                                    onChange={(e) => setHotelData({ ...hotelData, destination: e.target.value })}
                                    required
                                    className="form-control"
                                />
                                <div className="form-group">
                                    <label htmlFor="checkIn">Check-in Date:</label>
                                    <DatePicker
                                        selected={hotelData.checkIn}
                                        onChange={(date) => setHotelData({ ...hotelData, checkIn: date })}
                                        minDate={new Date()} // Set today's date as the minimum
                                        usePortal={true}
                                        placeholderText="Select check-in date"
                                        dateFormat="yyyy-MM-dd"
                                        popperPlacement="bottom-start"
                                        customInput={<input type="text" className="custom-datepicker" readOnly />}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="checkOut">Check-out Date:</label>
                                    <DatePicker
                                        selected={hotelData.checkOut}
                                        onChange={(date) => setHotelData({ ...hotelData, checkOut: date })}
                                        minDate={hotelData.checkIn} // Minimum date is set to check-in date
                                        usePortal={true}
                                           placeholderText="Select check-out date"
                                        dateFormat="yyyy-MM-dd"
                                        popperPlacement="bottom-start"
                                        customInput={<input type="text" className="custom-datepicker" readOnly />}
                                    />
                                </div>
                                <button type="button" onClick={handleHotelSearch}>Find Hotel</button>
                                <button type="submit" onClick={handleBookHotel}>Book Hotel</button>
                            </form>

                            {}
                            {hotelOptions.length > 0 && (
                                <div className="hotels-scroll">
                                    <h3>Available Hotels:</h3>
                                    <div className="hotel-options-container">
                                        {hotelOptions.map((hotel) => (
                                            <div
                                                key={hotel.hotelId}
                                                className={`hotel-card ${selectedHotel?.hotelId === hotel.hotelId ? "selected" : ""}`}
                                                onClick={() => setSelectedHotel(hotel)} // This sets the selected hotel when clicked
                                            >
                                                {hotel.photo && (
                                                    <img src={hotel.photo} alt={hotel.name} className="hotel-photo" />
                                                )}
                                                <div className="hotel-info">
                                                    <strong>{hotel.name}</strong>
                                                    <div>{hotel.address}</div>
                                                    <div>${hotel.price}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {}
                        <div className="booking-form-container">
                            <h2>Transportation Booking</h2>
                            <form onSubmit={handleTransportationSubmit}>
                                {}
                                <input
                                    type="text"
                                    placeholder="Departure City"
                                    value={transportationData.departureCity}
                                    onChange={(e) => setTransportationData({ ...transportationData, departureCity: e.target.value })}
                                    required
                                    className="form-control"
                                />
                                <input
                                    type="text"
                                    placeholder="Destination City"
                                    value={transportationData.destinationCity}
                                    onChange={(e) => setTransportationData({ ...transportationData, destinationCity: e.target.value })}
                                    required
                                    className="form-control"
                                />
                                {}
                                <div className="form-group">
                                    <label htmlFor="departureDate">Departure Date:</label>
                                    <DatePicker
                                        selected={transportationData.departureDate}
                                        onChange={(date) => setTransportationData({ ...transportationData, departureDate: date })}
                                        minDate={new Date()} // Set today's date as the minimum
                                        placeholderText="Select departure date"
                                        dateFormat="yyyy-MM-dd"
                                        popperPlacement="bottom-start"
                                        customInput={<input type="text" className="custom-datepicker" readOnly />}
                                    />
                                </div>
                                <button type="button" onClick={handleTransportationSearch}>Find Transportation</button>
                                <button type="submit">Book Transportation</button>
                            </form>

                            {}
                            {transportationOptions.length > 0 && (
                                <div className="transportation-scroll">
                                    <h3>Available Transportation:</h3>
                                    <div className="transportation-options-container">
                                        {transportationOptions.map((transport) => (
                                            <div
                                                key={transport.id}
                                                className={`transport-card ${selectedTransportation?.id === transport.id ? "selected" : ""}`}
                                                onClick={() => setSelectedTransportation(transport)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="transport-info">
                                                    <strong>{transport.airline}</strong>
                                                    <p>{`Flight No: ${transport.flightNumber || 'N/A'}`}</p>
                                                    <p>{`Departure: ${new Date(transport.departureDate).toLocaleDateString() || 'N/A'}`}</p>
                                                    <p>{`Departure Airport: ${departureAirportCode || 'N/A'}`}</p> {}
                                                    <p>{`Destination Airport: ${destinationAirportCode || 'N/A'}`}</p> {}
                                                    <p>${transport.price?.toFixed(2) || 'N/A'}</p>
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
        </div>
    );
}

export default BookingsPage;