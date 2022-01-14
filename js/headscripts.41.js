// call these functions on DOM loaded
window.addEventListener('DOMContentLoaded', function () {
    applySettingsAtStartup();
    buildYearButtons();
});

// call these functions on page fully loaded
window.addEventListener('load', function () {
    //handle video being set resize
    document.getElementById('div-video').addEventListener('resize',()=>handleDivVideoResize());
    window.addEventListener('resize',()=>handleDivVideoResize());
    handleDivVideoResize();
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
    const divBtnGp = document.getElementById('btngp-yearselect');
    Object.keys(gvIndexMediaObj).forEach(yearName=>{
        let btn = document.createElement('div');
        const favCSS = yearName === kFavsName ? ' cssYearBtnFavs' : '';
        btn.className = 'cssYearBtn cssYearUnselected' + favCSS;
        btn.innerText = yearName;
        btn.setAttribute('data-year',yearName);
        btn.onclick = (ev)=>{handleYearClicked(ev)};
        divBtnGp.appendChild(btn);
    });
    // select the first button
    const firstButton = divBtnGp.getElementsByClassName('cssYearBtn')[0];
    toggleYearBtnSelected(firstButton,true);
    // add its images
    loadThumbnailsForYear(firstButton.getAttribute('data-year'));
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
    setTimeout(() => {handleDivVideoResize()}, 500);
    handleDivVideoResize();
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
    loadThumbnailsForYear(ev.target.getAttribute('data-year'));
}

function clearYearButtonSelected() {
    for(const btn of document.getElementById('btngp-yearselect').getElementsByClassName('cssYearBtn')) toggleYearBtnSelected(btn,false);
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
    handleDivVideoResize();
}

function handleDivVideoResize() {
    const paddingBuffer = 150;//150;
    const divThumbs = document.getElementById('div-thumbnailsouter');
    const colThumbs = document.getElementById('col-thumbnails');
    // videoHeight accpunts for whether year buttons sit on top or not
    const offsetTop = divThumbs.getBoundingClientRect().top;//document.getElementById('div-video') + window.visualViewport.offsetTop;
    const divThumbsWidth = divThumbs.offsetWidth;
    const windowWidth = window.innerWidth;
    // ratio goes from 1.x (stacked) to 4.x (alongside)
    if(windowWidth / divThumbsWidth > 2) {
        //alongside
        divThumbs.style.paddingBottom = (offsetTop+paddingBuffer)+'px';//window.visualViewport.offsetTop+
        document.getElementById('btngp-yearselect').style.paddingBottom = paddingBuffer+'px';
    } else {
        // stacked
        divThumbs.style.paddingBottom = (offsetTop+paddingBuffer)+'px';
        document.getElementById('btngp-yearselect').style.paddingBottom = '4px';
    }
}

function handleSwitchAutoplayClicked() {
    const checked = document.getElementById('switch-autoplay').checked;
    if(checked) document.getElementById('video-main').setAttribute('autoplay','');
    else document.getElementById('video-main').removeAttribute('autoplay');
    localStorage.setItem(ls_autoplay, checked ? "true" : 'false');
}

/*
function handleDivVideoResize() {
    const paddingBuffer = 125;//150;
    const divThumbs = document.getElementById('div-thumbnailsouter');
    const colThumbs = document.getElementById('col-thumbnails');
    // videoHeight accpunts for whether year buttons sit on top or not
    const offsetTop = divThumbs.getBoundingClientRect().top;//document.getElementById('div-video') + window.visualViewport.offsetTop;
    const divThumbsWidth = divThumbs.offsetWidth;
    const windowWidth = window.innerWidth;
    // ratio goes from 1.x (stacked) to 4.x (alongside)
    if(windowWidth / divThumbsWidth > 2) {
        //alongside
        colThumbs.style.paddingBottom = (offsetTop+paddingBuffer)+'px';//window.visualViewport.offsetTop+
        document.getElementById('btngp-yearselect').style.marginBottom = '150px';
    } else {
        // stacked
        colThumbs.style.paddingBottom = (offsetTop+paddingBuffer)+'px';
        document.getElementById('btngp-yearselect').style.marginBottom = '4px';
    }
}
*/