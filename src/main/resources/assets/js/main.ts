import {Application} from '@enonic/lib-admin-ui/app/Application';
import {ApplicationAppPanel} from './app/ApplicationAppPanel';
import {InstallAppDialog} from './app/installation/InstallAppDialog';
import {InstallAppPromptEvent} from './app/installation/InstallAppPromptEvent';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {Path} from '@enonic/lib-admin-ui/rest/Path';
import {ConnectionDetector} from '@enonic/lib-admin-ui/system/ConnectionDetector';
import {AppBar} from '@enonic/lib-admin-ui/app/bar/AppBar';
import {AppHelper} from '@enonic/lib-admin-ui/util/AppHelper';
import {ServerEventsListener} from '@enonic/lib-admin-ui/event/ServerEventsListener';
import {i18nInit} from '@enonic/lib-admin-ui/util/MessagesInitializer';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {AppInstalledEvent} from './app/installation/AppInstalledEvent';
import {CONFIG, ConfigObject} from '@enonic/lib-admin-ui/util/Config';
import {AppUninstalledEvent} from './app/installation/AppUninstalledEvent';
import {LauncherHelper} from '@enonic/lib-admin-ui/util/LauncherHelper';

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
    const appPanel = new ApplicationAppPanel(application.getPath());

    body.appendChild(appBar);
    body.appendChild(appPanel);

    AppHelper.preventDragRedirect();

    application.setLoaded(true);

    const serverEventsListener = new ServerEventsListener([application], CONFIG.getString('eventApiUrl'));
    serverEventsListener.start();

    startLostConnectionDetector();

    const installAppDialog = new InstallAppDialog();

    InstallAppPromptEvent.on((event) => {
        installAppDialog.setInstalledApplications(event.getInstalledApplications());
        installAppDialog.open();
    });

    AppInstalledEvent.on((event) => {
        installAppDialog.updateAppInstalled(event.getApplication());
    });

    AppUninstalledEvent.on((event) => {
       installAppDialog.updateAppUninstalled(event.getApplication());
    });

    LauncherHelper.appendLauncherPanel();
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

