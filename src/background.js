chrome.extension.onRequest.addListener(function(request, sender, sendResponse) 
{
    if (request.method == "getSettings") 
	{
	   sendResponse(getSettings());
	}
});

function getSettings()
{
	var settingsString = localStorage["btvSettings"];
	
	var settings;
	if (settingsString == null || settingsString == '' || settingsString == 'undefined')
	{
		settings = new Object();
		settings.doLineWrap = false;
		settings.fontFamily = 'monospace';
		settings.fontSize = 0;
		setSettings(settings);
	}
	else
	{
		settings = JSON.parse(settingsString);
	}
	
	return settings;
}

function setSettings(settings)
{
	localStorage["btvSettings"] = JSON.stringify(settings);
}

function isTrue(value)
{
	return value == true || value == 'true';
}

function hasValue(value)
{
	return value != null && value != '' && value != 'undefined' && (value.toString().length > 10 || value.toString().trim().length > 0);
}