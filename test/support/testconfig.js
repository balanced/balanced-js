QUnit.testStart(function (test) {
    var module = test.module ? test.module : '';
    console.log('#' + module + ' ' + test.name + ': starting setup.');
});

QUnit.testDone(function (test) {
    var module = test.module ? test.module : '';
    console.log('#' + module + ' ' + test.name + ': tearing down.');
});
