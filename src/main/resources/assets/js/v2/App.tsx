import type {Application} from '@enonic/lib-admin-ui/app/Application';
import {Body} from '@enonic/lib-admin-ui/dom/Body';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import type {ReactElement} from 'react';
import {LegacyElement} from './app/legacy/LegacyElement';
import {registerApplicationEvents} from './app/events/registerApplicationEvents';
import {ApplicationsPage} from './pages/applications/ApplicationsPage';
import {setReadonly} from './shared/config/readonly';
import {Toaster} from './shared/ui/toaster/Toaster';

interface AppProps {
    application: Application;
}

/**
 * Composition root of the v2 application tree. Mounted via `LegacyElement` so
 * dialog portals continue to attach inside the same DOM root.
 */
const App = ({application}: AppProps): ReactElement => {
    return (
        <>
            <ApplicationsPage application={application} />
            <Toaster />
        </>
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
