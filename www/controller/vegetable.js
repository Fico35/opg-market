document.getElementsByClassName("navbar-top")[0].children[2].className += " active";
activeIndex = -1;

disableEditAndDelete(true);

let userVegetablesDatatable = new simpleDatatables.DataTable("#user_vegetables", {
    columns: [
        {
            select: [0, 1],
            hidden: true
        },
        {
            select: [0, 3, 4],
            type: "number"
        },
    ],
    data: {
        headings: [
            "ID",
            "OPG",
            "Naziv",
            "Količina (kg)",
            "Cijena (HRK)",
            "Cijena po 1 kg (HRK)"
        ],
    },
    labels: defaultDatatableLabels,
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

let allVegetablesDatatable = new simpleDatatables.DataTable("#all_vegetables", {
    columns: [
        {
            select: 0,
            hidden: true
        },
        {
            select: [0, 3, 4, 5],
            type: "number"
        },
    ],
    data: {
        headings: [
            "ID",
            "OPG",
            "Naziv",
            "Količina (kg)",
            "Cijena (HRK)",
            "Cijena po 1 kg (HRK)"
        ],
    },
    labels: defaultDatatableLabels,
});

function refreshAllVegetables() {
    $xhr({
        url: "/resource/vegetables",
        method: "GET",
        onSuccess: (status, xhr_data) => {
            let rows = JSON.parse(xhr_data);
            allVegetablesDatatable.destroy();
            allVegetablesDatatable.init();
            allVegetablesDatatable.insert({data:rows});
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
    if (clickedRow.dataIndex === activeIndex) {
        activeIndex = -1;
        disableEditAndDelete(true);
    } else {
        clickedRow.className += " active";
        activeIndex = clickedRow.dataIndex;
        disableEditAndDelete(false);
    }
});

function showEdit(yes) {
    $('#vegetable_list').style.display = (yes ? "none" : "flex");
    $('#vegetable_edit').style.display = (yes ? "flex" : "none");
}

function disableEditAndDelete(yes) {
    $('#btn_edit').disabled = yes;
    $('#btn_delete').disabled = yes;
}

function clearInputs() {
    $('#input_vegetable_id').value = null;
    $('#input_name').value = null;
    $('#input_amount').value = null;
    $('#input_cost').value = null;
}

function refreshTables() {
    activeIndex = -1;
    disableEditAndDelete(true);
    refreshUserVegetables();
    refreshAllVegetables();
}

function createVegetable() {
    clearInputs();
    $('#input_method').value = "POST";
    showEdit(true);
}

function editVegetable() {
    // fill inputs
    $('#input_method').value = "PUT";
    $('#input_vegetable_id').value = userVegetablesDatatable.data[activeIndex].cells[0].innerText;
    $('#input_name').value = userVegetablesDatatable.data[activeIndex].cells[2].innerText;
    $('#input_amount').value = userVegetablesDatatable.data[activeIndex].cells[3].innerText;
    $('#input_cost').value = userVegetablesDatatable.data[activeIndex].cells[4].innerText;
    showEdit(true);
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
        method: $('#input_method').value,
        data: {
            name: $('#input_name').value,
            amount: $('#input_amount').value,
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

function cancelVegetable() {
    clearInputs();
    showEdit(false);
}

refreshTables();
