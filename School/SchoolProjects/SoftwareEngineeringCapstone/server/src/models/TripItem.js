class TripItem {
    constructor(tripId, cost, date) {
        this.tripId = tripId;
        this.cost = cost;
        this.date = date;
    }
    getSummary() {
        return `Trip item on ${this.date} costing $${this.cost}`;
    }
}

class Booking extends TripItem {
    constructor(tripId, cost, date, type, details) {
        super(tripId, cost, date);
        this.type = type;
        this.details = details;
    }
    getSummary() {
        return `${this.type} booking on ${this.date} - $${this.cost}`;
    }
}

class Excursion extends TripItem {
    constructor(tripId, cost, date, name, description) {
        super(tripId, cost, date);
        this.name = name;
        this.description = description;
    }
    getSummary() {
        return `${this.name} on ${this.date} - $${this.cost}`;
    }
}

module.exports = { TripItem, Booking, Excursion };