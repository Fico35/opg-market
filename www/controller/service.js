document.getElementsByClassName("navbar-top")[0].children[3].className += " active";
activeIndex = -1;

disableEditAndDelete(true);

let userServicesDatatable = new simpleDatatables.DataTable("#user_services", {
    columns: [
        {
            select: [0, 1],
            hidden: true
        },
        {
            select: [0, 4],
            type: "number"
        },
    ],
    data: {
        headings: [
            "ID",
            "OPG",
            "Naziv",
            "Opis",
            "Cijena (HRK)"
        ],
    },
    labels: defaultDatatableLabels,
});

function refreshUserServices() {
    $xhr({
        url: "/resource/user/" + getCookie("user_id") + "/services",
        method: "GET",
        onSuccess: (status, xhr_data) => {
            let rows = JSON.parse(xhr_data);
            userServicesDatatable.destroy();
            userServicesDatatable.init();
            userServicesDatatable.insert({data:rows});
        },
    });
}

let allServicesDatatable = new simpleDatatables.DataTable("#all_services", {
    columns: [
        {
            select: 0,
            hidden: true
        },
        {
            select: [0, 4],
            type: "number"
        },
    ],
    data: {
        headings: [
            "ID",
            "OPG",
            "Naziv",
            "Opis",
            "Cijena (HRK)"
        ],
    },
    labels: defaultDatatableLabels,
});

function refreshAllServices() {
    $xhr({
        url: "/resource/services",
        method: "GET",
        onSuccess: (status, xhr_data) => {
            let rows = JSON.parse(xhr_data);
            allServicesDatatable.destroy();
            allServicesDatatable.init();
            allServicesDatatable.insert({data:rows});
        },
    });
}

$('#user_services').addEventListener("click", (e) => {
    let clickedRow = null;
    if (e.target.nodeName === "TD") {
        if (e.target.nodeName.className != null && e.target.nodeName.className.search("dataTables-empty") === -1) {
            return false;
        }
        clickedRow = e.target.parentNode;
    } else if (e.target.nodeName === "TR") {
        clickedRow = e.target;
    }
    for (let row of userServicesDatatable.activeRows) {
        row.className = row.className.replace("active", "").trim();
    }
    if (clickedRow !== null) {
        if (clickedRow.dataIndex === activeIndex) {
            activeIndex = -1;
            disableEditAndDelete(true);
        } else {
            clickedRow.className += " active";
            activeIndex = clickedRow.dataIndex;
            disableEditAndDelete(false);
        }
    }
});

function showEdit(yes) {
    $('#service_list').style.display = (yes ? "none" : "flex");
    $('#service_edit').style.display = (yes ? "flex" : "none");
}

function disableEditAndDelete(yes) {
    $('#btn_edit').disabled = yes;
    $('#btn_delete').disabled = yes;
}

function clearInputs() {
    $('#input_service_id').value = null;
    $('#input_name').value = null;
    $('#input_description').value = null;
    $('#input_cost').value = null;
}

function refreshTables() {
    activeIndex = -1;
    disableEditAndDelete(true);
    refreshUserServices();
    refreshAllServices();
}

function createService() {
    clearInputs();
    $('#input_method').value = "POST";
    showEdit(true);
}

function editService() {
    // fill inputs
    $('#input_method').value = "PUT";
    $('#input_service_id').value = userServicesDatatable.data[activeIndex].cells[0].innerText;
    $('#input_name').value = userServicesDatatable.data[activeIndex].cells[2].innerText;
    $('#input_description').value = userServicesDatatable.data[activeIndex].cells[3].innerText;
    $('#input_cost').value = userServicesDatatable.data[activeIndex].cells[4].innerText;
    showEdit(true);
}

function deleteService() {
    // send DELETE request
    $xhr({
        url: '/resource/service/' + userServicesDatatable.data[activeIndex].cells[0].innerText,
        method: 'DELETE',
        onSuccess: (status, xhr_data) => {
            refreshTables();
        },
        onError: (err, err_text) => {
            alert(err.code + " " + err.text + ":" + err_text);
        }
    });
}

function confirmService() {
    // send POST/PUT request
    let urlID = $('#input_service_id').value;
    if (urlID !== "") {
        urlID = "/" + urlID;
    }
    $xhr({
        url: '/resource/service' + urlID,
        method: $('#input_method').value,
        data: {
            name: $('#input_name').value,
            description: $('#input_description').value,
            cost: $('#input_cost').value
        },
        onSuccess: (status, xhr_data) => {
            refreshTables();
            clearInputs();
            showEdit(false);
        },
        onError: (err, err_text) => {
            alert(err.code + " " + err.text + ":" + err_text);
        }
    });
}

function cancelService() {
    clearInputs();
    showEdit(false);
}

refreshTables();
