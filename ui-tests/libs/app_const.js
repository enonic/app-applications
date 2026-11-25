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
  // Waits end as soon as their condition holds, so a long one costs a green run nothing; a short one
  // turns a slow CI runner into a red build. Start and stop of an application go to the server.
  TIMEOUT: {
    SHORT: 5000,
    MEDIUM: 10000,
    LONG: 20000,
    // An install from Enonic Market: the download, the deploy and the catalogue reload after it.
    INSTALL: 60000,
  },

  PASSWORD: {
    MEDIUM: 'AUserA567$',
    STRONG: '1User%#567$=',
    WEAK: 'test12345',
  },
  // Display names of the roles XP ships with.
  SYSTEM_ROLES: {
    ADMIN_CONSOLE: 'Administration Console Login',
    ADMINISTRATOR: 'Administrator',
    CM_ADMIN: 'Content Manager Administrator',
    CM_EXPERT: 'Content Manager Expert',
    USERS_APP: 'Users App',
    USERS_ADMINISTRATOR: 'Users Administrator',
    AUTHENTICATED: 'Authenticated',
    EVERYONE: 'Everyone',
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
  // The url segment a section answers to (`config.path` of its extension descriptor): the section
  // is at '<tool url>#/<path>'.
  SECTION_PATH: {
    APPLICATIONS: 'applications',
    SERVICE_ACCOUNTS: 'service-accounts',
    USERS: 'users',
    GROUPS: 'groups',
    ROLES: 'roles',
    ID_PROVIDERS: 'id-providers',
  },
  // The Settings admin tool, relative to 'base.url'.
  SETTINGS_TOOL_PATH: 'com.enonic.xp.app.settings/main',
  // The GraphQL endpoint of app-users' sections, relative to the admin origin: the accounts a spec
  // logs in as are made through it.
  GRAPHQL_API: {
    USERS:
      '/admin/com.enonic.xp.app.settings/main/_/admin:extension/com.enonic.xp.app.users:users/graphql',
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
  // What the shell shows in place of the sections to a visitor no section's access rules admit
  // (phrases: sections.empty.*). The hint is shown to everyone but a system administrator.
  SECTIONS_EMPTY: {
    MESSAGE: 'No administration applications',
    HINT: 'Install one, or check that its access rules include you',
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
    // Not deployed: downloaded into ui-tests/build/upload-apps by `:ui-tests:downloadUploadApps` and
    // uploaded through the Install dialog by applications.install.upload.spec, which uninstalls it
    // again. Neither local nor system once installed that way: a row with no badge, uninstallable.
    TEST_SELENIUM: {
      key: 'com.enonic.uitest.test_application',
      // The file in ui-tests/build/upload-apps, named by the artifact and its version.
      jarName: 'test-application-2.0.0-SNAPSHOT.jar',
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
      description: 'Test application for ui-testing',
    },
    AUTH0_ID_PROVIDER: {
      key: 'com.enonic.uitest.auth0_idprovider',
      displayName: 'Test Auth0 ID Provider',
      description: 'Test application for ui-testing',
      contentTypes: ['article', 'checkbox'],
      formFragments: ['meta-data'],
      // The mode of its ID provider descriptor, shown in the 'ID provider applications' section.
      idProviderMode: 'MIXED',
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
