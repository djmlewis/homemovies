
let gvFavouritesObj = {};

function loadFavourites() {
    if (!localStorage.getItem(ls_favourites)) localStorage.setItem(ls_favourites, JSON.stringify(gvFavouritesObj));
    else {
        let madeCorrections = false;
        const tempFavouritesObj = JSON.parse(localStorage.getItem(ls_favourites));
        // clean up any old style entries
        for (const [key, value] of Object.entries(tempFavouritesObj)) {
            if(!key.includes("/")) {
                // previous version with a [thumbname] = year format. make new in new style
                tempFavouritesObj[value+"/"+key+".mp4"] = "";
                delete tempFavouritesObj[key];
                madeCorrections = true;
            }
        }
        gvFavouritesObj = tempFavouritesObj;
        if(madeCorrections) localStorage.setItem(ls_favourites, JSON.stringify(gvFavouritesObj));
    }
}

function saveFavourites() {
    localStorage.setItem(ls_favourites, JSON.stringify(gvFavouritesObj));
}

function addNameToFavourites(mpegpath,chapter) {
    // ensure we have a short mpegpath
    gvFavouritesObj[shortMPEGpath(mpegpath)] = chapter;
    saveFavourites();
    // if yearFavs is active then this does nothing so no need to update thumbnails
}

function deleteNameFromFavourites(mpegpath) {
    // ensure we have a short mpegpath
    delete gvFavouritesObj[shortMPEGpath(mpegpath)];
    saveFavourites();
    if(favsIsSelectedYear()) loadThumbnailsForYear(kFavsName);
}

function isFavourite(mpegpath) {
    // ensure we have a short mpegpath
    return gvFavouritesObj.hasOwnProperty(shortMPEGpath(mpegpath));
}

function updateFavouriteIconForStatus(isFavourite) {
    const img = document.getElementById('img-favourite');
    if(isFavourite) {
        img.src = "img/filledHeart1.png";
        img.alt = "Favourite";
        img.title = "Tap to unfavourite";
    } else
    {
        img.src = "img/emptyHeart1.png";
        img.alt = "";
        img.title = "Tap to make favourite";
    }
}

function handleFavouriteBtnClicked() {
    const divThumbName = document.getElementById('div-thumbName');
    const mpegpath = divThumbName.getAttribute('data-mpegpath');
    const chaptername = divThumbName.getAttribute('data-chaptername');
    const isFav = isFavourite(mpegpath);
    if(isFav) {
        deleteNameFromFavourites(mpegpath);
    } else  {
        const chapter = chaptername === null ? "" : chaptername;
        addNameToFavourites(mpegpath,chapter);
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
                for (const [key, value] of Object.entries(favsOj)) {
                    if(key.includes("/")) {
                        // latest version with a [year/thumbname.mp4] = chapterTitle format
                        gvFavouritesObj[key] = value;
                    } else {
                        // previous version with a [thumbname] = year format
                        gvFavouritesObj[value+"/"+key+".mp4"] = "";
                    }
                }
                saveFavourites();
                if(favsIsSelectedYear()) loadThumbnailsForYear(kFavsName);
            }
        });
    }
}

function favsIsSelectedYear() {
    return selectedYearButtonIsNamed(kFavsName);
}

function displayFavouritesFileDialog() {
    document.getElementById('fileElemFavourites').click();
}

function handleClearFavsClicked() {
    for (const prop of Object.getOwnPropertyNames(gvFavouritesObj)) {
        delete gvFavouritesObj[prop];
    }
    saveFavourites();
    if(favsIsSelectedYear()) loadThumbnailsForYear(kFavsName);
}

function loadArrayTapesViewed(){
    if(!!localStorage.getItem(ls_ArrayTapesViewed)) gvArrayTapesViewed = JSON.parse(localStorage.getItem(ls_ArrayTapesViewed));
    else gvArrayTapesViewed = [];
}
function saveArrayTapesViewed(){
    if(!!gvArrayTapesViewed) localStorage.setItem(ls_ArrayTapesViewed, JSON.stringify(gvArrayTapesViewed));
    else localStorage.setItem(ls_ArrayTapesViewed, JSON.stringify([]));
}

function mpegpathInArrayTapesViewed(mpegpath) {
    if(!!gvArrayTapesViewed) return gvArrayTapesViewed.includes(shortMPEGpath(mpegpath));
    return false;
}

function addMPEGpathToArrayTapesViewed(mpegpath) {
    const shortmpp = shortMPEGpath(mpegpath);
    if(!!gvArrayTapesViewed) gvArrayTapesViewed.push(shortmpp);
    else gvArrayTapesViewed = [shortmpp];
    saveArrayTapesViewed();
}


loadFavourites();

