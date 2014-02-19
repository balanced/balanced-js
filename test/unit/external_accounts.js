module('balanced.js.externalAccount', {
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

asyncTest('create', function (assert) {
    function callback (response) {
        start();
    }
    var spy = sinon.spy(balanced, 'jsonp');
    balanced.init();
    balanced.externalAccount.create('test', callback);

    //simulate window event
    window.postMessage({'foo': 'bar'}, "*");
    assert.ok(spy.calledOnce);
    assert.ok(spy.getCall(0).args[0], 'https://api.balancedpayments.com/jsonp/external_accounts', 'Test #1');
});


asyncTest('create opens window', function (assert) {
    var spy = sinon.spy(window, 'open');
    balanced.externalAccount.create('test', function (){});
    var expectedArgs = [
        "/base/build/test/oauth_test.html?response_type=code&client_id=TEST_CLIENT_ID&redirect_uri=https://js.balancedpayments.com/callback.html",
        "",
        "top=445, left=1030, width=500, height=550"
    ];
    assert.ok(spy.calledOnce);
    assert.ok(spy.getCall(0).args, expectedArgs);
});

asyncTest('callback handles data', function (assert) {
    var spy = sinon.spy(balanced, 'jsonp');
    var event = {
        origin: 'https://js.balancedpayments.com',
        data: {
            asd: 123
        }
    }
    balanced.externalAccount.callback(event);
    var expectedArgs = [
        // todo
    ];
    assert.ok(spy.calledOnce);
    assert.ok(spy.getCall(0).args, expectedArgs);
});