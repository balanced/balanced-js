$(document).ready(function() {
    balanced.init('/v1/marketplaces/TEST-MP5noKWGqLyLOLKkQkJmKg9s', {
        server: 'http://localhost:3000'
    });

    $("#cc-submit").click(function(e) {
        e.preventDefault();

        $("#response").slideUp(200);

        var payload = {
            card_number: $("#cc-number").val(),
            expiration_month: $("#cc-ex-month").val(),
            expiration_year: $("#cc-ex-year").val(),
            security_code: $("#ex-csc").val()
        };

        ////
        // Tokenize card
        ////
        balanced.card.create(payload, function(data, errors, status) {
            $("#response .panel-body pre").html(JSON.stringify(data, false, 2));
            $("#response").slideDown(300);
        });
    });

    $("#ba-sumit").click(function(e) {
        e.preventDefault();

        $("#response").slideUp(200);
    });
});