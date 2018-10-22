import {ApplicationInfoJson} from './json/ApplicationInfoJson';
import {ContentReference} from './ContentReference';
import {ApplicationDeployment} from './json/ApplicationDeployment';
import {ApplicationTask} from './ApplicationTask';
import {ApplicationIdProvider} from './ApplicationIdProvider';
import {AdminToolDescriptor} from './AdminToolDescriptor';
import {RelationshipType} from '../relationshiptype/RelationshipType';
import ContentTypeSummary = api.schema.content.ContentTypeSummary;
import PageDescriptor = api.content.page.PageDescriptor;
import PartDescriptor = api.content.page.region.PartDescriptor;
import LayoutDescriptor = api.content.page.region.LayoutDescriptor;
import MacroDescriptor = api.macro.MacroDescriptor;
import Widget = api.content.Widget;

export class ApplicationInfo {

    private contentTypes: ContentTypeSummary[];

    private pages: PageDescriptor[];

    private parts: PartDescriptor[];

    private layouts: LayoutDescriptor[];

    private relations: RelationshipType[];

    private references: ContentReference[];

    private macros: MacroDescriptor[];

    private tasks: ApplicationTask[];

    private widgets: Widget[];

    private tools: AdminToolDescriptor[];

    private idProvider: ApplicationIdProvider;

    private deployment: ApplicationDeployment;

    static fromJson(json: ApplicationInfoJson): ApplicationInfo {
        let result = new ApplicationInfo();

        result.contentTypes = json.contentTypes ? ContentTypeSummary.fromJsonArray(json.contentTypes.contentTypes) : [];

        result.pages = (json.pages && json.pages.descriptors) ? json.pages.descriptors.map(descriptorJson => {
            return PageDescriptor.fromJson(descriptorJson);
        }) : [];

        result.parts = (json.parts && json.parts.descriptors) ? json.parts.descriptors.map((descriptorJson => {
            return PartDescriptor.fromJson(descriptorJson);
        })) : [];

        result.layouts = (json.layouts && json.layouts.descriptors) ? json.layouts.descriptors.map((descriptorJson => {
            return LayoutDescriptor.fromJson(descriptorJson);
        })) : [];

        result.relations = (json.relations && json.relations.relationshipTypes) ? json.relations.relationshipTypes.map(
            (relationshipJson) => {
                return RelationshipType.fromJson(relationshipJson);
            }) : [];

        result.macros = (json.macros && json.macros.macros) ? json.macros.macros.map((macroJson) => {
            return MacroDescriptor.fromJson(macroJson);
        }) : [];

        result.references = (json.references && json.references.references) ? json.references.references.map((referenceJson) => {
            return ContentReference.fromJson(referenceJson);
        }) : [];

        result.tasks = (json.tasks && json.tasks.tasks) ? json.tasks.tasks.map((taskJson) => {
            return ApplicationTask.fromJson(taskJson);
        }) : [];

        result.widgets = (json.widgets && json.widgets.descriptors) ? json.widgets.descriptors.map((widgetJson) => {
            return Widget.fromJson(widgetJson);
        }) : [];

        result.tools = (json.tools && json.tools.descriptors) ? json.tools.descriptors.map((toolJson) => {
            return AdminToolDescriptor.fromJson(toolJson);
        }) : [];

        result.idProvider = json.idProvider ? ApplicationIdProvider.fromJson(json.idProvider) : null;

        result.deployment = json.deployment;

        return result;
    }

    getContentTypes(): api.schema.content.ContentTypeSummary[] {
        return this.contentTypes;
    }

    getPages(): api.content.page.PageDescriptor[] {
        return this.pages;
    }

    getParts(): api.content.page.region.PartDescriptor[] {
        return this.parts;
    }

    getLayouts(): api.content.page.region.LayoutDescriptor[] {
        return this.layouts;
    }

    getRelations(): RelationshipType[] {
        return this.relations;
    }

    getReferences(): ContentReference[] {
        return this.references;
    }

    getMacros(): api.macro.MacroDescriptor[] {
        return this.macros;
    }

    getTasks(): ApplicationTask[] {
        return this.tasks;
    }

    getWidgets(): Widget[] {
        return this.widgets;
    }

    getTools(): AdminToolDescriptor[] {
        return this.tools;
    }

    getIdProvider(): ApplicationIdProvider {
        return this.idProvider;
    }

    getDeployment(): ApplicationDeployment {
        return this.deployment;
    }
}
