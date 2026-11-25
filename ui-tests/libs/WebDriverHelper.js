/**
 * Helper class that encapsulates webdriverio
 * and sets up mocha hooks for easier test writing.
 */
function WebDriverHelper() {
  this.browser = null;
}

WebDriverHelper.prototype.getBrowser = function () {
  return this.browser;
};

const makeChromeOptions = (headless, width, height) => ({
  args: [
    ...(headless ? ['--headless', '--disable-gpu', '--no-sandbox'] : []),
    '--lang=en',
    '--disable-extensions',
    `--window-size=${width},${height}`,
  ],
});

/**
 * Sets up a `before` mocha hook that initializes the webdriverio session and adds, at run time,
 * the `after` that terminates it.
 *
 * The session is deleted by an `after` hook added to the suite from inside `before`, at run time.
 * Mocha runs a suite's `after` hooks in the order they were added, and a spec's own `after` that
 * still needs the browser - theme.spec clears the stored theme in one - is added at collection
 * time, after this function was called: an `after` registered here would run before it and leave
 * it with a dead session (ECONNREFUSED on every request). A hook added at run time comes last.
 */
WebDriverHelper.prototype.setupBrowser = function setupBrowser(w, h) {
  let _this = this;
  let ww = w;
  let hh = h;
  before(async function () {
    let propertiesReaderModule = require('properties-reader');
    let propertiesReader =
      propertiesReaderModule.propertiesReader ||
      propertiesReaderModule.default ||
      propertiesReaderModule;
    let path = require('path');
    let webdriverio = require('webdriverio');
    let file = path.join(__dirname, '/../browser.properties');
    let properties = propertiesReader({ sourceFile: file });
    let browser_name = properties.get('browser.name');
    let browser_version = properties.get('browser.version');
    let baseUrl = properties.get('base.url');
    let isHeadless = properties.get('is.headless');
    let width = ww === undefined ? properties.get('browser.width') : w;
    let height = hh === undefined ? properties.get('browser.height') : h;
    let options = {
      logLevel: 'error',
      automationProtocol: 'webdriver',
      strictSelectors: false,
      capabilities: {
        browserName: browser_name,
        browserVersion: browser_version,
        'wdio:enforceWebDriverClassic': true,
        'goog:chromeOptions': makeChromeOptions(isHeadless, width, height),
      },
    };
    _this.browser = await webdriverio.remote(options);
    // Registered before the first request, so a failed url() still gets its session deleted.
    const browser = _this.browser;
    this.test.parent.afterAll(async function () {
      await browser.deleteSession();
    });
    await _this.browser.url(baseUrl);
    return _this.browser;
  });
};
module.exports = new WebDriverHelper();
