// IE you make me cry
if (typeof JSON === 'undefined' || typeof JSON.stringify !== 'function' || typeof JSON.parse !== 'function') {
    ////
    // json2.js
    // Crockford is a beast
    ////
    "object"!==typeof JSON&&(JSON={});
    (function(){function m(a){return 10>a?"0"+a:a}function r(a){s.lastIndex=0;return s.test(a)?'"'+a.replace(s,function(a){var c=u[a];return"string"===typeof c?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function p(a,l){var c,d,h,q,g=e,f,b=l[a];b&&("object"===typeof b&&"function"===typeof b.toJSON)&&(b=b.toJSON(a));"function"===typeof k&&(b=k.call(l,a,b));switch(typeof b){case "string":return r(b);case "number":return isFinite(b)?String(b):"null";case "boolean":case "null":return String(b);
    case "object":if(!b)return"null";e+=n;f=[];if("[object Array]"===Object.prototype.toString.apply(b)){q=b.length;for(c=0;c<q;c+=1)f[c]=p(c,b)||"null";h=0===f.length?"[]":e?"[\n"+e+f.join(",\n"+e)+"\n"+g+"]":"["+f.join(",")+"]";e=g;return h}if(k&&"object"===typeof k)for(q=k.length,c=0;c<q;c+=1)"string"===typeof k[c]&&(d=k[c],(h=p(d,b))&&f.push(r(d)+(e?": ":":")+h));else for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(h=p(d,b))&&f.push(r(d)+(e?": ":":")+h);h=0===f.length?"{}":e?"{\n"+e+f.join(",\n"+
    e)+"\n"+g+"}":"{"+f.join(",")+"}";e=g;return h}}"function"!==typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+m(this.getUTCMonth()+1)+"-"+m(this.getUTCDate())+"T"+m(this.getUTCHours())+":"+m(this.getUTCMinutes())+":"+m(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()});var t=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    s=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,e,n,u={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},k;"function"!==typeof JSON.stringify&&(JSON.stringify=function(a,l,c){var d;n=e="";if("number"===typeof c)for(d=0;d<c;d+=1)n+=" ";else"string"===typeof c&&(n=c);if((k=l)&&"function"!==typeof l&&("object"!==typeof l||"number"!==typeof l.length))throw Error("JSON.stringify");return p("",{"":a})});
    "function"!==typeof JSON.parse&&(JSON.parse=function(a,e){function c(a,d){var g,f,b=a[d];if(b&&"object"===typeof b)for(g in b)Object.prototype.hasOwnProperty.call(b,g)&&(f=c(b,g),void 0!==f?b[g]=f:delete b[g]);return e.call(a,d,b)}var d;a=String(a);t.lastIndex=0;t.test(a)&&(a=a.replace(t,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
    "]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return d=eval("("+a+")"),"function"===typeof e?c({"":d},""):d;throw new SyntaxError("JSON.parse");})})();
}

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
        system_timezone:-(new Date()).getTimezoneOffset() / 60,
        user_agent:navigator.userAgent,
        language:navigator.language
    };

var initIFrame = function () {
    frame = null;
    var body = document.getElementsByTagName("body")[0],
        iframe = document.createElement("iframe");
    var frameName = "balancedFrame" + (new Date()).getTime();
    var src = proxy + "#" + encodeURIComponent(window.location.href);
    var attributes = {
        src:src,
        name:frameName,
        id:frameName,
        frameborder:0,
        scrolling:'no',
        allowtransparency:'true',
        width:0,
        height:0,
        style:'position:absolute;top:0;left:0;width:0;height:0'
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
                status:504,
                error:{
                    message:'There was a timeout processing your operation'
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
        message:{
            id:callCount++,
            uri:uri,
            params:data,
            method:method
        },
        callback:callback
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
