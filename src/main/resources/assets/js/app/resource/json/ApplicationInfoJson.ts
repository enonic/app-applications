import {ContentReferencesJson} from './ContentReferencesJson';
import {ApplicationDeployment} from './ApplicationDeployment';
import {ApplicationTasksJson} from './ApplicationTasksJson';
import {IdProviderApplicationJson} from './IdProviderApplicationJson';
import {WidgetDescriptorsJson} from './WidgetDescriptorsJson';
import {RelationshipTypeListJson} from '../../relationshiptype/RelationshipTypeListJson';
import {ContentTypeSummaryListJson} from '@enonic/lib-admin-ui/schema/content/ContentTypeSummaryListJson';
import {BaseDescriptorsJson} from './BaseDescriptorJson';
import {MacrosJson} from '@enonic/lib-admin-ui/macro/MacrosJson';
import {AdminToolDescriptorsJson} from './AdminToolDescriptorsJson';

export interface ApplicationInfoJson {

    contentTypes: ContentTypeSummaryListJson;

    pages: BaseDescriptorsJson;

    parts: BaseDescriptorsJson;

    layouts: BaseDescriptorsJson;

    relations: RelationshipTypeListJson;

    macros: MacrosJson;

    references: ContentReferencesJson;

    tasks: ApplicationTasksJson;

    idProviderApplication: IdProviderApplicationJson;

    deployment: ApplicationDeployment;

    widgets: WidgetDescriptorsJson;

    tools: AdminToolDescriptorsJson;

}
