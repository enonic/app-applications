/*global app, require*/

const admin = require('/lib/xp/admin');
const mustache = require('/lib/mustache');
const portal = require('/lib/xp/portal');
const i18n = require('/lib/xp/i18n');

function getMarketUrl() {
    const marketConfigBean = __.newBean('com.enonic.xp.app.main.GetMarketConfigBean');
    return __.toNativeObject(marketConfigBean.getMarketUrl());
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
        configServiceUrl: `${toolBaseUrl}/_/${app.name}/config`,
        toolBaseUrl: toolBaseUrl,
        toolAppName: app.name,
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
