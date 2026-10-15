package com.enonic.xp.app.applications.lib.idprovider;

import java.util.Objects;

import com.enonic.xp.idprovider.IdProviderDescriptor;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public final class IdProviderDescriptorMapper
    implements MapSerializable
{
    private final IdProviderDescriptor idProviderDescriptor;

    public IdProviderDescriptorMapper( final IdProviderDescriptor idProviderDescriptor )
    {
        this.idProviderDescriptor = idProviderDescriptor;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        // The descriptor's builder has no default, so a yaml without `mode:` yields null here, and the
        // bridge then omits the key — an empty map, which is still not the same as no descriptor.
        // The pre-rewrite IdProviderApplicationJson called getMode().toString() unguarded and NPEd
        // on exactly this input.
        gen.value( "mode", Objects.toString( idProviderDescriptor.getMode(), null ) );

        // Whether the descriptor declares a config form, not the form itself: rendering it is its own
        // job (#64), while the dialog only has to know there is something to render.
        gen.value( "hasConfig", idProviderDescriptor.getConfig().size() > 0 );
    }
}
