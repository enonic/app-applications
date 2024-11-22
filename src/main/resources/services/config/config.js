/*global app, require*/

const admin = require('/lib/xp/admin');
const portal = require('/lib/xp/portal');
const assetLib = require('/lib/enonic/asset');

function getMarketUrl() {
    const marketConfigBean = __.newBean('com.enonic.xp.app.main.GetMarketConfigBean');
    return __.toNativeObject(marketConfigBean.getMarketUrl());
}

function handleGet() {
    const readonlyMode = app.config['readonlyMode'] === 'true' || false;

    const baseUri = admin.getBaseUri();

    return {
        status: 200,
        contentType: 'application/json',
        body: {
            adminUrl: baseUri,
            appId: app.name,
            assetsUri: assetLib.assetUrl({path: ''}),
            marketUrl: getMarketUrl(),
            readonlyMode,
            services: {
                i18nUrl: portal.serviceUrl({service: 'i18n'}),
            },
            toolUri: admin.getToolUrl(
                app.name,
                'main'
            ),
            xpVersion: app.version,
            statusApiUrl: `${baseUri}/rest/status`,
            eventApiUrl: `${baseUri}/event`,
        }
    };
}

exports.get = handleGet;
