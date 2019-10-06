import {UninstallApplicationEvent} from './UninstallApplicationEvent';
import {i18n} from 'lib-admin-ui/util/Messages';
import {Application} from 'lib-admin-ui/application/Application';
import {Action} from 'lib-admin-ui/ui/Action';
import {ModalDialog} from 'lib-admin-ui/ui/dialog/ModalDialog';
import {H6El} from 'lib-admin-ui/dom/H6El';

export class UninstallApplicationDialog
    extends ModalDialog {

    private applications: Application[];

    private yesAction: Action = new Action(i18n('action.yes'));

    private noAction: Action = new Action(i18n('action.no'));

    constructor(applications: Application[]) {
        super({title: i18n('dialog.uninstall')});

        this.applications = applications;
        this.addClass('uninstall-dialog');

        let message = new H6El();
        message.getEl().setInnerHtml(i18n('dialog.uninstall.question'));
        this.appendChildToContentPanel(message);

        this.yesAction.onExecuted(() => {
            new UninstallApplicationEvent(this.applications).fire();
            this.close();
        });
        this.addAction(this.yesAction);

        this.noAction.onExecuted(() => {
            this.close();
        });
        this.addAction(this.noAction);
    }

    show() {
        super.show();
    }

    close() {
        super.close();
        this.remove();
    }
}
