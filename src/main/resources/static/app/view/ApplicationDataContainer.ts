import {Application} from '@enonic/lib-admin-ui/application/Application';
import {Element} from '@enonic/lib-admin-ui/dom/Element';
import {ApplicationInfo} from '../resource/ApplicationInfo';
import {ContentReference} from '../resource/ContentReference';
import {AdminToolDescriptor} from '../resource/AdminToolDescriptor';
import {RelationshipType} from '../relationshiptype/RelationshipType';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';
import {ItemDataGroup} from '@enonic/lib-admin-ui/app/view/ItemDataGroup';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {DateTimeFormatter} from '@enonic/lib-admin-ui/ui/treegrid/DateTimeFormatter';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import {MacroDescriptor} from '@enonic/lib-admin-ui/macro/MacroDescriptor';
import {IdProviderMode} from '@enonic/lib-admin-ui/security/IdProviderMode';
import {Widget} from '@enonic/lib-admin-ui/content/Widget';
import {SpanEl} from '@enonic/lib-admin-ui/dom/SpanEl';
import {Tooltip} from '@enonic/lib-admin-ui/ui/Tooltip';
import {AEl} from '@enonic/lib-admin-ui/dom/AEl';
import {StringHelper} from '@enonic/lib-admin-ui/util/StringHelper';
import {ContentTypeSummary} from '@enonic/lib-admin-ui/schema/content/ContentTypeSummary';
import {BaseDescriptor} from '../resource/BaseDescriptor';

export class ApplicationDataContainer
    extends DivEl {
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

        const pageNames: string[] = applicationInfo.getPages().map(this.getDescriptorName).sort(
            this.sortAlphabeticallyAsc);
        siteGroup.addDataArray(i18n('field.page'), pageNames);

        const partNames: string[] = applicationInfo.getParts().map(this.getDescriptorName).sort(
            this.sortAlphabeticallyAsc);
        siteGroup.addDataArray(i18n('field.part'), partNames);

        const layoutNames: string[] = applicationInfo.getLayouts().map(this.getDescriptorName).sort(
            this.sortAlphabeticallyAsc);
        siteGroup.addDataArray(i18n('field.layout'), layoutNames);

        const relationshipTypeNames: string[] = applicationInfo.getRelations().map(
            (relationshipType: RelationshipType) => relationshipType.getRelationshiptypeName().getLocalName()).sort(
            this.sortAlphabeticallyAsc);
        siteGroup.addDataArray(i18n('field.relationshipTypes'), relationshipTypeNames);

        const referencesPaths: string[] = applicationInfo.getReferences().map(
            (reference: ContentReference) => reference.getContentPath()).sort(this.sortAlphabeticallyAsc);
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

    private getExtensionsWidgets(applicationInfo: ApplicationInfo): Element[] {
        return applicationInfo.getWidgets().map(this.widgetToElement).sort(this.sortElInAlphabeticallyAsc);
    }

    private widgetToElement(widget: Widget): Element {
        const interfacesStr = widget.getInterfaces().join(', ');
        const displayString = widget.getDisplayName() + (StringHelper.isBlank(interfacesStr) ? '' : ' (' + interfacesStr + ')');

        const spanEl = new SpanEl().setHtml(displayString);
        new Tooltip(spanEl, widget.getWidgetDescriptorKey().toString(), 200).setMode(Tooltip.MODE_GLOBAL_STATIC);
        return spanEl;
    }

    private getExtensionsTools(applicationInfo: ApplicationInfo): Element[] {
        return applicationInfo.getTools().map(this.adminToolDescriptorToElement).sort(this.sortElInAlphabeticallyAsc);
    }

    private adminToolDescriptorToElement(adminToolDescriptor: AdminToolDescriptor): Element {
        const aEl = new AEl().setUrl(adminToolDescriptor.getToolUrl(), '_blank').setHtml(adminToolDescriptor.getDisplayName());
        new Tooltip(aEl, adminToolDescriptor.getKey(), 200).setMode(Tooltip.MODE_GLOBAL_STATIC);
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

    private getDescriptorName(descriptor: BaseDescriptor): string {
        return descriptor.getName();
    }

    private sortAlphabeticallyAsc(a: string, b: string): number {
        return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
    }

    private sortElInAlphabeticallyAsc(a: Element, b: Element): number {
        return a.getHtml().toLocaleLowerCase().localeCompare(b.getHtml().toLocaleLowerCase());
    }
}
