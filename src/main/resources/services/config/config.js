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
    const baseUriWithoutTailingSlash = baseUri.endsWith('/') ? baseUri.substring(0, baseUri.length - 1) : baseUri;

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
            statusApiUrl: `${baseUriWithoutTailingSlash}/rest/status`,
            eventApiUrl: `${baseUriWithoutTailingSlash}/event`,
        }
    };
}

exports.get = handleGet;
