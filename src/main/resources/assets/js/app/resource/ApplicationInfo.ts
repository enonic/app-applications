import {ApplicationInfoJson} from './json/ApplicationInfoJson';
import {ContentReference} from './ContentReference';
import {ApplicationDeployment} from './json/ApplicationDeployment';
import {ApplicationTask} from './ApplicationTask';
import {IdProviderApplication} from './IdProviderApplication';
import {AdminToolDescriptor} from './AdminToolDescriptor';
import {RelationshipType} from '../relationshiptype/RelationshipType';
import {ContentTypeSummary} from '@enonic/lib-admin-ui/schema/content/ContentTypeSummary';
import {MacroDescriptor} from '@enonic/lib-admin-ui/macro/MacroDescriptor';
import {Widget} from '@enonic/lib-admin-ui/content/Widget';
import {BaseDescriptor} from './BaseDescriptor';
import {ApiDescriptor} from './ApiDescriptor';

export class ApplicationInfo {

    private contentTypes: ContentTypeSummary[];

    private pages: BaseDescriptor[];

    private parts: BaseDescriptor[];

    private layouts: BaseDescriptor[];

    private relations: RelationshipType[];

    private references: ContentReference[];

    private macros: MacroDescriptor[];

    private tasks: ApplicationTask[];

    private widgets: Widget[];

    private tools: AdminToolDescriptor[];

    private idProviderApplication: IdProviderApplication;

    private deployment: ApplicationDeployment;

    private apiDescriptors: ApiDescriptor[];

    static fromJson(json: ApplicationInfoJson): ApplicationInfo {
        let result = new ApplicationInfo();

        result.contentTypes = json.contentTypes ? ContentTypeSummary.fromJsonArray(json.contentTypes.contentTypes) : [];

        result.pages = (json.pages && json.pages.descriptors) ?
            json.pages.descriptors.map(descriptorJson => BaseDescriptor.fromJson(descriptorJson)) : [];

        result.parts = (json.parts && json.parts.descriptors) ?
            json.parts.descriptors.map((descriptorJson => BaseDescriptor.fromJson(descriptorJson))) : [];

        result.layouts = (json.layouts && json.layouts.descriptors) ?
            json.layouts.descriptors.map((descriptorJson => BaseDescriptor.fromJson(descriptorJson))) : [];

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

        result.apiDescriptors = json.apis && json.apis.descriptors ? json.apis.descriptors.map((apiJson) => {
            return ApiDescriptor.fromJson(apiJson);
        }) : [];

        result.idProviderApplication = json.idProviderApplication ? IdProviderApplication.fromJson(json.idProviderApplication) : null;

        result.deployment = json.deployment;

        return result;
    }

    getContentTypes(): ContentTypeSummary[] {
        return this.contentTypes;
    }

    getPages(): BaseDescriptor[] {
        return this.pages;
    }

    getParts(): BaseDescriptor[] {
        return this.parts;
    }

    getLayouts(): BaseDescriptor[] {
        return this.layouts;
    }

    getRelations(): RelationshipType[] {
        return this.relations;
    }

    getReferences(): ContentReference[] {
        return this.references;
    }

    getMacros(): MacroDescriptor[] {
        return this.macros;
    }

    getTasks(): ApplicationTask[] {
        return this.tasks;
    }

    getWidgets(): Widget[] {
        return this.widgets;
    }

    getApiDescriptors(): ApiDescriptor[] {
        return this.apiDescriptors;
    }

    getTools(): AdminToolDescriptor[] {
        return this.tools;
    }

    getIdProviderApplication(): IdProviderApplication {
        return this.idProviderApplication;
    }

    getDeployment(): ApplicationDeployment {
        return this.deployment;
    }

    getDeploymentUrl(): string {
        const url = this.deployment.url;
        return url.substr(-1) === '/' ? url : url + '/';
    }
}
