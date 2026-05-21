import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import type {ReactElement} from 'react';
import {registerApplicationEvents} from './features/events/applicationEvents';
import {setReadonly} from './features/store/app.store';
import {LegacyElement} from './shared/LegacyElement';
import {BrowsePage} from './views/browse/BrowsePage';
import {DetailPanel} from './views/detail/DetailPanel';
import {InstallDialog} from './views/install/InstallDialog';

/**
 * AppShell component that renders the v2 application tree. Mounted under
 * `Body` so dialog portals attach above the legacy AppBar.
 */
const App = (): ReactElement => {
    return (
        <>
            <div className="flex h-full w-full min-h-0 flex-1 flex-row">
                <div className="flex h-full min-w-0 flex-1 flex-col border-r border-bdr-soft">
                    <BrowsePage />
                </div>
                <DetailPanel />
            </div>
            <InstallDialog />
        </>
    );
};

App.displayName = 'App';

export class AppElement extends LegacyElement<typeof App> {
    private static INSTANCE: AppElement;

    private constructor() {
        super({}, App);
    }

    static initialize(): void {
        if (!AppElement.INSTANCE) {
            AppElement.INSTANCE = new AppElement();
            AppElement.INSTANCE.addClass('flex-1 min-h-0 w-full');
            Body.get().appendChild(AppElement.INSTANCE);
            setReadonly(CONFIG.isTrue('readonlyMode'));
            registerApplicationEvents();
        }
    }
}
