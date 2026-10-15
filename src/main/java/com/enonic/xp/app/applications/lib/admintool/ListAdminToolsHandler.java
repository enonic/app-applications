package com.enonic.xp.app.applications.lib.admintool;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.xp.admin.tool.AdminToolDescriptorService;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public final class ListAdminToolsHandler
    implements ScriptBean
{
    private String application;

    private Supplier<AdminToolDescriptorService> adminToolDescriptorServiceSupplier;

    public void setApplication( final String application )
    {
        this.application = application;
    }

    public List<AdminToolDescriptorMapper> execute()
    {
        return adminToolDescriptorServiceSupplier.get()
            .getByApplication( ApplicationKey.from( application ) )
            .stream()
            .map( AdminToolDescriptorMapper::new )
            .collect( Collectors.toList() );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.adminToolDescriptorServiceSupplier = context.getService( AdminToolDescriptorService.class );
    }
}
