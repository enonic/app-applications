const path = require('path');
const { propertiesReader } = require('properties-reader');
const file = path.join(__dirname, './browser.properties');
const properties = propertiesReader({ sourceFile: file });
const browser_version = properties.get('browser.version');
const width = properties.get('browser.width');
const height = properties.get('browser.height');
const baseURL = properties.get('base.url');

exports.config = {
  specs: [path.join(__dirname, './specs/**/*.spec.js')],

  maxInstances: 1,

  // wdio v10: `$` throws when a selector matches several elements. The page objects wait on the
  // first match of a list (rows, menu items) and pick from `$$` afterwards, so keep it non-strict.
  strictSelectors: false,

  capabilities: [
    {
      browserName: 'chrome',
      ...(browser_version ? { browserVersion: String(browser_version) } : {}),
      'wdio:enforceWebDriverClassic': true,
      'goog:chromeOptions': {
        args: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--lang=en',
          '--disable-extensions',
          `--window-size=${width},${height}`,
        ],
      },
    },
  ],
  logLevel: 'info',
  //
  // Enables colors for log output.
  coloredLogs: true,

  baseUrl: baseURL,
  //
  // Default timeout for all waitForXXX commands.
  waitforTimeout: 3000,
  //
  // Default timeout in milliseconds for request
  // if Selenium Grid doesn't send response
  connectionRetryTimeout: 160000,
  //
  // Default request retries count
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
  // Set directory to store all logs into.
  //
  // ! Absolute, and it has to stay that way: Chromedriver puts Chrome's --user-data-dir under this
  // ! directory and passes it on as it reads here. Chrome 155 quits on the spot on a relative one
  // ! (exit code 21, no output), which reaches the run as 'session not created: DevToolsActivePort
  // ! file doesn't exist' - the browser is gone before it can write the port file.
  outputDir: path.join(__dirname, './build/reports/logs'),

  reporters: [
    'concise',
    [
      'allure',
      {
        outputDir: './build/reports/allure',
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: true,
      },
    ],
  ],

  // Hook that gets executed before the suite starts
  beforeSuite: async function () {
    await browser.url(this.baseUrl);
  },
};
