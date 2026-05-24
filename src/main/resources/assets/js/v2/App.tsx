import type {Application} from '@enonic/lib-admin-ui/app/Application';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import type {ReactElement} from 'react';
import {registerApplicationEvents} from './features/events/applicationEvents';
import {setReadonly} from './features/store/app.store';
import {LegacyElement} from './shared/LegacyElement';
import {Toaster} from './shared/ui/Toaster';
import {BrowsePage} from './views/browse/BrowsePage';
import {DetailPanel} from './views/detail/DetailPanel';
import {InstallDialog} from './views/install/InstallDialog';
import {TopBar} from './views/topbar/TopBar';

interface AppProps {
    application: Application;
}

/**
 * Root of the v2 application tree. Owns the modern Enonic top chrome plus the
 * browse / detail split below it. Mounted via `LegacyElement` so dialog
 * portals continue to attach inside the same DOM root.
 */
const App = ({application}: AppProps): ReactElement => {
    return (
        <div className="flex h-full w-full min-h-0 flex-col">
            <TopBar application={application} />
            <div className="flex w-full min-h-0 flex-1 flex-row bg-surface-primary">
                <div className="flex h-full min-w-0 flex-1 flex-col">
                    <BrowsePage />
                </div>
                <DetailPanel />
            </div>
            <InstallDialog />
            <Toaster />
        </div>
    );
};

App.displayName = 'App';

export class AppElement extends LegacyElement<typeof App> {
    private static INSTANCE: AppElement;

    private constructor(application: Application) {
        super({application}, App);
    }

    static initialize(application: Application): void {
        if (!AppElement.INSTANCE) {
            AppElement.INSTANCE = new AppElement(application);
            AppElement.INSTANCE.addClass('block h-full w-full');
            Body.get().appendChild(AppElement.INSTANCE);
            setReadonly(CONFIG.isTrue('readonlyMode'));
            registerApplicationEvents();
        }
    }
}
