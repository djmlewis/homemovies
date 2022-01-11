// call these functions on DOM loaded
window.addEventListener('DOMContentLoaded', function () {
    buildYearButtons();
});

// call these functions on page fully loaded
window.addEventListener('load', function () {

});

function buildYearButtons() {
    const divBtnGp = document.getElementById('btngp-yearselect');
    gvIndexMediaObj.dirsArray.forEach(yearName=>{
        let btn = document.createElement('div');
        btn.className = 'cssYearBtn text-secondary bg-dark mx-1 mb-1';
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
        img.style.maxWidth = '48%';
        img.className = 'cssThumbnailImage mb-1';
        img.src = 'media/jpegs/'+year+'/'+thumbName+'.jpg';
        img.setAttribute('data-jpegpath','media/jpegs/'+year+'/'+thumbName+'.jpg');
        img.setAttribute('data-mpegpath','media/mpegs/'+year+'/'+thumbName+'.mp4');
        img.onclick = (ev)=>{handleThumbnailClicked(ev)};
        divThumbnails.appendChild(img);
    });

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
        btn.classList.add('text-warning');
        btn.classList.remove('text-secondary');
    } else {
        btn.classList.remove('text-warning');
        btn.classList.add('text-secondary');
    }
}

function handleThumbnailClicked(ev) {
    const videoMain = document.getElementById('video-main');
    videoMain.poster = ev.target.getAttribute('data-jpegpath');
    videoMain.src = ev.target.getAttribute('data-mpegpath');
}