// call these functions on DOM loaded  -- DOMContentLoaded on DOCUMENT, onload on WINDOW
document.addEventListener('DOMContentLoaded', function () {
    applySettingsAtStartup();
    buildYearButtons();
});

// call these functions on page fully loaded  -- DOMContentLoaded on DOCUMENT, onload on WINDOW
window.addEventListener('load', function () {
    window.addEventListener('resize',()=>handleWindowResize());
    hideShowBtnThumbsIndex();
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
    btn.className = 'cssYearBtn cssYearUnselected cssYearBtnFavs';
    btn.innerText = kFavsName;
    btn.setAttribute('data-year',kFavsName);
    btn.onclick = handleYearClicked;
    divYears.appendChild(btn);
}
function addTapesYearButton(divYears) {
    let btn = document.createElement('div');
    btn.className = 'cssYearBtn cssYearUnselected';
    btn.innerText = kTitlesTapesName;
    btn.setAttribute('data-year',kTitlesTapesName);
    btn.onclick = (ev)=>{handleYearClicked(ev)};
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

function loadThumbnailsForYear(year) {
    const divThumbnailsOuter = document.getElementById('div-thumbnailsouter');
    divThumbnailsOuter.innerHTML = '';
    const btnIndexThumbs = document.getElementById('btn-ThumbsIndex');
    btnIndexThumbs.innerText = 'Show Titles';
    btnIndexThumbs.hidden = true;
    hideShowChaptersHeader(true);
    if(year === kTitlesTapesName) {
        loadTapesList();
    } else if(year === kTitlesIndexName) {
        btnIndexThumbs.hidden = true;
        divThumbnailsOuter.innerHTML = gvIndexHTML;
    } else if(year === kFavsName) {
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

    if(chapterName != null && chapterName.length>0) {
        const divchaptername = document.createElement('div');
        divchaptername.innerText = chapterName;
        divchaptername.className = "cssDivChapterName ";
        imgdiv.appendChild(divchaptername);

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
        if(btn.innerText === kTitlesTapesName) btn.classList.add('cssYearSelectedTapes');
        if(btn.innerText === kFavsName) btn.classList.add('cssYearSelectedFavs');
        btn.classList.remove('cssYearUnselected');
    } else {
        btn.classList.remove('cssYearSelected');
        btn.classList.remove('cssYearSelectedTapes');
        btn.classList.remove('cssYearSelectedFavs');
        btn.classList.add('cssYearUnselected');
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
    const mpegpath = fqMPEGpath(thumbnail.getAttribute('data-mpegpath'));
    const thumbName = thumbNameFromMPEGpath(mpegpath);//thumbnail.getAttribute('data-thumbName');
    const year = yearFromMPEGpath(mpegpath);//thumbnail.getAttribute('data-year');
    const jpegpath = jpegpathFromMPEGpath(mpegpath);//thumbnail.getAttribute('data-jpegpath');
    setVideoPoster(videoMain, mpegpath,jpegpath);
    videoMain.src = mpegpath;
    divthumbname.setAttribute('data-thumbName',thumbName);
    divthumbname.setAttribute('data-year',year);
    divthumbname.setAttribute('data-mpegpath',mpegpath);
    setThumbnameForID(divthumbname,thumbName,year,thumbnail.getAttribute('data-chaptername'));
    document.getElementById('img-favourite').hidden = false;
    btndownload.hidden = false;
    btndownload.setAttribute('data-mpegpath', mpegpath);
    btndownload.setAttribute('data-thumbName', thumbName);
    updateFavouriteIconForStatus(isFavourite(mpegpath));
}

function setThumbnameForID(divthumbname, thumbName,year,description) {
    const caption = description == null || description.length ===0 ? "" : " : "+description ;
    if(!!gvTitlesObj[thumbName]) divthumbname.innerText = gvTitlesObj[thumbName] + caption;
    else divthumbname.innerText = year+':' + caption;
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
    btnThumbsIndex.hidden = indexIsSelectedYear() || favsIsSelectedYear() || tapesIsSelectedYear();
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
function tapesIsSelectedYear() {
    return selectedYearButtonIsNamed(kTitlesTapesName);
}

function handleDownloadVideoClicked() {
    const btndownload = document.getElementById('img-downloadvideo');
    const anchor = document.createElement('a');
    anchor.href = fqMPEGpath(btndownload.getAttribute('data-mpegpath'));
    anchor.download = btndownload.getAttribute('data-thumbname')+'.mp4';
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
        divTapesTitle.className = "cssIndexRow cssBanding";
        divTapesTitle.setAttribute('data-mpegpath',"tapes/"+thumbName+".mp4");
        divTapesTitle.setAttribute('data-thumbname',thumbName);
        divTapesTitle.innerText = gvTitlesObj[thumbName];
        divTapesIDsOuter.appendChild(divTapesTitle);
    });
    document.getElementById('div-thumbnailsouter').appendChild(divTapesIDsOuter);
}


function loadVideoFromTapeDiv(seltapeDiv) {
    clearAttribsDivThumbNameBtnDownload();
    const videoMain = document.getElementById('video-main');
    const divthumbname = document.getElementById('div-thumbName');
    const mpegpath = fqMPEGpath(seltapeDiv.getAttribute('data-mpegpath'));
    const thumbName = thumbNameFromMPEGpath(mpegpath);//seltapeDiv.getAttribute('data-thumbName');
    const year = kTitlesTapesName;
    const jpegpath = jpegpathFromMPEGpath(mpegpath);
    setVideoPoster(videoMain,mpegpath,jpegpath);
    videoMain.src = mpegpath;
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
    // cycle thru the tapes chapters array which has elements as array: [start,end,title] ['38995','40489','Garden, Southwood Lane']
    gvTapesObj[tapesObjTapesChaptersObj][thumbname].forEach(startEndtitleArray=>{
        const divchapter = document.createElement('div');
        divchapter.className = "cssIndexRow cssBanding";
        divchapter.setAttribute('data-mpegpath',"tapes/" + thumbname+".mp4"+"#t=" + startEndtitleArray[0] + "," + startEndtitleArray[1]);
        divchapter.setAttribute('data-thumbname',thumbname);
        // chapter divs use a chapter name
        divchapter.setAttribute('data-chaptername', startEndtitleArray[2]);
        divchapter.innerText = startEndtitleArray[2];
        divChaptersOuter.appendChild(divchapter);
    });
    divThumbnailsOuter.appendChild(divChaptersOuter);
    document.getElementById('div-chaptersListTitleDiv').innerText = gvTitlesObj[thumbname];
    hideShowChaptersHeader(false);
}

function loadVideoFromChapter(chapterDiv) {
    clearAttribsDivThumbNameBtnDownload();
    const videoMain = document.getElementById('video-main');
    const divthumbname = document.getElementById('div-thumbName');
    const mpegpath = fqMPEGpath(chapterDiv.getAttribute('data-mpegpath'));
    const thumbName = thumbNameFromMPEGpath(mpegpath);//chapterDiv.getAttribute('data-thumbName');
    const chaptername = chapterDiv.getAttribute('data-chaptername');
    const year = kTitlesTapesName;
    const jpegpath = jpegpathFromMPEGpath(mpegpath);//chapterDiv.getAttribute('data-jpegpath');
    setVideoPoster(videoMain,mpegpath,jpegpath);
    videoMain.src = mpegpath;
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
    hideShowChaptersHeader(true);
    document.getElementById('div-thumbnailsouter').innerHTML = '';
    loadTapesList();
}

function hideShowChaptersHeader(hide) {
    document.getElementById('btn-BackToTapesTitles').hidden = hide;
    document.getElementById('div-chaptersListTitleDiv').hidden = hide;
    if(hide) document.getElementById('div-chaptersListTitleDiv').innerText = "";
}