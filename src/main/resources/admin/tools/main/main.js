/*global app, require*/

const admin = require('/lib/xp/admin');
const mustache = require('/lib/mustache');
const portal = require('/lib/xp/portal');
const i18n = require('/lib/xp/i18n');

function getMarketUrl() {
    const marketConfigBean = __.newBean('com.enonic.xp.app.main.GetMarketConfigBean');
    return __.toNativeObject(marketConfigBean.getMarketUrl());
}

function getConfigAsJson() {
    const readonlyMode = app.config['readonlyMode'] === 'true' || false;

    return JSON.stringify({
        adminUrl: admin.getBaseUri(),
        appId: app.name,
        assetsUri: portal.assetUrl({path: ''}),
        marketUrl: getMarketUrl(),
        readonlyMode: readonlyMode,
        apis: {
            i18nUrl: portal.apiUrl({
                application: app.name,
                api: 'i18n',
            }),
        },
        toolUri: admin.getToolUrl(
            app.name,
            'main'
        ),
        xpVersion: app.version,
    }, null, 4).replace(/<(\/?script|!--)/gi, "\\u003C$1");
}

function handleGet() {
    const view = resolve('./main.html');
    const toolBaseUrl = admin.getToolUrl(app.name, 'main');

    const params = {
        assetsUri: portal.assetUrl({
            path: ''
        }),
        appName: i18n.localize({
            key: 'admin.tool.displayName',
            bundles: ['i18n/phrases'],
            locale: admin.getLocales()
        }),
        launcherPath: admin.getLauncherPath(),
        toolBaseUrl: toolBaseUrl,
        toolAppName: app.name,
        configScriptId: 'app-applications-config-as-json',
        configAsJson: getConfigAsJson(),
    };

    const marketUrl = getMarketUrl();
    const baseMarketUrl = marketUrl.substring(0, marketUrl.indexOf('/', 9));
    const marketSrc = ' \'self\' ' + baseMarketUrl + ';';

    return {
        contentType: 'text/html',
        body: mustache.render(view, params),
        headers: {
            'Content-Security-Policy': 'default-src \'self\'; script-src \'self\' \'unsafe-eval\'; style-src \'self\' \'unsafe-inline\'; object-src \'none\'; connect-src ' + marketSrc + ' img-src ' + marketSrc
        }
    };
}

exports.get = handleGet;
