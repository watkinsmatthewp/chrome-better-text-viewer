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
        var children = bodyElement.children();
        if (children.length == 0) {
            return bodyElement;
        } else if (children[0].nodeName == 'PRE') {
            return children[0];
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
    
    // Add a rating div to the top-right corner
    addRatingFloater(settings);
}

function addRatingFloater(settings) {
    var now = new Date();
    if (now < settings.nextRatingPromptDate) {
        // Build the ratings box
        $('<div id="ratingsBox">'
            + '<h4 id="ratingsBoxHeader">Do you l<span id="heart">♥</span>ve Better Text Viewer?</h4>'
            + '<hr id="ratingsBoxHr"/>'
            + '<p id="ratingsBoxMessage">If you think this extension is awesome, show your love by heading over to the Chrome webstore and rating it!</p>'
            + '<table id="ratingsBoxButtonTable">'
                + '<tr>'
                    + '<td id="ratingsBoxButtonLeftCell">'
                        + '<input id="btnRateNever" type="button" value="Never"></input>'
                    + '</td>'
                    + '<td id="ratingsBoxButtonRightCell">'
                        + '<input id="btnRateLater" type="button" value="Maybe Later"></input> '
                        + '<input id="btnRateNow" type="button" value="Sure!"></input>'
                    + '</td>'
                + '</tr>'
            + '</table>'
        + '</div>').appendTo($('body') || $(document));
        
        // Style the rest of the elements
        $('#ratingsBoxHeader').css({
            'font-family': 'Arial',
            'margin': '.5em 0 1em 0'
        });
        $('#heart').css({
            'color': 'red',
            'font-weight': 'bold'
        });
        $('#ratingsBoxMessage').css({
            'font-family': 'Arial'
        });
        $('#ratingsBoxButtonTable').css({
            'width': '100%',
            'border': 'none'
        });
        $('#ratingsBoxButtonRightCell').css({
            'text-align': 'right' 
        });
        
        // Attach events to the buttons
        $('#btnRateNever').click(function() {
            chrome.extension.sendRequest({
                msg : "setNextRatingPromptDate",
                days: -1
            }, function () {
                alert('Aw, you cut me to the quick!');
                $('#ratingsBox').hide();
            });
        });
        $('#btnRateLater').click(function() {
            chrome.extension.sendRequest({
                msg : "setNextRatingPromptDate",
                days: 7
            }, function () {
                $('#ratingsBox').hide();
            });
        });
         $('#btnRateNow').click(function() {
            chrome.extension.sendRequest({
                msg : "setNextRatingPromptDate",
                days: -1
            }, function () {
                window.open('https://chrome.google.com/webstore/detail/better-text-viewer/lcaidopdffhfemoefoaadecppnjdknkc/reviews', '_blank');
                $('#ratingsBox').hide();
            });
        });
        
        // Style the ratings box (bringing it forward)
        $('#ratingsBox').css({
            'z-index': 8999,
            'position': 'absolute',
            'right': '40px',
            'top': '20px',
            'width': '360px',
            'padding': '.5em 1em .5em 1em',
            'border': '1px solid gray',
            'background-color': 'white',
            'border-radius': '4px'
         });
        
        // Show the box
        $('#ratingsBox').show();
    }
}