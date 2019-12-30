import {ContentReferencesJson} from './ContentReferencesJson';
import {ApplicationDeployment} from './ApplicationDeployment';
import {ApplicationTasksJson} from './ApplicationTasksJson';
import {IdProviderApplicationJson} from './IdProviderApplicationJson';
import {WidgetDescriptorsJson} from './WidgetDescriptorsJson';
import {RelationshipTypeListJson} from '../../relationshiptype/RelationshipTypeListJson';
import {ContentTypeSummaryListJson} from 'lib-admin-ui/schema/content/ContentTypeSummaryListJson';
import {PageDescriptorsJson} from 'lib-admin-ui/content/page/PageDescriptorsJson';
import {PartDescriptorsJson} from 'lib-admin-ui/content/page/region/PartDescriptorsJson';
import {LayoutDescriptorsJson} from 'lib-admin-ui/content/page/region/LayoutDescriptorsJson';
import {MacrosJson} from 'lib-admin-ui/macro/resource/MacrosJson';
import {AdminToolDescriptorsJson} from './AdminToolDescriptorsJson';

export interface ApplicationInfoJson {

    contentTypes: ContentTypeSummaryListJson;

    pages: PageDescriptorsJson;

    parts: PartDescriptorsJson;

    layouts: LayoutDescriptorsJson;

    relations: RelationshipTypeListJson;

    macros: MacrosJson;

    references: ContentReferencesJson;

    tasks: ApplicationTasksJson;

    idProviderApplication: IdProviderApplicationJson;

    deployment: ApplicationDeployment;

    widgets: WidgetDescriptorsJson;

    tools: AdminToolDescriptorsJson;

}
