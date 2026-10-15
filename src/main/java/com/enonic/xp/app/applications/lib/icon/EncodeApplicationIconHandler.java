package com.enonic.xp.app.applications.lib.icon;

import java.util.Base64;
import java.util.function.Supplier;

import com.enonic.xp.app.ApplicationDescriptor;
import com.enonic.xp.app.ApplicationDescriptorService;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.icon.Icon;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public final class EncodeApplicationIconHandler
    implements ScriptBean
{
    private String application;

    private Supplier<ApplicationDescriptorService> applicationDescriptorServiceSupplier;

    public void setApplication( final String application )
    {
        this.application = application;
    }

    // ! Base64, because the icon has to reach the browser inside a JSON payload. `lib/xp/app` already
    // ! exposes the icon as a ByteSource, but nothing running on GraalJS can serve those bytes: XP
    // ! wraps every host object in GraalObjectScriptValue, whose isObject() is true, so
    // ! PortalResponseSerializer.populateBody turns a ByteSource body into a map of its own methods.
    // ! Encoding here is the one place that can see the bytes at all.
    public String execute()
    {
        final ApplicationDescriptor descriptor =
            applicationDescriptorServiceSupplier.get().get( ApplicationKey.from( application ) );

        final Icon icon = descriptor == null ? null : descriptor.getIcon();

        return icon == null ? null : Base64.getEncoder().encodeToString( icon.toByteArray() );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.applicationDescriptorServiceSupplier = context.getService( ApplicationDescriptorService.class );
    }
}
