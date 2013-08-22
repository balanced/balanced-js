var handleMessage = function (data) {
    var id = data.id;
    var callback = function (response) {
        XD.postMessage({
            id:id, response:response
        }, options.parentDomain, options.parentURL, parent);
    };
    var method = data.method || 'POST';
    jx.load(data.uri + '?' + data.params, callback, 'text', method);
};
var options = {
    parentURL:null,
    parentDomain:null
};
var balanced = {
    init:function () {
        options.parentURL = decodeURIComponent(window.location.hash.replace(/^#/, "")).replace(/#.*$/, "");
        options.parentDomain = options.parentURL.replace(/([^:]+:\/\/[^\/]+).*/, "$1");
        XD.receiveMessage(handleMessage, options.parentDomain);
    }
};

var loadScript = function (scriptUri, callback) {
    var el = document.createElement('script');
    el.setAttribute('type', 'text/javascript');
    el.setAttribute('src', scriptUri);
    if (callback) {
        // most browsers
        el.onload = callback;
        // IE 6 & 7
        el.onreadystatechange = function () {
            if (this.readyState == 'complete') {
                callback();
            }
        };
    }
    document.getElementsByTagName('head')[0].appendChild(el);
};

//  this is for shitty versions of IE
if (typeof JSON === 'undefined' || typeof JSON.stringify !== 'function' || typeof JSON.parse !== 'function') {
    loadScript('https://js.balancedpayments.com/v1/json2.min.js', balanced.init);
} else {
    window.onload = balanced.init;
}

