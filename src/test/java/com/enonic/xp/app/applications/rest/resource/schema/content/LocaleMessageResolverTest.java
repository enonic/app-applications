package com.enonic.xp.app.applications.rest.resource.schema.content;

import java.util.List;
import java.util.Locale;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.i18n.LocaleService;
import com.enonic.xp.i18n.MessageBundle;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class LocaleMessageResolverTest
{
    private LocaleMessageResolver localeMessageResolver;

    private MessageBundle messageBundle;

    @BeforeEach
    public void init()
    {
        Locale.setDefault( new Locale( "es", "ES" ) );
        messageBundle = mock( MessageBundle.class );
        when( messageBundle.localize( "key.valid" ) ).thenReturn( "translated" );
        LocaleService localeService = mock( LocaleService.class );
        when( localeService.getBundle( any(), any() ) ).thenReturn( messageBundle );
        this.localeMessageResolver =
            new LocaleMessageResolver( localeService, ApplicationKey.from( "myApplication" ), List.of( Locale.US ) );
    }

    @Test
    public void testInvalid()
    {
        Locale.setDefault( new Locale( "es", "ES" ) );
        final String result = localeMessageResolver.localizeMessage( "key.invalid", null );
        assertNull( result );
    }

    @Test
    public void testInvalidWithDefaultValue()
    {
        Locale.setDefault( new Locale( "es", "ES" ) );
        final String result = localeMessageResolver.localizeMessage( "key.invalid", "defaultValue" );
        assertEquals( "defaultValue", result );
    }

    @Test
    public void testValid()
    {
        Locale.setDefault( new Locale( "es", "ES" ) );
        final String result = localeMessageResolver.localizeMessage( "key.valid", "defaultValue" );
        assertEquals( "translated", result );
    }

    @Test
    public void testValidKeyWithInvalidValue()
    {
        when( messageBundle.localize( "key.valid" ) ).thenThrow( new IllegalArgumentException() );
        when( messageBundle.getMessage( "key.valid" ) ).thenReturn( "invalid value" );

        Locale.setDefault( new Locale( "es", "ES" ) );
        final String result = localeMessageResolver.localizeMessage( "key.valid", "defaultValue" );
        assertEquals( "invalid value", result );
    }
}
