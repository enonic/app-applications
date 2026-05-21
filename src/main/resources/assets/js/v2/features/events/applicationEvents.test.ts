import {ApplicationEvent, ApplicationEventType} from '@enonic/lib-admin-ui/application/ApplicationEvent';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
    $appActions,
    markStarting,
    markStopping,
    resetAppActions,
    setInstalling,
} from '../store/app-actions.store';
import {$applications, resetApplications, setApplications} from '../store/applications.store';
import type {ApplicationDto} from '../types/application';
import {handleApplicationEvent} from './applicationEvents';

// ! lib-admin-ui's AbstractEvent constructor calls ClassHelper.getFullName,
// which references `window`. The test environment is Node, so stub it.
(globalThis as Record<string, unknown>).window ??= globalThis;

function makeApp(overrides: Partial<ApplicationDto> & {key: string}): ApplicationDto {
    return {
        key: overrides.key,
        name: overrides.name ?? overrides.key,
        displayName: overrides.displayName ?? overrides.key,
        description: overrides.description ?? '',
        version: overrides.version ?? '1.0.0',
        state: overrides.state ?? 'started',
        url: overrides.url ?? '',
        iconUrl: overrides.iconUrl ?? '',
        vendorName: overrides.vendorName ?? '',
        vendorUrl: overrides.vendorUrl ?? '',
        local: overrides.local ?? false,
        system: overrides.system ?? false,
        minSystemVersion: overrides.minSystemVersion ?? '',
        maxSystemVersion: overrides.maxSystemVersion ?? '',
        modifiedTime: overrides.modifiedTime ?? '',
    };
}

function mockFetchOnce(body: unknown, init: ResponseInit = {status: 200}) {
    const response = new Response(typeof body === 'string' ? body : JSON.stringify(body), {
        headers: {'Content-Type': 'application/json'},
        ...init,
    });
    return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response);
}

function makeEvent(
    type: ApplicationEventType,
    options: {key?: string; progress?: number; systemApplication?: boolean} = {},
): ApplicationEvent {
    const key = options.key != null ? ApplicationKey.fromString(options.key) : null;
    return new ApplicationEvent(key, type, options.systemApplication ?? false, undefined, options.progress);
}

const APP_JSON = {
    key: 'com.enonic.app.demo',
    title: 'Demo App',
    displayName: '',
    description: '',
    info: '',
    url: '',
    vendorName: 'Enonic',
    vendorUrl: '',
    version: '1.2.3',
    state: 'started',
    config: undefined,
    idProviderConfig: undefined,
    applicationDependencies: [],
    contentTypeDependencies: [],
    metaSteps: [],
    minSystemVersion: '',
    maxSystemVersion: '',
    local: false,
    iconUrl: '',
    system: false,
};

