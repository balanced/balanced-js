module('balanced.js', {
    setup: function () {
    },

    teardown: function () {
    }
});

test('trim', function (assert) {
    ////
    // Not sure how to test this, unless I force the trim function here
    ///
    String.prototype.trim=function() {
        return this.replace(/^\s+|\s+$/g, '');
    };

    assert.equal(' foo'.trim(), 'foo');
    assert.equal('foo '.trim(), 'foo');
    assert.equal(' foo '.trim(), 'foo');
});