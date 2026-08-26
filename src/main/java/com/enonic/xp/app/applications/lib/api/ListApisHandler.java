package com.enonic.xp.app.applications.lib.api;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.xp.api.ApiDescriptorService;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public final class ListApisHandler
    implements ScriptBean
{
    private String application;

    private Supplier<ApiDescriptorService> apiDescriptorServiceSupplier;

    public void setApplication( final String application )
    {
        this.application = application;
    }

    public List<ApiDescriptorMapper> execute()
    {
        return apiDescriptorServiceSupplier.get()
            .getByApplication( ApplicationKey.from( application ) )
            .stream()
            .map( ApiDescriptorMapper::new )
            .collect( Collectors.toList() );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.apiDescriptorServiceSupplier = context.getService( ApiDescriptorService.class );
    }
}
