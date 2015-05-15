function validateAndAutoCorrectSettings(settings) {
    var isValid = true;

    // Validate font family
    if (!hasValue(settings.fontFamily)) {
        settings.fontFamily = 'monospace';
    }

    // Validate font size
    if (hasValue(settings.fontSize)) {
        if (settings.fontSize < 0) {
            alert('Cannot have a negative font size. Please specify a valid font size, or 0 to use the default value');
            isValid = false;
        }
    } else {
        // Apply the default
        settings.fontSize = 13;
    }

    // Return results
    return {
        settings : settings,
        isValid : isValid
    };
}

function getOrCreateSettings() {
    var settingsString = localStorage["btvSettings"];
    if (settingsString == null || settingsString == undefined || settingsString == '' || settingsString == 'undefined') {
        return saveSettings(defaultSettings());
    } 
    return JSON.parse(settingsString);
}

function defaultSettings() {
    return {
        doLineWrap: false,
        fontFamily: 'monospace',
        fontSize: 14,
        debugMode: false,
    };
}

function saveSettings(settings) {
    localStorage["btvSettings"] = JSON.stringify(settings);
    return settings;
}

function isTrue(value) {
    return value == true || value == 'true';
}

function hasValue(value) {
    return value != null && value != '' && value != 'undefined' && (value.toString().length > 10 || value.toString().trim().length > 0);
}
