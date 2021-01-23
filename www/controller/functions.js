xhrDefaultOptions = {
    url: "http://" + ENV.WEB_HOSTNAME + ":" + ENV.WEB_PORT + "/",
    method: "GET",
    contentType: "application/json; charset=UTF-8",
    data: null,
    timeout: 5000   // default timeout: 5 seconds
}

$ = function(selector) {
    if (selector.substring(0, 1) === "#") {
        return document.getElementById(selector.substring(1));
    } else if (selector.substring(0, 1) === ".") {
        return document.getElementsByClassName(selector.substring(1));
    } else {
        return document.getElementsByTagName(selector);
    }
};

// requestOptions = {url, method, contentType, data, timeout, onSuccess(), onError(), onComplete()}
$xhr = function(requestOptions) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState != 4) {
            return; // reuqest is not ready yet
        }
        if (this.status == 200) {
            (requestOptions.onSuccess === undefined ? null : requestOptions.onSuccess({code:this.status, text:this.statusText}, this.responseText));
        } else {
            (requestOptions.onError === undefined ? null : requestOptions.onError({code:this.status, text:this.statusText}, this.responseText));
        }
        (requestOptions.onComplete === undefined ? null : requestOptions.onComplete());
    };
    xhr.timeout = (requestOptions.timeout === undefined ? xhrDefaultOptions.timeout : requestOptions.timeout);
    xhr.open((requestOptions.method === undefined ? xhrDefaultOptions.method : requestOptions.method), (requestOptions.url === undefined ? xhrDefaultOptions.url : requestOptions.url), true); // 3rd parameter is true for async call
    xhr.setRequestHeader('Content-Type', (requestOptions.contentType === undefined ? xhrDefaultOptions.contentType : requestOptions.contentType));
    xhr.send((requestOptions.data === undefined ? xhrDefaultOptions.data : JSON.stringify(requestOptions.data)));
};

function getCookie(cookieName) {
    let searchName = cookieName + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let allCookies = decodedCookie.split(';');
    for(let cookie of allCookies) {
        cookie = cookie.trimStart();
        if (cookie.startsWith(searchName)) {
            return cookie.substring(searchName.length);
        }
    }
    return "";
}

defaultDatatableLabels = {
    placeholder: "Pretraži...",
    perPage: "{select} rezultata po stranici",
    noRows: "Nema rezultata",
    info: "Prikazano {start} do {end} od {rows} rezultata",
}
