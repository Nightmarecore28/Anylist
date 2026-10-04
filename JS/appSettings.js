const APP_SETTINGS_KEY = "anyListAppSettings";


// ========================================
// DEFAULT SETTINGS
// ========================================

const DEFAULT_SETTINGS = {
    backgroundColor: "#f4f6f8",
    backgroundImage: "",
    rainbow: false
};


// ========================================
// GET APP SETTINGS
// ========================================

export function getAppSettings() {

    const saved =
        localStorage.getItem(APP_SETTINGS_KEY);


    if (!saved) {

        return {
            ...DEFAULT_SETTINGS
        };

    }


    try {

        const settings =
            JSON.parse(saved);


        return {

            backgroundColor:
                settings.backgroundColor ||
                DEFAULT_SETTINGS.backgroundColor,

            backgroundImage:
                settings.backgroundImage ||
                DEFAULT_SETTINGS.backgroundImage,

            rainbow:
                settings.rainbow === true

        };

    }

    catch (error) {

        console.error(
            "Could not load app settings:",
            error
        );


        return {
            ...DEFAULT_SETTINGS
        };

    }

}


// ========================================
// SAVE APP SETTINGS
// ========================================

export function saveAppSettings(settings) {

    const newSettings = {

        backgroundColor:
            settings.backgroundColor ||
            DEFAULT_SETTINGS.backgroundColor,

        backgroundImage:
            settings.backgroundImage || "",

        rainbow:
            settings.rainbow === true

    };


    localStorage.setItem(

        APP_SETTINGS_KEY,

        JSON.stringify(newSettings)

    );

}


// ========================================
// RESET APP SETTINGS
// ========================================

export function resetAppSettings() {

    const settings = {
        ...DEFAULT_SETTINGS
    };


    localStorage.setItem(

        APP_SETTINGS_KEY,

        JSON.stringify(settings)

    );


    return settings;

}