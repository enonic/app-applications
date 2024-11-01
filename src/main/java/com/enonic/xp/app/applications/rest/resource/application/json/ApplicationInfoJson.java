package com.enonic.xp.app.applications.rest.resource.application.json;

import java.util.stream.Collectors;

import com.google.common.base.Preconditions;

import com.enonic.xp.admin.widget.WidgetDescriptor;
import com.enonic.xp.api.ApiDescriptors;
import com.enonic.xp.app.ApplicationInfo;
import com.enonic.xp.app.applications.json.content.page.PageDescriptorListJson;
import com.enonic.xp.app.applications.json.content.page.region.LayoutDescriptorsJson;
import com.enonic.xp.app.applications.json.content.page.region.PartDescriptorsJson;
import com.enonic.xp.app.applications.json.schema.content.ContentTypeSummaryListJson;
import com.enonic.xp.app.applications.json.schema.relationship.RelationshipTypeListJson;
import com.enonic.xp.app.applications.rest.resource.apis.json.ApiDescriptorJson;
import com.enonic.xp.app.applications.rest.resource.apis.json.ApiDescriptorsJson;
import com.enonic.xp.app.applications.rest.resource.macro.json.MacrosJson;
import com.enonic.xp.app.applications.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.app.applications.rest.resource.schema.mixin.InlineMixinResolver;
import com.enonic.xp.app.applications.rest.resource.tool.json.AdminToolDescriptorsJson;
import com.enonic.xp.app.applications.rest.resource.widget.json.WidgetDescriptorsJson;
import com.enonic.xp.descriptor.Descriptors;
import com.enonic.xp.page.PageDescriptors;
import com.enonic.xp.region.LayoutDescriptors;
import com.enonic.xp.region.PartDescriptors;

public class ApplicationInfoJson
{
    private final ContentTypeSummaryListJson contentTypes;

    private final PageDescriptorListJson pages;

    private final PartDescriptorsJson parts;

    private final LayoutDescriptorsJson layouts;

    private final RelationshipTypeListJson relations;

    private final ContentReferencesJson references;

    private final MacrosJson macros;

    private final ApplicationTaskDescriptorsJson tasks;

    private final WidgetDescriptorsJson widgets;

    private final AdminToolDescriptorsJson tools;

    private final ApiDescriptorsJson apis;

    private final IdProviderApplicationJson idProviderApplication;

    private final ApplicationDeploymentJson deployment;

    private ApplicationInfoJson( final Builder builder )
    {
        this.contentTypes = new ContentTypeSummaryListJson( builder.applicationInfo.getContentTypes(), builder.localeMessageResolver );
        this.pages = new PageDescriptorListJson( PageDescriptors.from( builder.applicationInfo.getPages() ), builder.localeMessageResolver,
                                                 builder.inlineMixinResolver );
        this.parts = new PartDescriptorsJson( PartDescriptors.from( builder.applicationInfo.getParts() ), builder.localeMessageResolver,
                                              builder.inlineMixinResolver );
        this.layouts =
            new LayoutDescriptorsJson( LayoutDescriptors.from( builder.applicationInfo.getLayouts() ), builder.localeMessageResolver,
                                       builder.inlineMixinResolver );
        this.relations = new RelationshipTypeListJson( builder.applicationInfo.getRelations() );
        this.references = new ContentReferencesJson( builder.applicationInfo.getContentReferences() );
        this.macros = MacrosJson.
            create().
            setMacroDescriptors( builder.applicationInfo.getMacros() ).
            setLocaleMessageResolver( builder.localeMessageResolver ).
            setInlineMixinResolver( builder.inlineMixinResolver ).
            build();
        this.tasks = new ApplicationTaskDescriptorsJson( builder.applicationInfo.getTasks() );
        this.widgets = new WidgetDescriptorsJson( builder.widgetDescriptors );
        this.tools = builder.adminToolDescriptors;
        this.apis = new ApiDescriptorsJson( builder.apis.stream().map( ApiDescriptorJson::new ).collect( Collectors.toList() ) );
        this.idProviderApplication = new IdProviderApplicationJson( builder.applicationInfo.getIdProviderDescriptor(),
                                                                    builder.applicationInfo.getIdProviderReferences() );
        this.deployment = new ApplicationDeploymentJson( builder.deploymentUrl );
    }

    public ContentTypeSummaryListJson getContentTypes()
    {
        return contentTypes;
    }

    public PageDescriptorListJson getPages()
    {
        return pages;
    }

    public PartDescriptorsJson getParts()
    {
        return parts;
    }

    public LayoutDescriptorsJson getLayouts()
    {
        return layouts;
    }

    public RelationshipTypeListJson getRelations()
    {
        return relations;
    }

    public MacrosJson getMacros()
    {
        return macros;
    }

    public ContentReferencesJson getReferences()
    {
        return references;
    }

    public ApplicationTaskDescriptorsJson getTasks()
    {
        return tasks;
    }

    public IdProviderApplicationJson getIdProviderApplication()
    {
        return idProviderApplication;
    }

    public ApplicationDeploymentJson getDeployment()
    {
        return deployment;
    }

    public WidgetDescriptorsJson getWidgets()
    {
        return widgets;
    }

    public AdminToolDescriptorsJson getTools()
    {
        return tools;
    }

    public ApiDescriptorsJson getApis()
    {
        return apis;
    }

    public static Builder create()
    {
        return new Builder();
    }

    public static final class Builder
    {
        private ApplicationInfo applicationInfo;

        private Descriptors<WidgetDescriptor> widgetDescriptors;

        private AdminToolDescriptorsJson adminToolDescriptors;

        private ApiDescriptors apis;

        private String deploymentUrl;

        private LocaleMessageResolver localeMessageResolver;

        private InlineMixinResolver inlineMixinResolver;

        private Builder()
        {
        }

        public Builder setApplicationInfo( final ApplicationInfo applicationInfo )
        {
            this.applicationInfo = applicationInfo;
            return this;
        }

        public Builder setWidgetDescriptors( final Descriptors<WidgetDescriptor> widgetDescriptors )
        {
            this.widgetDescriptors = widgetDescriptors;
            return this;
        }

        public Builder setAdminToolDescriptors( final AdminToolDescriptorsJson adminToolDescriptors )
        {
            this.adminToolDescriptors = adminToolDescriptors;
            return this;
        }

        public Builder setApis( final ApiDescriptors apis )
        {
            this.apis = apis;
            return this;
        }

        public Builder setDeploymentUrl( final String deploymentUrl )
        {
            this.deploymentUrl = deploymentUrl;
            return this;
        }

        public Builder setLocaleMessageResolver( final LocaleMessageResolver localeMessageResolver )
        {
            this.localeMessageResolver = localeMessageResolver;
            return this;
        }

        public Builder setInlineMixinResolver( final InlineMixinResolver inlineMixinResolver )
        {
            this.inlineMixinResolver = inlineMixinResolver;
            return this;
        }

        public void validate()
        {
            Preconditions.checkNotNull( this.applicationInfo, "applicationInfo cannot be null" );
            Preconditions.checkNotNull( this.inlineMixinResolver, "inlineMixinResolver cannot be null" );
        }

        public ApplicationInfoJson build()
        {
            validate();
            return new ApplicationInfoJson( this );
        }
    }
}
