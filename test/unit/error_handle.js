module('balanced.js.errors', {
    setup: function () {
    },

    teardown: function () {
    }
});

asyncTest('throw', function (assert) {
    var e = console.error;
    console.error = function (err) {
        console.error = e;
        assert.ok(err.message == 'test', 'Error message match');
        start();
    };
    balanced.card.create({
        'number': '4111111111111111',
        'expiration_year': '3000',
        'expiration_month': 12
    }, function (result) {
        throw new Error('test');
    });
});
