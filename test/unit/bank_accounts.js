module('balanced.js.bank_accounts', {
    setup: function () {
    },

    teardown: function () {
    }
});

test('validateRoutingNumber', function (assert) {
    var tests = [
        {
            number: '121000374',
            expected: true
        },
        {
            number: '1210003742',
            expected: false
        },
        {
            number: '011000015',
            expected: true
        },
        {
            number: ' 121-000374-2 ',
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
            number: 'no numbers in hurr',
            expected: false
        },
        {
            number: '123457890',
            expected: false
        }
    ];

    for(var i = 0; i < tests.length; i++) {
        assert.equal(balanced.bankAccount.validateRoutingNumber(tests[i].number), tests[i].expected, "Test #" + (i + 1));
    }
});

test('validate', function (assert) {
    var tests = [
        {
            bank_code: '121000374',
            expected_length: 0
        },
        {
            routing_number: '121000374',
            type: 'savings',
            expected_length: 0
        },
        {
            routing_number: '121000374',
            type: 'checking',
            expected_length: 0
        },
        {
            bank_code: '1210003742',
            expected_length: 1
        },
        {
            routing_number: '',
            expected_length: 1
        },
        {
            routing_number: null,
            expected_length: 1
        },
        {
            routing_number: 'no numbers in hurr',
            expected_length: 1
        },
        {
            bank_code: ' 121-000374-2 ',
            expected_length: 1
        },
        {
            routing_number: '121000374',
            type: 'foo',
            expected_length: 1
        },
        {
            routing_number: 'no numbers in hurr',
            type: 'foo',
            expected_length: 2
        }
    ];


    for(var i = 0; i < tests.length; i++) {
        assert.equal(Object.keys(balanced.bankAccount.validate(tests[i])).length, tests[i].expected_length, "Test #" + (i + 1));
    }
});
