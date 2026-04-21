package com.enonic.xp.app.applications.rest.resource.macro.json;

import com.google.common.base.Preconditions;

import com.enonic.xp.app.applications.json.form.FormJson;
import com.enonic.xp.app.applications.rest.resource.schema.content.LocaleMessageResolver;
import com.enonic.xp.app.applications.rest.resource.schema.mixin.CmsFormFragmentServiceResolver;
import com.enonic.xp.macro.MacroDescriptor;

import static com.google.common.base.Strings.nullToEmpty;

public class MacroDescriptorJson
{
    private final String key;

    private final String name;

    private final String title;

    private final String description;

    private final FormJson form;

    private final String titleI18nKey;

    private final LocaleMessageResolver localeMessageResolver;

    private final String descriptionI18nKey;

    public MacroDescriptorJson( final Builder builder )
    {
        Preconditions.checkNotNull( builder.localeMessageResolver );
        Preconditions.checkNotNull( builder.macroDescriptor );

        this.localeMessageResolver = builder.localeMessageResolver;

        this.key = builder.macroDescriptor.getKey().toString();
        this.name = builder.macroDescriptor.getName();
        this.title = builder.macroDescriptor.getTitle();
        this.titleI18nKey = builder.macroDescriptor.getTitleI18nKey();
        this.descriptionI18nKey = builder.macroDescriptor.getDescriptionI18nKey();
        this.description = builder.macroDescriptor.getDescription();
        this.form = new FormJson( builder.macroDescriptor.getForm(), builder.localeMessageResolver, builder.inlineMixinResolver );
    }

    public String getKey()
    {
        return key;
    }

    public String getName()
    {
        return name;
    }

    public String getDisplayName()
    {
        if ( !nullToEmpty( titleI18nKey ).isBlank() )
        {
            return localeMessageResolver.localizeMessage( titleI18nKey, title );
        }
        else
        {
            return title;
        }
    }

    public String getDescription()
    {
        if ( !nullToEmpty( descriptionI18nKey ).isBlank() )
        {
            return localeMessageResolver.localizeMessage( descriptionI18nKey, description );
        }
        else
        {
            return description;
        }
    }

    public FormJson getForm()
    {
        return form;
    }

    public static Builder create()
    {
        return new Builder();
    }

    public static class Builder
    {
        private MacroDescriptor macroDescriptor;

        private LocaleMessageResolver localeMessageResolver;

        private CmsFormFragmentServiceResolver inlineMixinResolver;

        public Builder setMacroDescriptor( final MacroDescriptor macroDescriptor )
        {
            this.macroDescriptor = macroDescriptor;
            return this;
        }

        public Builder setLocaleMessageResolver( final LocaleMessageResolver localeMessageResolver )
        {
            this.localeMessageResolver = localeMessageResolver;
            return this;
        }

        public Builder setInlineMixinResolver( final CmsFormFragmentServiceResolver inlineMixinResolver )
        {
            this.inlineMixinResolver = inlineMixinResolver;
            return this;
        }

        public MacroDescriptorJson build()
        {
            return new MacroDescriptorJson( this );
        }
    }
}
