import {
    getBaseUri,
    getToolUrl
} from '/lib/xp/admin';
import {
    assetUrl,
    serviceUrl
} from '/lib/xp/portal';


function getMarketUrl() {
    const marketConfigBean = __.newBean<{
        getMarketUrl: () => unknown
    }>('com.enonic.xp.app.main.GetMarketConfigBean');
    return __.toNativeObject(marketConfigBean.getMarketUrl());
}

export function get() {
    const readonlyMode = app.config['readonlyMode'] === 'true' || false;
    return {
        status: 200,
        contentType: 'application/json',
        body: {
            adminUrl: getBaseUri(),
            appId: app.name,
            assetsUri: assetUrl({path: ''}),
            marketUrl: getMarketUrl(),
            readonlyMode,
            services: {
                i18nUrl: serviceUrl({service: 'i18n'}),
            },
            toolUri: getToolUrl(
                app.name,
                'main'
            ),
            xpVersion: app.version
        }
    };
}
