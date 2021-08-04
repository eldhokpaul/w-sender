let my_number = null;

var rows = [],
    media_attached = false,
    notifications_hash = {},
    stop = false;
var messages = ['Hello! how can we help you?', 'Hello!', 'Thank you for using service!'],
    total_messages = 0;

function initReport() {
    rows = [
        ["Phone Number", "Result"]
    ];
};

function suggestion_messages() {
    var reply_div = document.getElementById("reply_div");
    if (reply_div)
        reply_div.parentNode.removeChild(reply_div);
    var smart_reply_edit_button = document.getElementById("smart_reply_edit_button");
    if (smart_reply_edit_button)
        smart_reply_edit_button.parentNode.removeChild(smart_reply_edit_button);
    var footer = document.querySelector('footer');
    if (!footer)
        return;
    footer.style.paddingTop = '33px';
    var reply_div = document.createElement("div");
    reply_div.id = 'reply_div';
    reply_div.style.position = 'absolute';
    reply_div.style.padding = '8px 12px';
    reply_div.style.top = '0';
    reply_div.style.zIndex = '1';
    reply_div.style.width = 'calc(100% - 80px)';
    $.each(messages, function (i, p) {
        var ps = p;
        if (p.length > 47)
            var ps = p.substring(0, 47) + "...";
        var dom_node = $($.parseHTML('<button class="reply_click" style="color: var(--message-primary);background-color: var(--outgoing-background);border-radius: 15px;padding: 4px 8px;font-size: 12px;margin-right: 8px;margin-bottom: 4px;" value="' + p + '">' + ps + '</button>'));
        reply_div.appendChild(dom_node[0]);
    });
    total_messages = messages.length;
    footer.appendChild(reply_div);
    footer.appendChild($($.parseHTML('<button style="position: absolute;width: 80px;right: 8px;top: 12px;color: var(--message-primary);" id="smart_reply_edit_button">Edit</button>'))[0]);

    var scrollWindow = document.getElementsByClassName("_33LGR")[0];
    if (scrollWindow)
        scrollWindow.scrollTop = scrollWindow.scrollHeight;
    var btnContainer = document.getElementById("reply_div");
    btnContainer.addEventListener("click", function (event) {
        var message = event.target.value;
        sendMessage(my_number, message);
    });
    document.getElementById("smart_reply_edit_button").addEventListener("click", function (event) {
        suggestion_popup();
    });
}

function referesh_messages() {
    var inner_div = document.getElementById("sugg_message_list");
    inner_div.innerHTML = '';
    $.each(messages, function (i, p) {
        var dom_node = $($.parseHTML('<div style="margin: 8px 0px;display: flex;"><div class="popup_list_message" style="color: var(--message-primary);background-color: var(--outgoing-background);padding: 6px 7px 8px 9px;border-radius: 7.5px;margin: 2px 0px;max-width: 400px;margin-right: 8px;cursor: pointer;overflow: auto;">' + p + '</div>' +
            '<button class="delete_message" style="border: 1px solid red;width: 18px;height: 18px;color: red;border-radius: 50%;font-size: 11px;margin-top: 8px;" value="' + p + '">X</button></div>'));
        inner_div.appendChild(dom_node[0]);
    });
    chrome.storage.local.set({
        messages: messages
    });
}

