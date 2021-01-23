function register() {
    $xhr({
        url: '/auth/register',
        method: 'POST',
        data: {
            username: $('#input_username').value,
            password: $('#input_password').value,
            opg_name: $('#input_opg_name').value
        },
        onSuccess: (status, xhr_data) => {
            window.location.href = '/index';
        },
        onError: (status, err_text) => {
            if (err_text === "username") {
                $('#input_username').className += " input-error";
                $('#label_error_username').className = $('#label_error_username').className.replace("hidden", "").trim();
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
