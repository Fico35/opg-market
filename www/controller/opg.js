document.getElementsByClassName("navbar-top")[0].children[4].className += " active";

let allUsersDatatable = new simpleDatatables.DataTable("#all_users", {
    columns: [
        {
            select: [0],
            type: "number"
        }
    ],
    data: {
        headings: [
            "ID",
            "Korisničko ime",
            "Naziv"
        ]
    },
    labels: defaultDatatableLabels
});

$xhr({
    url: "/resource/users",
    method: "GET",
    onSuccess: (status, xhr_data) => {
        let rows = JSON.parse(xhr_data);
        allUsersDatatable.insert({data:rows});
    },
});
