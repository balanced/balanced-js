var handleMessage = function (data) {
    var id = data.id;
    var callback = function (response) {
        XD.postMessage({
            id: id,
            response: response
        }, options.parentDomain, options.parentURL, parent);
    };
    var method = data.method || 'POST';
    jx.load(data.uri + '?' + data.params, callback, 'text', method);
};
var options = {
    parentURL: null,
    parentDomain: null
};

var balanced = {
    init: function () {
        options.parentURL = decodeURIComponent(window.location.hash.replace(/^#/, "")).replace(/#.*$/, "");
        options.parentDomain = options.parentURL.replace(/([^:]+:\/\/[^\/]+).*/, "$1");
        XD.receiveMessage(handleMessage, options.parentDomain);
    }
};

window.onload = balanced.init;