function suggestion_popup() {
    if (!document.getElementsByClassName("modal")[0]) {
        var popup = document.createElement('div');
        popup.className = 'modal';
        var modal_content = document.createElement('div');
        modal_content.className = 'modal-content';
        modal_content.style.position = 'relative';
        modal_content.style.width = '600px';
        modal_content.style.maxHeight = '450px';
        modal_content.style.overflow = 'auto';
        popup.appendChild(modal_content);
        var body = document.querySelector('body');
        body.appendChild(popup);
        modal_content.appendChild($($.parseHTML('<div style="font-weight: bold;font-size: 20px;text-align: center;margin-bottom: 24px;color: #000;">Edit/Add quick replies</div>'))[0]);
        var inner_div = document.createElement('div');
        inner_div.id = 'sugg_message_list';
        inner_div.style.height = '228px';
        inner_div.style.overflowY = 'auto';
        inner_div.style.margin = '16px 0px';
        modal_content.appendChild(inner_div);
        referesh_messages();
        modal_content.appendChild($($.parseHTML('<span id="close_edit" style="position: absolute;top: 4px;right: 12px;font-size: 20px;">&times;</span>'))[0]);
        modal_content.appendChild($($.parseHTML('<textarea style="width: 400px;height: 100px;padding: 8px;" type="text" id="add_message"> </textarea>'))[0]);
        modal_content.appendChild($($.parseHTML('<button style="background: #7bc152;border-radius: 2px;padding: 8px 12px;float: right;" id="add_message_btn">Add Template</button>'))[0]);

        modal_content.appendChild($($.parseHTML('<div style="font-size: 16px;color: black;margin: 12px auto;font-weight: bold;"><span>Powered by</span> <a href="https://elifcs.com" target="_blank" style="color: #7bc152;text-decoration: unset;font-weight: normal;"> Elif Sender</a><a href="https://elifcs.com" style="float: right;color: #C4C4C4;text-decoration: underline;font-weight: normal;">How to use?</a></div>'))[0]);

        document.getElementById("close_edit").addEventListener("click", function (event) {
            document.getElementsByClassName("modal")[0].style.display = 'none';
        });
        document.getElementById("sugg_message_list").addEventListener("click", function (event) {
            var nmessage = event.target.value;
            if (event.target.localName != 'div') {
                var index = messages.indexOf(nmessage);
                messages.splice(index, 1);
                referesh_messages();
            } else if ((event.target.localName == 'div') && (event.target.className == 'popup_list_message')) {
                document.getElementsByClassName("modal")[0].style.display = 'none';
                sendMessage(my_number, event.target.innerHTML);
            }
        });
        document.getElementById("add_message_btn").addEventListener("click", function (event) {
            var nmessage = document.getElementById("add_message").value;
            if (nmessage !== '') {
                messages.push(nmessage);
                referesh_messages();
                document.getElementById("add_message").value = '';

            }
        });
    } else {
        document.getElementsByClassName("modal")[0].style.display = 'block';
    }
}

function reload_mynumber() {
    my_number = window.localStorage.getItem("last-wid").split("@")[0].substring(1);
}

function init() {
    messageListner();
    initReport();
    window.onload = function () {
        if (window.location.host !== 'web.whatsapp.com')
            window.open("https://web.whatsapp.com", "_blank");
        else {
            reload_mynumber();
            chrome.storage.local.get(['messages'], function (result) {
                if (result.messages)
                    messages = result.messages;
            });
        }
    };
}

function messageListner() {
    chrome.runtime.onMessage.addListener(listner);
}

function listner(request, sender, sendResponse) {
    if (request.type === 'download_group')
        download_group();
    else if (request.type === 'sheet')
        process_sheet(request.data, request.message);
    else if (request.type === 'attachment')
        attachMedia(request.media_type);
    else if (request.type === 'download_report')
        download_report();
    else if (request.type === 'number_message')
        messanger(request.numbers, request.message, request.time_gap, request.csv_data, request.customization);
    else if (request.type === 'stop') {
        stop = true;
    }
}

function sendChromeMessage(message) {
    chrome.runtime.sendMessage(message);
}
async function process_sheet(data, message) {
    var numbers = [];
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            numbers.push(data[i][j]);
        }
    }
    messanger(numbers, message);
}
async function setMessages(message, csv_data) {
    var messages = [];
    for (var i = 1; i < csv_data.length; i++) {
        var temp_message = message;
        for (var j = 0; j < csv_data[0].length; j++) {
            var variable = csv_data[0][j];
            var curr_text = csv_data[i][j];
            temp_message = temp_message.replaceAll('{{' + variable + '}}', curr_text);
        }
        messages.push(temp_message);
    }
    return messages;
}

