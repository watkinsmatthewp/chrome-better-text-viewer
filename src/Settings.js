$(window).load(function () {
    // Page load. get and show settings
    showSettings(getOrCreateSettings());
    
    // Attach an event to the reset button
    $('#reset').click(function() {
        showSettings(saveSettings(defaultSettings()));
    });
    
    // Attach an event to the save button
    $('#save').click(function() {
        var newSettings = {
            doLineWrap: $('#inputDoLineWrap').prop('checked'),
            fontFamily: $('#inputFontFamily').val(),
            fontSize: $('#inputFontSize').val(),
            debugMode: $('#inputDebugMode').prop('checked')
        };
    
        var validation = validateAndAutoCorrectSettings(newSettings);
        if (validation.isValid) {
            showSettings(saveSettings(validation.settings));
            alert('Settings saved');
        }
    });
});

// Restores select box state to saved value from localStorage.
function showSettings(settings) {
    $('#inputDoLineWrap').prop('checked', settings.doLineWrap);
    $('#inputFontFamily').val(settings.fontFamily);
    $('#inputFontSize').val(settings.fontSize);
    $('#inputDebugMode').prop('checked', settings.debugMode);
    $('#settingsJson').html(JSON.stringify(settings, null, 2));
    
    if (settings.debugMode) {
        $('.debugSetting').show();
    } else {
        $('.debugSetting').hide();
    }
}

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
