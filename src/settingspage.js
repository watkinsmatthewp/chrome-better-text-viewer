$(window).load(function () {
    // Page load. get and show settings
    showSettings(getOrCreateSettings());
    
    // Attach an event to the reset button
    $('#reset').click(function() {
        showSettings(saveSettings(defaultSettings()));
        showAlertMessage('Settings have been reset to default values');
    });
    
    // Attach an event to the save button
    $('#save').click(function() {
        var settings = getOrCreateSettings();
        
        // Set properties from UI
        settings.doLineWrap = $('#inputDoLineWrap').prop('checked');
        settings.fontFamily = $('#inputFontFamily').val();
        settings.fontSize = $('#inputFontSize').val();
        settings.theme = $('#inputTheme').val();
        settings.debugMode = $('#inputDebugMode').prop('checked');
        settings.nextRatingPromptDate = new Date($('#inputNextRatingPromptDate').val()).getTime();
    
        var validation = validateAndAutoCorrectSettings(settings);
        if (validation.isValid) {
            showSettings(saveSettings(validation.settings));
            showAlertMessage('Settings saved');
        } else {
            showAlertMessage('Please correct errors and hit save again', true);
        }
    });
    
    // Show debug shortcut
    $(document).keydown(function (e) {
        // Ctrl+F2
        if (e.ctrlKey && e.keyCode == 113) {
            // Show debug info
            $('.debugSetting').show();
        }
    });
});

// Display the alert div (temporarily or permanently for a specified amount of time)
function showAlertMessage(text, keepAlive, aliveTime) {
	keepAlive = keepAlive || false;
    aliveTime = aliveTime || 3000;
    
    var alertBox = $('#alert');
	alertBox.text(text);
	alertBox.fadeTo(400, 1);
    if (!keepAlive) {
      alertBox.delay(aliveTime).fadeTo(1000, 0);
    }
}

// Restores select box state to saved value from localStorage.
function showSettings(settings) {
    if (!$('#inputTheme option').length) {
        $('#inputTheme').append(
            themes.map(theme => $('<option>').text(theme))
        );
    }

    $('#inputDoLineWrap').prop('checked', settings.doLineWrap);
    $('#inputFontFamily').val(settings.fontFamily);
    $('#inputFontSize').val(settings.fontSize);
    $('#inputTheme').val(settings.theme);
    $('#inputDebugMode').prop('checked', settings.debugMode);
    $('#inputNextRatingPromptDate').val(new Date(settings.nextRatingPromptDate));
    $('#settingsJson').html(JSON.stringify(settings, null, 2));
    
    if (settings.debugMode) {
        $('.debugSetting').show();
    } else {
        $('.debugSetting').hide();
    }
}
