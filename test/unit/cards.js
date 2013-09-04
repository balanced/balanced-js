module('balanced.js.cards', {
    setup: function () {
        balanced.init({
            server: 'http://localhost:3000'
        });
    },

    teardown: function () {
    }
});

test('isCardNumberValid', function (assert) {
    var tests = [
        {
            number: '4111111111111111',
            expected: true
        },
        {
            number: 4111111111111111,
            expected: true
        },
        {
            number: ' 4111111111111111',
            expected: true
        },
        {
            number: '4111111111111111 ',
            expected: true
        },
        {
            number: ' 4111111111111111 ',
            expected: true
        },
        {
            number: '4111 1111 1111 1111',
            expected: true
        },
        {
            number: '4111-1111-1111-1111',
            expected: true
        },
        {
            number: '4111-1111-1111-1111 ',
            expected: true
        },
        {
            number: ' 4111-1111-1111-1111',
            expected: true
        },
        {
            number: ' 4111-1111-1111-1111 ',
            expected: true
        },
        {
            number: '378734493671000',
            expected: true
        },
        {
            number: '6011111111111117',
            expected: true
        },
        {
            number: '4222222222222',
            expected: true
        },
        {
            number: '5105105105105100',
            expected: true
        },
        {
            number: '42123',
            expected: false
        },
        {
            number: 41111,
            expected: false
        },
        {
            number: 'no numbers in hurr',
            expected: false
        },
        {
            number: null,
            expected: false
        },
        {
            number: '',
            expected: false
        },
        {
            number: false,
            expected: false
        },
        {
            number: true,
            expected: false
        }
    ];

    for(var i = 0; i < tests.length; i++) {
        assert.equal(balanced.card.isCardNumberValid(tests[i].number), tests[i].expected, "Test #" + (i + 1));
    }
});

test('cardType', function (assert) {
    var tests = [
        {
            number: '5105105105105100',
            expected: 'Mastercard'
        },
        {
            number: '5555555555554444',
            expected: 'Mastercard'
        },
        {
            number: '4111111111111111',
            expected: 'VISA'
        },
        {
            number: 4111111111111111,
            expected: 'VISA'
        },
        {
            number: '4012888888881881',
            expected: 'VISA'
        },
        {
            number: '4222222222222',
            expected: 'VISA'
        },
        {
            number: '341111111111111',
            expected: 'American Express'
        },
        {
            number: '378734493671000',
            expected: 'American Express'
        },
        {
            number: '6011111111111117',
            expected: 'Discover Card'
        },
        {
            number: '4111111111111111 ',
            expected: 'VISA'
        },
        {
            number: ' 4111111111111111',
            expected: 'VISA'
        },
        {
            number: ' 4111111111111111 ',
            expected: 'VISA'
        },
        {
            number: '4111 1111 1111 1111',
            expected: 'VISA'
        },
        {
            number: '4111-1111-1111-1111',
            expected: 'VISA'
        },
        {
            number: 'no numbers in hurr',
            expected: null
        },
        {
            number: null,
            expected: null
        },
        {
            number: '',
            expected: null
        },
        {
            number: false,
            expected: null
        },
        {
            number: true,
            expected: null
        }
    ];

    for(var i = 0; i < tests.length; i++) {
        assert.equal(balanced.card.cardType(tests[i].number), tests[i].expected, "Test #" + (i + 1));
    }
});

test('isSecurityCodeValid', function (assert) {
    var tests = [
        {
            number: '4111111111111111',
            csc: 123,
            expected: true
        },
        {
            number: 4111111111111111,
            csc: 123,
            expected: true
        },
        {
            number: '4111111111111111',
            csc: '123',
            expected: true
        },
        {
            number: '4111111111111111',
            csc: 1234,
            expected: false
        },
        {
            number: '4111111111111111',
            csc: '1234',
            expected: false
        },
        {
            number: '4111111111111111',
            csc: '',
            expected: false
        },
        {
            number: '4111111111111111',
            csc: null,
            expected: false
        },
        {
            number: '4111111111111111',
            csc: 'abc',
            expected: false
        },
        {
            number: '378734493671000',
            csc: '1234',
            expected: true
        },
        {
            number: '378734493671000',
            csc: 1234,
            expected: true
        },
        {
            number: '378734493671000',
            csc: '123',
            expected: false
        },
        {
            number: '378734493671000',
            csc: null,
            expected: false
        },
        {
            number: 'no numbers',
            csc: '123',
            expected: false
        },
        {
            number: 'no numbers',
            csc: '1234',
            expected: false
        },
        {
            number: null,
            csc: '123',
            expected: false
        },
        {
            number: null,
            csc: '1234',
            expected: false
        },
        {
            number: null,
            csc: null,
            expected: false
        },
    ];

    for(var i = 0; i < tests.length; i++) {
        assert.equal(balanced.card.isSecurityCodeValid(tests[i].number, tests[i].csc), tests[i].expected, "Test #" + (i + 1));
    }
});

