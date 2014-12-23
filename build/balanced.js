////
// balanced.js
// version: 1.1.21
// built: 2014-12-22
// https://github.com/balanced/balanced-js
////

(function(exports, global) {
    global["balanced"] = exports;
    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, "");
        };
    }
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function int(str) {
        return parseInt(str, 10);
    }
    function isString(value) {
        return typeof value === "string";
    }
    function isDefined(value) {
        return typeof value !== "undefined";
    }
    function isNumber(value) {
        return typeof value === "number";
    }
    function isObject(value) {
        return value !== null && typeof value === "object";
    }
    function getCookies() {
        var cookie = document.cookie.match(/__b=([a-zA-Z0-9\-!\.]+)/);
        if (!cookie) {
            cookie = new Date().getTime() + "." + Math.random().toString().substr(2) + ".0!0";
        } else {
            cookie = cookie[1];
        }
        cookie = cookie.split("!");
        var cookie_parts = cookie[0].split(".");
        if (cookie_parts.length < 3) {
            cookie_parts[1] = Math.random().toString().substr(2);
            cookie_parts[2] = 0;
        }
        cookie_parts[2]++;
        cookie = cookie_parts.join(".") + "!" + cookie[1];
        var cookie_date = new Date();
        cookie_date.setDate(cookie_date.getDate() + 365);
        document.cookie = "__b=" + cookie + " ;expires=" + cookie_date.toUTCString();
        return cookie;
    }
    var capabilities = {
        system_timezone: -new Date().getTimezoneOffset() / 60,
        user_agent: navigator.userAgent,
        language: navigator.userLanguage || navigator.language,
        kp: 0,
        cli: 0,
        loaded: new Date().getTime(),
        screen_width: screen.width,
        screen_length: screen.height,
        hist: global.history.length,
        cookie: getCookies()
    };
    var marketplace_href = null;
    var dialog = null;
    var root_url = "https://api.balancedpayments.com";
    function preparePayload(data) {
        if (!data.meta) {
            data.meta = {};
        }
        capabilities.submitted = new Date().getTime();
        capabilities.scrollX = global.scrollX;
        capabilities.scrollY = global.scrollY;
        for (var k in capabilities) {
            if (!("capabilities_" + k in data.meta)) {
                data.meta["capabilities_" + k] = capabilities[k];
            }
        }
        return data;
    }
    function addEvent(obj, type, fn) {
        if (obj.addEventListener) {
            obj.addEventListener(type, fn, false);
        } else if (obj.attachEvent) {
            obj["e" + type + fn] = fn;
            obj[type + fn] = function() {
                obj["e" + type + fn](global.event);
            };
            obj.attachEvent("on" + type, obj[type + fn]);
        }
    }
    var shifted = false;
    function icl(e) {
        e = e ? e : global.event;
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
    function isEmpty(obj) {
        if (obj == null) {
            return true;
        }
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                return false;
            }
        }
        return true;
    }
    addEvent(global, "keydown", function(e) {
        if (!capabilities.cl) {
            capabilities.cl = icl(e);
        }
        capabilities.kp++;
    });
    addEvent(global, "paste", function() {
        capabilities.ps = true;
    });
    addEvent(global, "click", function() {
        capabilities.cli++;
    });
    function buildErrorObject(key, message) {
        var error = {};
        var extras = {};
        if (isObject(key)) {
            for (var i = 0; i < key.length; i++) {
                extras[key[i]] = message;
            }
        } else {
            extras[key] = message;
        }
        error.description = message;
        error.extras = extras;
        return error;
    }
    function validateData(requiredKeys, data, errors) {
        for (var i = 0; i < requiredKeys.length; i++) {
            var key = requiredKeys[i];
            if (!data || !(key in data) || !data[key]) {
                errors.push(buildErrorObject(key, "Invalid field [" + key + '] - Missing field "' + key + '"'));
            }
        }
    }
    function validate(details, requiredKeys, validationMethod) {
        var errors = [];
        validateData(requiredKeys, details, errors);
        var additionalErrors = validationMethod(details);
        errors = errors.concat(additionalErrors);
        for (var i = 0; i < errors.length; i++) {
            errors[i].status = "Bad Request";
            errors[i].category_code = "request";
            errors[i].additional = null;
            errors[i].status_code = 400;
            errors[i].category_type = "request";
        }
        return errors;
    }
    function noDataError(callback, message) {
        var m = message ? message : "No data supplied";
        if (!callback) {
            throw m;
        } else {
            callback({
                errors: [ {
                    description: m,
                    status: "Bad Request",
                    category_code: "request",
                    additional: null,
                    status_code: 400,
                    category_type: "request",
                    extras: {}
                } ],
                status_code: 400
            });
        }
    }
    var cc = {
        isCardNumberValid: function(cardNumber) {
            if (!cardNumber) {
                return false;
            }
            cardNumber = (cardNumber + "").replace(/\D+/g, "").split("").reverse();
            if (!cardNumber.length || cardNumber.length < 12) {
                return false;
            }
            var total = 0, i;
            for (i = 0; i < cardNumber.length; i++) {
                cardNumber[i] = int(cardNumber[i]);
                total += i % 2 ? 2 * cardNumber[i] - (cardNumber[i] > 4 ? 9 : 0) : cardNumber[i];
            }
            return total % 10 === 0;
        },
        cardType: function(cardNumber) {
            var p = {};
            p["51"] = p["52"] = p["53"] = p["54"] = p["55"] = "Mastercard";
            p["34"] = p["37"] = "American Express";
            p["4"] = "VISA";
            p["6"] = "Discover Card";
            p["35"] = "JCB";
            p["30"] = p["36"] = p["38"] = "Diners Club";
            if (cardNumber) {
                cardNumber = cardNumber.toString().trim();
                for (var k in p) {
                    if (cardNumber.indexOf(k) === 0) {
                        return p[k];
                    }
                }
            }
            return null;
        },
        isCVVValid: function(cardNumber, cvv) {
            var cardType = cc.cardType(cardNumber);
            if (!cardType) {
                return false;
            }
            var requiredLength = cardType === "American Express" ? 4 : 3;
            if (isString(cvv) || isNumber(cvv)) {
                if (cvv.toString().replace(/\D+/g, "").length === requiredLength) {
                    return true;
                }
            }
            return false;
        },
        isSecurityCodeValid: function(cardNumber, securityCode) {
            return cc.isCVVValid(cardNumber, securityCode);
        },
        isExpiryValid: function(expiryMonth, expiryYear) {
            if (!expiryMonth || !expiryYear) {
                return false;
            }
            expiryMonth = int(expiryMonth);
            expiryYear = int(expiryYear);
            if (isNaN(expiryMonth) || isNaN(expiryYear) || expiryMonth > 12 || expiryMonth < 1) {
                return false;
            }
            var today = new Date();
            return !(today.getFullYear() > expiryYear || today.getFullYear() === expiryYear && today.getMonth() >= expiryMonth);
        },
        validate: function(cardData) {
            if (cardData.number) {
                cardData.number = cardData.number.toString().trim();
            }
            var number = cardData.number, cvv = cardData.cvv, expiryMonth = cardData.expiration_month, expiryYear = cardData.expiration_year;
            var errors = [];
            if (!cc.isCardNumberValid(number)) {
                errors.push(buildErrorObject("number", 'Invalid field [number] - "' + number + '" is not a valid credit card number'));
            }
            if (isDefined(cvv) && cvv !== null && !cc.isCVVValid(number, cvv)) {
                errors.push(buildErrorObject("cvv", 'Invalid field [cvv] - "' + cvv + '" is not a valid credit card security code'));
            }
            if (!cc.isExpiryValid(expiryMonth, expiryYear)) {
                errors.push(buildErrorObject([ "expiration_month", "expiration_year" ], 'Invalid field [expiration_month,expiration_year] - "' + expiryMonth + "-" + expiryYear + '" is not a valid credit card expiration date'));
            }
            return errors;
        },
        create: function(data, callback) {
            if (!data) {
                noDataError(callback);
                return;
            }
            var requiredKeys = [ "number", "expiration_month", "expiration_year" ];
            var errors = validate(data, requiredKeys, cc.validate);
            if (!isEmpty(errors)) {
                callback({
                    errors: errors,
                    status_code: 400
                });
            } else {
                jsonp(make_url("/jsonp/cards", preparePayload(data)), make_callback(callback));
            }
        }
    };
    var emailRegExp = /[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+(?:\.[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?/i;
    var em = {
        validate: function(emailAddress) {
            return !!(emailAddress && emailRegExp.test(emailAddress));
        }
    };
    var ba = {
        types: [ "savings", "checking" ],
        validate: function(accountData) {
            var noun = "routing_number" in accountData ? "routing_number" : "bank_code";
            var bankCode = accountData[noun];
            var errors = [];
            if (!ba.isRoutingNumberValid(bankCode)) {
                errors.push(buildErrorObject(noun, "Invalid field [" + noun + '] - "' + bankCode + '" is not a valid ' + noun.replace("_", " ")));
            }
            var account_type = accountData.type || accountData.account_type;
            var type_name = "type" in accountData ? "type" : "account_type";
            if (accountData[type_name] && !ba.validateType(account_type)) {
                errors.push(buildErrorObject(type_name, "Invalid field [" + type_name + '] - "' + account_type + '" must be one of: "' + ba.types.join('", "') + '"'));
            }
            return errors;
        },
        isRoutingNumberValid: function(routingNumber) {
            if (!routingNumber) {
                return false;
            }
            routingNumber = routingNumber.toString().match(/\d+/g);
            if (!routingNumber) {
                return false;
            }
            routingNumber = routingNumber.join("");
            if (!routingNumber || routingNumber.length !== 9) {
                return false;
            }
            var a = routingNumber.toString().split("");
            var d = [];
            for (var i = 0; i < a.length; i++) {
                d.push(int(a[i]));
            }
            return d[8] === (7 * (d[0] + d[3] + d[6]) + 3 * (d[1] + d[4] + d[7]) + 9 * (d[2] + d[5])) % 10;
        },
        validateRoutingNumber: function(routingNumber) {
            return ba.isRoutingNumberValid(routingNumber);
        },
        lookupRoutingNumber: function(routingNumber, callback) {
            if (!routingNumber) {
                noDataError(callback);
                return;
            }
            var uri = "/bank_accounts/routing_numbers/" + routingNumber;
            jsonp(make_url(uri, null, make_callback(callback)));
        },
        validateType: function(type) {
            if (!type) {
                return true;
            }
            return !!/savings|checking/.exec(type);
        },
        create: function(data, callback) {
            if (!data) {
                noDataError(callback);
                return;
            }
            var requiredKeys = [ "name", "account_number", "routing_number" ];
            var errors = validate(data, requiredKeys, ba.validate);
            if (!isEmpty(errors)) {
                callback({
                    errors: errors,
                    status_code: 400
                });
            } else {
                if ("type" in data && !("account_type" in data)) {
                    data.account_type = data.type;
                }
                jsonp(make_url("/jsonp/bank_accounts", preparePayload(data)), make_callback(callback));
            }
        }
    };
    var ea = {
        providers: {
            coinbase: {
                url: "https://coinbase.com/oauth/authorize",
                params: {
                    response_type: "code",
                    client_id: "050f4c85231a51c147a3fb011e012755d81cdb499cc50b5354b7bcdf9bf805ad",
                    redirect_uri: "https://js.balancedpayments.com/callback.html",
                    scope: "send"
                }
            }
        },
        provider_name: null,
        callback: null,
        create: function(provider_name, callback) {
            var provider = ea.providers[provider_name];
            var url = provider.url;
            var params = provider.params;
            var params_array = [];
            ea.provider_name = provider_name;
            ea.callback = callback;
            if (params) {
                for (var param in params) {
                    params_array.push(param + "=" + params[param]);
                }
                url = url + "?" + params_array.join("&");
            }
            dialog = global.open(url, "", "top=" + (global.outerHeight / 2 - 275) + ", left=" + (global.outerWidth / 2 - 250) + ", width=500, height=550");
        },
        configure: function() {}
    };
    addEvent(global, "message", function(event) {
        if (event.origin !== "https://js.balancedpayments.com") {
            return;
        }
        if (!event.data) {
            noDataError(ea.callback);
            return;
        }
        var data = event.data;
        data.token = event.data.token || event.data.code;
        data.provider = ea.provider_name;
        jsonp(make_url("/jsonp/external_accounts", data), make_callback(ea.callback));
        if (dialog) {
            dialog.close();
        }
    });
    function jsonp(path, callback) {
        var funct = "balanced_jsonp_" + Math.random().toString().substr(2);
        var tag = document.createElement("script");
        tag.type = "text/javascript";
        tag.async = true;
        tag.src = path.replace("{callback}", funct);
        var where = document.getElementsByTagName("script")[0];
        where.parentNode.insertBefore(tag, where);
        global[funct] = function(result) {
            try {
                callback(result);
            } catch (e) {
                if (isDefined(console) && console.error) {
                    console.error(e);
                }
            }
            tag.parentNode.removeChild(tag);
        };
    }
    function make_url(path, data) {
        return root_url + path + "?callback={callback}&data=" + encodeURIComponent(JSON.stringify(data));
    }
    function make_callback(callback) {
        var called_back = false;
        function ret(data) {
            if (called_back) {
                return;
            }
            called_back = true;
            if (!data || !data.status) {
                callback({
                    errors: [ {
                        description: "Unable to connect to the balanced servers",
                        status: "Internal Server Error",
                        category_code: "server-error",
                        additional: null,
                        status_code: 500,
                        category_type: "server-error",
                        extras: {}
                    } ],
                    status_code: 500
                });
                return;
            }
            var body = JSON.parse(data.body);
            if (isDefined(data.status)) {
                body.status_code = data.status;
            }
            callback(body);
        }
        setTimeout(ret, 6e4);
        return ret;
    }
    if (typeof JSON !== "object") {
        jsonp("https://js.balancedpayments.com/json2.js");
    }
    global.balanced = {
        card: cc,
        bankAccount: ba,
        externalAccount: ea,
        emailAddress: em,
        init: function(args) {
            if (!args) {
                return;
            }
            if (isString(args)) {
                marketplace_href = args;
            } else {
                if ("server" in args) {
                    root_url = args.server;
                }
                if ("marketplace_href" in args) {
                    marketplace_href = args.marketplace_href;
                }
                if ("providers" in args) {
                    ea.providers = args.providers;
                }
            }
        }
    };
})({}, function() {
    return this;
}());