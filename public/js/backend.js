function renderResult(levelID, loaderID, status) {
    let spanClass;
    let iconClass;
    switch (status) {
        case 200:
            spanClass = 'icon has-text-success';
            iconClass = 'fas fa-check-circle fa-lg';
            break;
        default:
            spanClass = 'icon has-text-warning';
            iconClass = 'fas fa-exclamation-triangle fa-lg';
    }
    let level = document.getElementById(levelID);
    let loader = document.getElementById(loaderID);
    let span = document.createElement("span");
    let icon = document.createElement("icon");
    span.setAttribute("class", spanClass);
    icon.setAttribute("class", iconClass);
    span.appendChild(icon);
    loader.remove();
    level.appendChild(span);
}

function pingEndpoint(url, levelID, loaderID) {
    let request = new XMLHttpRequest();
    request.open('GET', url);

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            renderResult(levelID, loaderID, request.status);
        }
    }

    request.send();
}

function fetchSystemInformation() {
    let request = new XMLHttpRequest();
    request.open('GET', `/api/system/platform`);

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            let data = JSON.parse(request.responseText)['data'];
            if (request.status === 200) {
                let distro = data['distro'];
                document.getElementById('os-text').innerHTML = distro;
            } else {
                document.getElementById('os-text').innerHTML = "<i class=\"fas fa-exclamation-triangle\"></i>";
            }
        }
    }

    request.send();
}

function requestNewToken() {
    let request = new XMLHttpRequest();
    request.open('PUT', `/api/igdb/regen-token`);

    let button = document.getElementById('request-token-button');
    button.disabled = true;
    button.setAttribute("class", "button is-warning is-loading");

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200) {
                button.innerHTML = "Success";
                button.setAttribute("class", "button is-success");
            } else {
                button.innerHTML = "Failed";
                button.setAttribute("class", "button is-danger");
            }
        }
    }

    request.send();
}

function getGamesWithoutLibrary() {
    let request = new XMLHttpRequest();
    request.open('GET', `/api/games?where=no-library`);

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            let rowData = document.getElementById('games-no-library-data');
            let loader = document.getElementById('games-no-library-loader');

            let data = JSON.parse(request.responseText);
            loader.remove();
            if (request.status === 200) {
                let text = document.createElement("p");
                text.innerHTML = data['data'].length;
                rowData.appendChild(text);
            } else {
                let span = document.createElement("span");
                let icon = document.createElement("icon");
                span.setAttribute("class", 'icon has-text-warning');
                icon.setAttribute("class", 'fas fa-exclamation-triangle fa-lg');
                span.appendChild(icon);
                rowData.appendChild(span);
            }
        }
    }

    request.send();
}

function getGamesWithoutIGDB() {
    let request = new XMLHttpRequest();
    request.open('GET', `/api/games?where=no-igdb`);

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            let rowData = document.getElementById('games-no-igdb-data');
            let loader = document.getElementById('games-no-igdb-loader');

            let data = JSON.parse(request.responseText);
            loader.remove();
            if (request.status === 200) {
                let text = document.createElement("p");
                text.innerHTML = data['data'].length;
                rowData.appendChild(text);
            } else {
                let span = document.createElement("span");
                let icon = document.createElement("icon");
                span.setAttribute("class", 'icon has-text-warning');
                icon.setAttribute("class", 'fas fa-exclamation-triangle fa-lg');
                span.appendChild(icon);
                rowData.appendChild(span);
            }
        }
    }

    request.send();
}