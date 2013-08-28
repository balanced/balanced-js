module('balanced.js.cards', {
    setup: function () {
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
