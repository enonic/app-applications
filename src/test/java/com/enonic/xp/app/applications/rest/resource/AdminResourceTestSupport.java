package com.enonic.xp.app.applications.rest.resource;

import com.enonic.xp.jaxrs.impl.JaxRsResourceTestSupport;

public abstract class AdminResourceTestSupport
    extends JaxRsResourceTestSupport
{
    public AdminResourceTestSupport()
    {
        super( ResourceConstants.REST_ROOT.substring( 1 ) );
    }
}
