/*global app, require*/

const admin = require('/lib/xp/admin');
const portal = require('/lib/xp/portal');

function getMarketUrl() {
    const marketConfigBean = __.newBean('com.enonic.xp.app.main.GetMarketConfigBean');
    return __.toNativeObject(marketConfigBean.getMarketUrl());
}

function handleGet() {
    const readonlyMode = app.config['readonlyMode'] === 'true' || false;

    return {
        status: 200,
        contentType: 'application/json',
        body: {
            adminUrl: admin.getBaseUri(),
            appId: app.name,
            assetsUri: portal.assetUrl({path: ''}),
            marketUrl: getMarketUrl(),
            readonlyMode,
            services: {
                i18nUrl: portal.serviceUrl({service: 'i18n'}),
            },
            toolUri: admin.getToolUrl(
                app.name,
                'main'
            ),
            xpVersion: app.version
        }
    };
}

exports.get = handleGet;