describe('events/applicationEvents', () => {
    beforeEach(() => {
        resetAppActions();
        resetApplications();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('handleApplicationEvent', () => {
        it('ignores events without an application key', async () => {
            const fetchMock = vi.spyOn(globalThis, 'fetch');
            await handleApplicationEvent(makeEvent(ApplicationEventType.INSTALLED));
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('INSTALLED refetches the app, upserts it and clears the installing record', async () => {
            setInstalling({key: 'com.enonic.app.demo', progress: 80});
            mockFetchOnce(APP_JSON);

            await handleApplicationEvent(makeEvent(ApplicationEventType.INSTALLED, {key: 'com.enonic.app.demo'}));

            expect($applications.get().byKey['com.enonic.app.demo']).toMatchObject({
                key: 'com.enonic.app.demo',
                displayName: 'Demo App',
            });
            expect($appActions.get().installing['com.enonic.app.demo']).toBeUndefined();
        });

        it('UNINSTALLED removes the application from the store', async () => {
            setApplications([makeApp({key: 'com.enonic.app.demo'})]);

            await handleApplicationEvent(makeEvent(ApplicationEventType.UNINSTALLED, {key: 'com.enonic.app.demo'}));

            expect($applications.get().byKey['com.enonic.app.demo']).toBeUndefined();
        });

        it('UNINSTALLED also drops any in-flight install record', async () => {
            setInstalling({key: 'com.enonic.app.demo', progress: 30});

            await handleApplicationEvent(makeEvent(ApplicationEventType.UNINSTALLED, {key: 'com.enonic.app.demo'}));

            expect($appActions.get().installing['com.enonic.app.demo']).toBeUndefined();
        });

        it('STARTING marks the application as starting', async () => {
            await handleApplicationEvent(makeEvent(ApplicationEventType.STARTING, {key: 'com.enonic.app.demo'}));
            expect($appActions.get().starting.has('com.enonic.app.demo')).toBe(true);
        });

        it('STARTED refetches and clears the starting flag', async () => {
            markStarting(['com.enonic.app.demo']);
            mockFetchOnce({...APP_JSON, state: 'started'});

            await handleApplicationEvent(makeEvent(ApplicationEventType.STARTED, {key: 'com.enonic.app.demo'}));

            expect($appActions.get().starting.has('com.enonic.app.demo')).toBe(false);
            expect($applications.get().byKey['com.enonic.app.demo']?.state).toBe('started');
        });

        it('STOPPING marks the application as stopping', async () => {
            await handleApplicationEvent(makeEvent(ApplicationEventType.STOPPING, {key: 'com.enonic.app.demo'}));
            expect($appActions.get().stopping.has('com.enonic.app.demo')).toBe(true);
        });

        it('STOPPED refetches and clears the stopping flag', async () => {
            markStopping(['com.enonic.app.demo']);
            mockFetchOnce({...APP_JSON, state: 'stopped'});

            await handleApplicationEvent(makeEvent(ApplicationEventType.STOPPED, {key: 'com.enonic.app.demo'}));

            expect($appActions.get().stopping.has('com.enonic.app.demo')).toBe(false);
            expect($applications.get().byKey['com.enonic.app.demo']?.state).toBe('stopped');
        });

        it('UPDATED refetches and upserts the application', async () => {
            mockFetchOnce({...APP_JSON, title: 'Updated Title'});

            await handleApplicationEvent(makeEvent(ApplicationEventType.UPDATED, {key: 'com.enonic.app.demo'}));

            expect($applications.get().byKey['com.enonic.app.demo']?.displayName).toBe('Updated Title');
        });

        it('UNRESOLVED refetches and upserts the application', async () => {
            mockFetchOnce({...APP_JSON, state: 'unresolved'});

            await handleApplicationEvent(makeEvent(ApplicationEventType.UNRESOLVED, {key: 'com.enonic.app.demo'}));

            expect($applications.get().byKey['com.enonic.app.demo']?.state).toBe('unknown');
        });

        it('PROGRESS records the install progress', async () => {
            await handleApplicationEvent(
                makeEvent(ApplicationEventType.PROGRESS, {key: 'com.enonic.app.demo', progress: 42}),
            );

            expect($appActions.get().installing['com.enonic.app.demo']).toEqual({
                key: 'com.enonic.app.demo',
                progress: 42,
            });
        });

        it('RESOLVED is a no-op', async () => {
            const fetchMock = vi.spyOn(globalThis, 'fetch');
            setApplications([makeApp({key: 'com.enonic.app.demo'})]);

            await handleApplicationEvent(makeEvent(ApplicationEventType.RESOLVED, {key: 'com.enonic.app.demo'}));

            expect(fetchMock).not.toHaveBeenCalled();
            expect($applications.get().byKey['com.enonic.app.demo']).toBeDefined();
        });

        it('swallows refetch failures so a single bad event does not break the bridge', async () => {
            mockFetchOnce(JSON.stringify({message: 'gone'}), {status: 404});

            await expect(
                handleApplicationEvent(makeEvent(ApplicationEventType.UPDATED, {key: 'com.enonic.app.demo'})),
            ).resolves.toBeUndefined();
        });
    });
});
