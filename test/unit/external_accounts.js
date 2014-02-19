module('balanced.js.cards', {
    setup: function () {
        // overwrite the network settings for testing
        balanced.init({
            networks: {
                'test': {
                    url: '/base/build/test/oauth_test.html',
                    params: {
                        response_type: 'code',
                        client_id: 'TEST_CLIENT_ID',
                        redirect_uri: 'https://js.balancedpayments.com/callback.html'
                    }
                }
            }
        });
    },

    teardown: function () {
    }
});

asyncTest('tokenizeExternalAccount', function (assert) {
    balanced.externalAccount.create('test', function (result) {
	start();
    });
});
