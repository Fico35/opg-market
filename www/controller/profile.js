document.getElementsByClassName("navbar-top")[0].children[5].className += " active";

activeIndex = -1;
activeTable = "";

disableEditAndDelete("vegetable", true);
disableEditAndDelete("service", true);

let userVegetablesDatatable = new simpleDatatables.DataTable("#user_vegetables", {
    columns: [
        {
            select: [0, 1],
            hidden: true
        },
        {
            select: [0, 3, 4],
            type: "number"
        }
    ],
    data: {
        headings: [
            "ID",
            "OPG",
            "Naziv",
            "Količina (kg)",
            "Cijena (HRK)",
            "Cijena po 1 kg (HRK)"
        ]
    },
    labels: defaultDatatableLabels
});

function refreshUserVegetables() {
    $xhr({
        url: "/resource/user/" + getCookie("user_id") + "/vegetables",
        method: "GET",
        onSuccess: (status, xhr_data) => {
            let rows = JSON.parse(xhr_data);
            userVegetablesDatatable.destroy();
            userVegetablesDatatable.init();
            userVegetablesDatatable.insert({data:rows});
        },
    });
}

let userServicesDatatable = new simpleDatatables.DataTable("#user_services", {
    columns: [
        {
            select: [0, 1],
            hidden: true
        },
        {
            select: [0, 4],
            type: "number"
        }
    ],
    data: {
        headings: [
            "ID",
            "OPG",
            "Naziv",
            "Opis",
            "Cijena (HRK)"
        ]
    },
    labels: defaultDatatableLabels
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

$('#user_vegetables').addEventListener("click", (e) => {
    let clickedRow = null;
    if (e.target.nodeName === "TD") {
        if (e.target.nodeName.className != null && e.target.nodeName.className.search("dataTables-empty") === -1) {
            return false;
        }
        clickedRow = e.target.parentNode;
    } else if (e.target.nodeName === "TR") {
        clickedRow = e.target;
    }
    for (let row of userVegetablesDatatable.activeRows) {
        row.className = row.className.replace("active", "").trim();
    }
    for (let row of userServicesDatatable.activeRows) {
        row.className = row.className.replace("active", "").trim();
    }
    if (clickedRow.dataIndex === activeIndex && activeTable === "vegetables") {
        activeIndex = -1;
        activeTable = "";
        disableEditAndDelete("vegetable", true);
    } else {
        clickedRow.className += " active";
        activeIndex = clickedRow.dataIndex;
        activeTable = "vegetables";
        disableEditAndDelete("vegetable", false);
        disableEditAndDelete("service", true);
    }
});

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
    for (let row of userVegetablesDatatable.activeRows) {
        row.className = row.className.replace("active", "").trim();
    }
    for (let row of userServicesDatatable.activeRows) {
        row.className = row.className.replace("active", "").trim();
    }
    if (clickedRow !== null) {
        if (clickedRow.dataIndex === activeIndex && activeTable === "services") {
            activeIndex = -1;
            activeTable = "";
            disableEditAndDelete("service", true);
        } else {
            clickedRow.className += " active";
            activeIndex = clickedRow.dataIndex;
            activeTable = "services";
            disableEditAndDelete("service", false);
            disableEditAndDelete("vegetable", true);
        }
    }
});

function showContainer(name) {
    $('#vegetable_service_list').style.display = (name === "list" ? "flex" : "none");
    $('#vegetable_edit').style.display = (name === "vegetable" ? "flex" : "none");
    $('#service_edit').style.display = (name === "service" ? "flex" : "none");
}

function disableEditAndDelete(table, yes) {
    $('#btn_edit_' + table).disabled = yes;
    $('#btn_delete_' + table).disabled = yes;
}

function clearInputs() {
    $('#input_vegetable_id').value = null;
    $('#input_vegetable_name').value = null;
    $('#input_vegetable_amount').value = null;
    $('#input_vegetable_cost').value = null;
    $('#input_service_id').value = null;
    $('#input_service_name').value = null;
    $('#input_service_description').value = null;
    $('#input_service_cost').value = null;
}

function refreshTables() {
    activeIndex = -1;
    disableEditAndDelete("vegetable", true);
    disableEditAndDelete("service", true);
    refreshUserVegetables();
    refreshUserServices();
}

function createVegetable() {
    clearInputs();
    $('#input_vegetable_method').value = "POST";
    showContainer("vegetable");
}

function editVegetable() {
    // fill inputs
    $('#input_vegetable_method').value = "PUT";
    $('#input_vegetable_id').value = userVegetablesDatatable.data[activeIndex].cells[0].innerText;
    $('#input_vegetable_name').value = userVegetablesDatatable.data[activeIndex].cells[2].innerText;
    $('#input_vegetable_amount').value = userVegetablesDatatable.data[activeIndex].cells[3].innerText;
    $('#input_vegetable_cost').value = userVegetablesDatatable.data[activeIndex].cells[4].innerText;
    showContainer("vegetable");
}

function deleteVegetable() {
    // send DELETE request
    $xhr({
        url: '/resource/vegetable/' + userVegetablesDatatable.data[activeIndex].cells[0].innerText,
        method: 'DELETE',
        onSuccess: (status, xhr_data) => {
            refreshTables();
        },
        onError: (err, err_text) => {
            alert(err.code + " " + err.text + ":" + err_text);
        }
    });
}

function confirmVegetable() {
    // send POST/PUT request
    let urlID = $('#input_vegetable_id').value;
    if (urlID !== "") {
        urlID = "/" + urlID;
    }
    $xhr({
        url: '/resource/vegetable' + urlID,
        method: $('#input_vegetable_method').value,
        data: {
            name: $('#input_vegetable_name').value,
            amount: $('#input_vegetable_amount').value,
            cost: $('#input_vegetable_cost').value
        },
        onSuccess: (status, xhr_data) => {
            refreshTables();
            clearInputs();
            showContainer("list");
        },
        onError: (err, err_text) => {
            alert(err.code + " " + err.text + ":" + err_text);
        }
    });
}

function cancelVegetable() {
    clearInputs();
    showContainer("list");
}

function createService() {
    clearInputs();
    $('#input_service_method').value = "POST";
    showContainer("service");
}

function editService() {
    // fill inputs
    $('#input_service_method').value = "PUT";
    $('#input_service_id').value = userServicesDatatable.data[activeIndex].cells[0].innerText;
    $('#input_service_name').value = userServicesDatatable.data[activeIndex].cells[2].innerText;
    $('#input_service_description').value = userServicesDatatable.data[activeIndex].cells[3].innerText;
    $('#input_service_cost').value = userServicesDatatable.data[activeIndex].cells[4].innerText;
    showContainer("service");
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
        method: $('#input_service_method').value,
        data: {
            name: $('#input_service_name').value,
            description: $('#input_service_description').value,
            cost: $('#input_service_cost').value
        },
        onSuccess: (status, xhr_data) => {
            refreshTables();
            clearInputs();
            showContainer("list");
        },
        onError: (err, err_text) => {
            alert(err.code + " " + err.text + ":" + err_text);
        }
    });
}

function cancelService() {
    clearInputs();
    showContainer("list");
}

refreshTables();
