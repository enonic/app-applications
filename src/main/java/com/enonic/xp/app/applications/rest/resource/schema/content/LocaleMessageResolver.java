package com.enonic.xp.app.applications.rest.resource.schema.content;

import java.util.List;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.i18n.MessageBundle;

public final class LocaleMessageResolver
{
    private static final Logger LOG = LoggerFactory.getLogger( LocaleMessageResolver.class );

    private final LocaleService localeService;

    private final ApplicationKey applicationKey;

    private final List<Locale> locales;

    public LocaleMessageResolver( final LocaleService localeService, final ApplicationKey applicationKey, final List<Locale> locales )
    {
        this.localeService = localeService;
        this.applicationKey = applicationKey;
        this.locales = locales;
    }

    public String localizeMessage( final String key, final String defaultValue )
    {
        final MessageBundle bundle = this.localeService.getBundle( applicationKey, getLocale() );

        if ( bundle == null )
        {
            return defaultValue;
        }
        final String localizedValue;
        try
        {
            localizedValue = bundle.localize( key );
        }
        catch ( IllegalArgumentException e )
        {
            LOG.error( "Error on localization of message with key [{}].", key, e );
            return bundle.getMessage( key );
        }

        return localizedValue != null ? localizedValue : defaultValue;
    }

    private Locale getLocale()
    {
        return localeService.getSupportedLocale( locales, applicationKey );
    }
}
