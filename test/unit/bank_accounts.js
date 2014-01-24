module('balanced.js.bank_accounts', {
    setup: function () {
        // no init required for rev1 balanced.js
    },

    teardown: function () {
    }
});

test('isRoutingNumberValid', function (assert) {
    var tests = [
        {
            routing_number: '121000374',
            expected: true
        },
        {
            routing_number: '1210003742',
            expected: false
        },
        {
            routing_number: '011000015',
            expected: true
        },
        {
            routing_number: ' 121-000374-2 ',
            expected: false
        },
        {
            routing_number: 121000374,
            expected: true
        },
        {
            routing_number: null,
            expected: false
        },
        {
            routing_number: '',
            expected: false
        },
        {
            routing_number: 'no numbers in hurr',
            expected: false
        },
        {
            routing_number: '123457890',
            expected: false
        }
    ];

    for(var i = 0; i < tests.length; i++) {
        assert.equal(balanced.bankAccount.isRoutingNumberValid(tests[i].routing_number), tests[i].expected, "Test #" + (i + 1));
    }
});

test('validateRoutingNumber', function (assert) {
    var tests = [
        {
            routing_number: '121000374',
            expected: true
        }
    ];

    for(var i = 0; i < tests.length; i++) {
        assert.equal(balanced.bankAccount.validateRoutingNumber(tests[i].routing_number), tests[i].expected, "Test #" + (i + 1));
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
            expected_length: 1,
            expected_keys: ['bank_code']
        },
        {
            routing_number: '',
            expected_length: 1,
            expected_keys: ['routing_number']
        },
        {
            routing_number: null,
            expected_length: 1,
            expected_keys: ['routing_number']
        },
        {
            routing_number: 'no numbers in hurr',
            expected_length: 1,
            expected_keys: ['routing_number']
        },
        {
            bank_code: ' 121-000374-2 ',
            expected_length: 1,
            expected_keys: ['bank_code']
        },
        {
            routing_number: '121000374',
            type: 'foo',
            expected_length: 1,
            expected_keys: ['type']
        },
        {
            routing_number: '121000374',
            account_type: 'foo',
            expected_length: 1,
            expected_keys: ['account_type']
        },
        {
            routing_number: 'no numbers in hurr',
            type: 'foo',
            expected_length: 2,
            expected_keys: ['type', 'routing_number']
        },
        {
            routing_number: 'no numbers in hurr',
            account_type: 'foo',
            expected_length: 2,
            expected_keys: ['account_type', 'routing_number']
        }
    ];

    for(var i = 0; i < tests.length; i++) {
        var validationErrors = balanced.bankAccount.validate(tests[i]);
        assert.equal(Object.keys(validationErrors).length, tests[i].expected_length, "Test #" + (i + 1) + " key count incorrect");

        for (var j = 0; j < validationErrors.length; j++) {
            var obj = validationErrors[j];

            for (key in obj.extras) {
                assert.ok(tests[i].expected_keys.indexOf(key) >= 0, "Test #" + (i + 1) + " keys incorrect");
            }
        }
    }
});

asyncTest('create', 3, function(assert) {
    var count = 0;

    function callback(response) {
        assert.equal(response.status_code, 201);

        if(++count == 3) {
            start();
        }
    }

    var tests = [
        {
            name: 'Mike Smith',
            account_number: '121000374',
            routing_number: '121000374',
            type: 'checking'
        },
        {
            name: 'Mike Smith',
            account_number: '121000374',
            routing_number: '121000374',
            type: 'savings'
        },
        {
            name: 'Mike Smith',
            account_number: '121000374',
            routing_number: '121000374'
        }
    ];

    for(var i = 0; i < tests.length; i++) {
        balanced.bankAccount.create(tests[i], callback);
    }
});
