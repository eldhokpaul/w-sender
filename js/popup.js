// Elif messaging tool for whatsapp
var csv_data = [];

$(function () {
    init();
});

function initvars() {
    chrome.storage.local.get(['popup_numbers', 'popup_message', 'popup_send_attachments', 'popup_attachment_type', 'time_gap', 'file_name', 'csv_data', 'customization', 'schedule_time'], function (result) {
        if (result.popup_numbers !== undefined) {
            document.querySelector("textarea#numbers").value = result.popup_numbers;
        }
        if (result.popup_message !== undefined) {
            document.querySelector("textarea#message").value = result.popup_message;
        }
        if (result.schedule_time !== undefined) {
            console.log(result.schedule_time);
            document.querySelector("#schedule_time").value = result.schedule_time;
        }
        if (result.popup_send_attachments !== undefined) {
            document.querySelector("#send_attachments").checked = result.popup_send_attachments;
            send_attachments_trigger();
            if (result.popup_send_attachments && (result.popup_attachment_type !== undefined)) {
                document.querySelector("#" + result.popup_attachment_type).checked = true;
            }
        }
        if (result.time_gap !== undefined && result.time_gap !== "")
            document.querySelector("#time_gap").value = result.time_gap;
        else
            document.querySelector("#time_gap").value = "3";
        if ((result.file_name !== undefined) || (result.file_name !== '')) {
            file_data_style(result.file_name);
            csv_data = result.csv_data;
            if (csv_data) {
                var column_headers = csv_data[0];
                $('#customized_arr').empty();
                $('#customized_arr').append($('<option disabled selected></option>').val('Select Option').html('Select Option'));
                $.each(column_headers, function (i, p) {
                    $('#customized_arr').append($('<option></option>').val(p).html(p));
                });
            }
        }
    });
}

function init() {
    checkVisit();
    initvars();
    getMessage();
}

function checkVisit() {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function (tabs) {
        var url = tabs[0].url;
        if (url !== "https://web.whatsapp.com" && url !== "https://web.whatsapp.com/")
            window.open("https://web.whatsapp.com", "_blank");
    });
};

function sendMessageToBackground(message) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}

function show_error(error) {
    document.getElementById("error_message").style.display = 'block';
    document.getElementById("error_message").innerText = error;
}

function reset_error() {
    document.getElementById("error_message").innerText = '';
    document.getElementById("error_message").style.display = 'none';
}

function messagePreparation() {
    reset_error();
    var numbers_str = document.querySelector("textarea#numbers").value;
    var message = document.querySelector("textarea#message").value;
    var time_gap = document.querySelector("#time_gap").value;
    var customization = $("#customization").is(":checked");
    var time_gap = parseInt(time_gap);
    var numbers = numbers_str.replace(/\n/g, ",").split(",");
    var attachment = document.querySelector("#send_attachments").checked;
    if (!numbers_str || (!message && !attachment)) {
        if (!numbers_str)
            show_error("Numbers can't be blank");
        if (!message && !attachment)
            show_error("Message can't be blank");
        return;
    }
    sendMessageToBackground({
        type: 'number_message',
        numbers: numbers,
        message: message,
        time_gap: time_gap,
        csv_data: csv_data,
        customization: customization
    });
    if (attachment) {
        document.querySelector("#send_attachments").checked = false;
        send_attachments_trigger();
    }
}

function processExcel(data) {
    var workbook = XLSX.read(data, {
        type: 'binary'
    });

    var firstSheet = workbook.SheetNames[0];
    var data = to_json(workbook);
    return data
};

function to_json(workbook) {
    var result = {};
    workbook.SheetNames.forEach(function (sheetName) {
        var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
            header: 1
        });
        if (roa.length) result[sheetName] = roa;
    });
    return JSON.stringify(result, 2, 2);
};

function process_sheet_data(evt) {
    var f = evt.target.files[0];

    if (f) {
        var r = new FileReader();
        r.onload = e => {
            var data = processExcel(e.target.result);
            data = JSON.parse(data);
            data = data[Object.keys(data)[0]];
            if (data && data.length > 0) {
                csv_data = data;
                var numbers = '';
                var column_headers = data[0];
                for (var i = 1; i < data.length; i++) {
                    if (data[i][0]) {
                        numbers += data[i][0];
                        if (i !== (data.length - 1))
                            numbers += ',';
                    }
                }
                document.getElementById("numbers").value = numbers;
                $('#customized_arr').empty();
                $('#customized_arr').append($('<option disabled selected></option>').val('Select Option').html('Select Option'));
                $.each(column_headers, function (i, p) {
                    $('#customized_arr').append($('<option></option>').val(p).html(p));
                });
                chrome.storage.local.set({
                    csv_data: data
                });
                chrome.storage.local.set({
                    popup_numbers: numbers
                });
                console.log('Imported -' + data.length + '- rows successfully!');
            } else {
                console.log('No data to import!');
            }
        };
        r.readAsBinaryString(f);
    } else {
        console.log("Failed to load file");
    }
}

