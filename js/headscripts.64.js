// call these functions on DOM loaded
window.addEventListener('DOMContentLoaded', function () {
    applySettingsAtStartup();
    buildYearButtons();
});

// call these functions on page fully loaded
window.addEventListener('load', function () {
    //handle video being set resize
    //document.getElementById('div-video').addEventListener('resize',()=>handleDivVideoResize());
    window.addEventListener('resize',()=>handleWindowResize());
    //handleDivVideoResize();
});

function applySettingsAtStartup() {
    setupAutoplay();
}

function setupAutoplay() {
    if (!localStorage.getItem(ls_autoplay)) localStorage.setItem(ls_autoplay, "true");
    const autoplay = localStorage.getItem(ls_autoplay) === 'true';
    document.getElementById('switch-autoplay').checked = autoplay;
    if(!autoplay) document.getElementById('video-main').removeAttribute('autoplay');
}

function buildYearButtons() {
    const divYears = document.getElementById('div-years');
    Object.keys(gvIndexMediaObj).forEach(yearName=>{
        let btn = document.createElement('div');
        const favCSS = yearName === kFavsName ? ' cssYearBtnFavs' : '';
        btn.className = 'cssYearBtn cssYearUnselected' + favCSS;
        btn.innerText = yearName;
        btn.setAttribute('data-year',yearName);
        btn.onclick = (ev)=>{handleYearClicked(ev)};
        divYears.appendChild(btn);
    });
    // add the import export favs btn
    //divYears.appendChild(createFavouritesMenu());

    // set the selected year
    const btns = Array.from(divYears.getElementsByClassName('cssYearBtn'));
    let prefBtn = btns[0];
    // select the last used if available or keep first button
    const savedYear = localStorage.getItem(ls_yearButtonName);
    if (!!savedYear) {
        const savedBtn = btns.find(element => element.innerText === savedYear);
        if(!!savedBtn) prefBtn = savedBtn;
    }
    toggleYearBtnSelected(prefBtn,true);
    // add its images
    loadThumbnailsForYear(prefBtn.getAttribute('data-year'));
}

function loadThumbnailsForYear(year) {
    const divThumbnails = document.getElementById('div-thumbnailsouter');
    divThumbnails.innerHTML = '';
    const thumbNamesArray = year === kFavsName ? Object.keys(gvFavouritesObj) : gvIndexMediaObj[year];
    thumbNamesArray.forEach(thumbName=>{
        // the year for the favs thumbName is the value of the thumbName key in gvFavouritesObj
        const actualYear = year === kFavsName ? gvFavouritesObj[thumbName] : year;
        divThumbnails.appendChild(thumnNailDivForNameYear(thumbName, actualYear));
    });
    if(year === kFavsName) {
        const favsdive = document.createElement('div');
        favsdive.className = 'cssFavsMessage';
        favsdive.innerHTML = 'Use <img alt="" src = "img/sharerup1.png" class="cssMiniImage"> ' +
            'menu under the video to export a list of these favourites to import on another device / browser';
        divThumbnails.appendChild(favsdive);
    }
    // setTimeout(() => {handleDivVideoResize()}, 500);
    // handleDivVideoResize();
}

function thumnNailDivForNameYear(thumbName, year) {
    let imgdiv = document.createElement('div');
    let img = document.createElement('img');
    img.style.width = '100%';
    imgdiv.className = 'cssThumbnailImage';//align-self-baseline
    img.src = 'media/jpegs/'+year+'/'+thumbName+'.jpg';
    img.setAttribute('data-thumbName',thumbName);
    img.setAttribute('data-year',year);
    img.setAttribute('data-jpegpath','media/jpegs/'+year+'/'+thumbName+'.jpg');
    img.setAttribute('data-mpegpath','media/mpegs/'+year+'/'+thumbName+'.mp4');
    img.onclick = (ev)=>{handleThumbnailClicked(ev)};
    // img.onload = ()=>{handleDivVideoResize()};
    imgdiv.appendChild(img);
    return imgdiv;
}

function handleYearClicked(ev) {
    clearYearButtonSelected();
    toggleYearBtnSelected(ev.target,true);
    const year = ev.target.getAttribute('data-year');
    localStorage.setItem(ls_yearButtonName,year);
    loadThumbnailsForYear(year);
}

