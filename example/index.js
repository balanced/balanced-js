$(document).ready(function () {
    balanced.init({
        server: 'http://localhost:3000'
    });

    $('#cc-submit').click(function (e) {
        e.preventDefault();

        $('#response').hide();

        var payload = {
            number: $('#cc-number').val(),
            expiration_month: $('#cc-ex-month').val(),
            expiration_year: $('#cc-ex-year').val(),
            security_code: $('#ex-csc').val()
        };

        // Tokenize card
        balanced.card.create(payload, function (response) {
            $('#response .panel-body pre').html(JSON.stringify(response, false, 4));
            $('#response').slideDown(300);
        });
    });

    $('#ba-submit').click(function (e) {
        e.preventDefault();

        $('#response').hide();

        var payload = {
            name: $('#ba-name').val(),
            account_number: $('#ba-number').val(),
            routing_number: $('#ba-routing').val()
        };

        // Tokenize bank account
        balanced.bankAccount.create(payload, function (response) {
            $('#response .panel-body pre').html(JSON.stringify(response, false, 4));
            $('#response').slideDown(300);
        });
    });

    $('#populate').click(function () {
        $(this).attr("disabled", true);

        $('#cc-number').val('4111111111111111');
        $('#cc-ex-month').val('12');
        $('#cc-ex-year').val('2020');
        $('#ex-csc').val('123');
        $('#ba-name').val('John Hancock');
        $('#ba-number').val('9900000000');
        $('#ba-routing').val('321174851');
    });
});
