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
import {InstalledAppChangedEvent} from './app/installation/InstalledAppChangedEvent';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

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
    ConnectionDetector.get()
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

    const serverEventsListener = new ServerEventsListener([application]);
    serverEventsListener.start();

    startLostConnectionDetector();

    const installAppDialog = new InstallAppDialog();

    InstallAppPromptEvent.on((event) => {
        installAppDialog.updateInstallApplications(event.getInstalledApplications());
        installAppDialog.open();
    });

    InstalledAppChangedEvent.on((event) => {
        installAppDialog.updateInstallApplications(event.getInstalledApplications());
    });

}

(async () => {
    if (!document.currentScript) {
        throw 'Legacy browsers are not supported';
    }
    const configServiceUrl = document.currentScript.getAttribute('data-config-service-url');
    if (!configServiceUrl) {
        throw 'Unable to fetch app config';
    }
    await CONFIG.init(configServiceUrl);
    await i18nInit(CONFIG.getString('services.i18nUrl'));
    startApplication();
})();

