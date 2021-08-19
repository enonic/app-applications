package com.enonic.xp.app.applications.json.form;

import com.enonic.xp.app.applications.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.form.FieldSet;
import com.enonic.xp.form.Layout;

@SuppressWarnings("UnusedDeclaration")
public class LayoutJsonFactory
{
    public static FormItemJson create( final Layout layout, final LocaleMessageResolver localeMessageResolver )
    {
        if ( layout instanceof FieldSet )
        {
            return new FieldSetJson( (FieldSet) layout, localeMessageResolver );
        }

        throw new IllegalArgumentException( "Unsupported Layout: " + layout.getClass().getSimpleName() );
    }
}
