import {describe, expect, it} from 'vitest';
import {type ApplicationInfoJson, toApplicationInfoDto} from './application-info';

describe('toApplicationInfoDto', () => {
    it('returns empty arrays for an empty payload', () => {
        expect(toApplicationInfoDto({})).toEqual({
            contentTypes: [],
            pages: [],
            parts: [],
            layouts: [],
            macros: [],
            tasks: [],
            tools: [],
            widgets: [],
            apis: [],
            idProviderApplication: undefined,
            deploymentUrl: '',
        });
    });

    it('extracts content-type local names by stripping the application key prefix', () => {
        const json: ApplicationInfoJson = {
            contentTypes: {
                contentTypes: [
                    {name: 'portal:fragment'},
                    {name: 'com.example.app:article'},
                    {name: 'bare'},
                ],
            },
        };
        expect(toApplicationInfoDto(json).contentTypes).toEqual(['fragment', 'article', 'bare']);
    });

    it('maps page/part/layout descriptors to {key, name}', () => {
        const json: ApplicationInfoJson = {
            pages: {descriptors: [{key: 'k1', name: 'pageA', title: '', description: ''}]},
            parts: {descriptors: [{key: 'k2', name: 'partA', title: '', description: ''}]},
            layouts: {descriptors: [{key: 'k3', name: 'layoutA', title: '', description: ''}]},
        };
        const dto = toApplicationInfoDto(json);
        expect(dto.pages).toEqual([{key: 'k1', name: 'pageA'}]);
        expect(dto.parts).toEqual([{key: 'k2', name: 'partA'}]);
        expect(dto.layouts).toEqual([{key: 'k3', name: 'layoutA'}]);
    });

    it('filters out system-owned macros', () => {
        const json: ApplicationInfoJson = {
            macros: {
                macros: [
                    {key: 'system:disable', name: 'disable', displayName: 'Disable', description: '', iconUrl: ''},
                    {key: 'my.app:embed', name: 'embed', displayName: 'Embed', description: '', iconUrl: ''},
                ],
            },
        };
        expect(toApplicationInfoDto(json).macros).toEqual([
            {key: 'my.app:embed', displayName: 'Embed'},
        ]);
    });

    it('maps tasks one-to-one', () => {
        const json: ApplicationInfoJson = {
            tasks: {tasks: [{key: 't1', description: 'A task'}]},
        };
        expect(toApplicationInfoDto(json).tasks).toEqual([{key: 't1', description: 'A task'}]);
    });

    it('maps admin tools to {key, title, toolUrl}', () => {
        const json: ApplicationInfoJson = {
            tools: {
                descriptors: [
                    {
                        key: 'tk1',
                        application: 'app',
                        name: 'tool',
                        title: 'Tool',
                        description: '',
                        icon: '',
                        toolUrl: '/admin/tool',
                    },
                ],
            },
        };
        expect(toApplicationInfoDto(json).tools).toEqual([
            {key: 'tk1', title: 'Tool', toolUrl: '/admin/tool'},
        ]);
    });

    it('maps widgets and defaults interfaces to an empty array', () => {
        const json: ApplicationInfoJson = {
            widgets: {
                descriptors: [
                    {key: 'w1', title: 'Widget A', description: '', iconUrl: '', url: '', interfaces: ['admin']},
                    // @ts-expect-error — exercise the runtime default for missing interfaces
                    {key: 'w2', title: 'Widget B', description: '', iconUrl: '', url: ''},
                ],
            },
        };
        expect(toApplicationInfoDto(json).widgets).toEqual([
            {key: 'w1', displayName: 'Widget A', interfaces: ['admin']},
            {key: 'w2', displayName: 'Widget B', interfaces: []},
        ]);
    });

    it('maps APIs and falls back title to empty when missing', () => {
        const json: ApplicationInfoJson = {
            apis: {
                descriptors: [
                    {key: 'a1', name: 'api1', mount: [], allowedPrincipals: [], title: 'API One'},
                    {key: 'a2', name: 'api2', mount: [], allowedPrincipals: []},
                ],
            },
        };
        expect(toApplicationInfoDto(json).apis).toEqual([
            {key: 'a1', name: 'api1', title: 'API One'},
            {key: 'a2', name: 'api2', title: ''},
        ]);
    });

    it('passes through a recognised id-provider mode', () => {
        const json: ApplicationInfoJson = {
            idProviderApplication: {
                mode: 'EXTERNAL',
                idProviders: [{path: '/p1'}, {path: '/p2'}],
            },
        };
        expect(toApplicationInfoDto(json).idProviderApplication).toEqual({
            mode: 'EXTERNAL',
            idProviders: [{path: '/p1'}, {path: '/p2'}],
        });
    });

    it('returns undefined when the id-provider mode is missing or unrecognised', () => {
        expect(toApplicationInfoDto({idProviderApplication: {}}).idProviderApplication).toBeUndefined();
        expect(toApplicationInfoDto({idProviderApplication: {mode: 'BOGUS'}}).idProviderApplication).toBeUndefined();
    });

    it('appends a trailing slash to the deployment URL when missing', () => {
        expect(
            toApplicationInfoDto({deployment: {url: 'https://example.com/app'}}).deploymentUrl,
        ).toBe('https://example.com/app/');
        expect(
            toApplicationInfoDto({deployment: {url: 'https://example.com/app/'}}).deploymentUrl,
        ).toBe('https://example.com/app/');
    });

    it('returns "" for an empty deployment URL', () => {
        expect(toApplicationInfoDto({}).deploymentUrl).toBe('');
        expect(toApplicationInfoDto({deployment: {url: ''}}).deploymentUrl).toBe('');
    });
});
