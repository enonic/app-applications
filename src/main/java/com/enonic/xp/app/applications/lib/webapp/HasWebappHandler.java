package com.enonic.xp.app.applications.lib.webapp;

import java.util.function.Supplier;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.resource.ResourceKey;
import com.enonic.xp.resource.ResourceService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public final class HasWebappHandler
    implements ScriptBean
{
    // The resource XP's own WebAppHandler runs. A webapp needs no descriptor, so this file — not
    // webapp.yml, which WebappService reads — is what decides whether an application has one.
    private static final String WEBAPP_CONTROLLER_PATH = "/webapp/webapp.js";

    private String application;

    private Supplier<ResourceService> resourceServiceSupplier;

    public void setApplication( final String application )
    {
        this.application = application;
    }

    public boolean execute()
    {
        // Existence only. The pre-rewrite AppsApplicationResource went on to execute the controller
        // and check for exported get/post/head/all — running another application's top-level code every
        // time an admin opened the panel, which is a steep price for catching a webapp.js that exports
        // nothing.
        return resourceServiceSupplier.get()
            .getResource( ResourceKey.from( ApplicationKey.from( application ), WEBAPP_CONTROLLER_PATH ) )
            .exists();
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.resourceServiceSupplier = context.getService( ResourceService.class );
    }
}
