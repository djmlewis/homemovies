// call these functions on DOM loaded  -- DOMContentLoaded on DOCUMENT, onload on WINDOW
document.addEventListener('DOMContentLoaded', function () {
    loadArrayTapesViewed();
    applySettingsAtStartup();
    buildYearButtons();
});

// call these functions on page fully loaded  -- DOMContentLoaded on DOCUMENT, onload on WINDOW
window.addEventListener('load', function () {
    window.addEventListener('resize',()=>handleWindowResize());
    hideShowBtnThumbsIndex();
    handleDivVideoResize();
    if(!localStorage.getItem(ls_switchHiResBool)) localStorage.setItem(ls_switchHiResBool,kBoolStrTrue);
    document.getElementById('switchHiRes').checked = localStorage.getItem(ls_switchHiResBool) === kBoolStrTrue;
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
    // filter out the tapes button, beware Tapes and tapes
    Object.keys(gvIndexMediaObj).filter(key=>key.toLowerCase() !== 'tapes').sort().forEach(yearName=>{
        let btn = document.createElement('div');
        //const favCSS = yearName === kFavsName ? ' cssYearBtnFavs' : '';
        btn.className = 'cssYearBtn cssYearUnselected';// + favCSS;
        btn.innerText = yearName;
        btn.setAttribute('data-year',yearName);
        btn.onclick = handleYearClicked;
        divYears.appendChild(btn);
    });
    addIndexYearButton(divYears);
    addTapesYearButton(divYears);
    addTapesIndexYearButton(divYears);
    addFavsYearButton(divYears);
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
function addFavsYearButton(divYears) {
    let btn = document.createElement('div');
    btn.className = 'cssYearBtn cssYearUnselected cssFavsUnselected cssYearBtnFavs';
    btn.innerText = kFavsName;
    btn.setAttribute('data-year',kFavsName);
    btn.onclick = handleYearClicked;
    divYears.appendChild(btn);
}
function addIndexYearButton(divYears) {
    let btn = document.createElement('div');
    btn.className = 'cssYearBtn cssYearUnselected';
    btn.innerText = kTitlesIndexName;
    btn.setAttribute('data-year',kTitlesIndexName);
    btn.onclick = (ev)=>{handleYearClicked(ev)};
    divYears.appendChild(btn);
}

function addTapesYearButton(divYears) {
    let btn = document.createElement('div');
    btn.className = 'cssYearBtn cssYearUnselected cssTapesUnselected';
    btn.innerText = kTitlesTapesName;
    btn.setAttribute('data-year',kTitlesTapesName);
    btn.onclick = (ev)=>{handleYearClicked(ev)};
    divYears.appendChild(btn);
}

function addTapesIndexYearButton(divYears) {
    let btn = document.createElement('div');
    btn.className = 'cssYearBtn cssYearUnselected cssTapesUnselected';
    btn.innerText = kTapesTitlesIndexName;
    btn.setAttribute('data-year',kTapesTitlesIndexName);
    btn.onclick = (ev)=>{handleYearClicked(ev)};
    divYears.appendChild(btn);
}

function loadIndexForYear(year) {
    const divThumbnails = document.getElementById('div-thumbnailsouter');
    loadCorrectGvIndexHTMLToDivOuter(gvIndexHTML,divThumbnails);
    // hide the This is and index for... Div using cssIndexSurtitle limit to divThumbnails
    Array.from(divThumbnails.getElementsByClassName('cssIndexSurtitle')).forEach(surtitle=>{surtitle.hidden = true;});
    divThumbnails.scrollTop = 0;
    document.getElementById('div-indexSearch').hidden = true;
    filterIndexByYear(year)
}

function filterIndexByYear(year) {
    const divIndexRows = document.getElementById("div-indexRows");
    Array.from(divIndexRows.getElementsByClassName('cssIndexHeader')).forEach(para=>{para.hidden = true;});
    let counter = 1;
    Array.from(divIndexRows.getElementsByClassName('cssIndexRow')).forEach((para)=>{
        const found = yearFromMPEGpath(para.getAttribute('data-mpegpath')).includes(year) === true;
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

function loadCorrectGvIndexHTMLToDivOuter(indexToLoad,divThumbnailsOuter) {
    divThumbnailsOuter.innerHTML = indexToLoad;
    const inner = document.getElementById("divIndexRowsInner");
    if(!!inner) inner.addEventListener("click",handleIndexRowClickedEvent);
}

function loadThumbnailsForYear(year) {
    const divThumbnailsOuter = document.getElementById('div-thumbnailsouter');
    divThumbnailsOuter.innerHTML = '';
    const btnIndexThumbs = document.getElementById('btn-ThumbsIndex');
    btnIndexThumbs.innerText = 'Show Titles';
    btnIndexThumbs.hidden = true;
    hideShowTapesHeader(true,true);
    if(year === kTitlesTapesName) {
        loadTapesList();
    } else if(year === kTapesTitlesIndexName) {
        hideShowTapesHeader(true,false);
        btnIndexThumbs.hidden = true;
        loadCorrectGvIndexHTMLToDivOuter(gvTapesIndexHTML,divThumbnailsOuter);
    } else if(year === kTitlesIndexName) {
        btnIndexThumbs.hidden = true;
        loadCorrectGvIndexHTMLToDivOuter(gvIndexHTML,divThumbnailsOuter);
    } else if(year === kFavsName) {
        hideShowTapesHeader(true,false);
        btnIndexThumbs.hidden = true;
        Object.keys(gvFavouritesObj).sort().forEach(mpegpath => {
            divThumbnailsOuter.appendChild(thumnNailDivForFavourite(mpegpath,gvFavouritesObj[mpegpath]));//gvFavouritesObj[mpegpath] value is chaptername
        });
        const favsdiv = document.createElement('div');
        favsdiv.className = 'cssFavsMessage';
        favsdiv.innerHTML = document.getElementById('div-favsbuttons').innerHTML;
        divThumbnailsOuter.appendChild(favsdiv);
    } else {
        btnIndexThumbs.hidden = false;
        gvIndexMediaObj[year].sort().forEach(thumbName => {
            //const actualYear = year === kFavsName ? gvFavouritesObj[thumbName] : year;
            divThumbnailsOuter.appendChild(thumnNailDivForNameYear(thumbName, year));
        });
    }
    divThumbnailsOuter.scrollTop = 0;
}

function thumnNailDivForNameYear(thumbName, year) {
    let imgdiv = document.createElement('div');
    imgdiv.className = 'cssThumbnailImageDiv ratio';//align-self-baseline
    imgdiv.setAttribute('data-thumbName',thumbName);
    imgdiv.setAttribute('data-year',year);
    //imgdiv.setAttribute('data-jpegpath','media/jpegs/'+year+'/'+thumbName+'.jpg');
    imgdiv.setAttribute('data-mpegpath',year+'/'+thumbName+'.mp4');
    // no data-chapter
    imgdiv.onclick = (ev)=>{handleThumbnailClicked(ev)};
    let img = document.createElement('img');
    img.style.width = '100%';
    img.src = 'media/jpegs/'+year+'/'+thumbName+'.jpg';
    img.style.objectFit = 'scale-down';
    imgdiv.appendChild(img);
    return imgdiv;
}

function thumnNailDivForFavourite(mpegpath, chapterName) {
    let imgdiv = document.createElement('div');
    imgdiv.className = 'cssThumbnailImageDiv ratio';//align-self-baseline
    const thumbName = thumbNameFromMPEGpath(mpegpath);
    const year = yearFromMPEGpath(mpegpath);
    imgdiv.setAttribute('data-thumbName',thumbName);
    imgdiv.setAttribute('data-year',year);
    //imgdiv.setAttribute('data-jpegpath','media/jpegs/'+year+'/'+thumbName+'.jpg');
    imgdiv.setAttribute('data-mpegpath',mpegpath);
    imgdiv.setAttribute('data-chaptername', chapterName);

    imgdiv.onclick = (ev)=>{handleThumbnailClicked(ev)};
    let img = document.createElement('img');
    img.style.width = '100%';
    img.src = jpegpathFromMPEGpath(mpegpath);
    img.style.objectFit = 'scale-down';
    //img.hidden = true;
    imgdiv.appendChild(img);

    if(yearFromMPEGpath(mpegpath) === kTitlesTapesName) {
        const divchapterOuter = document.createElement('div');
        divchapterOuter.className = "cssDivChapterName d-flex align-items-center ";
        const divchaptername = document.createElement('div');
        divchaptername.className = "bg-dark my-auto";
        if(chapterName != null && chapterName.length>0) divchaptername.innerHTML = '<span class="cssTapeTitleText">'+gvTitlesObj[thumbName]+':</span> '+chapterName ;
        else divchaptername.innerHTML = '<span class="cssTapeTitleText">'+gvTitlesObj[thumbName]+'</span>';
        divchapterOuter.appendChild(divchaptername);
        imgdiv.appendChild(divchapterOuter);
    }
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
        // we need cssYearSelected to identify btn as selected!!!
        btn.classList.add('cssYearSelected');
        // overlay cssYearSelectedTapes or cssYearSelectedFavs
        if(btn.innerText === kTitlesTapesName || btn.innerText === kTapesTitlesIndexName) btn.classList.add('cssYearSelectedTapes');
        if(btn.innerText === kFavsName) btn.classList.add('cssYearSelectedFavs');
        btn.classList.remove('cssYearUnselected');
        btn.classList.remove('cssTapesUnselected');
        btn.classList.remove('cssFavsUnselected');
    } else {
        btn.classList.remove('cssYearSelected');
        btn.classList.remove('cssYearSelectedTapes');
        btn.classList.remove('cssYearSelectedFavs');
        btn.classList.add('cssYearUnselected');
        if(btn.innerText === kTitlesTapesName || btn.innerText === kTapesTitlesIndexName) btn.classList.add('cssTapesUnselected');
        if(btn.innerText === kFavsName) btn.classList.add('cssFavsUnselected');
    }
}

function setVideoPoster(video,mpegpath,jpegpath) {
    if(mpegpath.includes('#t=')) video.removeAttribute('poster');
    else video.setAttribute('poster', jpegpath);
}

function clearAttribsDivThumbNameBtnDownload() {
    ['img-downloadvideo','div-thumbName'].forEach(elid=>
        ['data-thumbName','data-year','data-mpegpath','data-chaptername'].forEach(attr=>
            document.getElementById(elid).removeAttribute(attr)));
}

function handleThumbnailClicked(ev) {
    loadVideoFromThumbnailObj(ev.currentTarget);
}

function loadVideoFromThumbnailObj(thumbnail) {
    clearAttribsDivThumbNameBtnDownload();
    const divthumbname = document.getElementById('div-thumbName');
    const videoMain = document.getElementById('video-main');
    const btndownload = document.getElementById('img-downloadvideo');

    // we need to switch according to we are called from a TapesIndexRow which has a chapter row number in data-indx,  or from elsewhere which lacks data-indx
    let mpegpath;
    let chapterName;
    if(!!thumbnail.getAttribute('data-indx')) {
        // lookup the chapter by tapeThumbname (tape fn) and indx (in array of chapters)
        const indx = parseInt(thumbnail.getAttribute('data-indx'));
        const tapeThumbName = thumbnail.getAttribute('data-tapeThumbName');
        if(!!gvTapesObj[tapesObjTapesChaptersObj][tapeThumbName]) {
            const startEndtitleArray = gvTapesObj[tapesObjTapesChaptersObj][tapeThumbName][indx];
            mpegpath = kMPEGpathPrefix + "Tapes/" + tapeThumbName + ".mp4" + "#t=" + startEndtitleArray[0] + "," + startEndtitleArray[1];
            chapterName = startEndtitleArray[2];
            // we MUST set divthumbname.setAttribute('data-chaptername', chapterName) from TapesIndex row to allow correct Favs save
            divthumbname.setAttribute('data-chaptername', chapterName);
        }
    } else {
        mpegpath = fqMPEGpath(thumbnail.getAttribute('data-mpegpath'));
        chapterName = thumbnail.getAttribute('data-chaptername');
    }
    const thumbName = thumbNameFromMPEGpath(mpegpath);//thumbnail.getAttribute('data-thumbName');
    const year = yearFromMPEGpath(mpegpath);//thumbnail.getAttribute('data-year');
    const jpegpath = jpegpathFromMPEGpath(mpegpath);//thumbnail.getAttribute('data-jpegpath');
    setVideoPoster(videoMain, mpegpath,jpegpath);
    loadPlayerWithMPEGpath(videoMain,mpegpath);//videoMain.src = mpegpath;
    divthumbname.setAttribute('data-thumbName',thumbName);
    divthumbname.setAttribute('data-year',year);
    divthumbname.setAttribute('data-mpegpath',mpegpath);
    // we dont set divthumbname.setAttribute('data-chaptername', chapterName) as not from TapesIndex row
    setThumbnameForID(divthumbname,thumbName,year,chapterName);
    document.getElementById('img-favourite').hidden = false;
    btndownload.hidden = false;
    btndownload.setAttribute('data-mpegpath', mpegpath);
    btndownload.setAttribute('data-thumbName', thumbName);
    updateFavouriteIconForStatus(isFavourite(mpegpath));
}

function setThumbnameForID(divthumbname, thumbName,year,description) {
    // comper null with == and NOT ===
    if(description == null || description.length ===0) {
        if(!!gvTitlesObj[thumbName]) {
            if(year === 'Tapes') divthumbname.innerHTML = '<span class="cssTapesUnselected">' + gvTitlesObj[thumbName] + '</span>';
            else divthumbname.innerHTML = gvTitlesObj[thumbName];
        } else {
            // i dont think this ever gets called
            divthumbname.innerHTML = year;
        }
    } else {
        divthumbname.innerHTML = '<span class="cssTapesUnselected">' + gvTitlesObj[thumbName] + " : " + '</span>' + description;
    }
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
    hideShowBtnThumbsIndex();
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

function hideShowBtnThumbsIndex() {
    const btnThumbsIndex = document.getElementById('btn-ThumbsIndex');
    btnThumbsIndex.hidden = indexIsSelectedYear() || favsIsSelectedYear() || tapesIsSelectedYear() || tapesIndexIsSelectedYear();
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
function handleIndexClicked(row) {
    loadVideoFromThumbnailObj(row);
}
*/
function handleIndexRowClickedEvent(ev) {
    loadVideoFromThumbnailObj(ev.target);
}
function searchIndexFromSearchInput() {
    const searchStr = document.getElementById("input-searchlegend").value.toLowerCase();
    const divIndexRows = document.getElementById("div-indexRows");
    if (searchStr.length > 0) {
        Array.from(divIndexRows.getElementsByClassName('cssIndexHeader')).forEach(para=>{para.hidden = true;});
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
    Array.from(document.getElementById("div-indexRows").getElementsByClassName('cssIndexHeader')).forEach(para=>{para.hidden = false;});
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
function tapesIsSelectedYear() {
    return selectedYearButtonIsNamed(kTitlesTapesName);
}

function tapesIndexIsSelectedYear() {
    return selectedYearButtonIsNamed(kTapesTitlesIndexName);
}

function handleDownloadVideoClicked() {
    const mpegpath = fqMPEGpath(document.getElementById('img-downloadvideo').getAttribute('data-mpegpath'));
    if(mpegpath.includes('Tapes') && !mpegpath.includes('#')) {
        if(confirm('The entire video file (~1 GB+) will be downloaded. Do you wish to continue?'))
            completeDownloadVideo(mpegpath);
    } else if(mpegpath.includes('#')) {
        if(confirm('The entire video file (~1 GB+) will be downloaded and not just this clip. Do you wish to continue?'))
            completeDownloadVideo(mpegpath);
    } else completeDownloadVideo(mpegpath);
}
function completeDownloadVideo(mpegpath){
    const anchor = document.createElement('a');
    anchor.href = mpegpath;
    anchor.download = thumbNameFromMPEGpath(mpegpath);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}
function loadTapesList() {
    document.getElementById('btn-ThumbsIndex').hidden = true;
    const divTapesIDsOuter = document.createElement('div');
    divTapesIDsOuter.className = "cssDivThumbsInner";
    divTapesIDsOuter.onclick = (ev)=>loadVideoFromTapeDiv(ev.target);
    gvTapesObj[tapesObjTapesIDsArray].forEach(thumbName=>{
        const divTapesTitle = document.createElement('div');
        divTapesTitle.className = "cssIndexRow cssBanding cssTapesUnselected";
        const mpegpath = "Tapes/"+thumbName+".mp4";
        divTapesTitle.setAttribute('data-mpegpath',mpegpath);
        divTapesTitle.setAttribute('data-thumbname',thumbName);
        const unviewedPrefix = mpegpathInArrayTapesViewed(mpegpath) ? "" : "<span class = 'cssColourColourSelectedTapes'>" + kSymbolUnviewed + " </span>";
        divTapesTitle.innerHTML = unviewedPrefix + gvTitlesObj[thumbName];
        divTapesIDsOuter.appendChild(divTapesTitle);
    });
    document.getElementById('div-thumbnailsouter').appendChild(divTapesIDsOuter);
    hideShowTapesHeader(true,false);
}


function loadVideoFromTapeDiv(seltapeDiv) {
    clearAttribsDivThumbNameBtnDownload();
    const videoMain = document.getElementById('video-main');
    const divthumbname = document.getElementById('div-thumbName');
    const mpegpath = fqMPEGpath(seltapeDiv.getAttribute('data-mpegpath'));
    const thumbName = thumbNameFromMPEGpath(mpegpath);//seltapeDiv.getAttribute('data-thumbName');
    const year = kTitlesTapesName;
    const jpegpath = jpegpathFromMPEGpath(mpegpath);
    addMPEGpathToArrayTapesViewed(mpegpath);
    setVideoPoster(videoMain,mpegpath,jpegpath);
    loadPlayerWithMPEGpath(videoMain,mpegpath);//videoMain.src = mpegpath;
    divthumbname.setAttribute('data-thumbName',thumbName);
    divthumbname.setAttribute('data-year',year);
    divthumbname.setAttribute('data-mpegpath',mpegpath);
    setThumbnameForID(divthumbname,thumbName,year);
    document.getElementById('img-favourite').hidden = false;
    const btndownload = document.getElementById('img-downloadvideo');
    btndownload.hidden = false;
    btndownload.setAttribute('data-mpegpath', mpegpath);
    btndownload.setAttribute('data-thumbName', thumbName);
    updateFavouriteIconForStatus(isFavourite(mpegpath));
    // now replace the tapes list with chapters
    loadTapeChaptersList(thumbName);
}

function loadTapeChaptersList(thumbname) {
    document.getElementById('btn-ThumbsIndex').hidden = true;
    const divThumbnailsOuter = document.getElementById('div-thumbnailsouter');
    divThumbnailsOuter.innerHTML = '';
    const divChaptersOuter = document.createElement('div');
    divChaptersOuter.className = "cssDivThumbsInner";
    divChaptersOuter.onclick = (ev)=>loadVideoFromChapter(ev.target);
    // cycle thru the tapes chapters array which has elements as array: [start,end,title,hhss] ['38995','40489','Garden, Southwood Lane','2:31']
    if(!!gvTapesObj[tapesObjTapesChaptersObj][thumbname]) gvTapesObj[tapesObjTapesChaptersObj][thumbname].forEach(startEndtitleArray=>{
        const divchapter = document.createElement('div');
        divchapter.className = "cssIndexRow cssBanding";
        divchapter.setAttribute('data-mpegpath',"Tapes/" + thumbname+".mp4"+"#t=" + startEndtitleArray[0] + "," + startEndtitleArray[1]);
        divchapter.setAttribute('data-thumbname',thumbname);
        // chapter divs use a chapter name
        divchapter.setAttribute('data-chaptername', startEndtitleArray[2]);
        divchapter.innerHTML = startEndtitleArray[2] + ' <span class = "cssTapesChapterDuration">' + startEndtitleArray[3] + '</span>';
        divChaptersOuter.appendChild(divchapter);
    });
    divThumbnailsOuter.appendChild(divChaptersOuter);
    document.getElementById('div-chaptersListTitleDiv').innerHTML = '<div class="cssIndexYearHeaderTapes">' + gvTitlesObj[thumbname] + "</div>" +
        "<div class = 'cssInfoDivTapesChapters'>" +
        "Click clips below to play just that section of tape. There may be a delay in clips loading. " +
        "Turn off HiRes Video to speed-up loading</div>";
    hideShowTapesHeader(false,false);
    clearTimeout(gvTimeoutInfoDivTapesChapters);
    gvTimeoutInfoDivTapesChapters = setTimeout(()=>{
        gvTimeoutInfoDivTapesChapters = undefined;
        Array.from(document.getElementsByClassName('cssInfoDivTapesChapters')).forEach(span=>{span.style.display = 'none';})
    },6000);
}

function loadVideoFromChapter(chapterDiv) {
    clearAttribsDivThumbNameBtnDownload();
    const videoMain = document.getElementById('video-main');
    const divthumbname = document.getElementById('div-thumbName');
    const mpegpath = fqMPEGpath(chapterDiv.getAttribute('data-mpegpath'));
    const thumbName = thumbNameFromMPEGpath(mpegpath);//chapterDiv.getAttribute('data-thumbName');
    const chaptername = chapterDiv.getAttribute('data-chaptername');
    const year = kTitlesTapesName;
    //const jpegpath = jpegpathFromMPEGpath(mpegpath);//chapterDiv.getAttribute('data-jpegpath');
    videoMain.removeAttribute('poster');// dont setVideoPoster(videoMain,mpegpath,jpegpath); as it flashes the start jpeg before loading
    loadPlayerWithMPEGpath(videoMain,mpegpath);//videoMain.src = mpegpath;
    divthumbname.setAttribute('data-thumbName',thumbName);
    divthumbname.setAttribute('data-year',year);
    divthumbname.setAttribute('data-mpegpath',mpegpath);
    divthumbname.setAttribute('data-chaptername', chaptername);
    setThumbnameForID(divthumbname,thumbName,year,chaptername);
    document.getElementById('img-favourite').hidden = false;
    const btndownload = document.getElementById('img-downloadvideo');
    btndownload.hidden = false;
    btndownload.setAttribute('data-mpegpath', mpegpath);
    btndownload.setAttribute('data-thumbName', thumbName);
    btndownload.setAttribute('data-chaptername', chaptername);
    updateFavouriteIconForStatus(isFavourite(mpegpath));
}

function goBackToTapesTitles() {
    hideShowTapesHeader(true,false);
    document.getElementById('div-thumbnailsouter').innerHTML = '';
    loadTapesList();
}

function hideShowTapesHeader(hideBackToTapesBtn,hideHiResSwitch) {
    const divTapesSettings = document.getElementById('div-TapesSettings');
    const divTapesSettingsFlex = document.getElementById('div-TapesSettingsFlex');
    divTapesSettings.hidden = hideHiResSwitch;
    if(hideBackToTapesBtn) {
        divTapesSettingsFlex.classList.remove('justify-content-between');
        divTapesSettingsFlex.classList.add('justify-content-end');
    } else {
        divTapesSettingsFlex.classList.add('justify-content-between');
        divTapesSettingsFlex.classList.remove('justify-content-end');
    }
    document.getElementById('btn-BackToTapesTitles').hidden = hideBackToTapesBtn;
    document.getElementById('div-chaptersListTitleDiv').hidden = hideBackToTapesBtn;
    if(hideBackToTapesBtn) document.getElementById('div-chaptersListTitleDiv').innerHTML = "";
}

function loadPlayerWithMPEGpath(player,mpegpath) {
    if(document.getElementById("switchHiRes").checked === false) {
        mpegpath = mpegpath.replace("Tapes","TapesLoRes");
    }
    player.src = mpegpath;
}

function switchHiResChanged(swHiRes) {
    localStorage.setItem(ls_switchHiResBool, swHiRes.checked ? kBoolStrTrue : kBoolStrFalse);
    const videoMain = document.getElementById('video-main');
    if(videoMain.src.includes("Tapes/")) videoMain.src = videoMain.src.replace("Tapes","TapesLoRes");
    else if(videoMain.src.includes("TapesLoRes")) videoMain.src = videoMain.src.replace("TapesLoRes","Tapes");
}