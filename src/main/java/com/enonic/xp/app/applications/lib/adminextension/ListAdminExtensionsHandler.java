package com.enonic.xp.app.applications.lib.adminextension;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.xp.admin.extension.AdminExtensionDescriptorService;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public final class ListAdminExtensionsHandler
    implements ScriptBean
{
    private String application;

    private Supplier<AdminExtensionDescriptorService> adminExtensionDescriptorServiceSupplier;

    public void setApplication( final String application )
    {
        this.application = application;
    }

    public List<AdminExtensionDescriptorMapper> execute()
    {
        return adminExtensionDescriptorServiceSupplier.get()
            .getByApplication( ApplicationKey.from( application ) )
            .stream()
            .map( AdminExtensionDescriptorMapper::new )
            .collect( Collectors.toList() );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.adminExtensionDescriptorServiceSupplier = context.getService( AdminExtensionDescriptorService.class );
    }
}
