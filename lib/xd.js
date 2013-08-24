var XD = (function () {
    'use strict';
    var deserialize = function (data) {
        for (var decoded = {}, keyPairs = data.split("&"), keyPairLength = keyPairs.length, c = null, d = null, i = 0; i < keyPairLength; ++i) {
            d = keyPairs[i].split("=");
            d[0] = decodeURIComponent(d[0]);
            d[1] = decodeURIComponent(d[1]);
            for (var f = d[0], c = [], g = -1;
                 (g = f.indexOf("[")) !== -1;) c.push(f.substr(g, f.indexOf("]") - g + 1)), f = f.substr(f.indexOf("]") + 1);
            if (c.length === 0) decoded[d[0]] = d[1];
            else {
                g = d[0].substr(0, d[0].indexOf("["));
                typeof decoded[g] === "undefined" && (decoded[g] = {});
                for (var f = decoded[g], t = c.length, p = 0; p < t - 1; ++p) g = c[p].substr(1, c[p].length - 2), typeof f[g] === "undefined" && (f[g] = {}), f = f[g];
                c = c[t - 1];
                g = c.substr(1, c.length - 2);
                f[g] = d[1]
            }
        }
        return decoded
    };
    var serialize = function (data, prefix) {
        var encoded = [],
            key;
        for (key in data) if (data.hasOwnProperty(key)) {
            var objectKey = prefix ? prefix + "[" + key + "]" : key,
                value = data[key];
            encoded.push(typeof value == "object" ? serialize(value, objectKey) : encodeURIComponent(objectKey) + "=" + encodeURIComponent(value))
        }
        return encoded.join("&");
    };
    return {
        receiveMessage:function (callback, origin) {
            if (typeof window === "undefined") {
                return;
            }
            if (window.postMessage) {
                var attachedCallback = function (response) {
                    if (response.origin.toLowerCase() !== origin.toLowerCase()) {
                        return false;
                    }
                    callback(deserialize(response.data))
                };
                if (window.addEventListener) {
                    window.addEventListener("message", attachedCallback, false)
                } else {
                    window.attachEvent("onmessage", attachedCallback);
                }
            } else {
                var currentHash = window.location.hash;
                setInterval(function () {
                    var newHash = window.location.hash,
                        hashIdentifier = /^#?\d+&/;
                    if (newHash !== currentHash && hashIdentifier.test(newHash)) {
                        currentHash = newHash;
                        window.location.hash = "";
                        callback(deserialize(newHash.replace(hashIdentifier, "")));
                    }
                }, 100);
            }
        },
        postMessage:function (messageToSend, callback, iframeSrc, iframe) {
            if (typeof window === "undefined") {
                return;
            }
            messageToSend = serialize(messageToSend);
            if (typeof window.postMessage === "undefined") {
                var url = iframeSrc + '#' + +new Date + Math.floor(Math.random() * 1000) + "&" + messageToSend;
                iframe.location.href = url;
            } else {
                iframe.postMessage(messageToSend, callback);
            }
        }
    };
})();
