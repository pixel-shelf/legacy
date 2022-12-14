const pixelShelf = require("../app");
const supertest = require("supertest");

const SQLite3Driver = require("../models/SQLite3Driver");
const EXPECTED_LIBRARY_SIZE = 6;

beforeEach(done => {
    SQLite3Driver.initializeDB().then(() => {
        SQLite3Driver.initializeDB('./models/testdata.sql').then(() => {
            done();
        });
    });
});

test('No Filters', () => {
    return supertest(pixelShelf)
        .get('/api/library?sortBy=title&filters=[]')
        .expect(200)
        .then(response => {
            let library = response['body']['library'];
            expect(library.length).toBe(EXPECTED_LIBRARY_SIZE);
        });
});

test('Malformed Filters', () => {
    return supertest(pixelShelf)
        .get('/api/library?sortBy=title&filters=not-physical,not-new')
        .expect(400);
});

test('Filter Physical Titles', () => {
    return supertest(pixelShelf)
        .get('/api/library?sortBy=title&filters=[not-physical]')
        .expect(200)
        .then(response => {
            let library = response['body']['library'];
            expect(library.length).toBe(2);
        });
});

test('Filter Digital Titles', () => {
    return supertest(pixelShelf)
        .get('/api/library?sortBy=title&filters=[not-digital]')
        .expect(200)
        .then(response => {
            let library = response['body']['library'];
            expect(library.length).toBe(4);
        });
});

test('Filter Physical and Digital Titles', () => {
    return supertest(pixelShelf)
        .get('/api/library?sortBy=title&filters=[not-physical,not-digital]')
        .expect(200)
        .then(response => {
            let library = response['body']['library'];
            expect(library.length).toBe(0);
        });
});

test('Filter New Titles', () => {
    return supertest(pixelShelf)
        .get('/api/library?sortBy=title&filters=[not-new]')
        .expect(200)
        .then(response => {
            let library = response['body']['library'];
            expect(library.length).toBe(1);
        });
});

test('Filter Used Titles', () => {
    return supertest(pixelShelf)
        .get('/api/library?sortBy=title&filters=[not-used]')
        .expect(200)
        .then(response => {
            let library = response['body']['library'];
            expect(library.length).toBe(5);
        });
});

test('Filter New and Used Titles', () => {
    return supertest(pixelShelf)
        .get('/api/library?sortBy=title&filters=[not-new,not-used]')
        .expect(200)
        .then(response => {
            let library = response['body']['library'];
            expect(library.length).toBe(0);
        });
});

test('Filter Gifted Titles', () => {
    return supertest(pixelShelf)
        .get('/api/library?sortBy=title&filters=[not-gift]')
        .expect(200)
        .then(response => {
            let library = response['body']['library'];
            expect(library.length).toBe(5);
        });
});