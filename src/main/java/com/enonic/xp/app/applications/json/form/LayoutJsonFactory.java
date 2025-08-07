package com.enonic.xp.app.applications.json.form;

import com.enonic.xp.app.applications.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.form.FieldSet;

@SuppressWarnings("UnusedDeclaration")
public class LayoutJsonFactory
{
    public static FormItemJson create( final FieldSet layout, final LocaleMessageResolver localeMessageResolver )
    {
            return new FieldSetJson( layout, localeMessageResolver );
    }
}
