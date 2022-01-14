
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
}

function deleteNameFromFavourites(name) {
    delete gvFavouritesObj[name];
    saveFavourites();
}

function isFavourite(name) {
    return gvFavouritesObj.hasOwnProperty(name);
}

function updateFavouriteIconForStatus(isFavourite) {
    const img = document.getElementById('img-favourite');
    if(isFavourite) {
        img.src = "img/heartFilled.png";
        img.alt = "Favourite";
        img.title = "Tap to unfavourite";
    } else
    {
        img.src = "img/heartEmpty.png";
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
    const selectedYearDiv = document.getElementById('btngp-yearselect').getElementsByClassName('cssYearSelected').item(0);
    // refresh the Favs thumbs if displayed
    if(selectedYearDiv && selectedYearDiv.innerText === kFavsName) {
        loadThumbnailsForYear(kFavsName);
    }
    // have to toggle isFav as we are toggling status based on it
    updateFavouriteIconForStatus(!isFav);
}

loadFavourites();
