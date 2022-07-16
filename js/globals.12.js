const ls_autoplay = "ls_autoplay";
const ls_favourites = "ls_favourites2";
const ls_yearButtonName = "ls_yearButtonName";

const kFavsName = '♥︎';
const kTitlesIndexName = 'Index︎';
const kTitlesTapesName = 'Tapes';
const tapesObjTapesIDsArray = 'tapesIDsArray';
const tapesObjTapesChaptersObj = 'tapesChaptersObj';


let gvResizeTimer;

const kMPEGpathPrefix = 'media/mpegs/';
const kJPEGpathPrefix = 'media/jpegs/';
const kJPEGpathSuffix = '.jpg';

let gvTimeoutInfoDivTapesChapters = undefined;

let gvArrayTapesViewed;
const ls_ArrayTapesViewed = "lsArrayTapesViewed";
const kSymbolUnviewed = "✵";

const ls_switchHiResBool = "ls_switchHiResBool";
const kBoolStrTrue = "T";
const kBoolStrFalse = "F";


function fqMPEGpath(mpegpath) {
    return kMPEGpathPrefix + mpegpath;
}
function shortMPEGpath(mpegpath) {
    return mpegpath.replace(kMPEGpathPrefix,"");
}

function yearFromMPEGpath(mpegpath) {
    const mpegpathArray = mpegpath.split("/");
    //              0      1       2         3
    // fq mpegpath is media/mpegs/'+year+'/'+thumbName+'.mp4' + #t=s,e
    // or just year+'/'+thumbName+'.mp4' + #t=s,e
    if(mpegpathArray.length > 2) return mpegpathArray[2];
    return mpegpathArray[0];
}
function thumbNameFromMPEGpath(mpegpath) {
    const mpegpathArray = mpegpath.split("/");
    //              0      1       2         3
    // mpegpath is media/mpegs/'+year+'/'+thumbName+'.mp4' + #t=s,e
    // or just year+'/'+thumbName+'.mp4' + #t=s,e
    // get the last element
    return mpegpathArray[mpegpathArray.length - 1].split(".")[0];
}

function jpegpathFromMPEGpath(mpegpath) {
    return kJPEGpathPrefix + "/" + yearFromMPEGpath(mpegpath) + "/" + thumbNameFromMPEGpath(mpegpath) + kJPEGpathSuffix;
}