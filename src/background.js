'use strict';

var _activeHeadersByTabID = {};

/*
 * Handle headers as they come in
 */
chrome.webRequest.onHeadersReceived.addListener(
	function(info) {
        if (parseInt(info.tabId, 10) > 0) {
            _activeHeadersByTabID[info.tabId] = info;
        }
    },
    {
        urls: ['http://*/*', 'https://*/*'],
        types: ['main_frame']
    },
    ['responseHeaders']
);

/*
 * Message listener
 */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var response = {};
    if (request.msg === 'startListening' && typeof sender.tab !== 'undefined' && parseInt(sender.tab.id, 10) > 0) {
        // Grab the headers and toss them back to content.js
		chrome.tabs.sendRequest(sender.tab.id, {
			msg: 'headersReceived',
			headers: _activeHeadersByTabID[sender.tab.id]
		});
    } else if (request.msg === 'getSettings' ) {
        response = getSettings();
    }
    sendResponse(response);
});

/**
 * When a tab closes, get rid of its headers from the active collection
 */
chrome.tabs.onRemoved.addListener(function(tabId) {
    delete _activeHeadersByTabID[tabId];
});

/*
 * Finds settings in local storage
 */
function getSettings() {
    var settingsString = localStorage["btvSettings"];

    var settings;
    if (settingsString == null || settingsString == '' || settingsString == 'undefined') {
        settings = {
            doLineWrap: false,
            fontFamily: 'monospace',
            fontSize: 0
        };
        setSettings(settings);
    } else {
        settings = JSON.parse(settingsString);
    }

    return settings;
}

/*
 * Sets settings in local storage
 */
function setSettings(settings) {
    localStorage["btvSettings"] = JSON.stringify(settings);
}