test('isExpiryValid', function (assert) {
    var tests = [
        {
            expiration_month: 11,
            expiration_year: 2030,
            expected: true
        },
        {
            expiration_month: '14',
            expiration_year: '2030',
            expected: false
        },
        {
            expiration_month: 13,
            expiration_year: 2030,
            expected: false
        },
        {
            expiration_month: '12',
            expiration_year: '2030',
            expected: true
        },
        {
            expiration_month: 1,
            expiration_year: 2012,
            expected: false
        },
        {
            expiration_month: '1',
            expiration_year: '2012',
            expected: false
        },
        {
            expiration_month: null,
            expiration_year: 2030,
            expected: false
        },
        {
            expiration_month: 0,
            expiration_year: 0,
            expected: false
        },
        {
            expiration_month: '',
            expiration_year: '',
            expected: false
        },
        {
            expiration_month: 13,
            expiration_year: 2030,
            expected: false
        },
        {
            expiration_month: 1,
            expiration_year: null,
            expected: false
        },
        {
            expiration_month: null,
            expiration_year: null,
            expected: false
        },
        {
            expiration_month: 'MM',
            expiration_year: 'YYYY',
            expected: false
        }
    ];

    for(var i = 0; i < tests.length; i++) {
        assert.equal(balanced.card.isExpiryValid(tests[i].expiration_month, tests[i].expiration_year), tests[i].expected, "Test #" + (i + 1));
    }
});

test('validate', function (assert) {
    var tests = [
        {
            number: '4111111111111111',
            expiration_month: 1,
            expiration_year: 2030,
            security_code: 123,
            expected_length: 0
        },
        {
            number: '4111111111111111',
            expiration_month: 1,
            expiration_year: 2030,
            security_code: null,
            expected_length: 0
        },
        {
            number: null,
            expiration_month: 1,
            expiration_year: 2030,
            security_code: null,
            expected_length: 1
        },
        {
            number: '4111111111111111',
            expiration_month: 1,
            expiration_year: 2030,
            security_code: 123,
            expected_length: 0
        },
        {
            number: '4111111111111111',
            expiration_month: 1,
            expiration_year: 2030,
            security_code: '',
            expected_length: 1
        },
        {
            number: '4111111111111111',
            expiration_month: 1,
            expiration_year: 2030,
            expected_length: 0
        },
        {
            number: '4111111111111111',
            expiration_month: 1,
            expiration_year: 2000,
            security_code: 123,
            expected_length: 1
        },
        {
            number: '4111111111111111',
            expiration_month: '14',
            expiration_year: '2030',
            expected_length: 1
        },
        {
            expected_length: 2
        },
        {
            security_code: '1234',
            expected_length: 3
        },
        {
            number: '',
            expiration_month: '',
            expiration_year: '',
            security_code: 'asdff',
            expected_length: 3
        },
        {
            number: null,
            expiration_month: null,
            expiration_year: null,
            security_code: null,
            expected_length: 2
        },
        {
            number: 378734493671000,
            expiration_month: 1,
            expiration_year: 2030,
            expected_length: 0
        },
        {
            number: '378734493671000',
            expiration_month: '1',
            expiration_year: 2030,
            expected_length: 0
        },
        {
            number: '4111-1111-1111-1111',
            expiration_month: 1,
            expiration_year: 2030,
            expected_length: 0
        },
        {
            number: 'no numbers in hurr',
            expiration_month: '1',
            expiration_year: '2030',
            expected_length: 1
        },
        {
            number: '6011111111111117',
            expiration_month: '1',
            expiration_year: '2030',
            security_code: 123,
            expected_length: 0
        },
        {
            number: '6011111111111117',
            expiration_month: '1',
            expiration_year: '2030',
            security_code: 1234,
            expected_length: 1
        }
    ];


    for(var i = 0; i < tests.length; i++) {
        assert.equal(Object.keys(balanced.card.validate(tests[i])).length, tests[i].expected_length, "Test #" + (i + 1));
    }
});

asyncTest('create', 4, function(assert) {
    var count = 0;

    function callback(response) {
        ////
        // We expect a 404
        ////
        assert.equal(response.status, 404);
        count++;

        if(count === 3) {
            start();
        }
    }

    var tests = [
        {
            number: '4111111111111111',
            expiration_month: 1,
            expiration_year: 2030,
            security_code: 123,
        },
        {
            number: '343434343434343',
            expiration_month: '1',
            expiration_year: 2030,
            expected_length: 0
        },
        {
            number: '6011111111111117',
            expiration_month: '1',
            expiration_year: '2030',
            security_code: 123,
        },
        {
            number: '378734493671000',
            expiration_month: '1',
            expiration_year: 2030
        }

    ];

    for(var i = 0; i < tests.length; i++) {
        balanced.card.create(tests[i], callback);
    }
});