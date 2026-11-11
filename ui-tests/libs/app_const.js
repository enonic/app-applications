module.exports = Object.freeze({
  SUITE_TIMEOUT: 180000,
  generateRandomName(part) {
    return part + Math.round(Math.random() * 1000000);
  },

  // Notification messages of the section (phrases: applications.notify.*).
  applicationInstalledMessage(displayName) {
    return `${displayName} was installed`;
  },
  applicationUpdatedMessage(displayName) {
    return `${displayName} was updated`;
  },
  applicationUninstalledMessage(displayName) {
    return `${displayName} was uninstalled`;
  },
  applicationStartFailedMessage(displayName) {
    return `Could not start ${displayName}`;
  },
  applicationStopFailedMessage(displayName) {
    return `Could not stop ${displayName}`;
  },

  BROWSER_XP_TITLES: {
    XP_HOME: 'Enonic XP Home',
  },
  TIMEOUT: {
    MEDIUM: 3000,
    LONG: 5000,
    SHORT: 2000,
    // An install from Enonic Market: the download, the deploy and the catalogue reload after it.
    INSTALL: 30000,
  },

  BROWSER_WIDTH: 1950,
  BROWSER_HEIGHT: 1050,

  // The sections the Settings rail offers: this app's one and the ones app-users adds.
  EXTENSIONS: {
    APPLICATIONS: 'Applications',
    SERVICE_ACCOUNTS: 'Service Accounts',
    USERS: 'Users',
    GROUPS: 'Groups',
    ROLES: 'Roles',
    ID_PROVIDERS: 'ID Providers',
  },
  // 'data-section' of the SectionMount that hosts the extension's shadow root
  SECTION_ID: {
    APPLICATIONS: 'com.enonic.xp.app.applications:applications',
    SERVICE_ACCOUNTS: 'com.enonic.xp.app.users:service-accounts',
    USERS: 'com.enonic.xp.app.users:users',
    GROUPS: 'com.enonic.xp.app.users:groups',
    ROLES: 'com.enonic.xp.app.users:roles',
    ID_PROVIDERS: 'com.enonic.xp.app.users:id-providers',
  },
  // The 'Actions' toolbar of the Applications section (phrases: applications.action.*). Each button
  // is located by its aria-label, which is the label itself.
  TOOLBAR: {
    INSTALL: 'Install',
    UNINSTALL: 'Uninstall',
    START: 'Start',
    STOP: 'Stop',
  },
  // What a row shows on its right and the details header in its state button
  // (phrases: applications.state.*).
  APP_STATE: {
    STARTED: 'Started',
    STOPPED: 'Stopped',
  },
  APP_BADGE: {
    SYSTEM: 'System application',
    LOCAL: 'Local application',
  },
  LIST_MESSAGE: {
    EMPTY: 'No applications',
    NOTHING_MATCHES: 'Nothing matches the search',
  },
  DETAILS_MESSAGE: {
    SELECT_AN_ITEM: 'Select an item to see its details',
    NOT_FOUND: 'The application is no longer installed',
    FAILED: 'The application could not be loaded',
    INFO_ERROR: 'The details could not be loaded',
  },
  FILTER_FIELD: {
    STATE: 'State',
    UPGRADE: 'Upgrade available',
  },
  // The values of the 'Upgrade available' field (phrases: applications.filter.yes / no).
  FILTER_VALUE: {
    YES: 'Yes',
    NO: 'No',
  },
  INSTALL_DIALOG: {
    TITLE: 'Install applications',
    TAB: {
      MARKET: 'Enonic Market',
      UPLOAD: 'Upload',
    },
    FILTER_FIELD: {
      LICENSE: 'License',
      VENDOR: 'Vendor',
      UPGRADE: 'Upgrade available',
      INSTALLED: 'Installed',
    },
    ACTION: {
      INSTALL: 'Install',
      UPDATE: 'Update',
      INSTALLED: 'Installed',
    },
    NO_MATCHES: 'No applications matching the specified criteria',
  },
  // The 'Confirm uninstall' dialog (phrases: applications.dialog.uninstall.*).
  UNINSTALL_DIALOG: {
    TITLE: 'Confirm uninstall',
    QUESTION: 'Are you sure you want to uninstall this application?',
  },
  SORT_MENU_ITEM: {
    DISPLAY_NAME_ASC: 'Display name (A–Z)',
    DISPLAY_NAME_DESC: 'Display name (Z–A)',
  },
  SYSTEM_TOGGLE: {
    LABEL: 'Show system applications',
    SHOW: 'Show system applications',
    HIDE: 'Hide system applications',
  },
  // The applications XP ships, listed only while 'Show system applications' is on: a row that
  // cannot be ticked, stopped or uninstalled and shows no state.
  SYSTEM_APPS: {
    MAIN: {
      key: 'com.enonic.xp.app.main',
      displayName: 'com.enonic.xp.app.main',
    },
    // Every key the distro of xpVersion ships (its system/ directory), sorted by key: the list
    // orders them by display name, which not every one of them has.
    KEYS: [
      'com.enonic.xp.app.applications',
      'com.enonic.xp.app.main',
      'com.enonic.xp.app.settings',
      'com.enonic.xp.app.standardidprovider',
      'com.enonic.xp.app.system',
      'com.enonic.xp.app.users',
    ],
  },
  TEST_APPS: {
    SIMPLE_SITE: {
      key: 'com.enonic.uitest.simple_page',
      displayName: 'Simple Site App',
      description: 'Test application for ui-tests',
      contentTypes: ['article', 'checkbox', 'htmlarea'],
      formFragments: ['menu-item', 'select-image'],
      layouts: ['layout-25-75', 'layout-3-col'],
      mixins: ['text-area'],
      pages: ['content', 'default', 'main', 'no-regions', 'with-error'],
    },
    MY_FIRST_APP: {
      key: 'com.enonic.uitest.myfirstapp',
      displayName: 'My First App',
      description: 'Test application for creating sites',
      vendorName: 'Enonic AS',
      vendorUrl: 'http://enonic.com',
      contentTypes: ['city', 'country'],
      pages: ['country-list', 'country-region', 'first-page'],
      parts: ['city-creation', 'city-list', 'country'],
    },
    TEST_SELENIUM: {
      key: 'com.enonic.uitest.test_application',
      displayName: 'Test Selenium App',
      description: 'Test application for ui-testing',
      contentTypes: ['article', 'checkbox'],
      formFragments: ['meta-data'],
      layouts: ['centered'],
      mixins: ['meta-data'],
      // The Admin section lists an extension as '<title> (<interfaces>)'.
      adminExtensions: ['My first widget (contentstudio.contextpanel)'],
    },
    ADFS_ID_PROVIDER: {
      key: 'com.enonic.uitest.adfs_idprovider',
      displayName: 'Test ADFS ID Provider',
    },
    AUTH0_ID_PROVIDER: {
      key: 'com.enonic.uitest.auth0_idprovider',
      displayName: 'Test Auth0 ID Provider',
    },
  },
  // Applications the specs install from Enonic Market, so the XP has to reach it. The latest version
  // is what the market offers for this XP version and changes with the market, so a spec compares
  // the grid with the dialog rather than with a literal.
  MARKET_APPS: {
    CHUCK_NORRIS: {
      key: 'com.enonic.app.chucknorris',
      displayName: 'Chuck Norris',
      description: 'A Chuck Norris fact widget',
      vendor: 'Enonic',
      // The free text that leaves this one application in the market list
      searchText: 'chuck',
    },
  },
});
