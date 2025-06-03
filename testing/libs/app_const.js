module.exports = Object.freeze({
    //waitForTimeout
    mediumTimeout: 3000,
    longTimeout: 9000,
    shortTimeout: 2000,
    TIMEOUT_10: 10000,
    TIMEOUT_1: 1000,
    SUITE_TIMEOUT: 200000,
    installAppTimeout: 60000,
    APPLICATION_TITLE: `Applications - Enonic XP Admin`,
    DELETE_INBOUND_MESSAGE: 'The content you are about to delete has inbound references. Please verify them before deletion.',

    TEST_APPS_NAME: {
        TEST_AUTH0_PROVIDER_APP: 'Test Auth0 ID Provider',
        SIMPLE_SITE_APP: 'Simple Site App',
        TEST_APP_WITH_METADATA_MIXIN: 'Test Selenium App',
        MY_FIRST_APP: 'My First App',
        TEST_ADFS_PROVIDER_APP: 'Test ADFS ID Provider',
    },

    TEST_IMAGES: {
        HAND: 'hand',
        WHALE: 'whale'
    },
    contentTypes: {
        SHORTCUT: 'base:shortcut',
    },
    generateRandomName (part) {
        return part + Math.round(Math.random() * 1000000);
    },
    BROWSER_TITLES: {
        XP_HOME: 'Enonic XP Home',
        APPLICATION_TITLE: `Applications - Enonic XP Admin`,
    },
});
