function fetchLibrary(sortBy = "title") {
    let filters = collectFilters();
    let filterText = document.getElementById("filter-text");
    let filterOptions = document.getElementById("filter-options");
    let tableHead = document.getElementById("table-head");
    filterOptions.classList.add("is-hidden");
    tableHead.classList.add("is-hidden");

    if (filters.length === 0) {
        filterText.classList.remove("has-text-primary");
    } else {
        filterText.classList.add("has-text-primary");
    }

    let request = new XMLHttpRequest();
    request.open('GET', `/api/library?sortBy=${sortBy}&filters=[${filters.join(',')}]`);

    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            let data = JSON.parse(request.responseText);
            let mainDiv = document.getElementById("main-div");
            while (mainDiv.firstChild) {
                mainDiv.removeChild(mainDiv.firstChild);
            }

            let libraryBar = document.getElementById("library-bar");
            libraryBar.classList.remove("is-hidden");
            tableHead.classList.remove("is-hidden");

            if (request.status === 200) {
                data = data['library'];

                let tableBody = document.getElementById("table-body");
                while (tableBody.firstChild) {
                    tableBody.removeChild(tableBody.firstChild);
                }

                if (data.length == 0) {
                    let noGamesText = document.createElement("p");
                    noGamesText.setAttribute("class", "title has-text-centered");
                    noGamesText.innerHTML = "No Games to Display...";
                    mainDiv.appendChild(noGamesText);
                    return;
                }

                data.forEach(game => {
                    let link = document.createElement("a");
                    link.setAttribute("href", `/library/${game.id}`);
                    let title = document.createElement("th");
                    link.innerHTML = game.title;
                    title.appendChild(link);

                    let platform = document.createElement("td");
                    platform.innerHTML = game.platform;

                    let dateAdded = document.createElement("td");
                    if (game['dateAdded'] === null) {
                        dateAdded.innerHTML = 'Unknown';
                    } else {
                        let date = new Date(game['dateAdded']);
                        dateAdded.innerHTML = (date.getUTCMonth() + 1) + '-' + date.getUTCDate() + '-' + date.getUTCFullYear();
                    }

                    let cost = document.createElement("td");
                    if (game['gift']) {
                        cost.innerHTML = 'Gift';
                    } else if (game['cost'] == null) {
                        cost.innerHTML = 'Unknown';
                    } else {
                        cost.innerHTML = game['cost'];
                    }

                    let edition = document.createElement("td");
                    edition.innerHTML = game['edition'];

                    let row = document.createElement("tr");
                    row.setAttribute("id", `library-${game['id']}-row`);
                    row.appendChild(title);
                    row.appendChild(platform);
                    row.appendChild(dateAdded);
                    row.appendChild(cost);
                    row.appendChild(edition);

                    tableBody.appendChild(row);
                });
            } else {
                let noGamesText = document.createElement("p");
                noGamesText.setAttribute("class", "title has-text-centered");
                noGamesText.innerHTML = "An error has occurred!";
                mainDiv.appendChild(noGamesText);
            }
        }
    }

    request.send();
}

function toggleFilterOptions() {
    let filterOptions = document.getElementById("filter-options");
    if (filterOptions.classList.contains("is-hidden")) {
        filterOptions.classList.remove("is-hidden");
    } else {
        filterOptions.classList.add("is-hidden");
    }
}

function collectFilters() {
    let filters = [];
    let checkboxes = document.getElementsByClassName('checkbox');

    for (let i = 0; i < checkboxes.length; i++) {
        let checkbox = checkboxes[i].children[0];
        if (!checkbox.checked) {
            filters.push(checkbox.getAttribute('value'));
        }
    }

    return filters;
}

function resetFilters() {
    let checkboxes = document.getElementsByClassName('checkbox');

    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].children[0].checked = true;
    }

    fetchLibrary('title');
}