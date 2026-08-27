package com.enonic.xp.app.applications.lib.admintool;

import com.enonic.xp.admin.tool.AdminToolDescriptor;
import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public final class AdminToolDescriptorMapper
    implements MapSerializable
{
    private final AdminToolDescriptor adminToolDescriptor;

    public AdminToolDescriptorMapper( final AdminToolDescriptor adminToolDescriptor )
    {
        this.adminToolDescriptor = adminToolDescriptor;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        // No url: the pre-rewrite AppsApplicationResource assembled /admin/<app>/<name> from the
        // servlet request, but lib-admin's getToolUrl already answers that, so the wrapper builds it in
        // TypeScript.
        gen.value( "key", adminToolDescriptor.getKey().toString() );
        gen.value( "title", adminToolDescriptor.getTitle() );
        gen.value( "description", adminToolDescriptor.getDescription() );
        // TODO: Unused until displayName is localized against the target app's i18n bundle.
        gen.value( "titleI18nKey", adminToolDescriptor.getTitleI18nKey() );
        gen.value( "descriptionI18nKey", adminToolDescriptor.getDescriptionI18nKey() );
    }
}
