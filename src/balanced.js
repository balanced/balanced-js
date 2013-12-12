var capabilities = {
    system_timezone:-(new Date()).getTimezoneOffset() / 60,
    user_agent:navigator.userAgent,
    language:navigator.userLanguage || navigator.language,
    kp: 0,
    cli: 0,
    loaded: (new Date) * 1,
    screen_width: screen.width,
    screen_length: screen.height,
    hist: window.history.length,
    cookie: (function () {
        var cookie = document.cookie.match(/__b=([a-zA-Z0-9\-!\.]+)/);
        if(!cookie) {
            cookie = (new Date) * 1 + '.' + Math.random().toString().substr(2) + '.0!0';
        }else{
            cookie = cookie[1];
        }
        cookie = cookie.split('!');
        var cookie_parts = cookie[0].split('.');
        if(cookie_parts.length < 3) {
            cookie_parts[1] = Math.random().toString().substr(2);
            cookie_parts[2] = 0;
        }
        cookie_parts[2]++;
        cookie = cookie_parts.join('.') + '!' + cookie[1];
        var cookie_date = new Date;
        cookie_date.setDate(cookie_date.getDate() + 365);
        document.cookie='__b=' + cookie + ' ;expires='+cookie_date.toUTCString();

        return cookie;
    })(),
};


function preparePayload(data) {
    if(!data.meta) {
        data.meta = {};
    }
    capabilities.submitted = (new Date) * 1;
    capabilities.scrollX = window.scrollX;
    capabilities.scrollY = window.scrollY;
    for(var k in capabilities) {
        if(!('capabilities_'+k in data.meta)) {
            data.meta['capabilities_'+k] = capabilities[k];
        }
    }
    return data;
}

