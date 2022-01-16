
let gvFavouritesObj = {};

function loadFavourites() {
    if (!localStorage.getItem(ls_favourites)) localStorage.setItem(ls_favourites, JSON.stringify(gvFavouritesObj));
    else gvFavouritesObj = JSON.parse(localStorage.getItem(ls_favourites));
    gvIndexMediaObj[kFavsName] = [];//actually ignored just a placeholder for the tab
}

function saveFavourites() {
    localStorage.setItem(ls_favourites, JSON.stringify(gvFavouritesObj));
}

function addNameToFavourites(name,year) {
    gvFavouritesObj[name] =year;
    saveFavourites();
    // if yearFavs is active then this does nothing so no need to update thumbnails
}

function deleteNameFromFavourites(name) {
    delete gvFavouritesObj[name];
    saveFavourites();
    if(yearButtonFavsSelected()) loadThumbnailsForYear(kFavsName);
}

function isFavourite(name) {
    return gvFavouritesObj.hasOwnProperty(name);
}

function updateFavouriteIconForStatus(isFavourite) {
    const img = document.getElementById('img-favourite');
    if(isFavourite) {
        img.src = "img/filledHeart.png";
        img.alt = "Favourite";
        img.title = "Tap to unfavourite";
    } else
    {
        img.src = "img/emptyHeart.png";
        img.alt = "";
        img.title = "Tap to make favourite";
    }
}

function handleFavouriteClicked() {
    const divThumbName = document.getElementById('div-thumbName');
    const thumbName = divThumbName.getAttribute('data-thumbName');
    const isFav = isFavourite(thumbName);
    if(isFav) {
        deleteNameFromFavourites(thumbName);
    } else
    {
        addNameToFavourites(thumbName,divThumbName.getAttribute('data-year'));
    }
    const selectedYearDiv = document.getElementById('div-years').getElementsByClassName('cssYearSelected').item(0);
    // refresh the Favs thumbs if displayed
    if(selectedYearDiv && selectedYearDiv.innerText === kFavsName) {
        loadThumbnailsForYear(kFavsName);
    }
    // have to toggle isFav as we are toggling status based on it
    updateFavouriteIconForStatus(!isFav);
}

function exportFavourites() {
    const data = JSON.stringify(gvFavouritesObj);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'homeMoviesFavourites.json';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}
function handleFavouritesFileElementChanged(element) {
    if(element.files.length > 0) {
        element.files[0].text().then(text => {
            const favsOj = JSON.parse(String(text));
            if(!!favsOj) {
                for (const [key, value] of Object.entries(favsOj)) gvFavouritesObj[key] = value;
                saveFavourites();
                if(yearButtonFavsSelected()) loadThumbnailsForYear(kFavsName);
            }
        });
    }
}

function yearButtonFavsSelected() {
    const divYears = document.getElementById('div-years');
    const btns = Array.from(divYears.getElementsByClassName('cssYearSelected'));
    return btns.length > 0 && btns[0].getAttribute('data-year') === kFavsName;
}

function displayFavouritesFileDialog() {
    document.getElementById('fileElemFavourites').click();
}


loadFavourites();
