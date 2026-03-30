package com.enonic.xp.app.applications.json.content.page;

import com.google.common.base.Preconditions;

import com.enonic.xp.app.applications.json.ItemJson;
import com.enonic.xp.app.applications.json.form.FormJson;
import com.enonic.xp.app.applications.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.app.applications.rest.resource.schema.mixin.CmsFormFragmentServiceResolver;
import com.enonic.xp.region.ComponentDescriptor;

import static com.google.common.base.Strings.nullToEmpty;


public abstract class DescriptorJson
    implements ItemJson
{
    private final ComponentDescriptor descriptor;

    private final FormJson configJson;

    private final LocaleMessageResolver localeMessageResolver;

    private final boolean editable;

    private final boolean deletable;

    public DescriptorJson( final ComponentDescriptor descriptor, final LocaleMessageResolver localeMessageResolver,
                           final CmsFormFragmentServiceResolver inlineMixinResolver )
    {
        Preconditions.checkNotNull( descriptor );
        Preconditions.checkNotNull( localeMessageResolver );

        this.editable = false;
        this.deletable = false;

        this.localeMessageResolver = localeMessageResolver;
        this.descriptor = descriptor;

        this.configJson = new FormJson( descriptor.getConfig(), localeMessageResolver, inlineMixinResolver );
    }

    public String getKey()
    {
        return descriptor.getKey().toString();
    }

    public String getName()
    {
        return descriptor.getName();
    }

    public String getDisplayName()
    {
        if ( !nullToEmpty( descriptor.getTitleI18nKey() ).isBlank() )
        {
            return localeMessageResolver.localizeMessage( descriptor.getTitleI18nKey(), descriptor.getTitle() );
        }
        else
        {
            return descriptor.getTitle();
        }
    }

    public String getDescription()
    {
        if ( !nullToEmpty( descriptor.getDescriptionI18nKey() ).isBlank() )
        {
            return localeMessageResolver.localizeMessage( descriptor.getDescriptionI18nKey(), descriptor.getDescription() );
        }
        else
        {
            return descriptor.getDescription();
        }
    }

    public FormJson getConfig()
    {
        return configJson;
    }

    @Override
    public boolean getEditable()
    {
        return editable;
    }

    @Override
    public boolean getDeletable()
    {
        return deletable;
    }
}
