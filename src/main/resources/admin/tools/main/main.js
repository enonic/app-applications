var admin = require('/lib/xp/admin');
var mustache = require('/lib/mustache');
var portal = require('/lib/xp/portal');

function getMarketUrl() {
    var marketConfigBean = __.newBean('com.enonic.xp.app.main.GetMarketConfigBean');
    return __.toNativeObject(marketConfigBean.getMarketUrl());
}

function handleGet() {
    var view = resolve('./main.html');

    var params = {
        adminUrl: admin.getBaseUri(),
        adminAssetsUri: admin.getAssetsUri(),
        assetsUri: portal.assetUrl({
            path: ''
        }),
        appName: 'Applications',
        appId: app.name,
        xpVersion: app.version,
        launcherPath: admin.getLauncherPath(),
        launcherUrl: admin.getLauncherUrl(),
        i18nUrl: portal.serviceUrl({service: 'i18n'}),
        marketUrl: getMarketUrl()
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params)
    };
}

exports.get = handleGet;
