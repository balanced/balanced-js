module('balanced.js.emailAddress', {
    setup: function () {
    },

    teardown: function () {
    }
});

test('validate', function (assert) {
    var tests = [
        {
            email_address: 'foo@bar.com',
            expected: true
        },
        {
            email_address: 'foo+gmail@bar.com',
            expected: true
        },
        {
            email_address: 'FOO@BAR.CO',
            expected: true
        },
        {
            email_address: 'foo@bar.bar.io',
            expected: true
        },
        {
            email_address: '_foo.bar@bar.org',
            expected: true
        },
        {
            email_address: 'foo@bar.info',
            expected: true
        },
        {
            email_address: 'foo@bar.museum',
            expected: true
        },
        {
            email_address: 'foo@bar.c',
            expected: true
        },
        {
            email_address: '',
            expected: false
        },
        {
            email_address: null,
            expected: false
        },
        {
            email_address: 'foo',
            expected: false
        },
        {
            email_address: 'foo@',
            expected: false
        },
        {
            email_address: 'foo@bar',
            expected: false
        },
        {
            email_address: 'foo@bar.',
            expected: false
        }
    ];

    for(var i = 0; i < tests.length; i++) {
        assert.equal(balanced.emailAddress.validate(tests[i].email_address), tests[i].expected, "Test #" + (i + 1));
    }
});