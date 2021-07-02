//console.log("background Script")

const updateCountBadge = (tabId) => {
    chrome.tabs.get(tabId, async (tab) => {
        //console.log(tab.url)

        chrome.storage.local.get([tab.url], function (notes) {
            notes = notes[tab.url]
            //console.log(notes)
            if (notes) {
                chrome.browserAction.setBadgeText({
                    tabId: tabId,
                    text: notes.length.toString()
                });
            } else {
                chrome.browserAction.setBadgeText({
                    tabId: tabId,
                    text: '0'
                });
            }


        })

    });
}

chrome.tabs.onActivated.addListener((activeInfo) => {


    //console.log(activeInfo)

    setTimeout(() => {
        updateCountBadge(activeInfo.tabId)
    }, 100);


});
chrome.tabs.onUpdated.addListener((tabId) => {

    //console.log(tabId)

    setTimeout(() => {
        updateCountBadge(tabId)
    }, 100);

});

chrome.runtime.onMessage.addListener(notify);
function notify(message) {
    if (message.type === "updateBatch") {
        chrome.tabs.query(
            { currentWindow: true, active: true },
            function (tabArray) { updateCountBadge(tabArray[0].id); }
        );
    }
}
