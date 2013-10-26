module('balanced.js.cards', {
    setup: function () {
        balanced.init({
            server: 'http://localhost:3000'
        });
    },

    teardown: function () {
    }
});

test('track', function () {
    notEqual(-1, document.cookie.indexOf('__b'));
});
