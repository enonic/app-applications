package com.enonic.xp.app.applications.lib.macro;

import com.enonic.xp.macro.MacroDescriptor;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public final class MacroDescriptorMapper
    implements MapSerializable
{
    private final MacroDescriptor macroDescriptor;

    public MacroDescriptorMapper( final MacroDescriptor macroDescriptor )
    {
        this.macroDescriptor = macroDescriptor;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        gen.value( "key", macroDescriptor.getKey().toString() );
        gen.value( "title", macroDescriptor.getTitle() );
        gen.value( "description", macroDescriptor.getDescription() );
        // TODO: Unused until displayName is localized against the target app's i18n bundle.
        gen.value( "titleI18nKey", macroDescriptor.getTitleI18nKey() );
        gen.value( "descriptionI18nKey", macroDescriptor.getDescriptionI18nKey() );
    }
}
