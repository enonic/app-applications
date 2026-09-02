package com.enonic.xp.app.applications.csp;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Modified;

import com.enonic.xp.admin.extension.AdminExtensionResponseProcessor;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.PortalResponse;
import com.enonic.xp.web.csp.ContentSecurityPolicy;
import com.enonic.xp.web.csp.CspDirective;

/**
 * Opens {@code img-src} for Enonic Market on the pages the Applications section is mounted to: the
 * section renders application icons straight from the market, and everything else it needs is
 * same-origin. The platform runs this after the tool controller, only for a caller the section's
 * own {@code allow} admits.
 */
@Component(service = AdminExtensionResponseProcessor.class, property = "key=com.enonic.xp.app.applications:applications",
    configurationPid = "com.enonic.xp.app.applications")
public final class ApplicationsSectionCspProcessor
    implements AdminExtensionResponseProcessor
{
    private static final String DEFAULT_MARKET_ORIGIN = "https://market.enonic.com";

    private static final Pattern ORIGIN = Pattern.compile( "^(https?://[^/]+)" );

    private volatile String marketOrigin = DEFAULT_MARKET_ORIGIN;

    @Activate
    @Modified
    public void activate( final Map<String, ?> properties )
    {
        // The app's own .cfg — the market url the section already reads.
        this.marketOrigin =
            properties.get( "marketApiUrl" ) instanceof String url && !url.isBlank() ? originOf( url ) : DEFAULT_MARKET_ORIGIN;
    }

    @Override
    public PortalResponse process( final PortalRequest request, final PortalResponse response )
    {
        final ContentSecurityPolicy policy = request.getContentSecurityPolicy();

        // ! Extend a directive the host declared, never create one: an img-src carrying the market alone
        // ! blocks every same-origin image, and this is what makes the host's kill switch stop the chain.
        if ( !this.marketOrigin.isEmpty() && policy.directive( CspDirective.IMG_SRC ).isPresent() )
        {
            policy.imgSrc( this.marketOrigin );
        }

        return response;
    }

    /** Scheme and host of the api url; nothing if it is not an http url, which would be an invalid source. */
    private static String originOf( final String marketApiUrl )
    {
        final Matcher matcher = ORIGIN.matcher( marketApiUrl.trim() );

        return matcher.find() ? matcher.group( 1 ) : "";
    }
}
