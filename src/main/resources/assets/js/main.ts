import {Application} from 'lib-admin-ui/app/Application';
import {ApplicationAppPanel} from './app/ApplicationAppPanel';
import {InstallAppDialog} from './app/installation/InstallAppDialog';
import {InstallAppPromptEvent} from './app/installation/InstallAppPromptEvent';
import {Body} from 'lib-admin-ui/dom/Body';
import {Path} from 'lib-admin-ui/rest/Path';
import {NotifyManager} from 'lib-admin-ui/notify/NotifyManager';
import {ConnectionDetector} from 'lib-admin-ui/system/ConnectionDetector';
import {showError} from 'lib-admin-ui/notify/MessageBus';
import {UriHelper} from 'lib-admin-ui/util/UriHelper';
import {AppBar} from 'lib-admin-ui/app/bar/AppBar';
import {AppHelper} from 'lib-admin-ui/util/AppHelper';
import {ServerEventsListener} from 'lib-admin-ui/event/ServerEventsListener';
import {i18nInit} from 'lib-admin-ui/util/MessagesInitializer';
import {i18n} from 'lib-admin-ui/util/Messages';

declare const CONFIG;

const body = Body.get();

function getApplication(): Application {
    const application = new Application('applications', 'Applications', 'AM', CONFIG.appIconUrl);
    application.setPath(Path.fromString('/'));
    application.setWindow(window);

    return application;
}

function startLostConnectionDetector() {
    ConnectionDetector.get()
        .setAuthenticated(true)
        .setSessionExpireRedirectUrl(UriHelper.getToolUri(''))
        .setNotificationMessage(i18n('notify.connection.loss'));
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

}

const renderListener = () => {
    i18nInit(CONFIG.i18nUrl).then(() => startApplication());
    body.unRendered(renderListener);
};
if (body.isRendered()) {
    renderListener();
} else {
    body.onRendered(renderListener);
}
