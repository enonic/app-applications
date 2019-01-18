import i18n = api.util.i18n;

declare const CONFIG;

const body = api.dom.Body.get();

import './api.ts';
import {ApplicationAppPanel} from './app/ApplicationAppPanel';
import {InstallAppDialog} from './app/installation/InstallAppDialog';
import {InstallAppPromptEvent} from './app/installation/InstallAppPromptEvent';

function getApplication(): api.app.Application {
    const application = new api.app.Application('applications', 'Applications', 'AM', CONFIG.appIconUrl);
    application.setPath(api.rest.Path.fromString('/'));
    application.setWindow(window);

    return application;
}

function startLostConnectionDetector() {
    let messageId;
    const lostConnectionDetector = new api.system.ConnectionDetector();
    lostConnectionDetector.setAuthenticated(true);
    lostConnectionDetector.onConnectionLost(() => {
        api.notify.NotifyManager.get().hide(messageId);
        messageId = api.notify.showError(i18n('notify.connection.loss'), false);
    });
    lostConnectionDetector.onSessionExpired(() => {
        api.notify.NotifyManager.get().hide(messageId);
        window.location.href = api.util.UriHelper.getToolUri('');
    });
    lostConnectionDetector.onConnectionRestored(() => {
        api.notify.NotifyManager.get().hide(messageId);
    });

    lostConnectionDetector.startPolling();
}

function startApplication() {

    const application: api.app.Application = getApplication();
    const appBar = new api.app.bar.AppBar(application);
    const appPanel = new ApplicationAppPanel(application.getPath());

    body.appendChild(appBar);
    body.appendChild(appPanel);

    api.util.AppHelper.preventDragRedirect();

    application.setLoaded(true);

    const serverEventsListener = new api.event.ServerEventsListener([application]);
    serverEventsListener.start();

    startLostConnectionDetector();

    const installAppDialog = new InstallAppDialog();

    InstallAppPromptEvent.on((event) => {
        installAppDialog.updateInstallApplications(event.getInstalledApplications());
        installAppDialog.open();
    });

}

const renderListener = () => {
    api.util.i18nInit(CONFIG.messages).then(() => startApplication());
    body.unRendered(renderListener);
};
if (body.isRendered()) {
    renderListener();
} else {
    body.onRendered(renderListener);
}
