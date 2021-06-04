const sqlite3 = require('sqlite3').verbose();

function SQLite3Driver() {
    SQLite3Driver.prototype.dbName = './models/pixelshelf.db';
}

SQLite3Driver.prototype.getLibrary = function getLibrary() {
    return new Promise(function (resolve, reject) {
        SQLite3Driver.prototype.db = new sqlite3.Database(SQLite3Driver.prototype.dbName, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                reject(err);
            }
            let sql = 'SELECT game.id, game.title, platform.name, library.month, library.day, library.year, library.cost FROM game, platform, edition, library INNER JOIN edition e ON editionid = e.id INNER JOIN game g ON edition.gameid = g.id INNER JOIN platform p ON p.id = game.platformid';
            SQLite3Driver.prototype.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                let result = [];
                rows.forEach((row) => {
                    result.push({
                        "id": row.id,
                        "title": row.title,
                        "platform": row.name,
                        "dateAdded": row.month + '-' + row.day + '-' + row.year,
                        "cost": row.cost,
                        "edition": row.name
                    });
                });
                SQLite3Driver.prototype.db.close();
                resolve(result);
            });
        });
    });
}

SQLite3Driver.prototype.getPlatforms = function getPlatforms() {
    return new Promise(function (resolve, reject) {
        SQLite3Driver.prototype.db = new sqlite3.Database(SQLite3Driver.prototype.dbName, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                reject(err);
            }
            let sql = 'SELECT platform.name, platform.id FROM platform';
            SQLite3Driver.prototype.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                let result = [];
                rows.forEach((row) => {
                    result.push({
                        "id": row.id,
                        "platform": row.name,
                    });
                });
                SQLite3Driver.prototype.db.close();
                resolve(result);
            });
        });
    });
}

SQLite3Driver.prototype.getLibraryGame = function getLibraryGame(id) {
    return new Promise(function (resolve, reject) {
        SQLite3Driver.prototype.db = new sqlite3.Database(SQLite3Driver.prototype.dbName, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                reject(err);
            }
            let sql = 'SELECT game.*, platform.*, edition.*, library.* FROM library, game, platform, edition INNER JOIN edition e ON editionid = e.id INNER JOIN game g ON edition.gameid = g.id INNER JOIN platform p ON p.id = game.platformid WHERE library.id = ' + id + ' LIMIT 1';
            SQLite3Driver.prototype.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                }
                let result = {};
                rows.forEach((row) => {
                    console.log(row)
                    result = {
                        "title": row.title,
                        "platform": row.name,
                        "cost": row.cost,
                        "msrp": row.msrp,
                        "upc": row.upc,
                        "edition": row.edition,
                        "new": row.new == 1,
                        "date": row.year + '-' + row.month + '-' + row.day
                    };
                });
                SQLite3Driver.prototype.db.close();
                resolve(result);
            });
        });
    });
}

SQLite3Driver.prototype.addGame = function addGame(json) {
    return new Promise(function (resolve, reject) {
        SQLite3Driver.prototype.db = new sqlite3.Database(SQLite3Driver.prototype.dbName, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                SQLite3Driver.prototype.db.close();
                reject(err);
            }
            console.log("MADE IT1")
            SQLite3Driver.prototype.db.all(`INSERT INTO game VALUES (${json.title}, ${json.platform})`, ['C'], (err) => {
                if (err) {
                    SQLite3Driver.prototype.db.close();
                    reject(err);
                }
                console.log("MADE IT2")
                SQLite3Driver.prototype.db.all(`INSERT INTO edition VALUES (${json.edition}, ${json.upc}, ${json.msrp}, ${this.lastID})`, ['C'], (err) => {
                    if (err) {
                        SQLite3Driver.prototype.db.close();
                        reject(err);
                    }
                    console.log("MADE IT3")
                    SQLite3Driver.prototype.db.all(`INSERT INTO library VALUES (${json.cost}, ${json.month}, ${json.day}, ${json.year}, ${this.lastID})`, ['C'], (err) => {
                        if (err) {
                            SQLite3Driver.prototype.db.close();
                            reject(err);
                        }
                        console.log("MADE IT4")
                        SQLite3Driver.prototype.db.close();
                        resolve();
                    });
                });
            });
        });
    });
}

SQLite3Driver.prototype.connect = function connect() {
    SQLite3Driver.prototype.db = new sqlite3.Database(SQLite3Driver.prototype.dbName, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to SQLite3 DB');
    });
}

module.exports = SQLite3Driver;