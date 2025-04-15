package com.enonic.xp.app.applications.rest.resource.application;

import com.enonic.xp.app.ApplicationDescriptor;
import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.app.applications.rest.resource.ResourceConstants;
import com.enonic.xp.icon.Icon;
import com.enonic.xp.web.servlet.ServletRequestUrlHelper;
import com.google.common.hash.Hashing;
import jakarta.servlet.http.HttpServletRequest;

public final class ApplicationIconUrlResolver {
    private static final String REST_SCHEMA_ICON_URL = ResourceConstants.REST_ROOT + "application/icon/";

    private final HttpServletRequest servletRequest;

    public ApplicationIconUrlResolver(final HttpServletRequest servletRequest) {
        this.servletRequest = servletRequest;
    }

    public String resolve(final ApplicationKey applicationKey, final ApplicationDescriptor applicationDescriptor )
    {
        final String baseUrl = REST_SCHEMA_ICON_URL + applicationKey.toString();
        final Icon icon = applicationDescriptor == null ? null : applicationDescriptor.getIcon();
        return generateIconUrl( baseUrl, icon );
    }

    private String generateIconUrl( final String baseUrl, final Icon icon )
    {
        final StringBuilder str = new StringBuilder( baseUrl );
        if ( icon != null )
        {
            final byte[] iconData = icon.toByteArray();
            if ( iconData.length > 0 )
            {
                str.append( "?hash=" ).append( Hashing.md5().hashBytes( iconData ) );
            }
        }
        return ServletRequestUrlHelper.createUri( servletRequest, str.toString() );
    }
}
