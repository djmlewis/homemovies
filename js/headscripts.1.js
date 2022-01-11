// call these functions on DOM loaded
window.addEventListener('DOMContentLoaded', function () {
    buildYearButtons();
});

// call these functions on page fully loaded
window.addEventListener('load', function () {

});

function buildYearButtons() {
    const inputPrefix = 'yearBtnCheckbox';
    const divBtnGp = document.getElementById('btngp-yearselect');
    gvIndexMediaObj.dirsArray.forEach(yearName=>{
        let input = document.createElement('input');
        input.type = 'radio';
        input.className = 'btn-check';
        input.name = inputPrefix+yearName;
        input.autocomplete = 'off';
        divBtnGp.appendChild(input);
        let label = document.createElement('label');
        label.className = 'btn btn-outline-dark';
        label.for = input.name;
        label.innerText = yearName;
        label.setAttribute('data-year',yearName);
        label.onclick = (ev)=>{handleYearClicked(ev)};
        divBtnGp.appendChild(label);
    });
    // check the first button
    const firstButton = divBtnGp.getElementsByTagName('label')[0];
    firstButton.checked = true;
    // add its images
    const divThumbnails = document.getElementById('div-thumbnailsouter');
    const firstBtnYear = firstButton.getAttribute('data-year');
    const thumbNamesArray = gvIndexMediaObj.namesArraysObj[firstBtnYear];
    thumbNamesArray.forEach(thumbName=>{
        let img = document.createElement('img');
        img.style.width = '30%';
        img.className = 'mb-1';
        img.src = 'media/jpegs/'+firstBtnYear+'/'+thumbName+'.jpg';
        divThumbnails.appendChild(img);
    });

}

function handleYearClicked(ev) {
    console.log(ev.target.getAttribute('data-year'));
}