function file_data_style(file_name) {
    if (file_name) {
        var elem = document.getElementById('uploaded_csv');
        elem.innerText = file_name.substring(0, 32);
        elem.cursor = 'pointer';
        var button = document.createElement("button");
        button.innerHTML = 'x';
        Object.assign(button.style, {
            "border": "1px solid #C4C4C4",
            "color": "#C4C4C4",
            "padding": "0px 4px",
            "margin-left": "4px",
            "border-radius": "50%"
        });
        elem.appendChild(button);
        document.querySelector('textarea#numbers').disabled = true;
        document.getElementById("number_disable_message").style.display = 'block';
        document.querySelector("#customization").checked = true;
        chrome.storage.local.set({
            file_name: file_name
        });
    }
}

function getMessage() {
    $('#sender').click(function () {
        messagePreparation();
    });
    $('#download_group').click(function () {
        sendMessageToBackground({
            type: 'download_group'
        });
    });
    $("#csv").on("change", function (e) {
        var file = document.getElementById("csv").files[0];
        if (file)
            file_data_style(file.name);
        process_sheet_data(e);
    });
    $("#send_attachments").on("change", function () {
        send_attachments_trigger();
    });
    $('#attachment_info').click(function () {
        document.getElementById("attachment_popup").style.display = 'block';
    });
    $('#attachment_popup_okay').click(function () {
        document.getElementById("attachment_popup").style.display = 'none';
    });
    $("#attachment_type input").on("change", function (e) {
        var value = e.target.value;
        sendMessageToBackground({
            type: 'attachment',
            media_type: e.target.value
        });
        chrome.storage.local.set({
            popup_attachment_type: value
        });
    });
    $('#report').click(function () {
        sendMessageToBackground({
            type: 'download_report'
        });
    });
    $("#numbers").on("change", function (e) {
        var numbers = document.querySelector("textarea#numbers").value;
        chrome.storage.local.set({
            popup_numbers: numbers
        });
    });
    $("#message").on("change", function (e) {
        var message = document.querySelector("textarea#message").value;
        chrome.storage.local.set({
            popup_message: message
        });
    });
    $("#time_gap").on("change", function (e) {
        var time_gap = document.querySelector("#time_gap").value;
        chrome.storage.local.set({
            time_gap: time_gap
        });
    });
    $("#customization").on("change", function (e) {
        var customization = document.querySelector("#customization").checked;
        chrome.storage.local.set({
            customization: customization
        });
    });
    $("#customized_arr").on("change", function (e) {
        var val = document.querySelector("#customized_arr").value;
        var message = document.querySelector("textarea#message").value;
        message += " {{" + val + "}}";
        document.querySelector("textarea#message").value = message;
        chrome.storage.local.set({
            popup_message: message
        });
    });
    $('#uploaded_csv').click(function () {
        document.querySelector('#csv').value = '';
        document.querySelector('textarea#numbers').disabled = false;
        document.getElementById("number_disable_message").style.display = 'none';
        document.getElementById('uploaded_csv').innerHTML = '';
        chrome.storage.local.set({
            csv_data: [],
            file_name: ''
        });
        chrome.storage.local.get(['file_name'], function (result) {
            console.log(result.file_name)
        });
    });
    $("#stop").click(function () {
        sendMessageToBackground({
            type: 'stop'
        });
    });
}

function download_group() {
    sendMessageToBackground({
        type: 'download_group'
    });
}

function send_attachments_trigger() {
    var checked = $("#send_attachments").is(":checked");
    var style = checked ? "flex" : "none";
    document.getElementById("attachment_type").style.display = style;
    chrome.storage.local.get(['popup_attachment_type', 'popup_send_attachments'], function (result) {
        if (!checked && result.popup_attachment_type !== undefined) {
            document.querySelector("#" + result.popup_attachment_type).checked = false;
        }
        if (result.popup_send_attachments === undefined) {
            document.getElementById("attachment_popup").style.display = style;
        }
    });
    chrome.storage.local.set({
        popup_send_attachments: checked
    });

}