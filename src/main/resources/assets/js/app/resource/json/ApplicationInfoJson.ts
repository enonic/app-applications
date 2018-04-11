import '../../../api.ts';
import {ContentReferencesJson} from './ContentReferencesJson';
import {ApplicationDeployment} from './ApplicationDeployment';
import {ApplicationTasksJson} from './ApplicationTasksJson';
import {ApplicationIdProviderJson} from './ApplicationIdProviderJson';
import ContentTypeSummaryListJson = api.schema.content.ContentTypeSummaryListJson;
import PageDescriptorsJson = api.content.page.PageDescriptorsJson;
import PartDescriptorsJson = api.content.page.region.PartDescriptorsJson;
import LayoutDescriptorsJson = api.content.page.region.LayoutDescriptorsJson;
import RelationshipTypeListJson = api.schema.relationshiptype.RelationshipTypeListJson;
import WidgetDescriptorsJson = api.content.json.WidgetDescriptorsJson;
import AdminToolDescriptorsJson = api.content.json.AdminToolDescriptorsJson;
import MacrosJson = api.macro.resource.MacrosJson;

export interface ApplicationInfoJson {

    contentTypes: ContentTypeSummaryListJson;

    pages: PageDescriptorsJson;

    parts: PartDescriptorsJson;

    layouts: LayoutDescriptorsJson;

    relations: RelationshipTypeListJson;

    macros: MacrosJson;

    references: ContentReferencesJson;

    tasks: ApplicationTasksJson;

    idProvider: ApplicationIdProviderJson;

    deployment: ApplicationDeployment;

    widgets: WidgetDescriptorsJson;

    tools: AdminToolDescriptorsJson;

}
