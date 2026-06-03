package com.enonic.xp.app.applications.rest.resource.application.json;

import com.enonic.xp.app.applications.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.schema.BaseSchema;

import static com.google.common.base.Strings.nullToEmpty;

public class SchemaDescriptorJson
{
    private final BaseSchema<?> schema;

    private final LocaleMessageResolver localeMessageResolver;

    public SchemaDescriptorJson( final BaseSchema<?> schema, final LocaleMessageResolver localeMessageResolver )
    {
        this.schema = schema;
        this.localeMessageResolver = localeMessageResolver;
    }

    public String getKey()
    {
        return schema.getName().toString();
    }

    public String getName()
    {
        return schema.getName().getLocalName();
    }

    public String getDisplayName()
    {
        if ( !nullToEmpty( schema.getTitleI18nKey() ).isBlank() )
        {
            return localeMessageResolver.localizeMessage( schema.getTitleI18nKey(), schema.getTitle() );
        }
        return schema.getTitle();
    }

    public String getDescription()
    {
        if ( !nullToEmpty( schema.getDescriptionI18nKey() ).isBlank() )
        {
            return localeMessageResolver.localizeMessage( schema.getDescriptionI18nKey(), schema.getDescription() );
        }
        return schema.getDescription();
    }
}
