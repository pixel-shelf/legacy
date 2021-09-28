const axios = require('axios');
var config = require('../config.json');

const https = require('https');
const fs = require('fs');

const create = require('./SQLiteUtils/CreateDriver');

const version = 'v4';
var clientID = config['client_id'];
var clientSecret = config['client_secret'];
var clientToken = config['token'];

module.exports = {
    regenerateToken: function () {
        return new Promise(function (resolve, reject) {
            axios({
                method: 'post',
                url: `https://id.twitch.tv/oauth2/token?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials`,
                headers: {}
            })
                .then(function (response) {
                    let data = response.data;
                    clientToken = data['access_token']; // Update the prototype's token
                    fs.readFile('config.json', 'utf8', function (err, configObject) { // Update the file's token
                        if (err) {
                            reject(err);
                        } else {
                            let temp = JSON.parse(configObject);
                            temp['token'] = data['access_token'];
                            let json = JSON.stringify(temp);
                            fs.writeFile('config.json', json, 'utf8', function () {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        }
                    });
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    },
    getGameByName: function (name) {
        return new Promise(function (resolve, reject) {
            axios({
                method: 'post',
                url: 'https://api.igdb.com/' + version + '/games/',
                headers: {
                    'Client-ID': clientID,
                    'Authorization': 'Bearer ' + clientToken,
                    'Content-Type': 'text/plain'
                },
                data: 'fields first_release_date, summary, url, age_ratings.rating, age_ratings.category, genres.name, cover.image_id; where name = \"' + name + '\";'
            })
                .then(function (res) {
                    let resJSON = res.data;
                    resolve(resJSON);
                    if (resJSON.length > 0) {
                        cacheMetadata(resJSON);
                    }
                })
                .catch(function (e) {
                    console.log(e);
                    reject(e);
                });
        });
    },
    getGameByURL: function (url) {
        return new Promise(function (resolve, reject) {
            axios({
                method: 'post',
                url: 'https://api.igdb.com/' + version + '/games/',
                headers: {
                    'Client-ID': clientID,
                    'Authorization': 'Bearer ' + clientToken,
                    'Content-Type': 'text/plain'
                },
                data: 'fields first_release_date, summary, url, age_ratings.rating, age_ratings.category, genres.name, cover.image_id; where url = \"' + url + '\";'
            })
                .then(function (res) {
                    let resJSON = res.data;
                    resolve(resJSON);
                    if (resJSON.length > 0) {
                        cacheMetadata(resJSON);
                    }
                })
                .catch(function (e) {
                    console.log(e);
                    reject(e);
                });
        });
    },
    checkStatus: function () {
        return new Promise(function (resolve, reject) {
            axios({
                method: 'post',
                url: 'https://api.igdb.com/' + version + '/games',
                headers: {
                    'Client-ID': clientID,
                    'Authorization': 'Bearer ' + clientToken,
                    'Content-Type': 'text/plain'
                },
                data: 'where url = "https://www.igdb.com/games/gex";'
            })
                .then(function (res) {
                    if (res.status === 200) {
                        resolve();
                    } else {
                        reject("Received non-200 status code");
                    }
                })
                .catch(function (e) {
                    reject(e);
                });
        });
    }
}

function cacheMetadata(resJSON) {
    if (resJSON[0]['cover']) {
        let size = 'cover_big_2x';
        let imageID = resJSON[0]['cover']['image_id'];
        https.get(`https://images.igdb.com/igdb/image/upload/t_${size}/${imageID}.jpg`, function (fileRes) {
            let imagePath = "/images/covers/" + imageID + ".jpg";
            const file = fs.createWriteStream(__dirname + "/../public" + imagePath);
            fileRes.pipe(file);
            create.insertIGDB(resJSON[0]['url'], resJSON[0]['summary'], resJSON[0]['first_release_date'], imagePath).catch(err => {
                console.log(err);
            });
        }).on('error', function (err) {
            console.log(err);
        });
    } else {
        create.insertIGDB(resJSON[0]['url'], resJSON[0]['summary'], resJSON[0]['first_release_date'], null).catch(err => {
            console.log(err);
        });
    }
    resJSON[0]['genres'].forEach(genre => {
        create.insertGenre(genre['id'], genre['name']).catch(err => {
        });
        create.insertHasAGenre(genre['id'], resJSON[0]['url']).catch(err => {
        });
    });
    resJSON[0]['age_ratings'].forEach(ageRating => {
        let category;
        switch (ageRating['category']) {
            case 1:
                category = 'ESRB';
                break;
            case 2:
                category = 'PEGI';
                break;
            default:
                category = 'Unknown';
        }
        create.insertRating(ageRating['rating'], category).catch(err => {
        });
        create.insertHasARating(ageRating['rating'], resJSON[0]['url']).catch(err => {
        });
    });
}