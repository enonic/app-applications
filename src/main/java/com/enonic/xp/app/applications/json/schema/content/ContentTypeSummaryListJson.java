package com.enonic.xp.app.applications.json.schema.content;

import java.util.List;

import com.google.common.collect.ImmutableList;

import com.enonic.xp.app.applications.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.schema.content.ContentType;
import com.enonic.xp.schema.content.ContentTypes;

@SuppressWarnings("UnusedDeclaration")
public class ContentTypeSummaryListJson
{
    private final List<ContentTypeSummaryJson> list;

    public ContentTypeSummaryListJson( final ContentTypes contentTypes, final LocaleMessageResolver localeMessageResolver )
    {
        final ImmutableList.Builder<ContentTypeSummaryJson> builder = ImmutableList.builder();
        if ( contentTypes != null )
        {
            for ( final ContentType contentType : contentTypes )
            {
                builder.add( new ContentTypeSummaryJson( contentType, localeMessageResolver ) );
            }
        }

        this.list = builder.build();
    }

    public ContentTypeSummaryListJson( final List<ContentTypeSummaryJson> list )
    {
        this.list = List.copyOf( list );
    }

    public int getTotal()
    {
        return this.list.size();
    }

    public List<ContentTypeSummaryJson> getContentTypes()
    {
        return this.list;
    }
}
