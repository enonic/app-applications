package com.enonic.xp.app.applications.lib.application;

import java.util.function.Supplier;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.ApplicationService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public final class IsLocalApplicationHandler
    implements ScriptBean
{
    private String application;

    private Supplier<ApplicationService> applicationServiceSupplier;

    public void setApplication( final String application )
    {
        this.application = application;
    }

    // ! Java because no JS lib carries this. lib-app's ApplicationMapper serializes eight fields and
    // ! local is not among them, and getApplicationMode answers BUNDLED/VIRTUAL/AUGMENTED about
    // ! virtual apps rather than reading localApplicationSet. ApplicationService.isLocalApplication is
    // ! the only accessor — see `../app-settings/docs/platform-facts.md`.
    public boolean execute()
    {
        return applicationServiceSupplier.get().isLocalApplication( ApplicationKey.from( application ) );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.applicationServiceSupplier = context.getService( ApplicationService.class );
    }
}
