const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { TripItem, Booking, Excursion } = require('../models/TripItem');

describe('TripItem — Base Class', () => {

    test('TP-01: TripItem stores tripId, cost, and date correctly', () => {
        const item = new TripItem(3, 150.00, '2026-04-20');
        assert.strictEqual(item.tripId, 3);
        assert.strictEqual(item.cost, 150.00);
        assert.strictEqual(item.date, '2026-04-20');
    });

    test('TP-02: TripItem getSummary() returns expected string', () => {
        const item = new TripItem(3, 150.00, '2026-04-20');
        const summary = item.getSummary();
        assert.ok(summary.includes('2026-04-20'), 'Summary should include date');
        assert.ok(summary.includes('150'), 'Summary should include cost');
    });

    test('TP-03: TripItem cost accepts decimal values', () => {
        const item = new TripItem(1, 99.99, '2026-05-01');
        assert.strictEqual(item.cost, 99.99);
    });

    test('TP-04: TripItem cost of zero is valid', () => {
        const item = new TripItem(1, 0, '2026-05-01');
        assert.strictEqual(item.cost, 0);
    });

});

describe('Booking — Subclass (extends TripItem)', () => {

    test('TP-05: Booking is an instance of TripItem (inheritance)', () => {
        const booking = new Booking(3, 500, '2026-04-20', 'hotel', { name: 'Grand Miami Hotel' });
        assert.ok(booking instanceof TripItem, 'Booking should be instanceof TripItem');
        assert.ok(booking instanceof Booking, 'Booking should be instanceof Booking');
    });

    test('TP-06: Booking stores type and details correctly', () => {
        const details = { name: 'Grand Miami Hotel', checkIn: '2026-04-20', checkOut: '2026-04-25' };
        const booking = new Booking(3, 500, '2026-04-20', 'hotel', details);
        assert.strictEqual(booking.type, 'hotel');
        assert.deepStrictEqual(booking.details, details);
    });

    test('TP-07: Booking inherits tripId, cost, date from TripItem', () => {
        const booking = new Booking(3, 500, '2026-04-20', 'hotel', {});
        assert.strictEqual(booking.tripId, 3);
        assert.strictEqual(booking.cost, 500);
        assert.strictEqual(booking.date, '2026-04-20');
    });

    test('TP-08: Booking getSummary() overrides TripItem (polymorphism)', () => {
        const booking = new Booking(3, 500, '2026-04-20', 'hotel', {});
        const summary = booking.getSummary();
        assert.ok(summary.includes('hotel'), 'Booking summary should include type');
        assert.ok(summary.includes('2026-04-20'), 'Booking summary should include date');
        assert.ok(summary.includes('500'), 'Booking summary should include cost');
    });

    test('TP-09: Booking getSummary() differs from TripItem getSummary() (polymorphism)', () => {
        const base = new TripItem(3, 500, '2026-04-20');
        const booking = new Booking(3, 500, '2026-04-20', 'hotel', {});
        assert.notStrictEqual(booking.getSummary(), base.getSummary(),
            'Overridden getSummary() should differ from base');
    });

    test('TP-10: Booking supports transportation type', () => {
        const booking = new Booking(3, 350, '2026-04-20', 'transportation', { airline: 'Delta', flightNumber: 'DL123' });
        assert.strictEqual(booking.type, 'transportation');
        assert.strictEqual(booking.details.airline, 'Delta');
    });

});

describe('Excursion — Subclass (extends TripItem)', () => {

    test('TP-11: Excursion is an instance of TripItem (inheritance)', () => {
        const exc = new Excursion(3, 75, '2026-04-22', 'Miami Boat Tour', 'A scenic boat tour of Miami Beach.');
        assert.ok(exc instanceof TripItem, 'Excursion should be instanceof TripItem');
        assert.ok(exc instanceof Excursion, 'Excursion should be instanceof Excursion');
    });

    test('TP-12: Excursion stores name and description correctly (encapsulation)', () => {
        const exc = new Excursion(3, 75, '2026-04-22', 'Miami Boat Tour', 'A scenic boat tour.');
        assert.strictEqual(exc.name, 'Miami Boat Tour');
        assert.strictEqual(exc.description, 'A scenic boat tour.');
    });

    test('TP-13: Excursion inherits tripId, cost, date from TripItem', () => {
        const exc = new Excursion(3, 75, '2026-04-22', 'Miami Boat Tour', '');
        assert.strictEqual(exc.tripId, 3);
        assert.strictEqual(exc.cost, 75);
        assert.strictEqual(exc.date, '2026-04-22');
    });

    test('TP-14: Excursion getSummary() overrides TripItem (polymorphism)', () => {
        const exc = new Excursion(3, 75, '2026-04-22', 'Miami Boat Tour', '');
        const summary = exc.getSummary();
        assert.ok(summary.includes('Miami Boat Tour'), 'Excursion summary should include name');
        assert.ok(summary.includes('2026-04-22'), 'Excursion summary should include date');
        assert.ok(summary.includes('75'), 'Excursion summary should include cost');
    });

    test('TP-15: Excursion getSummary() differs from TripItem getSummary() (polymorphism)', () => {
        const base = new TripItem(3, 75, '2026-04-22');
        const exc = new Excursion(3, 75, '2026-04-22', 'Miami Boat Tour', '');
        assert.notStrictEqual(exc.getSummary(), base.getSummary(),
            'Overridden getSummary() should differ from base');
    });

    test('TP-16: Excursion description can be empty string', () => {
        const exc = new Excursion(3, 50, '2026-04-23', 'City Walk', '');
        assert.strictEqual(exc.description, '');
    });

});

describe('Polymorphism — mixed TripItem array', () => {

    test('TP-17: Array of TripItems produces correct polymorphic getSummary() per type', () => {
        const items = [
            new TripItem(3, 0, '2026-04-19'),
            new Booking(3, 500, '2026-04-20', 'hotel', {}),
            new Excursion(3, 75, '2026-04-22', 'Miami Boat Tour', ''),
        ];
        const summaries = items.map(i => i.getSummary());
        assert.ok(summaries[0].includes('Trip item'), 'Base class summary');
        assert.ok(summaries[1].includes('hotel'), 'Booking summary');
        assert.ok(summaries[2].includes('Miami Boat Tour'), 'Excursion summary');
    });

    test('TP-18: Total cost calculated correctly across mixed TripItem array', () => {
        const items = [
            new Booking(3, 500, '2026-04-20', 'hotel', {}),
            new Booking(3, 350, '2026-04-20', 'transportation', {}),
            new Excursion(3, 75, '2026-04-22', 'Boat Tour', ''),
        ];
        const total = items.reduce((sum, i) => sum + i.cost, 0);
        assert.strictEqual(total, 925);
    });

});

describe('Input validation edge cases', () => {

    test('TP-19: TripItem handles large cost values', () => {
        const item = new TripItem(1, 999999.99, '2026-12-31');
        assert.strictEqual(item.cost, 999999.99);
    });

    test('TP-20: Booking details object can be empty', () => {
        const booking = new Booking(1, 100, '2026-04-20', 'hotel', {});
        assert.deepStrictEqual(booking.details, {});
    });

});