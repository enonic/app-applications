package com.enonic.xp.app.applications.rest.resource.application.json;

import java.util.List;

import com.google.common.collect.ImmutableList;

import com.enonic.xp.app.applications.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.schema.mixin.MixinDescriptors;

public class MixinDescriptorsJson
{
    private final List<SchemaDescriptorJson> descriptors;

    public MixinDescriptorsJson( final MixinDescriptors mixinDescriptors, final LocaleMessageResolver localeMessageResolver )
    {
        final ImmutableList.Builder<SchemaDescriptorJson> builder = ImmutableList.builder();
        if ( mixinDescriptors != null )
        {
            mixinDescriptors.forEach( descriptor -> builder.add( new SchemaDescriptorJson( descriptor, localeMessageResolver ) ) );
        }
        this.descriptors = builder.build();
    }

    public List<SchemaDescriptorJson> getDescriptors()
    {
        return descriptors;
    }
}
