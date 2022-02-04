// call these functions on DOM loaded  -- DOMContentLoaded on DOCUMENT, onload on WINDOW
document.addEventListener('DOMContentLoaded', function () {
    applySettingsAtStartup();
    buildYearButtons();
});

// call these functions on page fully loaded  -- DOMContentLoaded on DOCUMENT, onload on WINDOW
window.addEventListener('load', function () {
    window.addEventListener('resize',()=>handleWindowResize());
    const year = localStorage.getItem(ls_yearButtonName);
   // const hideBtn = /*!isLandscape() || */ year === kFavsName || year === kTitlesIndexName;
    document.getElementById('btn-ThumbsIndex').hidden = year === kFavsName || year === kTitlesIndexName;
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
    const divYears = document.getElementById('div-years');
    Object.keys(gvIndexMediaObj).sort().forEach(yearName=>{
        let btn = document.createElement('div');
        const favCSS = yearName === kFavsName ? ' cssYearBtnFavs' : '';
        btn.className = 'cssYearBtn cssYearUnselected' + favCSS;
        btn.innerText = yearName;
        btn.setAttribute('data-year',yearName);
        btn.onclick = handleYearClicked;//(ev)=>{handleYearClicked(ev)};
        divYears.appendChild(btn);
    });
    addIndexYearButton(divYears);
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

function addIndexYearButton(divYears) {
    let btn = document.createElement('div');
    btn.className = 'cssYearBtn cssYearUnselected';
    btn.innerText = kTitlesIndexName;
    btn.setAttribute('data-year',kTitlesIndexName);
    btn.onclick = (ev)=>{handleYearClicked(ev)};
    divYears.appendChild(btn);
}

function loadIndexForYear(year) {
    const divThumbnails = document.getElementById('div-thumbnailsouter');
    divThumbnails.innerHTML = gvIndexHTML;
    divThumbnails.scrollTop = 0;
    document.getElementById('div-indexSearch').hidden = true;
    filterIndexByYear(year)
}

function filterIndexByYear(year) {
    const divIndexRows = document.getElementById("div-indexRows");
    Array.from(divIndexRows.getElementsByClassName('cssIndexYearHeader')).forEach(para=>{para.hidden = true;});
    let counter = 1;
    Array.from(divIndexRows.getElementsByClassName('cssIndexRow')).forEach((para)=>{
        const found = para.getAttribute('data-year').includes(year) === true;
        para.hidden = !found;
        para.classList.remove('cssBanding');
        if(counter % 2 === 0) {
            para.classList.remove('cssParaOdd');
            para.classList.add('cssParaEven');
        } else {
            para.classList.add('cssParaOdd');
            para.classList.remove('cssParaEven');
        }
        if(found) counter++;
    });
}

function loadThumbnailsForYear(year) {
    const divThumbnails = document.getElementById('div-thumbnailsouter');
    divThumbnails.innerHTML = '';
    const btnIndexThumbs = document.getElementById('btn-ThumbsIndex');
    btnIndexThumbs.innerText = 'Show Titles';
    btnIndexThumbs.hidden = true;
    if(year === kTitlesIndexName) {
        btnIndexThumbs.hidden = true;
        divThumbnails.innerHTML = gvIndexHTML;
    } else {
        btnIndexThumbs.hidden = year === kFavsName;//!isLandscape() || year === kFavsName;
        const thumbNamesArray = year === kFavsName ? Object.keys(gvFavouritesObj) : gvIndexMediaObj[year];
        thumbNamesArray.sort().forEach(thumbName => {
            // the year for the favs thumbName is the value of the thumbName key in gvFavouritesObj
            const actualYear = year === kFavsName ? gvFavouritesObj[thumbName] : year;
            divThumbnails.appendChild(thumnNailDivForNameYear(thumbName, actualYear));
        });
        if (year === kFavsName) {
            const favsdiv = document.createElement('div');
            favsdiv.className = 'cssFavsMessage';
            favsdiv.innerHTML = document.getElementById('div-favsbuttons').innerHTML;
            divThumbnails.appendChild(favsdiv);
        }
    }
    divThumbnails.scrollTop = 0;
}

function thumnNailDivForNameYear(thumbName, year) {
    let imgdiv = document.createElement('div');
    let img = document.createElement('img');
    img.style.width = '100%';
    imgdiv.className = 'cssThumbnailImage ratio';//align-self-baseline
    img.src = 'media/jpegs/'+year+'/'+thumbName+'.jpg';
    img.setAttribute('data-thumbName',thumbName);
    img.setAttribute('data-year',year);
    img.setAttribute('data-jpegpath','media/jpegs/'+year+'/'+thumbName+'.jpg');
    img.setAttribute('data-mpegpath','media/mpegs/'+year+'/'+thumbName+'.mp4');
    img.style.objectFit = 'scale-down';
    img.onclick = (ev)=>{handleThumbnailClicked(ev)};
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
    loadVideoFromThumbnailObj(ev.target);
}
function loadVideoFromThumbnailObj(thumbnail) {
    const videoMain = document.getElementById('video-main');
    videoMain.poster = thumbnail.getAttribute('data-jpegpath');
    videoMain.src = thumbnail.getAttribute('data-mpegpath');
    const thumbName = thumbnail.getAttribute('data-thumbName');
    const divthumbname = document.getElementById('div-thumbName');
    const year = thumbnail.getAttribute('data-year');
    divthumbname.setAttribute('data-thumbName',thumbName);
    divthumbname.setAttribute('data-year',year);
    setThumbnameForID(divthumbname,thumbName,year);
    document.getElementById('img-favourite').hidden = false;
    const btndownload = document.getElementById('img-downloadvideo');
    btndownload.hidden = false;
    btndownload.setAttribute('data-mpegpath', thumbnail.getAttribute('data-mpegpath'));
    btndownload.setAttribute('data-thumbName', thumbnail.getAttribute('data-thumbName'));
    updateFavouriteIconForStatus(isFavourite(thumbName));
}

function setThumbnameForID(divthumbname, thumbName,year) {
    if(!!gvTitlesObj[thumbName]) divthumbname.innerText = gvTitlesObj[thumbName];
    else divthumbname.innerText = year+':'+thumbName;
}

function handleWindowResize() {
    clearTimeout(gvResizeTimer);
    gvResizeTimer = setTimeout(()=>{handleDivVideoResize()},100);
}

function handleDivVideoResize() {
    const colyears = document.getElementById('col-years');
    const colthumbs = document.getElementById('col-thumbnails');
    const innerheight = window.innerHeight;
    // i dont trust reported col heights so have a special div video outer
    const divvideoouter = document.getElementById('div-videoOuter');
    const divYears = document.getElementById('div-years');
    const btnThumbsIndex = document.getElementById('btn-ThumbsIndex');
    btnThumbsIndex.hidden = indexIsSelectedYear() || favsIsSelectedYear();
    if(isLandscape()) {
        //alongside
        colthumbs.style.height = innerheight + 'px';
        colyears.style.height = innerheight + 'px';
        btnThumbsIndex.style.marginTop = '6px';
    } else {
        // stacked
        colthumbs.style.height = (innerheight - divYears.getBoundingClientRect().height - divvideoouter.getBoundingClientRect().height) + 'px';
        colyears.style.height = 'auto';
        btnThumbsIndex.style.marginTop = '0';
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

function handleIndexClicked(row) {
    loadVideoFromThumbnailObj(row);
}

function searchIndexFromSearchInput() {
    const searchStr = document.getElementById("input-searchlegend").value.toLowerCase();
    const divIndexRows = document.getElementById("div-indexRows");
    if (searchStr.length > 0) {
        Array.from(divIndexRows.getElementsByClassName('cssIndexYearHeader')).forEach(para=>{para.hidden = true;});
        let counter = 1;
        Array.from(divIndexRows.getElementsByClassName('cssIndexRow')).forEach((para)=>{
            const found = para.innerText.toLowerCase().includes(searchStr) === true;
            para.hidden = !found;
            para.classList.remove('cssBanding');
            if(counter % 2 === 0) {
                para.classList.remove('cssParaOdd');
                para.classList.add('cssParaEven');
            } else {
                para.classList.add('cssParaOdd');
                para.classList.remove('cssParaEven');
            }
            if(found) counter++;
        });
    } else clearSearchIndex();
}

function clearSearchIndex() {
    document.getElementById("input-searchlegend").value = '';
    Array.from(document.getElementById("div-indexRows").getElementsByClassName('cssIndexYearHeader')).forEach(para=>{
        para.hidden = false;
    });
    Array.from(document.getElementById("div-indexRows").getElementsByClassName('cssIndexRow')).forEach(para=>{
        para.classList.add('cssBanding');
        para.hidden = false;
        para.classList.remove('cssParaOdd');
        para.classList.remove('cssParaEven');
    });
}

function toggleIndexThumbs(btn) {
    const year = localStorage.getItem(ls_yearButtonName);
    if(btn.innerText.includes('Titles')) {
        btn.innerText = 'Show Thumbnails';
        loadIndexForYear(year);
    } else {
        btn.innerText = 'Show Titles';
        loadThumbnailsForYear(year);
    }
}

function selectedYearButtonIsNamed(name) {
    const divYears = document.getElementById('div-years');
    const btns = Array.from(divYears.getElementsByClassName('cssYearSelected'));
    return btns.length > 0 && btns[0].getAttribute('data-year') === name;
}

function indexIsSelectedYear() {
    return selectedYearButtonIsNamed(kTitlesIndexName);
}

function handleDownloadVideoClicked() {
    const btndownload = document.getElementById('img-downloadvideo');
    const anchor = document.createElement('a');
    anchor.href = btndownload.getAttribute('data-mpegpath');
    anchor.download = btndownload.getAttribute('data-thumbname')+'.mp4';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}
