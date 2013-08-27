//V3.01.A - http://www.openjs.com/scripts/jx/
jx = {
    //Create a xmlHttpRequest object - this is the constructor.
    getHTTPObject:function () {
        var http = false;
        //Use IE's ActiveX items to load the file.
        if (typeof ActiveXObject != 'undefined') {
            try {
                http = new ActiveXObject("Msxml2.XMLHTTP");
            }
            catch (e) {
                try {
                    http = new ActiveXObject("Microsoft.XMLHTTP");
                }
                catch (E) {
                    http = false;
                }
            }
            //If ActiveX is not available, use the XMLHttpRequest of Firefox/Mozilla etc. to load the document.
        } else if (window.XMLHttpRequest) {
            try {
                http = new XMLHttpRequest();
            }
            catch (e) {
                http = false;
            }
        }
        return http;
    },

    // This function is called from the user's script.
    //Arguments -
    //	url	- The url of the serverside script that is to be called. Append all the arguments to
    //			this url - eg. 'get_data.php?id=5&car=benz'
    //	callback - Function that must be called once the data is ready.
    //	format - The return type for this function. Could be 'xml','json' or 'text'. If it is json,
    //			the string will be 'eval'ed before returning it. Default:'text'
    //	method - GET or POST. Default 'GET'
    load:function (url, callback, format, method, opt) {
        var http = this.init(); //The XMLHttpRequest object is recreated at every call - to defeat Cache problem in IE
        if (!http || !url) return;
        //XML Format need this for some Mozilla Browsers
        if (http.overrideMimeType) http.overrideMimeType('text/xml');

        if (!method) method = "GET";//Default method is GET
        if (!format) format = "text";//Default return type is 'text'
        if (!opt) opt = {};
        format = format.toLowerCase();
        method = method.toUpperCase();

        //Kill the Cache problem in IE.
        var parameters = null;

        if (method === "POST") {
            var parts = url.split("\?");
            url = parts[0];
            parameters = parts[1];
        } else {
            var now = "uid=" + new Date().getTime();
            url += (url.indexOf("?") + 1) ? "&" : "?";
            url += now;
        }
        http.open(method, url, true);

        if (method === "POST") {
            http.setRequestHeader("Content-type", "application/json");
        }

        var ths = this;// Closure
        http.onreadystatechange = function () {//Call a function when the state changes.
            if (http.readyState == 4) {//Ready State will be 4 when the document is loaded.
                var result = "";
                if (http.responseText) result = http.responseText;
                //If the return is in JSON format, eval the result before returning it.
                if (format.charAt(0) == "j") {
                    //\n's in JSON string, when evaluated will create errors in IE
                    result = result.replace(/[\n\r]/g, "");
                    result = eval('(' + result + ')');

                } else if (format.charAt(0) == "x") { //XML Return
                    result = http.responseXML;
                }
                //Give the data to the callback function.
                if (callback) {
                    var resultAsJson;
                    try {
                        resultAsJson = JSON.parse(result);
                    } catch (e) {
                        resultAsJson = result;
                    }
                    var r = {
                        status:http.status
                    };
                    if (r['status'] >= 400) {
                        r['error'] = resultAsJson;
                    } else {
                        if (r['status'] === 300) {
                            r['data'] = {
                                location:http.getResponseHeader('location')
                            };
                        } else {
                            r['data'] = resultAsJson;
                        }
                    }
                    callback(r);
                }
            }
        };
        http.send(parameters);
    },
    bind:function (user_options) {
        var opt = {
            'url':'',             //URL to be loaded
            'onSuccess':false,    //Function that should be called at success
            'onError':false,      //Function that should be called at error
            'format':"text",      //Return type - could be 'xml','json' or 'text'
            'method':"GET"        //GET or POST
        };
        for (var key in opt) {
            if (user_options[key]) {//If the user given options contain any valid option, ...
                opt[key] = user_options[key];// ..that option will be put in the opt array.
            }
        }

        if (!opt.url) return; //Return if a url is not provided

        this.load(opt.url, function (data) {
            if (opt.onSuccess) opt.onSuccess(data);

        }, opt.format, opt.method, opt);
    },
    init:function () {
        return this.getHTTPObject();
    }
};
