import type {
	Request,
	Response,
} from '/types';


import {
    getLauncherPath,
    getLocales
} from '/lib/xp/admin';
// @ts-expect-error Cannot find module '/lib/mustache' or its corresponding type declarations.ts(2307)
import mustache from '/lib/mustache';
// @ts-expect-error Cannot find module '/lib/router' or its corresponding type declarations.ts(2307)
import Router from '/lib/router';
import {
    assetUrl,
    serviceUrl
} from '/lib/xp/portal';
import {localize} from '/lib/xp/i18n';
import {immutableGetter, getAdminUrl} from '/lib/applications/urlHelper';
import {
	// FILEPATH_MANIFEST_CJS,
	FILEPATH_MANIFEST_NODE_MODULES,
	GETTER_ROOT,
} from '/constants';


const TOOL_NAME = 'main';
const VIEW = resolve('./main.html');

const router = Router();

router.all(`/${GETTER_ROOT}/{path:.+}`, (r: Request) => {
	return immutableGetter(r);
});

function getMarketUrl() {
    const marketConfigBean = __.newBean<{
    getMarketUrl: () => unknown
}>('com.enonic.xp.app.main.GetMarketConfigBean');
    return __.toNativeObject(marketConfigBean.getMarketUrl());
}


function get(_request: Request): Response {
    const params = {
        appApplicationsBundleUrl: getAdminUrl({
            path: 'main.js'
        }, TOOL_NAME),
        appName: localize({
            key: 'admin.tool.displayName',
            bundles: ['i18n/phrases'],
            locale: getLocales()
        }),
        assetsUri: assetUrl({
            path: ''
        }),
        configServiceUrl: serviceUrl({service: 'config'}),
        jqueryUrl: getAdminUrl({
            manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
            path: 'jquery/dist/jquery.min.js',
        }, TOOL_NAME),
        jqueryUiUrl: getAdminUrl({
            manifestPath: FILEPATH_MANIFEST_NODE_MODULES,
            path: 'jquery-ui/dist/jquery-ui.min.js',
        }, TOOL_NAME),
        launcherPath: getLauncherPath(),
    };

    const marketUrl = getMarketUrl();
    const baseMarketUrl = marketUrl.substring(0, marketUrl.indexOf('/', 9));
    const marketSrc = ' \'self\' ' + baseMarketUrl + ';';

    return {
        contentType: 'text/html',
        body: mustache.render(VIEW, params),
        headers: {
            'content-security-policy': 'default-src \'self\'; script-src \'self\' \'unsafe-eval\'; style-src \'self\' \'unsafe-inline\'; object-src \'none\'; connect-src ' + marketSrc + ' img-src ' + marketSrc
        }
    };
}

router.get('', (r: Request) => get(r)); // Default admin tool path
router.get('/', (r: Request) => get(r)); // Just in case someone adds a slash on the end

export const all = (r: Request) => router.dispatch(r);
