const admin = require('/lib/xp/admin');
const mustache = require('/lib/mustache');
const portal = require('/lib/xp/portal');
const i18n = require('/lib/xp/i18n');

function handleGet() {
    const view = resolve('./main.html');

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
        configServiceUrl: portal.serviceUrl({service: 'config'})
    };

    return {
        contentType: 'text/html',
        body: mustache.render(view, params)
    };
}

exports.get = handleGet;
