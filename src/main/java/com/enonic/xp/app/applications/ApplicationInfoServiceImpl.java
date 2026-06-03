package com.enonic.xp.app.applications;

import java.util.Objects;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationKeys;
import com.enonic.xp.descriptor.DescriptorKey;
import com.enonic.xp.descriptor.DescriptorKeyLocator;
import com.enonic.xp.descriptor.Descriptors;
import com.enonic.xp.idprovider.IdProviderDescriptor;
import com.enonic.xp.idprovider.IdProviderDescriptorService;
import com.enonic.xp.macro.MacroDescriptorService;
import com.enonic.xp.macro.MacroDescriptors;
import com.enonic.xp.page.PageDescriptorService;
import com.enonic.xp.page.PageDescriptors;
import com.enonic.xp.region.LayoutDescriptorService;
import com.enonic.xp.region.LayoutDescriptors;
import com.enonic.xp.region.PartDescriptorService;
import com.enonic.xp.region.PartDescriptors;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.schema.content.CmsFormFragmentService;
import com.enonic.xp.schema.content.ContentTypeService;
import com.enonic.xp.schema.content.ContentTypes;
import com.enonic.xp.schema.formfragment.FormFragmentDescriptors;
import com.enonic.xp.schema.formfragment.FormFragmentName;
import com.enonic.xp.schema.mixin.MixinDescriptors;
import com.enonic.xp.schema.mixin.MixinService;
import com.enonic.xp.security.IdProviders;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.task.TaskDescriptor;
import com.enonic.xp.task.TaskDescriptorService;

@Component
public final class ApplicationInfoServiceImpl
    implements ApplicationInfoService
{
    private PageDescriptorService pageDescriptorService;

    private PartDescriptorService partDescriptorService;

    private LayoutDescriptorService layoutDescriptorService;

    private MixinService mixinService;

    private CmsFormFragmentService cmsFormFragmentService;

    private ResourceService resourceService;

    private MacroDescriptorService macroDescriptorService;

    private ContentTypeService contentTypeService;

    private TaskDescriptorService taskDescriptorService;

    private SecurityService securityService;

    private IdProviderDescriptorService idProviderDescriptorService;

    @Override
    public ContentTypes getContentTypes( final ApplicationKey applicationKey )
    {
        return contentTypeService.getByApplication( applicationKey );
    }

    @Override
    public PageDescriptors getPageDescriptors( final ApplicationKey applicationKey )
    {
        return this.pageDescriptorService.getByApplication( applicationKey );
    }

    @Override
    public PartDescriptors getPartDescriptors( final ApplicationKey applicationKey )
    {
        return this.partDescriptorService.getByApplication( applicationKey );
    }

    @Override
    public LayoutDescriptors getLayoutDescriptors( final ApplicationKey applicationKey )
    {
        return this.layoutDescriptorService.getByApplication( applicationKey );
    }

    @Override
    public MixinDescriptors getMixinDescriptors( final ApplicationKey applicationKey )
    {
        return this.mixinService.getByApplication( applicationKey );
    }

    @Override
    public FormFragmentDescriptors getFormFragmentDescriptors( final ApplicationKey applicationKey )
    {
        return new DescriptorKeyLocator( this.resourceService, "/cms/form-fragments", true ).findKeys( applicationKey )
            .stream()
            .map( DescriptorKey::getName )
            .map( name -> this.cmsFormFragmentService.getByName( FormFragmentName.from( applicationKey, name ) ) )
            .filter( Objects::nonNull )
            .collect( FormFragmentDescriptors.collector() );
    }

    @Override
    public MacroDescriptors getMacroDescriptors( final ApplicationKey applicationKey )
    {
        return this.macroDescriptorService.getByApplications( ApplicationKeys.from( applicationKey, ApplicationKey.SYSTEM ) );
    }

    @Override
    public Descriptors<TaskDescriptor> getTaskDescriptors( final ApplicationKey applicationKey )
    {
        return this.taskDescriptorService.getTasks( applicationKey );
    }

    @Override
    public IdProviders getIdProviderReferences( final ApplicationKey applicationKey )
    {
        return securityService.getIdProviders().
            stream().
            filter( idProvider -> idProvider.getIdProviderConfig() != null &&
                idProvider.getIdProviderConfig().getApplicationKey().equals( applicationKey ) ).collect( IdProviders.collector() );

    }

    @Override
    public IdProviderDescriptor getIdProviderDescriptor( final ApplicationKey applicationKey )
    {
        return this.idProviderDescriptorService.getDescriptor( applicationKey );
    }

    @Override
    public ApplicationInfo getApplicationInfo( final ApplicationKey applicationKey )
    {
        return ApplicationInfo.create().
            setContentTypes( this.getContentTypes( applicationKey ) ).
            setPages( this.getPageDescriptors( applicationKey ) ).
            setParts( this.getPartDescriptors( applicationKey ) ).
            setLayouts( this.getLayoutDescriptors( applicationKey ) ).
            setMixins( this.getMixinDescriptors( applicationKey ) ).
            setFormFragments( this.getFormFragmentDescriptors( applicationKey ) ).
            setIdProviderReferences( this.getIdProviderReferences( applicationKey ) ).
            setMacros( this.getMacroDescriptors( applicationKey ) ).
            setTasks( this.getTaskDescriptors( applicationKey ) ).
            setIdProviderDescriptor( this.getIdProviderDescriptor( applicationKey ) ).
            build();
    }

    @Reference
    public void setPageDescriptorService( final PageDescriptorService pageDescriptorService )
    {
        this.pageDescriptorService = pageDescriptorService;
    }

    @Reference
    public void setPartDescriptorService( final PartDescriptorService partDescriptorService )
    {
        this.partDescriptorService = partDescriptorService;
    }

    @Reference
    public void setLayoutDescriptorService( final LayoutDescriptorService layoutDescriptorService )
    {
        this.layoutDescriptorService = layoutDescriptorService;
    }

    @Reference
    public void setMixinService( final MixinService mixinService )
    {
        this.mixinService = mixinService;
    }

    @Reference
    public void setCmsFormFragmentService( final CmsFormFragmentService cmsFormFragmentService )
    {
        this.cmsFormFragmentService = cmsFormFragmentService;
    }

    @Reference
    public void setResourceService( final ResourceService resourceService )
    {
        this.resourceService = resourceService;
    }

    @Reference
    public void setTaskDescriptorService( final TaskDescriptorService taskDescriptorService )
    {
        this.taskDescriptorService = taskDescriptorService;
    }

    @Reference
    public void setSecurityService( final SecurityService securityService )
    {
        this.securityService = securityService;
    }

    @Reference
    public void setContentTypeService( final ContentTypeService contentTypeService )
    {
        this.contentTypeService = contentTypeService;
    }

    @Reference
    public void setMacroDescriptorService( final MacroDescriptorService macroDescriptorService )
    {
        this.macroDescriptorService = macroDescriptorService;
    }

    @Reference
    public void setIdProviderDescriptorService( final IdProviderDescriptorService idProviderDescriptorService )
    {
        this.idProviderDescriptorService = idProviderDescriptorService;
    }

}
