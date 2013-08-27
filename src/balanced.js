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
        return securityCode && securityCode.toString().replace(/\D+/g, '').length === requiredLength;
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
        if (cardData.card_number) {
            cardData.card_number = cardData.card_number.toString().trim();
        }
        var cardNumber = cardData.card_number,
            securityCode = cardData.security_code,
            expiryMonth = cardData.expiration_month,
            expiryYear = cardData.expiration_year;
        var errors = {};
        if (!cc.isCardNumberValid(cardNumber)) {
            errors.card_number = '"' + cardNumber + '" is not a valid credit card number';
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
        if (!initd) {
            noDataError(callback, 'You need to call balanced.init first');
            return;
        }
        var requiredKeys = [
            'card_number', 'expiration_month', 'expiration_year'
        ];
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
            var uri = '/cards';
            var payload = preparePayload(data);
            sendWhenReady(uri, payload, callback);
        }
    }
};

var em = {
    validate:function (emailAddress) {
        var match = emailAddress &&
            emailAddress.match(/[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+(?:\.[a-z0-9!#$%&'*+\/=?\^_`{|}~\-]+)*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?/i);
        return match && match.toString() === emailAddress;
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

        if (!routingNumber || routingNumber.length != 9) {
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
        if (!initd) {
            noDataError(callback, 'You need to call balanced.init first');
            return;
        }
        if (!routingNumber) {
            noDataError(callback);
            return;
        }
        var uri = ROUTING_NUMBER_URI + routingNumber;
        sendWhenReady(uri, null, callback, 'GET');
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
        if (!initd) {
            noDataError(callback, 'You need to call balanced.init first');
            return;
        }
        var requiredKeys = ['name', 'account_number', 'bank_code'];
        if (data && 'routing_number' in data) {
            requiredKeys = ['name', 'account_number', 'routing_number'];
        }
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
            var uri = '/bank_accounts';
            var payload = preparePayload(data);
            sendWhenReady(uri, payload, callback);
        }
    }
};

balanced = {
    init:function (params) {
        params = params || {};
        if ('server' in params) {
            server = params.server;
            proxy = server + '/proxy.html';
        }
        createProxy(params.mock);
        if (params.revision) {
            revision = params.revision;
        }
        initd = true;
    },
    card: cc,
    bankAccount: ba,
    emailAddress: em
};

var server = 'https://js.balancedpayments.com',
    proxy = server + '/proxy.html',
    initd = false,
    DEFAULT_REVISION = '1.0',
    revision = DEFAULT_REVISION,
    ROUTING_NUMBER_URI = '/v1/bank_accounts/routing_numbers/',
    validate = function (details, requiredKeys, validationMethod) {
        var errors = {};

        validateData(requiredKeys, details, errors);
        var additionalErrors = validationMethod(details);
        for (var k in additionalErrors) {
            errors[k] = additionalErrors[k];
        }
        return errors;
    },
    noDataError = function (callback, message) {
        var m = (message) ? message : 'No data supplied';
        if (!callback) {
            throw m;
        } else {
            callback({
                error:[m],
                status:400
            });
        }
    };
