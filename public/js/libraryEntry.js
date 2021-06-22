function renderCostChart(msrp, cost) {
    let chart = new Chart(document.getElementById('cost-chart').getContext('2d'), {
        type: 'horizontalBar',
        data: {
            labels: ["MSRP", "Cost"],
            datasets: [{
                scaleFontColor: "#FFFFFF",
                borderColor: ['rgb(196, 25, 25)', 'rgb(25, 25, 196)'],
                backgroundColor: ['rgb(196, 25, 25)', 'rgb(25, 25, 196)'],
                data: [msrp, cost]
            }]
        },
        options: {
            legend: {
                display: false
            },
            animation: {
                tension: {
                    duration: 1000,
                    easing: 'linear',
                    from: 1,
                    to: 0,
                    loop: true
                }
            },
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        fontColor: 'rgb(255, 255, 255)'
                    }
                }]
            }
        }
    });
}

function getIGDBInfo(id) {
    let loader = document.createElement("div");
    loader.setAttribute("class", "loader");
    loader.setAttribute("id", "igdb-loader");
    document.getElementById("loading-div").appendChild(loader);

    let igdbRequest = new XMLHttpRequest();
    igdbRequest.open('GET', `/library/${id}/igdb`);

    igdbRequest.onreadystatechange = function () {
        if (igdbRequest.readyState === 4) {
            let data = JSON.parse(igdbRequest.responseText)['data'][0];
            if (igdbRequest.status === 200) {
                console.log(data);
                document.getElementById("igdb-loader").remove();
                document.getElementById("description").innerHTML = data['summary'];
                document.getElementById("igdb-link").innerHTML = 'View on IGDB';
                let tagsDiv = document.getElementById("tags-div");
                data['genres'].forEach(genre => {
                    let genreTag = document.createElement("span");
                    genreTag.setAttribute("class", "tag is-light mr-3");
                    genreTag.innerHTML = genre.name;
                    tagsDiv.appendChild(genreTag);
                });
                const ratingOrg = 1; // ESRB Ratings Only
                const ratingLegend = ["N/A", "Three", "Seven", "Twelve", "Sixteen", "Eighteen", "RP", "EC", "E", "E10", "T", "M", "AO"];
                let ratings = data['age_ratings'];
                for (let i = 0; i < ratings.length; i++) {
                    if (ratings[i]['category'] === ratingOrg) {
                        console.log(ratings[i]['rating']);
                        console.log("Rating is " + ratingLegend[ratings[i]['rating']]);
                        let image = document.createElement("img");
                        image.setAttribute("src", "/images/ratings/" + ratings[i]['rating'] + ".jpg");
                        document.getElementById("rating-figure").appendChild(image);
                        break;
                    }
                }
            } else {
                console.log("TODO: Handle error!")
            }
        }
    }

    igdbRequest.send();
}

function deleteGame(id) {
    let request = new XMLHttpRequest();
    request.open('DELETE', `/library/${id}`);
    request.setRequestHeader('Content-Type', 'application/json');

    let params = {
        "id": id
    };

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 204) {
                console.log("Success!");
            } else {
                console.log("TODO: Handle error!")
            }
        }
    }

    request.send(JSON.stringify(params));
}