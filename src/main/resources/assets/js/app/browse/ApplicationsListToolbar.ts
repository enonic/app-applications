import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ListBoxToolbar, ListBoxToolbarParams} from '@enonic/lib-admin-ui/ui/selector/list/ListBoxToolbar';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';
import {TogglerButton} from '@enonic/lib-admin-ui/ui/button/TogglerButton';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';

export interface ApplicationsListToolbarParams extends ListBoxToolbarParams {
    onHideSystemAppsToggled: (hide: boolean) => void;
}

export class ApplicationsListToolbar extends ListBoxToolbar<Application> {

    private readonly hideSystemAppsButton: TogglerButton;

    constructor(listBoxWrapper: SelectableListBoxWrapper<Application>, params: ApplicationsListToolbarParams) {
        super(listBoxWrapper, params);

        const initialLabel = i18n('action.hideSystemApps');
        this.hideSystemAppsButton = new TogglerButton('hide-system-apps-toggler icon-cog', initialLabel);
        this.hideSystemAppsButton.setEnabled(true);
        this.hideSystemAppsButton.setAriaLabel(initialLabel);
        this.hideSystemAppsButton.onActiveChanged((isActive: boolean) => {
            const label = i18n(isActive ? 'action.showSystemApps' : 'action.hideSystemApps');
            this.hideSystemAppsButton.setTitle(label);
            this.hideSystemAppsButton.setAriaLabel(label);
            params.onHideSystemAppsToggled(isActive);
        });

        this.appendToRight(this.hideSystemAppsButton);
    }

    isHidingSystemApps(): boolean {
        return this.hideSystemAppsButton.isActive();
    }
}
