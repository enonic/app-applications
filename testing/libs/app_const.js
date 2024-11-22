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
    TEST_APPLICATIONS: {
        FIRST_APP: 'First Selenium App',
        SECOND_APP: 'Second Selenium App',
        THIRD_APP: 'Third Selenium App',
        FOURTH_APP: 'Fourth Selenium App',
    },
    TEST_IMAGES: {
        HAND: 'hand',
        WHALE: 'whale'
    },
    contentTypes: {
        SHORTCUT: 'base:shortcut',
    },
    generateRandomName: function (part) {
        return part + Math.round(Math.random() * 1000000);
    },
    BROWSER_TITLES: {
        XP_HOME: 'Enonic XP Home',
        APPLICATION_TITLE: `Applications - Enonic XP Admin`,
    },
});
