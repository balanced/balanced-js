module('balanced.js.externalAccount', {
    setup: function () {
        // overwrite the providers settings for testing
        balanced.init({
            providers: {
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

asyncTest('create opens window', function (assert) {
    var p = "/base/build/test/oauth_test.html?response_type=code&client_id=TEST_CLIENT_ID&redirect_uri=https://js.balancedpayments.com/callback.html";
    var open = window.open;
    window.open = function (path) {
        window.open = open;
        assert.equal(path, p);
        start();
    };
    balanced.externalAccount.create('test', function () {});
});


asyncTest('Test redirect and postMessage works', function (assert) {
    balanced.externalAccount.create('test', function (result) {
        assert.ok('external_accounts' in result, 'Have external_accounts');
        assert.ok(result.external_accounts[0].href, 'There is a href on this external account');
        start();
    });
});


asyncTest('Check for events getting sent', function (assert) {
    var got_message = false;
    window.addEventListener("message", function (event) {
        if(got_message) return;
        assert.equal(event.origin, "https://js.balancedpayments.com");
        assert.equal(event.data.code, "BALANCED_FIXTURE_TEST_CODE");
        got_message = true;
    });
    balanced.externalAccount.create('test', function (){
        assert.ok(got_message, 'Got the postMessage event');
        start();
    });
});
