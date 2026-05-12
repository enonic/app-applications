import {Body} from '@enonic/lib-admin-ui/dom/Body';
import type {ReactElement} from 'react';
import {registerApplicationEvents} from './features/events/applicationEvents';
import {LegacyElement} from './shared/LegacyElement';

/**
 * AppShell component that renders the v2 application tree.
 * Rendered at the app root so dialogs can portal correctly.
 * Returns null until BrowsePage / dialogs land in later phases.
 */
const App = (): ReactElement | null => {
    return null;
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
            Body.get().appendChild(AppElement.INSTANCE);
            registerApplicationEvents();
        }
    }
}
