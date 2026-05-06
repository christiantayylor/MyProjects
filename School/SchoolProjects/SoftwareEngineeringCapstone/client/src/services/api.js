import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function getTrips() {
    try {
        const res = await fetch(`${API_URL}/api/trips`);
        if (!res.ok) throw new Error(`Failed to get trips: ${res.status}`);
        return res.json();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function createTrip(tripData) {
    try {
        const res = await fetch(`${API_URL}/api/trips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripData),
        });
        if (!res.ok) throw new Error(`Failed to create trip: ${res.status}`);
        return res.json();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function getTripDetails(tripId) {
    try {
        const res = await fetch(`${API_URL}/api/trips/${tripId}`);
        if (!res.ok) throw new Error(`Failed to get trip details: ${res.status}`);
        const data = await res.json();
        console.log('API Response for trip details:', data);
        return data;
    } catch (err) {
        console.error('Error fetching trip details:', err);
        throw err;
    }
}

export async function updateTrip(tripId, tripData) {
    try {
        const response = await fetch(`${API_URL}/api/trips/${tripId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tripData),
        });
        if (!response.ok) throw new Error(`Failed to update trip: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error updating trip:', error);
        throw error;
    }
}

export async function deleteTrip(tripId) {
    try {
        const response = await fetch(`${API_URL}/api/trips/${tripId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Failed to delete trip: ${response.status}`);
        return { success: true };
    } catch (err) {
        console.error('Error deleting trip:', err);
        throw err;
    }
}

export async function fetchDestinations(query) {
    try {
        const res = await fetch(`${API_URL}/api/cities?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`Failed to fetch destinations: ${res.status}`);
        return res.json();
    } catch (err) {
        console.error('Error fetching destinations:', err);
        throw err;
    }
}

export async function getBookings(tripId) {
    try {
        const res = await fetch(`${API_URL}/api/bookings/${tripId}`);
        if (!res.ok) throw new Error(`Failed to fetch bookings: ${res.status}`);
        return res.json();
    } catch (err) {
        console.error('Error fetching bookings:', err);
        throw err;
    }
}

export async function createBooking(data) {
    const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function deleteBooking(bookingId) {
    try {
        const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`Failed to delete booking: ${response.status}`);
        return { success: true };
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function fetchExcursions(city, startDate, endDate, orderBy = 'trending') {
    try {
        const startStr = formatDate(startDate);
        const endStr = formatDate(endDate);
        const params = new URLSearchParams({ city, startDate: startStr, endDate: endStr, orderBy });
        const res = await fetch(`${API_URL}/api/excursions/search?${params.toString()}`);
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Failed to fetch excursions: ${res.status}`);
        }
        const data = await res.json();
        return data.results || [];
    } catch (err) {
        console.error('Error fetching excursions:', err);
        throw err;
    }
}

export async function fetchDestId(city, locale = 'en-gb') {
    try {
        const params = new URLSearchParams({ city, locale });
        const res = await fetch(`${API_URL}/api/excursions/destid?${params.toString()}`);
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Failed to fetch dest ID: ${res.status}`);
        }
        const data = await res.json();
        return data.dest_id;
    } catch (err) {
        console.error('Error fetching destination ID:', err);
        throw err;
    }
}

export async function getSavedExcursions(tripId) {
    const res = await fetch(`${API_URL}/api/excursions/${tripId}`);
    return res.json();
}

export async function createExcursion(data) {
    const res = await fetch(`${API_URL}/api/excursions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function getExpenses(tripId) {
    const res = await fetch(`${API_URL}/api/expenses/${tripId}`);
    return res.json();
}

export async function createExpense(data) {
    const res = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function fetchTransportation(departureCity, destinationCity, departureDate) {
    try {
        if (!departureCity || !destinationCity || !departureDate) {
            throw new Error('departureCity, destinationCity, and departureDate must be provided.');
        }
        const formattedDepartureDate = formatDate(departureDate);
        const response = await fetch(
            `${API_URL}/api/flights/transportation/search?departureCity=${encodeURIComponent(departureCity)}&destinationCity=${encodeURIComponent(destinationCity)}&departureDate=${encodeURIComponent(formattedDepartureDate)}`,
            { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        if (!response.ok) throw new Error(`Failed to fetch transportation: ${response.status}`);
        const data = await response.json();
        if (!data || data.length === 0) throw new Error('No transportation options available for the selected route.');
        return data;
    } catch (err) {
        console.error('Error fetching transportation:', err.message);
        throw err;
    }
}

export async function fetchHotels(destination, checkIn, checkOut, filter_by_currency = 'USD', units = 'imperial', roomNumber = 1, adultsNumber = 2, childrenNumber = 0, childrenAges = '') {
    try {
        const checkInStr = checkIn ? checkIn.toISOString().split('T')[0] : '';
        const checkOutStr = checkOut ? checkOut.toISOString().split('T')[0] : '';
        const response = await fetch(
            `${API_URL}/api/hotels/search?city=${encodeURIComponent(destination)}&checkin_date=${checkInStr}&checkout_date=${checkOutStr}&filter_by_currency=${filter_by_currency}&units=${units}&room_number=${roomNumber}&adults_number=${adultsNumber}&children_number=${childrenNumber}&children_ages=${childrenAges}`,
            { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        if (!response.ok) throw new Error(`Failed to fetch hotels: ${response.status}`);
        return response.json();
    } catch (err) {
        console.error('Error fetching hotels:', err);
        throw err;
    }
}

const formatDate = (date) => {
    if (date instanceof Date && !isNaN(date)) {
        return date.toISOString().split('T')[0];
    }
    console.error('Invalid date value:', date);
    throw new Error('Provided date must be a valid Date object.');
};