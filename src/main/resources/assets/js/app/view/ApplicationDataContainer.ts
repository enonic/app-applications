import {ApplicationInfo} from '../resource/ApplicationInfo';
import {ContentReference} from '../resource/ContentReference';
import {AdminToolDescriptor} from '../resource/AdminToolDescriptor';
import {RelationshipType} from '../relationshiptype/RelationshipType';
import ContentTypeSummary = api.schema.content.ContentTypeSummary;
import ItemDataGroup = api.app.view.ItemDataGroup;
import ApplicationKey = api.application.ApplicationKey;
import Application = api.application.Application;
import MacroDescriptor = api.macro.MacroDescriptor;
import Widget = api.content.Widget;
import Tooltip = api.ui.Tooltip;
import i18n = api.util.i18n;
import DateTimeFormatter = api.ui.treegrid.DateTimeFormatter;
import StringHelper = api.util.StringHelper;
import AEl = api.dom.AEl;
import IdProviderMode = api.security.IdProviderMode;
import Descriptor = api.content.page.Descriptor;

export class ApplicationDataContainer
    extends api.dom.DivEl {
    constructor() {
        super('application-data-container');
    }

    update(application: Application, applicationInfo: ApplicationInfo) {
        this.removeChildren();

        this.updateAppInfoSection(application);
        this.updateSiteSection(applicationInfo);
        this.updateMacrosSection(applicationInfo);
        this.updateProvidersSection(applicationInfo);
        this.updateTasksSection(applicationInfo);
        this.updateExtensionsSection(applicationInfo);
        this.updateDeploymentSection(applicationInfo);
    }

    private updateAppInfoSection(application: Application) {
        const infoGroup: ItemDataGroup = new ItemDataGroup(i18n('field.application'), 'application');
        const minVersion: string = application.getMinSystemVersion();
        const modifiedTime: Date = application.getModifiedTime();

        if (modifiedTime) {
            infoGroup.addDataList(i18n('status.installed'), DateTimeFormatter.createHtml(modifiedTime));
        }
        infoGroup.addDataList(i18n('field.version'), application.getVersion());
        infoGroup.addDataList(i18n('field.key'), application.getApplicationKey().toString());
        infoGroup.addDataList(i18n('field.systemRequired'), i18n('field.systemRequired.value', minVersion));

        if (!infoGroup.isEmpty()) {
            this.appendChild(infoGroup);
        }
    }

    private updateSiteSection(applicationInfo: ApplicationInfo) {
        const site: ItemDataGroup = this.initSite(applicationInfo);

        if (!site.isEmpty()) {
            this.appendChild(site);
        }
    }

    private initSite(applicationInfo: ApplicationInfo): ItemDataGroup {
        const siteGroup: ItemDataGroup = new ItemDataGroup(i18n('field.site'), 'site');

        const contentTypeNames: string[] = applicationInfo.getContentTypes().map(
            (contentType: ContentTypeSummary) => contentType.getContentTypeName().getLocalName()).sort(this.sortAlphabeticallyAsc);
        siteGroup.addDataArray(i18n('field.contentTypes'), contentTypeNames);

        const pageNames: string[] = applicationInfo.getPages().map(this.getDescriptorNameAsString).sort(
            this.sortAlphabeticallyAsc);
        siteGroup.addDataArray(i18n('field.page'), pageNames);

        const partNames: string[] = applicationInfo.getParts().map(this.getDescriptorNameAsString).sort(
            this.sortAlphabeticallyAsc);
        siteGroup.addDataArray(i18n('field.part'), partNames);

        const layoutNames: string[] = applicationInfo.getLayouts().map(this.getDescriptorNameAsString).sort(
            this.sortAlphabeticallyAsc);
        siteGroup.addDataArray(i18n('field.layout'), layoutNames);

        const relationshipTypeNames: string[] = applicationInfo.getRelations().map(
            (relationshipType: RelationshipType) => relationshipType.getRelationshiptypeName().getLocalName()).sort(
            this.sortAlphabeticallyAsc);
        siteGroup.addDataArray(i18n('field.relationshipTypes'), relationshipTypeNames);

        const referencesPaths: string[] = applicationInfo.getReferences().map(
            (reference: ContentReference) => reference.getContentPath().toString()).sort(this.sortAlphabeticallyAsc);
        siteGroup.addDataArray(i18n('field.usedBy'), referencesPaths);

        return siteGroup;
    }

    private updateMacrosSection(applicationInfo: ApplicationInfo) {
        const macros: ItemDataGroup = this.initMacros(applicationInfo);

        if (!macros.isEmpty()) {
            this.appendChild(macros);
        }
    }

    private initMacros(applicationInfo: ApplicationInfo): ItemDataGroup {
        const macrosGroup: ItemDataGroup = new ItemDataGroup(i18n('field.macros'), 'macros');

        macrosGroup.addDataArray(i18n('field.name'), this.getMacroNames(applicationInfo));

        return macrosGroup;
    }

    private getMacroNames(applicationInfo: ApplicationInfo): string[] {
        return applicationInfo.getMacros().filter((macro: MacroDescriptor) => {
            return !ApplicationKey.SYSTEM.equals(macro.getKey().getApplicationKey());
        }).map((macro: MacroDescriptor) => {
            return macro.getDisplayName();
        });
    }

    private updateProvidersSection(applicationInfo: ApplicationInfo) {
        const providers: ItemDataGroup = this.initProviders(applicationInfo);

        if (providers && !providers.isEmpty()) {
            this.appendChild(providers);
        }
    }

    private initProviders(applicationInfo: ApplicationInfo): ItemDataGroup {
        if (applicationInfo.getIdProviderApplication().getMode() != null) {
            const applicationsGroup = new ItemDataGroup(i18n('field.idProviderApplications'), 'applications');

            applicationsGroup.addDataList(i18n('field.mode'), IdProviderMode[applicationInfo.getIdProviderApplication().getMode()]);
            applicationsGroup.addDataArray(i18n('field.usedBy'),
                applicationInfo.getIdProviderApplication().getIdProviders().map(idProvider => idProvider.getPath().toString()));

            return applicationsGroup;
        }
        return null;
    }

    private updateTasksSection(applicationInfo: ApplicationInfo) {
        const tasks: ItemDataGroup = this.initTasks(applicationInfo);

        if (tasks && !tasks.isEmpty()) {
            this.appendChild(tasks);
        }
    }

    private initTasks(applicationInfo: ApplicationInfo): ItemDataGroup {
        if (applicationInfo.getTasks()) {
            const tasksGroup: ItemDataGroup = new ItemDataGroup(i18n('field.tasks'), 'tasks');

            tasksGroup.addDataArray(i18n('field.key'), applicationInfo.getTasks().map(task => task.getKey().toString()));
            tasksGroup.addDataArray(i18n('field.description'), applicationInfo.getTasks().map(task => task.getDescription()));
            return tasksGroup;
        }
        return null;
    }

    private updateExtensionsSection(applicationInfo: ApplicationInfo) {
        const extensions: ItemDataGroup = this.initExtensions(applicationInfo);

        if (!extensions.isEmpty()) {
            this.appendChild(extensions);
        }
    }

    private initExtensions(applicationInfo: ApplicationInfo): ItemDataGroup {
        const extensionGroup: ItemDataGroup = new ItemDataGroup(i18n('field.extensions'), 'extensions');

        extensionGroup.addDataElements(i18n('field.tools'), this.getExtensionsTools(applicationInfo));
        extensionGroup.addDataElements(i18n('field.widgets'), this.getExtensionsWidgets(applicationInfo));

        return extensionGroup;
    }

    private getExtensionsWidgets(applicationInfo: ApplicationInfo): api.dom.Element[] {
        return applicationInfo.getWidgets().map(this.widgetToElement).sort(this.sortElInAlphabeticallyAsc);
    }

    private widgetToElement(widget: Widget): api.dom.Element {
        const interfacesStr = widget.getInterfaces().join(', ');
        const displayString = widget.getDisplayName() + (StringHelper.isBlank(interfacesStr) ? '' : ' (' + interfacesStr + ')');

        const spanEl = new api.dom.SpanEl().setHtml(displayString);
        new Tooltip(spanEl, widget.getWidgetDescriptorKey().toString(), 200).setMode(Tooltip.MODE_GLOBAL_STATIC);
        return spanEl;
    }

    private getExtensionsTools(applicationInfo: ApplicationInfo): api.dom.Element[] {
        return applicationInfo.getTools().map(this.adminToolDescriptorToElement).sort(this.sortElInAlphabeticallyAsc);
    }

    private adminToolDescriptorToElement(adminToolDescriptor: AdminToolDescriptor): api.dom.Element {
        const aEl = new api.dom.AEl().setUrl(adminToolDescriptor.getToolUrl(), '_blank').setHtml(adminToolDescriptor.getDisplayName());
        new Tooltip(aEl, adminToolDescriptor.getKey().toString(), 200).setMode(Tooltip.MODE_GLOBAL_STATIC);
        return aEl;
    }

    private updateDeploymentSection(applicationInfo: ApplicationInfo) {
        const deployment: ItemDataGroup = this.initDeployment(applicationInfo);

        if (deployment && !deployment.isEmpty()) {
            this.appendChild(deployment);
        }
    }

    private initDeployment(applicationInfo: ApplicationInfo): ItemDataGroup {
        if (!StringHelper.isBlank(applicationInfo.getDeployment().url)) {
            const deploymentGroup = new ItemDataGroup(i18n('field.webApp'), 'deployment');
            deploymentGroup.addDataElements(i18n('field.deployment'),
                [new AEl().setUrl(applicationInfo.getDeploymentUrl(), '_blank').setHtml(applicationInfo.getDeploymentUrl())]);

            return deploymentGroup;
        }
        return null;
    }

    private getDescriptorNameAsString(descriptor: Descriptor): string {
        return descriptor.getName().toString();
    }

    private sortAlphabeticallyAsc(a: string, b: string): number {
        return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
    }

    private sortElInAlphabeticallyAsc(a: api.dom.Element, b: api.dom.Element): number {
        return a.getHtml().toLocaleLowerCase().localeCompare(b.getHtml().toLocaleLowerCase());
    }
}
