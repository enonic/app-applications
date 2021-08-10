import {GridColumnConfig} from 'lib-admin-ui/ui/grid/GridColumn';
import {ApplicationRowFormatter} from './ApplicationRowFormatter';
import {i18n} from 'lib-admin-ui/util/Messages';

export class ApplicationTreeGridHelper {

    public static generateColumnsConfig(): GridColumnConfig[] {
        return [{
            name: i18n('field.name'),
            id: 'displayName',
            field: 'displayName',
            formatter: ApplicationRowFormatter.nameFormatter,
            style: {cssClass: 'name', minWidth: 250}
        }, {
            name: i18n('field.version'),
            id: 'version',
            field: 'version',
            style: {cssClass: 'version', minWidth: 50, maxWidth: 130}
        }, {
            name: i18n('field.state'),
            id: 'state',
            field: 'state',
            formatter: ApplicationRowFormatter.stateFormatter,
            style: {cssClass: 'state', minWidth: 80, maxWidth: 100}
        }];
    }
}
