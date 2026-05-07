import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ListBoxToolbar, ListBoxToolbarParams} from '@enonic/lib-admin-ui/ui/selector/list/ListBoxToolbar';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';
import {TogglerButton} from '@enonic/lib-admin-ui/ui/button/TogglerButton';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';

const ARE_SYSTEM_APPS_SHOWN_BY_DEFAULT = false;

export interface ApplicationsListToolbarParams extends ListBoxToolbarParams {
    onSystemAppsVisibilityToggled: (show: boolean) => void;
}

export class ApplicationsListToolbar extends ListBoxToolbar<Application> {

    private readonly systemAppsToggleButton: TogglerButton;

    constructor(listBoxWrapper: SelectableListBoxWrapper<Application>, params: ApplicationsListToolbarParams) {
        super(listBoxWrapper, params);

        const initialLabel = i18n(ARE_SYSTEM_APPS_SHOWN_BY_DEFAULT ? 'action.hideSystemApps' : 'action.showSystemApps');
        this.systemAppsToggleButton = new TogglerButton('hide-system-apps-toggler icon-cog', initialLabel);
        this.systemAppsToggleButton.removeClass('icon-medium');
        this.systemAppsToggleButton.setEnabled(true);
        this.systemAppsToggleButton.setTitle(initialLabel);
        this.systemAppsToggleButton.setAriaLabel(initialLabel);
        this.systemAppsToggleButton.onActiveChanged((isActive: boolean) => {
            const label = i18n(isActive ? 'action.hideSystemApps' : 'action.showSystemApps');
            this.systemAppsToggleButton.setTitle(label);
            this.systemAppsToggleButton.setAriaLabel(label);
            params.onSystemAppsVisibilityToggled(isActive);
        });

        this.appendToRight(this.systemAppsToggleButton);
    }

    isShowingSystemApps(): boolean {
        return this.systemAppsToggleButton.isActive();
    }
}
