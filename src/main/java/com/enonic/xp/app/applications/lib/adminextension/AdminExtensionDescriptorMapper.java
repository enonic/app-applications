package com.enonic.xp.app.applications.lib.adminextension;

import com.enonic.xp.admin.extension.AdminExtensionDescriptor;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public final class AdminExtensionDescriptorMapper
    implements MapSerializable
{
    private final AdminExtensionDescriptor adminExtensionDescriptor;

    public AdminExtensionDescriptorMapper( final AdminExtensionDescriptor adminExtensionDescriptor )
    {
        this.adminExtensionDescriptor = adminExtensionDescriptor;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "key", adminExtensionDescriptor.getKey().toString() );
        gen.value( "title", adminExtensionDescriptor.getTitle() );
        gen.value( "description", adminExtensionDescriptor.getDescription() );
        // TODO: Unused until displayName is localized against the target app's i18n bundle.
        gen.value( "titleI18nKey", adminExtensionDescriptor.getTitleI18nKey() );
        gen.value( "descriptionI18nKey", adminExtensionDescriptor.getDescriptionI18nKey() );

        // The one thing that makes an extension not just another descriptor — which admin interfaces
        // it plugs into. The pre-rewrite ApplicationDataContainer rendered it as "Title (iface1, iface2)".
        gen.array( "interfaces" );
        adminExtensionDescriptor.getInterfaces().forEach( gen::value );
        gen.end();
    }
}
