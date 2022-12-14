function getIGDBInfo(id, ratingOrg = 'ESRB') {
    let loader = document.createElement("div");
    loader.setAttribute("class", "loader");
    loader.setAttribute("id", "igdb-loader");
    document.getElementById("loading-div").appendChild(loader);

    let igdbRequest = new XMLHttpRequest();
    igdbRequest.open('GET', `/api/games/${id}/igdb`);

    igdbRequest.onreadystatechange = function () {
        if (igdbRequest.readyState === 4) {
            let data = JSON.parse(igdbRequest.responseText)['data'];
            if (igdbRequest.status === 200) {
                document.getElementById("igdb-loader").remove();
                document.getElementById("description").innerHTML = data['description'];
                document.getElementById("igdb-link").innerHTML = 'View on IGDB';
                let tagsDiv = document.getElementById("tags-div");
                data['genres'].forEach(genre => {
                    let genreTag = document.createElement("span");
                    genreTag.setAttribute("class", "tag is-light mr-3");
                    genreTag.innerHTML = genre['description'];
                    tagsDiv.appendChild(genreTag);
                });
                data['ratings'].forEach(rating => {
                    if (rating['ratingorg'] == ratingOrg) {
                        let ratingFigure = document.getElementById('rating-figure');
                        let image = document.createElement("img");
                        image.setAttribute("src", "/images/ratings/" + rating['id'] + ".jpg");
                        ratingFigure.appendChild(image);
                    }
                });
            } else {
                document.getElementById("igdb-loader").remove();
                document.getElementById("description").innerHTML = "Failed to load IGDB information!";
                document.getElementById("igdb-link").innerHTML = 'View on IGDB';
            }
        }
    }
    igdbRequest.send();
}

function toggleModal() {
    let modal = document.getElementById('add-modal');
    if (modal.getAttribute('class') === 'modal is-active') {
        modal.setAttribute('class', 'modal');
    } else {
        modal.setAttribute('class', 'modal is-active');
    }
}

function addToLibrary(editionID) {
    let cost = document.getElementById("cost-text").value;
    if (cost.length == 0) {
        cost = null;
    }

    let timestamp = new Date(document.getElementById("calendar-input").value).toISOString();
    let dateCheck = document.getElementById("date-check").checked;
    if (dateCheck) {
        timestamp = null;
    }

    let conditionSelect = document.getElementById("condition-selection");
    let hasBox = !document.getElementById("box-button").classList.contains('is-outlined');
    let hasManual = !document.getElementById("manual-button").classList.contains('is-outlined');

    let retailerSelect = document.getElementById("retailer-selection");
    let retailerID = retailerSelect[retailerSelect.selectedIndex].value;
    if (retailerID < 1) {
        retailerID = null;
    }

    let button = document.getElementById("submit-button");
    button.classList.add("is-loading");
    button.disabled = true;

    let request = new XMLHttpRequest();
    request.open('POST', `/api/library`);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            let data = JSON.parse(request.responseText);
            if (request.status === 200) {
                // TODO: Delete wishlist entry and redirect user to new library entry
            } else {
                console.log(data.err);
                button.classList.add("is-danger");
                button.classList.remove("is-loading");
                button.innerHTML = "Error!"
            }
        }
    }

    request.send(JSON.stringify({
        "cost": cost,
        "timestamp": timestamp,
        "condition": conditionSelect.selectedIndex == 0,
        "box": hasBox,
        "manual": hasManual,
        "retailerID": retailerID,
        "editionID": editionID
    }));
}