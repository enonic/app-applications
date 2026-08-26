package com.enonic.xp.app.applications.lib.idprovider;

import java.util.function.Supplier;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.idprovider.IdProviderDescriptor;
import com.enonic.xp.idprovider.IdProviderDescriptorService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public final class GetIdProviderDescriptorHandler
    implements ScriptBean
{
    private String application;

    private Supplier<IdProviderDescriptorService> idProviderDescriptorServiceSupplier;

    public void setApplication( final String application )
    {
        this.application = application;
    }

    // ! Null and a descriptor with no mode are different answers: null means the application is not an
    // ! id provider at all, so the whole section disappears. Never collapse the two into one string.
    public IdProviderDescriptorMapper execute()
    {
        final IdProviderDescriptor descriptor =
            idProviderDescriptorServiceSupplier.get().getDescriptor( ApplicationKey.from( application ) );

        return descriptor == null ? null : new IdProviderDescriptorMapper( descriptor );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.idProviderDescriptorServiceSupplier = context.getService( IdProviderDescriptorService.class );
    }
}
