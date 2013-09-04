//  XD Communication stuff begins here.
var frame = null,
    frameName = null,
    messageQueue = [],
    callbackQueue = [],
    timeoutQueue = [],
    callCount = 0,
    callbackInitialized = false,
    windowProxy,
    capabilities = {
        system_timezone: -(new Date()).getTimezoneOffset() / 60,
        user_agent: navigator.userAgent,
        language: navigator.language
    };

var initIFrame = function () {
    frame = null;
    var body = document.getElementsByTagName("body")[0],
        iframe = document.createElement("iframe");
    var frameName = "balancedFrame" + (new Date()).getTime();
    var src = proxy + "#" + encodeURIComponent(window.location.href);
    var attributes = {
        src: src,
        name: frameName,
        id: frameName,
        frameborder: 0,
        scrolling: 'no',
        allowtransparency: 'true',
        width: 0,
        height: 0,
        style: 'position:absolute;top:0;left:0;width:0;height:0'
    };
    for (var key in attributes) {
        iframe.setAttribute(key, attributes[key]);
    }
    var onLoad = function () {
        frame = window.frames[frameName];
        processMessages();
    };
    if (iframe.attachEvent) {
        iframe.attachEvent("onload", onLoad);
    } else {
        iframe.onload = onLoad;
    }
    body.appendChild(iframe);
};

var processMessages = function () {
    var messageQueueLength = messageQueue.length;
    if (!frame || !messageQueueLength) {
        return;
    }
    function processMessage(data) {
        var message = data.message,
            messageId = message.id;
        callbackQueue[messageId] = data.callback;
        XD.postMessage(message, proxy, proxy, frame);
        timeoutQueue[messageId] = window.setTimeout(function () {
            callbackQueue[messageId]({
                status: 504,
                error: {
                    message: 'There was a timeout processing your operation'
                }
            });
            delete callbackQueue[messageId];
            delete timeoutQueue[messageId];
        }, 60 * 1000);
    }

    for (var counter = 0; counter < messageQueueLength; ++counter) {
        var data = messageQueue[counter];
        processMessage(data);
    }
    messageQueue = [];
};

var receiveMessage = function (response) {
    var messageId = response.id;
    var data = response.response;
    try {
        data = JSON.parse(data);
    } catch (e) {

    }
    data.status = parseInt(data.status, 10);
    callbackQueue[messageId](data);
    window.clearTimeout(timeoutQueue[messageId]);
    delete callbackQueue[messageId];
    delete timeoutQueue[messageId];
};

var validateData = function (requiredKeys, data, errors) {
    for (var i = 0; i < requiredKeys.length; i++) {
        var key = requiredKeys[i];
        if (!data || !(key in data) || !data[key]) {
            errors[key] = 'Missing field';
        }
    }
};

var preparePayload = function (unencryptedDict) {
    //  blend
    for (var k in capabilities) {
        if (!(k in unencryptedDict)) {
            unencryptedDict[k] = capabilities[k];
        }
    }
    return JSON.stringify(unencryptedDict);
};

var sendWhenReady = function (uri, data, callback, method) {
    method = method || 'POST';
    messageQueue.push({
        message: {
            id: callCount++,
            uri: uri,
            params: data,
            method: method
        },
        callback: callback
    });
    processMessages();
};

function addEvent(obj, type, fn) {
    if (obj.addEventListener)
        obj.addEventListener(type, fn, false);
    else if (obj.attachEvent) {
        obj["e" + type + fn] = fn;
        obj[type + fn] = function () {
            obj["e" + type + fn](window.event);
        };
        obj.attachEvent("on" + type, obj[type + fn]);
    }
}

var shifted = false;

function icl(e) {
    e = (e) ? e : window.event;
    var shifton = false;
    if (e.shiftKey) {
        shifton = e.shiftKey;
    } else if (e.modifiers) {
        shifton = !!(e.modifiers & 4);
    }
    if (shifton) {
        shifted = true;
    }
    return shifted;
}

addEvent(window, 'keydown', function (e) {
    if (!capabilities.cl) {
        capabilities.cl = icl(e);
    }
});
addEvent(window, 'paste', function () {
    capabilities.ps = !0;
});

var createProxy = function (proxy) {
    if (!proxy) {
        windowProxy = XD;
    } else {
        windowProxy = proxy;
    }

    messageQueue = [];
    callbackQueue = {};
    timeoutQueue = {};

    var setupIframe = function () {
        initIFrame();
        if (!callbackInitialized) {
            XD.receiveMessage(receiveMessage, server);
            callbackInitialized = true;
        }
    };

    if (!frameName || !document.getElementById(frameName)) {
        if (typeof document !== "undefined" && document && document.body) {
            setupIframe();
        } else {
            if (typeof window !== "undefined" && window && !callbackInitialized) {
                if (window.addEventListener) {
                    window.addEventListener("load", setupIframe, false);
                } else {
                    window.attachEvent("onload", setupIframe);
                }
            }
        }
    }
};

var countDict = function (dict) {
    var i = 0;
    for (var k in dict) {
        i++;
    }
    return i;
};

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}
