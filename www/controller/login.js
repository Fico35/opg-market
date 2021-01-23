function login() {
    $xhr({
        url: '/auth/login',
        method: 'POST',
        data: {
            username: $('#input_username').value,
            password: $('#input_password').value
        },
        onSuccess: (status, xhr_data) => {
            window.location.href = '/index';
        },
        onError: (status, err_text) => {
            if (err_text === "username") {
                $('#input_username').className += " input-error";
                $('#label_error_username').className = $('#label_error_username').className.replace("hidden", "").trim();
            } else if (err_text === "password") {
                $('#input_password').className += " input-error";
                $('#label_error_password').className = $('#label_error_password').className.replace("hidden", "").trim();
            } else {
                alert("Došlo je do nepoznate pogreške. Molimo pokušajte ponovno kasnije.");
            }
        }
    });
}

$('#input_username').addEventListener('keyup', (e) => {
    $('#input_username').className = $('#input_username').className.replace("input-error", "").trim();
    if ($('#label_error_username').className.search("hidden") === -1) {
        $('#label_error_username').className += " hidden";
    }
});

$('#input_password').addEventListener('keyup', (e) => {
    $('#input_password').className = $('#input_password').className.replace("input-error", "").trim();
    if ($('#label_error_password').className.search("hidden") === -1) {
        $('#label_error_password').className += " hidden";
    }
});
