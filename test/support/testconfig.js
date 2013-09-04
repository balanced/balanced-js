QUnit.testStart(function (test) {
    var module = test.module ? test.module : '';
    console.log('#' + module + ' ' + test.name + ': starting.');
});

QUnit.testDone(function (test) {
    var module = test.module ? test.module : '';
    console.log('#' + module + ' ' + test.name + ': finished.');
});
