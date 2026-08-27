package com.enonic.xp.app.applications.lib.task;

import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.task.TaskDescriptorService;

public final class ListTaskDescriptorsHandler
    implements ScriptBean
{
    private String application;

    private Supplier<TaskDescriptorService> taskDescriptorServiceSupplier;

    public void setApplication( final String application )
    {
        this.application = application;
    }

    public List<TaskDescriptorMapper> execute()
    {
        return taskDescriptorServiceSupplier.get()
            .getTasks( ApplicationKey.from( application ) )
            .stream()
            .map( TaskDescriptorMapper::new )
            .collect( Collectors.toList() );
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.taskDescriptorServiceSupplier = context.getService( TaskDescriptorService.class );
    }
}
