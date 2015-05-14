$(window).load(function () {
    updatePageFromSettings();
    $('#save').click(updateSettingsFromPage);
    $('#reset').click(resetSettings);
});

function resetSettings() {
    var settings = getDefaultSettings();
    setSettings(settings);
    updatePageFromSettings();
}

// Restores select box state to saved value from localStorage.
function updatePageFromSettings() {
    var settings = getSettings();
    $('#inputDoLineWrap').attr('checked', settings.doLineWrap);
    $('#inputFontFamily').val(settings.fontFamily);
    $('#inputFontSize').val(settings.fontSize);
    $('#inputDebugMode').attr('checked', settings.debugMode);
    $('#settingsJson').html(JSON.stringify(settings, null, 2));
    
    if (settings.adminMode) {
        $('.adminSetting').show();
    }
}

// Saves options to localStorage.
function updateSettingsFromPage() {
    var settings = {
        doLineWrap: $('#inputDoLineWrap').attr('checked'),
        fontFamily: $('#inputFontFamily').val(),
        fontSize: $('#inputFontSize').val(),
        debugMode: $('#inputDebugMode').attr('checked')
    };

    var validation = validateSettings(settings);
    if (validation.isValid) {
        setSettings(settings);

        var statusElement = $('#status');
        statusElement.animate({
            opacity : "1.0"
        }, 500);
        setTimeout(function () {
            statusElement.animate({
                opacity : "0.0"
            }, 1000);
        }, 2500);
    }
}

function validateSettings(settings) {
    var isValid = true;
    settings.doLineWrap = isTrue(settings.doLineWrap);

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
    
    // Set admin mode
    if (isTrue(settings.debugMode)) {
        settings.adminMode = true;
    }

    // Return results
    return {
        settings : settings,
        isValid : isValid
    };
}

function getSettings() {
    var settingsString = localStorage["btvSettings"];

    var settings;
    if (settingsString == null || settingsString == '' || settingsString == 'undefined') {
        settings = getDefaultSettings();
        setSettings(settings);
    } else {
        settings = JSON.parse(settingsString);
    }

    return settings;
}

function getDefaultSettings() {
    return {
        doLineWrap: false,
        fontFamily: 'monospace',
        fontSize: 14,
        adminMode: false,
        debugMode: false,
    };
}

function setSettings(settings) {
    localStorage["btvSettings"] = JSON.stringify(settings);
}

function isTrue(value) {
    return value == true || value == 'true';
}

function hasValue(value) {
    return value != null && value != '' && value != 'undefined' && (value.toString().length > 10 || value.toString().trim().length > 0);
}
