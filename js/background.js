// (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
//     (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
//     m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
// })(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // Note: https protocol here

// ga('create', 'UA-190269211-1', 'auto'); // Enter your GA identifier
// ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
// ga('require', 'displayfeatures');

var notifications = {
    type: "basic",
    iconUrl: "logo/large.png",
    title: "Elif Sender is installed",
    message: "Click to view more."
};

chrome.runtime.onInstalled.addListener((async function(e) {
    send_notification("Elif Sender is installed", '');
}));

chrome.runtime.setUninstallURL("https://Elifcs");

function messageListner() {
    chrome.runtime.onMessage.addListener(listner);
}

function listner(request, sender, sendResponse){
    if(request.type === 'send_notification')
        send_notification(request.title, request.message);
    // if(request.type === 'ga') {
    //     ga('send', 'event', request.event, request.track);
    // }
}

function send_notification(title, message) {
    notifications['title'] = title;
    notifications['message'] = message;
    try {
        chrome.notifications.create(notifications, (function(e) {}))
    } catch (e) {}
}

function bcdinit() {
    messageListner();
}

bcdinit();