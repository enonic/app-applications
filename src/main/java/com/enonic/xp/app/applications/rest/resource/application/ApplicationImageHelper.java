package com.enonic.xp.app.applications.rest.resource.application;

import com.enonic.xp.app.applications.rest.resource.BaseImageHelper;
import com.enonic.xp.icon.Icon;

public final class ApplicationImageHelper
    extends BaseImageHelper
{
    private final Icon defaultApplicationIcon;

    public ApplicationImageHelper()
    {
        defaultApplicationIcon = loadDefaultIcon( "application" );
    }

    public Icon getDefaultApplicationIcon()
    {
        return defaultApplicationIcon;
    }
}
