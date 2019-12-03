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
    api.system.ConnectionDetector.get()
            .setAuthenticated(true)
            .setSessionExpireRedirectUrl(api.util.UriHelper.getToolUri(''))
            .setNotificationMessage(api.util.i18n('notify.connection.loss'))
            .startPolling(true);
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
    api.util.i18nInit(CONFIG.i18nUrl).then(() => startApplication());
    body.unRendered(renderListener);
};
if (body.isRendered()) {
    renderListener();
} else {
    body.onRendered(renderListener);
}
