var themes = [
    'default',
    '3024-day', '3024-night', 'ambiance', 'ambiance', 'base16-dark', 'base16-light', 'blackboard', 'cobalt',
    'colorforth', 'eclipse', 'elegant', 'erlang-dark', 'lesser-dark', 'mbo', 'mdn-like', 'midnight', 'monokai',
    'neat', 'neo', 'night', 'paraiso-dark', 'paraiso-light', 'pastel-on-dark', 'rubyblue', 'solarized dark',
    'solarized light', 'solarized lightCodeMirror', 'the-matrix', 'tomorrow-night-bright',
    'tomorrow-night-eighties', 'twilight', 'vibrant', 'vibrant-ink', 'xq-dark', 'xq-light', 'zenburn'
];

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
        settings.fontSize = 14;
    }

    // Validate theme
    if (!hasValue(settings.theme)) {
        settings.theme = 'default';
    }

    // Return results
    return {
        settings : settings,
        isValid : isValid
    };
}

function setNextRatingPromptDate(daysInTheFuture) {
  var settings = getOrCreateSettings();
  if (daysInTheFuture < 0) {
    // Set to an impossibly future date
    settings.nextRatingPromptDate = new Date(3000, 1, 1).getTime();
  }
  else {
    settings.nextRatingPromptDate = addDays(new Date(), daysInTheFuture).getTime();
  }
  saveSettings(settings);
}

function getOrCreateSettings() {
    var settingsString = localStorage["btvSettings"];
    var settings;
    if (settingsString == null || settingsString == undefined || settingsString == '' || settingsString == 'undefined') {
        settings = saveSettings(defaultSettings());
    } else {
        settings = JSON.parse(settingsString);
        var needSave = false;
        if (!settings.theme || !themes.includes(settings.theme)) {
            settings.theme = 'default';
            needSave = true;
        }
        if (settings.nextRatingPromptDate == null || settings.nextRatingPromptDate == undefined) {
            settings.nextRatingPromptDate = addDays(new Date(), 3);
            needSave = true;
        }
        if (needSave) {
            settings = saveSettings(settings);
        }
    }    
    return settings;
}

function defaultSettings() {
    return {
        doLineWrap: false,
        fontFamily: 'monospace',
        fontSize: 14,
        theme: 'default',
        debugMode: false,
        nextRatingPromptDate: addDays(new Date(), 3).getTime()
    };
}

function saveSettings(settings) {
    localStorage["btvSettings"] = JSON.stringify(settings);
    return settings;
}

function addDays(dateObject, numDays) {
  dateObject.setDate(dateObject.getDate() + numDays);
  return dateObject;
}

function isTrue(value) {
    return value == true || value == 'true';
}

function hasValue(value) {
    return value != null && value != '' && value != 'undefined' && (value.toString().length > 10 || value.toString().trim().length > 0);
}
