module('balanced.js.cards', {
    setup: function () {
    },

    teardown: function () {
    }
});

test('track', function () {
    notEqual(-1, document.cookie.indexOf('__b='));
});
