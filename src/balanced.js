var capabilities = {
    system_timezone:-(new Date()).getTimezoneOffset() / 60,
    user_agent:navigator.userAgent,
    language:navigator.userLanguage || navigator.language
};

function validateData (requiredKeys, data, errors) {
    for (var i = 0; i < requiredKeys.length; i++) {
        var key = requiredKeys[i];
        if (!data || !(key in data) || !data[key]) {
            errors[key] = 'Missing field';
        }
    }
}

function preparePayload(data) {
    if(!data.meta) { data.meta = {}; }
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

addEvent(window, 'keydown', function (e) {
    if (!capabilities.cl) {
        capabilities.cl = icl(e);
    }
});
addEvent(window, 'paste', function () {
    capabilities.ps = true;
});

////
// Required for ie < 9 support
////
if (!String.prototype.trim) {
    String.prototype.trim=function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

// validation stuff copied out of the old balanced.js
function validate (details, requiredKeys, validationMethod) {
    var errors = {};

    validateData(requiredKeys, details, errors);
    var additionalErrors = validationMethod(details);
    for (var k in additionalErrors) {
        errors[k] = additionalErrors[k];
    }
    return errors;
}

function noDataError(callback, message) {
    var m = (message) ? message : 'No data supplied';

    if (!callback) {
        throw m;
    } else {
        callback({
            error:[m],
            status:400
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
    isSecurityCodeValid:function (cardNumber, securityCode) {
        var cardType = cc.cardType(cardNumber);
        if (!cardType) {
            return false;
        }
        var requiredLength = (cardType === 'American Express' ? 4 : 3);

        if(typeof securityCode === "string" || typeof securityCode === "number") {
            if(securityCode.toString().replace(/\D+/g, '').length === requiredLength) {
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
        var cardNumber = cardData.number,
        securityCode = cardData.security_code,
        expiryMonth = cardData.expiration_month,
        expiryYear = cardData.expiration_year;
        var errors = {};
        if (!cc.isCardNumberValid(cardNumber)) {
            errors.number = '"' + cardNumber + '" is not a valid credit card number';
        }
        if (typeof securityCode !== 'undefined' && securityCode !== null && !cc.isSecurityCodeValid(cardNumber, securityCode)) {
            errors.security_code = '"' + securityCode + '" is not a valid credit card security code';
        }
        if (!cc.isExpiryValid(expiryMonth, expiryYear)) {
            errors.expiration = '"' + expiryMonth + '-' + expiryYear + '" is not a valid credit card expiration date';
        }
        return errors;
    },
    create:function (data, callback) {
        if (!data) {
            noDataError(callback);
            return;
        }
        var requiredKeys = ['number', 'expiration_month', 'expiration_year'];
        var errors = validate(data, requiredKeys, cc.validate);
        var ec = 0;
        for (var p in errors) {
            ec++;
            break;
        }
        if (ec > 0) {
            callback({
                error:errors,
                status:400
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
        var errors = {};
        if (!ba.validateRoutingNumber(bankCode)) {
            errors[noun] = '"' + bankCode + '" is not a valid ' + noun.replace('_', ' ');
        }
        if ('type' in accountData && !ba.validateType(accountData.type)) {
            errors.type = '"' + accountData.type + '" must be one of: "' + ba.types.join('", "') + '"';
        }
        return errors;
    },
    validateRoutingNumber:function (routingNumber) {
        if (!routingNumber) {
            return false;
        }
        routingNumber = routingNumber.match(/\d+/g);

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
        if (!routingNumber) {
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
        if (!data) {
            noDataError(callback);
            return;
        }
        var requiredKeys = ['name', 'account_number', 'routing_number'];
        var errors = validate(data, requiredKeys, ba.validate);
        var ec = 0;
        for (var p in errors) {
            ec++;
            break;
        }
        if (ec > 0) {
            callback({
                error:errors,
                status:400
            });
        } else {
            jsonp(make_url('/jsonp/bank_accounts', preparePayload(data)), make_callback(callback));
        }
    }
};

var root_url = 'https://js.balancedpayments.com';
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
            if(console && console.error) {
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
        if(!data || !data.status || data.status >= 400) {
            callback(data && data.body ? JSON.parse(data.body) : {
                status_code: 500,
                description: "Unable to connect to the balanced servers"
            });
            return;
        }
        var body = JSON.parse(data.body);
        if(!('href' in body)) {
            callback(body);
            return;
        }
        callback(null, body);
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
        if('server' in args) {
            root_url = args.server;
        }
    }
};