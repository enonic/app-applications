package com.enonic.xp.app.applications.json.content.page.region;

import com.enonic.xp.app.applications.json.content.page.DescriptorJson;
import com.enonic.xp.app.applications.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.app.applications.rest.resource.schema.mixin.CmsFormFragmentServiceResolver;
import com.enonic.xp.region.PartDescriptor;

public class PartDescriptorJson
    extends DescriptorJson
{

    public PartDescriptorJson( final PartDescriptor descriptor, final LocaleMessageResolver localeMessageResolver,
                               final CmsFormFragmentServiceResolver inlineMixinResolver )
    {
        super( descriptor, localeMessageResolver, inlineMixinResolver );
    }

}