function addEvent(obj, type, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(type, fn, false);
    } else if (obj.attachEvent) {
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

function isEmpty(obj) {
    // null and undefined are empty
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

addEvent(window, 'keydown', function (e) {
    if (!capabilities.cl) {
        capabilities.cl = icl(e);
    }
    capabilities.kp++;
});
addEvent(window, 'paste', function () {
    capabilities.ps = true;
});
addEvent(window, 'click', function () {
    capabilities.cli++;
});

////
// Required for ie < 9 support
////
if (!String.prototype.trim) {
    String.prototype.trim=function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

////
// Yikes
////
function buildErrorObject(key, message) {
    var error = {};
    var extras = {};

    if(typeof key === "object") {
        for(var i = 0; i < key.length; i++) {
            extras[key[i]] = message;
        }
    } else {
        extras[key] = message;
    }

    error.description = message;
    error.extras = extras;
    return error;
}

function validateData (requiredKeys, data, errors) {
    var i, key;
    for (i = 0; i < requiredKeys.length; i++) {
        key = requiredKeys[i];
        if (!(key in data) || !data[key]) {
            errors.push(buildErrorObject(key, 'Invalid field [' + key + '] - Missing field \"' + key + '\"'));
        }
    }
}

// validation stuff copied out of the old balanced.js
function validate(details, requiredKeys, validationMethod) {
    if(typeof details !== 'object') {
        throw new Error('Parameter must be an object, you passed in a ' + typeof details + '.');
    }

    var errors = [];
    validateData(requiredKeys, details, errors);
    var additionalErrors = validationMethod(details);
    errors = errors.concat(additionalErrors);

    ////
    // Inject additional properties
    ////
    for(var i = 0; i < errors.length; i++) {
        errors[i].status = "Bad Request";
        errors[i].category_code = "request";
        errors[i].additional = null;
        errors[i].status_code = 400;
        errors[i].category_type = "request";
    }

    return errors;
}

function noDataError(callback, message) {
    var m = (message) ? message : 'No data supplied';

    if (!callback) {
        throw new Error('Missing required callback function parameter.');
    } else {
        callback({
            errors: {
                description: m,
                status: "Bad Request",
                category_code: "request",
                additional: null,
                status_code: 400,
                category_type: "request",
                extras: {}
            }
        });
    }
}

var cc = {
    isCardNumberValid:function (cardNumber) {
        if (!cardNumber) {
            return false;
        }
        cardNumber = (cardNumber + '').replace(/\D+/g, '').split('').reverse();
        if (!cardNumber.length || cardNumber.length < 12) {
            return false;
        }
        var total = 0, i;
        for (i = 0; i < cardNumber.length; i++) {
            cardNumber[i] = parseInt(cardNumber[i], 10);
            total += i % 2 ? 2 * cardNumber[i] - (cardNumber[i] > 4 ? 9 : 0) : cardNumber[i];
        }
        return (total % 10) === 0;
    },
    cardType:function (cardNumber) {
        var p = {};
        p['51'] = p['52'] = p['53'] = p['54'] = p['55'] = 'Mastercard';
        p['34'] = p['37'] = 'American Express';
        p['4'] = 'VISA';
        p['6'] = 'Discover Card';

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
    isSecurityCodeValid:function (cardNumber, cvv) {
        var cardType = cc.cardType(cardNumber);
        if (!cardType) {
            return false;
        }
        var requiredLength = (cardType === 'American Express' ? 4 : 3);

        if(typeof cvv === "string" || typeof cvv === "number") {
            if(cvv.toString().replace(/\D+/g, '').length === requiredLength) {
                return true;
            }
        }

        return false;
    },
    isExpiryValid:function (expiryMonth, expiryYear) {
        if (!expiryMonth || !expiryYear) {
            return false;
        }
        expiryMonth = parseInt(expiryMonth, 10);
        expiryYear = parseInt(expiryYear, 10);
        if (isNaN(expiryMonth) || isNaN(expiryYear) || expiryMonth > 12 || expiryMonth < 1) {
            return false;
        }
        var today = new Date();
        return !(today.getFullYear() > expiryYear ||
                 (today.getFullYear() === expiryYear && today.getMonth() >= expiryMonth));
    },
    validate:function (cardData) {
        if (cardData.number) {
            cardData.number = cardData.number.toString().trim();
        }

        var number = cardData.number,
        cvv = cardData.cvv,
        expiryMonth = cardData.expiration_month,
        expiryYear = cardData.expiration_year;

        var errors = [];
        if (!cc.isCardNumberValid(number)) {
            errors.push(buildErrorObject('number', 'Invalid field [number] - "' + number + '" is not a valid credit card number'));
        }
        if (typeof cvv !== 'undefined' && cvv !== null && !cc.isSecurityCodeValid(number, cvv)) {
            errors.push(buildErrorObject('cvv', 'Invalid field [cvv] - "' + cvv + '" is not a valid credit card security code'));
        }
        if (!cc.isExpiryValid(expiryMonth, expiryYear)) {
            errors.push(buildErrorObject(['expiration_month', 'expiration_year'], 'Invalid field [expiration_month,expiration_year] - "' + expiryMonth + '-' + expiryYear + '" is not a valid credit card expiration date'));
        }

        return errors;
    },
    create:function (data, callback) {
        if (!data || !callback) {
            noDataError(callback);
            return;
        }
        var requiredKeys = ['number', 'expiration_month', 'expiration_year'];
        var errors = validate(data, requiredKeys, cc.validate);

        if (!isEmpty(errors)) {
            callback({
                errors: errors
            });
        } else {
            jsonp(make_url('/jsonp/cards', preparePayload(data)), make_callback(callback));
        }
    }
};

var em = {
    validate:function (emailAddress) {
        if(emailAddress && emailAddress.match(/[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+(?:\.[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?/i)) {
            return true;
        }

        return false;
    }
};

var ba = {
    types: ['savings', 'checking'],
    validate:function (accountData) {
        var noun = ('routing_number' in accountData) ? 'routing_number' : 'bank_code';
        var bankCode = accountData[noun];
        var errors = [];
        if (!ba.validateRoutingNumber(bankCode)) {
            errors.push(buildErrorObject(noun, 'Invalid field [' + noun + '] - "' + bankCode + '" is not a valid ' + noun.replace('_', ' ')));
        }
        if ('type' in accountData && !ba.validateType(accountData.type)) {
            errors.push(buildErrorObject('type', 'Invalid field [type] - "' + accountData.type + '" must be one of: "' + ba.types.join('", "') + '"'));
        }
        return errors;
    },
    validateRoutingNumber:function (routingNumber) {
        if (!routingNumber) {
            return false;
        }
        routingNumber = routingNumber.toString().match(/\d+/g);

        if (!routingNumber) {
            return false;
        }

        routingNumber = routingNumber.join('');

        if (!routingNumber || routingNumber.length !== 9) {
            return false;
        }

        var a = routingNumber.toString().split('');
        var d = [];
        for (var i = 0; i < a.length; i++) {
            d.push(parseInt(a[i], 10));
        }
        return d[8] === (
            7 * (d[0] + d[3] + d[6]) +
                3 * (d[1] + d[4] + d[7]) +
                9 * (d[2] + d[5])
        ) % 10;
    },
    lookupRoutingNumber:function (routingNumber, callback) {
        if (!routingNumber || !callback) {
            noDataError(callback);
            return;
        }
        var uri = '/bank_accounts/routing_numbers/' + routingNumber;
        jsonp(make_url(uri, null, make_callback(callback)));
    },
    validateType: function (type) {
        if (!type) {
            return true;
        }
        return ba.types.indexOf(type) >= 0;
    },
    create:function (data, callback) {
        if (!data || !callback) {
            noDataError(callback);
            return;
        }
        var requiredKeys = ['name', 'account_number', 'routing_number'];
        var errors = validate(data, requiredKeys, ba.validate);

        if (!isEmpty(errors)) {
            callback({
                errors: errors
            });
        } else {
            jsonp(make_url('/jsonp/bank_accounts', preparePayload(data)), make_callback(callback));
        }
    }
};

var root_url = 'https://api.balancedpayments.com';
function jsonp(path, callback) {
    var funct = "balanced_jsonp_"+Math.random().toString().substr(2);
    var tag = document.createElement('script');
    tag.type = 'text/javascript';
    tag.async = true;
    tag.src = path.replace('{callback}', funct);
    var where = document.getElementsByTagName('script')[0];
    where.parentNode.insertBefore(tag, where);
    window[funct] = function(result) {
        try {
            callback(result);
        } catch(e) {
            if(typeof console !== 'undefined' && console.error) {
                console.error(e);
            }
        }
        tag.parentNode.removeChild(tag);
    };
}

function make_url(path, data) {
    return root_url + path + "?callback={callback}&data="+encodeURI(JSON.stringify(data));
}

function make_callback(callback) {
    var called_back = false;

    function ret(data) {
        if(called_back) { return; }

        called_back = true;

        if(!data || !data.status) {
            callback({
                description: "Unable to connect to the balanced servers",
                status: "Internal Server Error",
                category_code: "server-error",
                additional: null,
                status_code: 500,
                category_type: "server-error",
                extras: {}
            });

            return;
        }

        var body = JSON.parse(data.body);

        ////
        // Append the status
        ////
        if(typeof data.status !== "undefined") {
            body.status_code = data.status;
        }

        callback(body);
    }

    setTimeout(ret, 60000);
    return ret;
}

////
// Load JSON parser for old browsers
////
if(typeof JSON !== 'object') {
    jsonp('https://js.balancedpayments.com/json2.js');
}

global.balanced = {
    card: cc,
    bankAccount: ba,
    emailAddress: em,
    init: function (args) {
        if(args && 'server' in args) {
            root_url = args.server;
        }
    }
};
