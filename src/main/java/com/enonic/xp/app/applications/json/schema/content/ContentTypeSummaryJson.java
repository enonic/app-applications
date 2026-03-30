package com.enonic.xp.app.applications.json.schema.content;

import java.time.Instant;

import com.google.common.collect.ImmutableList;

import com.enonic.xp.app.applications.json.ChangeTraceableJson;
import com.enonic.xp.app.applications.json.ItemJson;
import com.enonic.xp.app.applications.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.schema.content.ContentType;
import com.enonic.xp.util.GenericValue;

import static com.google.common.base.Strings.nullToEmpty;

@SuppressWarnings("UnusedDeclaration")
public class ContentTypeSummaryJson
    implements ItemJson, ChangeTraceableJson
{
    private final ContentType contentType;

    private final LocaleMessageResolver localeMessageResolver;

    public ContentTypeSummaryJson( final ContentType contentType, final LocaleMessageResolver localeMessageResolver )
    {
        this.contentType = contentType;
        this.localeMessageResolver = localeMessageResolver;

        ImmutableList.Builder<String> xDataNamesBuilder = new ImmutableList.Builder<>();
    }

    public String getName()
    {
        return contentType.getName() != null ? contentType.getName().toString() : null;
    }

    public String getDisplayName()
    {
        if ( !nullToEmpty( contentType.getTitleI18nKey() ).isBlank() )
        {
            return localeMessageResolver.localizeMessage( contentType.getTitleI18nKey(), contentType.getTitle() );
        }
        else
        {
            return contentType.getTitle();
        }
    }

    public String getDescription()
    {
        if ( !nullToEmpty( contentType.getDescriptionI18nKey() ).isBlank() )
        {
            return localeMessageResolver.localizeMessage( contentType.getDescriptionI18nKey(), contentType.getDescription() );
        }
        else
        {
            return contentType.getDescription();
        }
    }

    public String getDisplayNameLabel()
    {
        final String displayNamePlaceholder = contentType.getDisplayNamePlaceholder();

        if ( displayNamePlaceholder == null )
        {
            return null;
        }

        final String i18n = contentType.getDisplayNamePlaceholderI18nKey() != null ? contentType.getDisplayNamePlaceholderI18nKey() : null;
        return !nullToEmpty( i18n ).isBlank()
            ? localeMessageResolver.localizeMessage( i18n, displayNamePlaceholder )
            : displayNamePlaceholder;
    }

    @Override
    public Instant getCreatedTime()
    {
        return contentType.getCreatedTime();
    }

    @Override
    public Instant getModifiedTime()
    {
        return contentType.getModifiedTime();
    }

    public String getDisplayNameExpression()
    {
        return contentType.getSchemaConfig().optional( "displayNameExpression" ).map( GenericValue::asString ).orElse( null );
    }

    public String getSuperType()
    {
        return contentType.getSuperType() != null ? contentType.getSuperType().toString() : null;
    }

    public boolean isAbstract()
    {
        return contentType.isAbstract();
    }

    public boolean isFinal()
    {
        return contentType.isFinal();
    }

    public boolean isAllowChildContent()
    {
        return contentType.allowChildContent();
    }

    @Override
    public String getCreator()
    {
        return contentType.getCreator() != null ? contentType.getCreator().toString() : null;
    }

    @Override
    public String getModifier()
    {
        return contentType.getModifier() != null ? contentType.getModifier().toString() : null;
    }

    @Override
    public boolean getEditable()
    {
        return false;
    }

    @Override
    public boolean getDeletable()
    {
        return false;
    }
}
