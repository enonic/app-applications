package com.enonic.xp.app.applications.lib.macro;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.macro.MacroDescriptorService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public final class ListMacrosHandler
    implements ScriptBean
{
    private String application;

    private Supplier<MacroDescriptorService> macroDescriptorServiceSupplier;

    public void setApplication( final String application )
    {
        this.application = application;
    }

    public List<MacroDescriptorMapper> execute()
    {
        // getByApplication, not getByApplications( application, SYSTEM ): the pre-rewrite
        // ApplicationInfoServiceImpl sent the system macros along with every application's own, and the
        // UI dropped them again client-side.
        return macroDescriptorServiceSupplier.get()
            .getByApplication( ApplicationKey.from( application ) )
            .stream()
            .map( MacroDescriptorMapper::new )
            .collect( Collectors.toList() );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.macroDescriptorServiceSupplier = context.getService( MacroDescriptorService.class );
    }
}
