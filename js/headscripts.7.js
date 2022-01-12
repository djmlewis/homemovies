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
    gvIndexMediaObj.dirsArray.forEach(yearName=>{
        let btn = document.createElement('div');
        btn.className = 'cssYearBtn cssYearUnselected';
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
    const thumbNamesArray = gvIndexMediaObj.namesArraysObj[year];
    thumbNamesArray.forEach(thumbName=>{
        let img = document.createElement('img');
        // img.style.maxWidth = '48%';
        img.className = 'cssThumbnailImage mb-1';
        img.src = 'media/jpegs/'+year+'/'+thumbName+'.jpg';
        img.setAttribute('data-jpegpath','media/jpegs/'+year+'/'+thumbName+'.jpg');
        img.setAttribute('data-mpegpath','media/mpegs/'+year+'/'+thumbName+'.mp4');
        img.onclick = (ev)=>{handleThumbnailClicked(ev)};
        divThumbnails.appendChild(img);
    });
    handleDivVideoResize();
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
    handleDivVideoResize();
}

function handleDivVideoResize() {
    const divThumbs = document.getElementById('div-thumbnailsouter');
    // videoHeight accpunts for whether year buttons sit on top or not
    const videoHeight = document.getElementById('div-video').getBoundingClientRect().bottom + window.visualViewport.offsetTop;
    const divThumbsWidth = divThumbs.offsetWidth;
    const windowWidth = window.innerWidth;
    // ratio goes from 1.x (underneath) to 4.x (alongside)
    divThumbs.style.paddingBottom = windowWidth / divThumbsWidth > 2 ? (window.visualViewport.offsetTop+100)+'px' : (videoHeight+100)+'px';
}

function handleSwitchAutoplayClicked() {
    const checked = document.getElementById('switch-autoplay').checked;
    if(checked) document.getElementById('video-main').setAttribute('autoplay','');
    else document.getElementById('video-main').removeAttribute('autoplay');
    localStorage.setItem(ls_autoplay, checked ? "true" : 'false');
}