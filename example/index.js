$(document).ready(function() {
    balanced.init('/v1/marketplaces/TEST-MP5noKWGqLyLOLKkQkJmKg9s');

    $("#cc-submit").click(function(e) {
        e.preventDefault();

        var payload = {
            card_number: $("#cc-number").val(),
            expiration_month: $("#cc-ex-month").val(),
            expriation_year: $("#cc-ex-year").val(),
            security_code: $("#ex-csc").val()
        };

        ////
        // Tokenize card
        ////
        balanced.card.create(payload, function(response, errors, status) {
            console.log(response);
            console.log(errors);
            console.log(status);
        });
    });

    $("#ba-sumit").click(function(e) {
        e.preventDefault();
    });
});