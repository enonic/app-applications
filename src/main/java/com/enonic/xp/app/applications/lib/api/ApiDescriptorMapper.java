package com.enonic.xp.app.applications.lib.api;

import com.enonic.xp.api.ApiDescriptor;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public final class ApiDescriptorMapper
    implements MapSerializable
{
    private final ApiDescriptor apiDescriptor;

    public ApiDescriptorMapper( final ApiDescriptor apiDescriptor )
    {
        this.apiDescriptor = apiDescriptor;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        // No mount and no allowedPrincipals: the pre-rewrite ApiDescriptorJson serialized both and
        // the UI rendered neither.
        gen.value( "key", apiDescriptor.getKey().toString() );
        gen.value( "title", apiDescriptor.getTitle() );
        gen.value( "description", apiDescriptor.getDescription() );
        gen.value( "documentationUrl", apiDescriptor.getDocumentationUrl() );
        // TODO: Unused until displayName is localized against the target app's i18n bundle.
        gen.value( "titleI18nKey", apiDescriptor.getTitleI18nKey() );
        gen.value( "descriptionI18nKey", apiDescriptor.getDescriptionI18nKey() );
    }
}
