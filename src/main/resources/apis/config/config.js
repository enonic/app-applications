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
            apis: {
                i18nUrl: portal.url({
                    path: `/admin/${app.name}/main/_/${app.name}/i18n`,
                }),
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
