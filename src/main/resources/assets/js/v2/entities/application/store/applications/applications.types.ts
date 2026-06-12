import type {ApplicationDto} from '../../types/Application';
import type {ApplicationInfoDto} from '../../types/ApplicationInfo';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface ApplicationsState {
    items: ApplicationDto[];
    byKey: Record<string, ApplicationDto>;
    infoByKey: Record<string, ApplicationInfoDto>;
    status: LoadStatus;
}