async function messanger(numbers, message, time_gap, csv_data, customization) {
    initReport();
    if (customization) {
        var messages = await setMessages(message, csv_data);
    }
    for (let i = 0; i < numbers.length; i++) {
        if (stop) {
            stop = false;
            break;
        }
        var number = numbers[i];
        number = number.replace(/\D/g, '');
        if (customization)
            message = messages[i];
        var a = null;
        if (number.length < 10) {
            rows.push([numbers[i], 'Invalid Number']);
            continue;
        }
        try {
            var curr_time_gap = time_gap;
            if (i === 0)
                curr_time_gap = 1;
            a = await openNumber(number, curr_time_gap);
        } catch (e) {
            continue
        }
        if (!a) {
            rows.push([numbers[i], 'Invalid Number']);
            continue;
        } else if (!message) {
            rows.push([numbers[i], 'Invalid Message']);
        } else if (message) {
            await sendMessage(number, message);
            rows.push([number, 'Message sent']);
        }

        if (media_attached) {
            await sendAttachment(number);
        }
    }
    media_attached = false;
    notifications_hash['type'] = 'send_notification';
    notifications_hash['title'] = 'Your messages are sent';
    notifications_hash['message'] = 'Open the extension to download the report';
    sendChromeMessage(notifications_hash);
}
async function sendAttachment(number) {
    let name = null,
        t = document.querySelector("[aria-selected='true'] img") ? document.querySelector("[aria-selected='true'] img")
        .getAttribute("src") : null;
    document.querySelector("[aria-selected='true'] [title]") ? name = document.querySelector("[aria-selected='true'] [title]")
        .getAttribute("title")
        .trim() : document.querySelector("header span[title]") && (name = document.querySelector("header span[title]")
            .getAttribute("title")
            .replace(/[^A-Z0-9]/gi, "")
            .trim());
    let n = !1;
    try {
        if (n = await openNumber(my_number)) {
            let n = document.querySelectorAll("[data-testid='forward-chat']"),
                o = n[n.length - 1];
            await o.click();
            let l = document.querySelectorAll("[data-animate-modal-body='true'] div[class=''] > div div[tabindex='-1']");
            var attachment_sent = false;
            for (let n = 0; n < l.length; n++) {
                if (l[n].querySelector("span[dir='auto']")) {
                    let o = l[n].querySelector("span[dir='auto']"),
                        s = l[n].querySelector("span[dir='auto']").title.trim();
                    if (s === name || s.replace(/[^A-Z0-9]/gi, "")
                        .trim() === name) {
                        let e = !t || !l[n].querySelector("img") || l[n].querySelector("img").src === t;
                        if (!e) continue;
                        attachment_sent = true;
                        await sendMedia(o), document.querySelector("[data-icon='send']").click();
                        rows.push([number, 'attachment sent']);
                        break
                    }
                }
            }
            if (!attachment_sent)
                rows.push([number, 'attachment failed']);
        }
    } catch (e) {
        console.log(e, "ERROR");
        rows.push([number, 'attachment failed']);
    }
}

async function sendMedia(e) {
    return new Promise(t => {
        setTimeout(function () {
            e.click(), t()
        }, 500)
    })
}
async function openNumber(number) {
    openNumber(number, 1);
}

async function openNumber(number, time_gap) {
    if (!time_gap)
        time_gap = 3;
    return new Promise(t => {
        openNumberTab(number)
            .then(() => {
                setTimeout(async function () {
                    let e = !1;
                    e = await hasOpened(), t(e)
                }, (time_gap * 1000))
            })
    })
}

async function openNumberTab(number) {
    return new Promise(t => {
        let n = document.getElementById("whatsapp-message-sender");
        n || ((n = document.createElement("a"))
            .id = "whatsapp-message-sender", document.body.append(n)), n.setAttribute("href", `https://api.whatsapp.com/send?phone=${number}`), setTimeout(() => {
            n.click(), t()
        }, 500)
    });
}

