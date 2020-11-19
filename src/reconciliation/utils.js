// TODO consider using GAE datastore

export function getStorageItem(key) {
    if (localStorageSupported) {
        return window.localStorage.getItem(key);
    } else {
        return getCookie(key);
    }
}

export function setStorageItem(key, value, days) {
    if (localStorageSupported) {
        window.localStorage.setItem(key, value);
    } else {
        setCookie(key, value, days);
    }
}

// function adjustCase(str) {
//     return str[0].toUpperCase() + str.slice(1).toLowerCase();
// }

// TODO remove instances?
// function debug(str, marker) {
//     let mark = marker || "";
//     console.log("begin: " + mark);
//     console.log(str);
//     console.log("end: " + mark);
// }

// utility function to remove duplicates from an array
// export function getUniqueElements(arr) {
//     let u = {}, a = [];
//     for (let i = 0, l = arr.length; i < l; ++i) {
//         if (u.hasOwnProperty(arr[i])) {
//             continue;
//         }
//         a.push(arr[i]);
//         u[arr[i]] = 1;
//     }
//     return a;
// }

// from http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript/901144#901144
// retrieve query parameters from URL by name
// function getURLParameter(name) {
//     name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
//     let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
//         results = regex.exec(window.location.search);
//     return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
// }

////// hidden ////////////////////////////////////////////////////////////
let localStorageSupported = window.localStorage || false;

function getCookie(name) {
    let cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        let key = cookies[i].slice(0, cookies[i].indexOf("="));
        let value = cookies[i].slice(cookies[i].indexOf("=") + 1);
        key = key.trim();

        if (key === name) {
            return unescape(value);
        }
    }
    return null;
}

function setCookie(name, value, days) {
    let expires = new Date();
    expires.setDate(expires.getDate() + days);
    value = escape(value) + ((days) ? "" : "; expires=" + expires.toUTCString());
    document.cookie = name + "=" + value;
}

// expose interface //////////////////////////////////////////////////