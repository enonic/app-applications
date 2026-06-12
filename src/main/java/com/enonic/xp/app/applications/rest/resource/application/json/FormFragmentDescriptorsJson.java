package com.enonic.xp.app.applications.rest.resource.application.json;

import java.util.List;

import com.google.common.collect.ImmutableList;

import com.enonic.xp.app.applications.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.schema.formfragment.FormFragmentDescriptors;

public class FormFragmentDescriptorsJson
{
    private final List<SchemaDescriptorJson> descriptors;

    public FormFragmentDescriptorsJson( final FormFragmentDescriptors formFragmentDescriptors,
                                        final LocaleMessageResolver localeMessageResolver )
    {
        final ImmutableList.Builder<SchemaDescriptorJson> builder = ImmutableList.builder();
        if ( formFragmentDescriptors != null )
        {
            formFragmentDescriptors.forEach( descriptor -> builder.add( new SchemaDescriptorJson( descriptor, localeMessageResolver ) ) );
        }
        this.descriptors = builder.build();
    }

    public List<SchemaDescriptorJson> getDescriptors()
    {
        return descriptors;
    }
}
