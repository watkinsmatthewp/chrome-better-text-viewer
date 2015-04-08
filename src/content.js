// Run on page load
chrome.runtime.sendMessage({
    localstorage : "sync"
}, run);
// chrome.webRequest.onHeadersReceived.addListener(function() {alert('Headers received');});

function run() {
    var ext = getExtensionFromUrl(window.location.href);
    var codeMode = getModeForExtension(ext);
    console.log('Ext is ' + ext + ' and code mode is ' + codeMode);

    var bodyElement = $('body');
    if (bodyElement != null) {
        var bodyNodes = bodyElement.contents();
        if (bodyNodes.length > 0) {
            var contentsToChangeToCode = null;
            var firstNode = bodyNodes[0];
            if (bodyNodes.length == 1) {
                if (firstNode.nodeName == '#text') {
					var head = $('head');
					if (head != null && head.children().length > 0) {
						// Yes, the body only has text but the head has content, so it's probably not safe to hijack it
						return;
					}
                    applyEditor(bodyElement, codeMode, bodyElement.html());
                } else if (firstNode.nodeName == 'PRE') {
					applyEditor(bodyElement, codeMode, firstNode.innerText);
                }
            } else if (firstNode.nodeName == '#text' && codeMode != 'plain-text') {
                applyEditor(bodyElement, codeMode, bodyElement.html());
            }
        }
    }
}

function getExtensionFromUrl(url) {
    var ext = null;
    if (url != null && url.length > 0) {
        var urlParts = url.split('?')[0].split('/');
        if (urlParts.length > 0) {
            var lastUrlPiece = urlParts[urlParts.length - 1].split('#')[0];
            if (lastUrlPiece.indexOf('.') >= 0) {
                var dotPieces = lastUrlPiece.split('.');
                ext = dotPieces[dotPieces.length - 1];
            }
        }
    }
    return ext;
}

function getModeForExtension(ext) {
    var mode = 'plain-text';
    if (ext != null) {
        ext = ext.trim().toLowerCase();
        switch (ext) {
        case 'xml':
        case 'csproj':
            mode = 'xml';
            break;
        case 'html':
            mode = 'html';
            break;
        case 'cshtml':
        case 'aspx':
            mode = 'htmlmixed';
            break;
        case 'cs':
        case 'java':
        case 'c':
            mode = 'clike';
            break;
        case 'sql':
            mode = 'sql'
                break;
        case 'js':
        case 'json':
            mode = 'javascript';
            break;
        case 'css':
            mode = 'css';
            break;
        default:
            break;
        }
    }

    return mode;
}

function applyEditor(bodyElement, codeMode, content) {
    chrome.extension.sendRequest({
        method : "getSettings"
    }, function (settings) {
        // var editor = CodeMirror(document.body, {value: content});
        var editor = CodeMirror(function (codeEditorElement) {
                bodyElement.html(codeEditorElement)
            }, {
                value : content,
                lineNumbers : true,
                fullScreen : true,
                mode : 'plain-text',
                lineWrapping : settings.doLineWrap,
                mode : codeMode,
                useCPP : (codeMode == "clike")
            });
        applyStyleFromSettings(settings);
    });
}

function applyStyleFromSettings(settings) {
    // Settings overrides
    if (settings.fontFamily != 'monospace' || settings.fontSize > 0) {
        if (settings.fontFamily != 'monospace' && settings.fontSize > 0) {
            // override both properties
            $('.CodeMirror').css('font-family', settings.fontFamily).css('font-size', settings.fontFamily);
        } else {
            if (settings.fontFamily != 'monospace') {
                $('.CodeMirror').css('font-family', settings.fontFamily);
            } else {
                $('.CodeMirror').css('font-size', settings.fontSize + 'px');
            }
        }
    }
}
