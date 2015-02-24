// Run on page load
chrome.runtime.sendMessage({localstorage: "sync"}, run);
// chrome.webRequest.onHeadersReceived.addListener(function() {alert('Headers received');});


function run()
{
	var htmlElement = $('html');
	if (htmlElement != null)
	{
		var bodyElement = $('body');
		if (bodyElement != null)
		{			
			var bodyChildren = bodyElement.children();
			if (bodyChildren != null && bodyChildren.length == 1)
			{
				if (bodyChildren[0].nodeName == 'PRE')
				{
					// This is an HTML document with a body which has one element, and that element is a pre
					// Therefore we can be pretty sure this is Chrome viewing a plain-text file of some sort
					// Start by guessing at which mode to use based on the file extension
					var mode = getModeFromUrl(window.location.href);
						
					// Request the settings
					chrome.extension.sendRequest({method: "getSettings"}, function(settings) 
					{
						// Perform the replacement
						var editor = replaceCodeElementWithEditor(bodyChildren[0], mode, settings.doLineWrap);
						applyStyleFromSettings(settings);
						bodyElement.append(getAuthorLinkBoxHtml());
					});
				}
			}
		}
	}
}

function replaceCodeElementWithEditor(codeElement, mode, doLineWrap)
{
	return replaceElementWithEditor($('pre')[0], codeElement.innerText, mode, doLineWrap);
}

function replaceElementWithEditor(element, value, mode, doLineWrap)
{
	// Setup options
	var options = 
	{
		value: value,
		lineNumbers: true,
		fullScreen: true,
		mode: 'plain-text',
		lineWrapping: doLineWrap
	};
		
	// Overwrite the mode
	if (mode != null && mode.length > 1)
	{
		options.mode = mode;
		if (options.mode == "clike")
	    {
	      options.useCPP = true;
	    }
	}
	
	// Construct the editor
	var myCodeMirror = CodeMirror(function(elt)
	{
	  element.parentNode.replaceChild(elt, element);
	}, 
	options
	);
	
	return myCodeMirror;
}

function applyStyleFromSettings(settings)
{
	// Settings overrides
	if (settings.fontFamily != 'monospace' || settings.fontSize > 0)
	{
		if (settings.fontFamily != 'monospace' && settings.fontSize > 0)
		{
			// override both properties
			$('.CodeMirror').css('font-family', settings.fontFamily).css('font-size', settings.fontFamily);
		}
		else
		{
			if (settings.fontFamily != 'monospace')
			{
				$('.CodeMirror').css('font-family', settings.fontFamily);
			}
			else
			{
				$('.CodeMirror').css('font-size', settings.fontSize + 'px');
			}
		}
	}
}

function getAuthorLinkBoxHtml()
{
	return '<div id="authorLinkBox" class="authorLinkBox">'
	 + '<span id="likeMessage">Like this extension? Click <a class="rateLink" href="https://chrome.google.com/webstore/detail/better-text-viewer/lcaidopdffhfemoefoaadecppnjdknkc" target="_blank">here</a> to rate it</span>'
	 + '<span><a href="#" class="closeLink" onClick="document.getElementById(\'authorLinkBox\').style.display = \'none\';">x</a></span>'
	 + '</div>'
}

function getModeFromUrl(url)
{
	var mode = 'plain-text';
	if (url != null && url.length > 0)
	{
		var urlParts = url.split('?')[0].split('.');
		if (urlParts != null && urlParts.length > 0)
		{
			var extensionPiece = urlParts[urlParts.length - 1];
			if (extensionPiece != null && extensionPiece.length > 0)
			{
				extensionPiece = extensionPiece.replace('#', '').replace('/', '');
				if (extensionPiece.length > 0)
				{
					mode = getModeForExtension(extensionPiece);
				}
			}
		}
	}
	return mode;
}

function getModeForExtension(ext)
{
	var mode = 'plain-text';
	ext = ext.trim().toLowerCase();
	switch (ext)
	{
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
	return mode;
}