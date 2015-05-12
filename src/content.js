'use strict';

/*
 * Tell background.js to start listening for headers
 */
 chrome.extension.sendRequest({
    msg: 'startListening'
});

/*
 * Message listener
 */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    var contentType = null;
	if (request.msg === 'headersReceived' && request.headers != null && request.headers.responseHeaders.length > 0) {
		for (var i = 0; i < request.headers.responseHeaders.length; i++) {
			var header = request.headers.responseHeaders[i];
			if (header.name == 'Content-Type') {
				contentType = header.value.substring(0, header.value.indexOf(';'));
			}
		}
    }
    sendResponse({});
    
    var bodyElement = $('body');
    var prettyPrintableElement = getPrettyPrintableElement(bodyElement);
    
    if (prettyPrintableElement != null) {
        var extension = getExtensionFromUrl(document.location.href);
        if (extension != null) {
            if (/.+\/json/i.test(contentType)) {
        		 // Override to JSON
        		 extension = 'json';
        	 } else if (/.+\/xml/i.test(contentType)) {
        		 // Override to XML
        		 extension = 'xml';
        	 }
        }
        var editorMode =  getModeForExtension(extension);
        // console.log('Pretty printing the ' + prettyPrintableElement.nodeName + ' element with extension ' + extension + ' (mode ' + editorMode + ')');
        applyEditor(bodyElement == null ? document : bodyElement, editorMode, prettyPrintableElement.innerText);
    }
});

/*
 * Finds the element to pretty print (if any)
 */
function getPrettyPrintableElement(bodyElement) {
	if (bodyElement == null) {
		return document;
	} else {
        var children = bodyElement.contents();
        if (children.length == 0) {
            return bodyElement;
        } else if (children[0].nodeName == 'PRE') {
            return children[0];
        } else if (children[0].nodeName == '#text' && children[0].nodeValue.trim().length > 0) {
            return bodyElement;
        }
        
        return null;
    }
}

/*
 * Extracts the file extension from the URL
 */ 
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

/*
 * Converts the extension to the proper editor language mode
 */ 
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
            mode = 'sql';
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

/*
 * Applies the editor to the specified element
 */ 
function applyEditor(containerElement, codeMode, content) {
    chrome.extension.sendRequest({
        msg : "getSettings"
    }, function (settings) {
        // var editor = CodeMirror(document.body, {value: content});
        var editor = CodeMirror(function (codeEditorElement) {
                containerElement.html(codeEditorElement)
            }, {
                value : content,
                readOnly: true,
                lineNumbers : true,
                fullScreen : true,
                lineWrapping : settings.doLineWrap,
                mode : codeMode,
                useCPP : (codeMode == "clike")
            });
        applyStyleFromSettings(settings);
    });
}

/*
 * Styles the editor according to the user settings
 */ 
function applyStyleFromSettings(settings) {
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