function clearYearButtonSelected() {
    for(const btn of document.getElementById('div-years').getElementsByClassName('cssYearBtn')) toggleYearBtnSelected(btn,false);
}

function toggleYearBtnSelected(btn,selected) {
    if(selected) {
        btn.classList.add('cssYearSelected');
        btn.classList.remove('cssYearUnselected');
    } else {
        btn.classList.remove('cssYearSelected');
        btn.classList.add('cssYearUnselected');
    }
}

function handleThumbnailClicked(ev) {
    const videoMain = document.getElementById('video-main');
    videoMain.poster = ev.target.getAttribute('data-jpegpath');
    videoMain.src = ev.target.getAttribute('data-mpegpath');
    const thumbName = ev.target.getAttribute('data-thumbName');
    const divthumbname = document.getElementById('div-thumbName');
    const year = ev.target.getAttribute('data-year');
    divthumbname.innerText = year+':'+thumbName;
    divthumbname.setAttribute('data-thumbName',thumbName);
    divthumbname.setAttribute('data-year',year);
    document.getElementById('img-favourite').hidden = false;
    updateFavouriteIconForStatus(isFavourite(thumbName));
    //handleDivVideoResize();
}

function handleWindowResize() {
    document.getElementById('div-thumbName').innerText =  window.innerHeight+'px';
    handleDivVideoResize();
}

function handleDivVideoResize() {
    const paddingBuffer = 175;//150;
    const colvideo = document.getElementById('col-video');
    const colyears = document.getElementById('col-years');
    const colthumbs = document.getElementById('col-thumbnails');
    const innerheight = window.innerHeight;


    const divThumbs = document.getElementById('div-thumbnailsouter');
    const divYears = document.getElementById('div-years');
    // videoHeight accounts for whether year buttons sit on top or not
    const offsetTop = divYears.getBoundingClientRect().bottom;//divThumbs.getBoundingClientRect().top;//document.getElementById('div-video') + window.visualViewport.offsetTop;
    const divThumbsWidth = divThumbs.offsetWidth;
    const windowWidth = window.innerWidth;



    // ratio goes from 1.x (stacked) to 4.x (alongside)
    if(isLandscape()) {
        //alongside
        colthumbs.style.height = innerheight + 'px';
        colyears.style.height = innerheight + 'px';
    } else {
        // stacked
        colyears.removeAttribute('height"');
        colthumbs.style.height = (innerheight - colyears.getBoundingClientRect().height - colvideo.getBoundingClientRect().height) + 'px';
    }
}

function isLandscape() {
    return window.innerWidth / document.getElementById('col-thumbnails').getBoundingClientRect().width > 2;
}


function handleSwitchAutoplayClicked() {
    const checked = document.getElementById('switch-autoplay').checked;
    if(checked) document.getElementById('video-main').setAttribute('autoplay','');
    else document.getElementById('video-main').removeAttribute('autoplay');
    localStorage.setItem(ls_autoplay, checked ? "true" : 'false');
}


function handleDropdownItemClicked(itemID) {
    switch (itemID) {
        case 'savefavs':
            exportFavourites();
            break;
        case 'loadfavs':
            displayFavouritesFileDialog();
            break;
    }
}
/*
function handleDivVideoResize() {
    const paddingBuffer = 175;//150;
    const divThumbs = document.getElementById('div-thumbnailsouter');
    const divYears = document.getElementById('div-years');
    // videoHeight accounts for whether year buttons sit on top or not
    const offsetTop = divYears.getBoundingClientRect().bottom;//divThumbs.getBoundingClientRect().top;//document.getElementById('div-video') + window.visualViewport.offsetTop;
    const divThumbsWidth = divThumbs.offsetWidth;
    const windowWidth = window.innerWidth;
    // ratio goes from 1.x (stacked) to 4.x (alongside)
    if(windowWidth / divThumbsWidth > 2) {
        //alongside
        divThumbs.style.paddingBottom = (6+paddingBuffer)+'px';// (offsetTop+paddingBuffer)+'px';//window.visualViewport.offsetTop+
        divYears.style.paddingBottom = paddingBuffer+'px';
    } else {
        // stacked
        divThumbs.style.paddingBottom = (offsetTop+paddingBuffer)+'px';
        divYears.style.paddingBottom = '4px';
    }
}
*/