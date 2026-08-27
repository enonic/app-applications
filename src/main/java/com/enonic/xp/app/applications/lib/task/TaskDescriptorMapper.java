package com.enonic.xp.app.applications.lib.task;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;
import com.enonic.xp.task.TaskDescriptor;

public final class TaskDescriptorMapper
    implements MapSerializable
{
    private final TaskDescriptor taskDescriptor;

    public TaskDescriptorMapper( final TaskDescriptor taskDescriptor )
    {
        this.taskDescriptor = taskDescriptor;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        // No title: TaskDescriptor extends Descriptor, which carries the key alone. A task's
        // displayName can only ever be its name.
        gen.value( "key", taskDescriptor.getKey().toString() );
        gen.value( "description", taskDescriptor.getDescription() );
        // TODO: Unused until description is localized against the target app's i18n bundle.
        gen.value( "descriptionI18nKey", taskDescriptor.getDescriptionI18nKey() );
    }
}
