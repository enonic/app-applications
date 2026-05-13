import {Application} from '@enonic/lib-admin-ui/app/Application';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {ConnectionDetector} from '@enonic/lib-admin-ui/system/ConnectionDetector';
import {AppBar} from '@enonic/lib-admin-ui/app/bar/AppBar';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';
import {ServerEventsListener} from '@enonic/lib-admin-ui/event/ServerEventsListener';
import {i18nInit} from '@enonic/lib-admin-ui/util/MessagesInitializer';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {CONFIG, ConfigObject} from '@enonic/lib-admin-ui/util/Config';
import {CustomElement} from '@enonic/lib-admin-ui/dom/CustomElement';
import {AppElement} from './v2/App';

const body = Body.get();

function getApplication(): Application {
    const assetsUri: string = CONFIG.getString('assetsUri');
    const application = new Application(
        CONFIG.getString('appId'),
        i18n('admin.tool.displayName'),
        i18n('app.abbr'),
        `${assetsUri}/icons/icon-white.svg`
    );
    application.setPath(Path.fromString('/'));
    application.setWindow(window);

    return application;
}

function startLostConnectionDetector() {
    ConnectionDetector.get(CONFIG.getString('statusApiUrl'))
        .setAuthenticated(true)
        .setSessionExpireRedirectUrl(CONFIG.getString('toolUri'))
        .setNotificationMessage(i18n('notify.connection.loss'))
        .startPolling(true);
}

function startApplication() {

    const application: Application = getApplication();
    const appBar = new AppBar(application);

    body.appendChild(appBar);

    AppElement.initialize();

    AppHelper.preventDragRedirect();

    application.setLoaded(true);

    const serverEventsListener = new ServerEventsListener([application], CONFIG.getString('eventApiUrl'));
    serverEventsListener.start();

    startLostConnectionDetector();

    appendMenuPanel();
}

function appendMenuPanel(): void {
    const menuUrl = CONFIG.getString('menuUrl');
    if (!menuUrl) {
        throw new Error('Menu URL is not defined');
    }
    const menuElement = CustomElement.create('xp-menu');
    document.body.appendChild(menuElement);
    fetch(menuUrl)
        .then(response => response.text())
        .then((html: string) => menuElement.setHtml(html))
        .catch((e: Error) => {
            throw new Error(`Failed to fetch the Menu extension panel at ${menuUrl}: ${e.toString()}`);
        });
}

(async () => {
    if (!document.currentScript) {
        throw Error('Legacy browsers are not supported');
    }

    const configScriptId = document.currentScript.getAttribute('data-config-script-id');
    if (!configScriptId) {
        throw Error('Missing \'data-config-script-id\' attribute');
    }

    const configScriptEl: HTMLElement = document.getElementById(configScriptId);
    CONFIG.setConfig(JSON.parse(configScriptEl.innerText) as ConfigObject);

    await i18nInit(CONFIG.getString('apis.i18nUrl'));
    startApplication();
})();

