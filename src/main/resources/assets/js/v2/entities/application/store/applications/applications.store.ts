import {map} from 'nanostores';
import type {ApplicationsState} from './applications.types';

function initialState(): ApplicationsState {
    return {
        items: [],
        byKey: {},
        infoByKey: {},
        status: 'idle',
    };
}

export const $applications = map<ApplicationsState>(initialState());

export {initialState as initialApplicationsState};
