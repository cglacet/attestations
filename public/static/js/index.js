const BASE_URL = window.location.origin;
const form = document.getElementById("form");
const MESSAGE_INCOMPLETE = "Vous n'avez pas fini de remplir le formulaire";
const QR_CODE_OPTIONS = {
    color: {
        dark: getComputedStyle(document.documentElement).getPropertyValue('--qr-code-dark-color').trim(),
        light: getComputedStyle(document.documentElement).getPropertyValue('--qr-code-light-color').trim()
    }
}
const QR_CODE_OPTIONS_ERROR = {
    color: {
        dark:"#CCC",
        light: getComputedStyle(document.documentElement).getPropertyValue('--qr-code-light-color').trim()
    }
}

// Make sure to update on first render, it's needed
// when someone with a completed form URL comes in:
onFormChange();
form.addEventListener("input", onFormChange);

function buildURL(endpoint){
    const params = buildParams();
    const paramString = new URLSearchParams(params);
    return `${BASE_URL}/${endpoint}?${paramString.toString()}`;
}

function buildURLGet(){
    // This way we avoid creating incomplete forms 
    // (always redirect to the creation page if any information is missing)
    return isFormCompleted() ? buildURL('get') : buildURL('set');
}

function buildParams(){
    return {
        'firstname': value('firstname'),
        'lastname': value('lastname'),
        'birthday': value('birthday'),
        'placeofbirth': value('placeofbirth'),
        'address': value('address'),
        'zipcode': value('zipcode'),
        'city': value('city'),
        'reasons': getSelectValues(document.getElementById('reasons')),
    };
}

function onFormChange(){
    const urlGet = buildURLGet();
    const urlSet = buildURL('set');
    setElementsURLs("url-get", urlGet);
    setElementsURLs("url-set", urlSet);
    setClipboardURL(urlGet);
    setQRCode('qrcode-get', urlGet);
    setQRCode('qrcode-set', urlSet);
    setNavigatorURL(urlSet);
    updateReasons();
    updateOwnerName();
    disableOnIncomplete();
    generateBonusQRCodes('achats');
    generateBonusQRCodes('travail');
}

function setElementsURLs(className, url){
    for (const element of document.getElementsByClassName(className)){
        element.setAttribute('href', url);
    }
}

function setClipboardURL(url){
    document.getElementById('url-clipboard').setAttribute('data-clipboard-text', url);
}

function setQRCode(elementID, url){
    QRCode.toCanvas(document.getElementById(elementID), url, QRCodeOptions());
}

function QRCodeOptions(){
    return isFormCompleted() ? QR_CODE_OPTIONS : QR_CODE_OPTIONS_ERROR
}

function setNavigatorURL(url){
    if (window.history.replaceState) {
        window.history.replaceState(`${BASE_URL}/set`, document.title, url);
    }
}

function updateOwnerName(){
    document.getElementById('qrcode-owner').innerHTML = `${value('firstname')} ${value('lastname')}`;
}

function updateReasons(){
    const reasons = getSelectValues(document.getElementById('reasons'));
    if (reasons && reasons.length > 0){
        document.getElementById('reasons-list').innerHTML = reasons.join(', ');
    }
    else {
        document.getElementById('reasons-list').innerHTML = "Aucun motif !"
    }
}

function generateBonusQRCodes(bonusReason){
    const selectedReasons = getSelectValues(document.getElementById('reasons'));
    if (selectedReasons.length > 1 || !selectedReasons.includes(bonusReason)){
        document.getElementById(`bonus-${bonusReason}`).style.display = "";
        const bonusURL = buildURLForReasons('get', [bonusReason]);
        setQRCode(`qrcode-get-${bonusReason}`, bonusURL)
    }
    else {
        document.getElementById(`bonus-${bonusReason}`).style.display = "none";
    }
}

function buildURLForReasons(endpoint, reasons){
    const params = buildParams();
    params.reasons = reasons;
    const paramString = new URLSearchParams(params);
    return `${BASE_URL}/${endpoint}?${paramString.toString()}`;
}

function disableOnIncomplete(){
    if (isFormCompleted()){
        enableRegisteredInputs();
    }
    else {
        disableRegisteredInputs();
    }
}

function enableRegisteredInputs(){
    for (const element of document.getElementsByClassName('disable-incomplete')){
        element.classList.remove('disabled');
    }
}

function disableRegisteredInputs(){
    for (const element of document.getElementsByClassName('disable-incomplete')){
        element.classList.add('disabled');
    }
}

function isFormCompleted() {
    const form = document.getElementById('form');
    for(const element of form.elements){
        if(element.hasAttribute('required') && element.value == ''){
            return false;
        }
    }
    return true;
};

function value(id){
    return document.getElementById(id).value;
}

function getSelectValues(select) {
    const result = [];
    const options = select && select.options;
    let opt;
    for (var i=0, iLen=options.length; i<iLen; i++) {
        opt = options[i];

        if (opt.selected) {
            result.push(opt.value || opt.text);
        }
    }
    return result;
}

function toFrenchDate(yyyy_mm_dd){
    const [yyyy, mm, dd] = yyyy_mm_dd.split('-');
    if (dd == undefined || mm == undefined || yyyy == undefined) {
        return "";
    }
    return `${dd}/${mm}/${yyyy}`;
}