async function eventFire(e, t) {
    var n = document.createEvent("MouseEvents");
    return n.initMouseEvent(t, !0, !0, window, 0, 0, 0, 0, 0, !1, !1, !1, !1, 0, null), new Promise(function (t) {
        var o = setInterval(function () {
            document.querySelector('span[data-icon="send"]') && (e.dispatchEvent(n), t((clearInterval(o), "BUTTON CLICKED")))
        }, 500)
    })
}

async function hasOpened() {
    let e = !0;
    return await waitTillWindow(), document.querySelector('[data-animate-modal-popup="true"]') && (e = !1), e
}

async function waitTillWindow() {
    document.querySelector('[data-animate-modal-popup="true"]') && !document.querySelector('[data-animate-modal-body="true"]')
        .innerText.includes("invalid") && setTimeout(async function () {
            await waitTillWindow()
        }, 500)
}

function sendMessage(number, message) {
    if (!message)
        return;
    messageBox = document.querySelectorAll("[contenteditable='true']")[1], event = document.createEvent("UIEvents"), messageBox.innerHTML = message.replace(/ /gm, " "), event.initUIEvent("input", !0, !0, window, 1), messageBox.dispatchEvent(event), eventFire(document.querySelector('span[data-icon="send"]'), "click")
}

function download_report() {
    let s = "data:text/csv;charset=utf-8," + rows.map(e => e.join(","))
        .join("\n");
    var o = encodeURI(s),
        l = document.createElement("a");
    l.setAttribute("href", o), l.setAttribute("download", "report.csv"), document.body.appendChild(l), l.click()
};

async function download_group() {
    var e = document.querySelector('div[title="Search…"]')
        .parentElement.parentElement.parentElement.parentElement.children[1].lastElementChild.textContent,
        t = document.querySelector('div[title="Search…"]')
        .parentElement.parentElement.parentElement.parentElement.children[1].firstElementChild.textContent;
    if ("online" === e || "typing..." === e || "check here for contact info" === e || "" === e || e.includes("last seen"));
    else {
        var n = [
            ["Numbers"]
        ];
        e.split(", ")
            .forEach(e => {
                if (e && e.includes("+"))
                    e = e.substring(1);
                arr = [], arr.push(e), n.push(arr)
            });
        let s = "data:text/csv;charset=utf-8," + n.map(e => e.join(","))
            .join("\n");
        var o = encodeURI(s),
            l = document.createElement("a");
        l.setAttribute("href", o), l.setAttribute("download", t + ".csv"), document.body.appendChild(l), l.click()
    }
}

async function clickOnElements(e) {
    let t = document.createEvent("MouseEvents");
    t.initEvent("mouseover", !0, !0);
    const n = document.querySelector(e)
        .dispatchEvent(t);
    t.initEvent("mousedown", !0, !0);
    const o = document.querySelector(e)
        .dispatchEvent(t);
    t.initEvent("mouseup", !0, !0);
    const l = document.querySelector(e)
        .dispatchEvent(t);
    t.initEvent("click", !0, !0);
    const s = document.querySelector(e)
        .dispatchEvent(t);
    return n ? new Promise(e => {
        e()
    }) : await clickOnElements(e)
}
async function clickMediaIcon(e) {
    let t = null;
    "pv" === e ? t = '[data-icon="attach-image"]' : "doc" === e ? t = '[data-icon="attach-document"]' : "cn" === e && (t = '[data-icon="attach-contact"]'), t && await clickOnElements(t)
}

async function attachMedia(type) {
    if (!my_number)
        reload_mynumber();
    try {
        hasOpenedSelf = await openNumber(my_number), await clickOnElements('[data-testid="clip"] svg'), await clickMediaIcon(type);
    } catch (e) {
        console.log(type, "ERROR")
    }
    media_attached = true;
    setTimeout(function () {
        notifications_hash['type'] = 'send_notification';
        notifications_hash['title'] = 'First message is always sent to you';
        notifications_hash['message'] = "Now open the extension and click on 'Send Message'";
        sendChromeMessage(notifications_hash);
    }, 5000);
}

init();