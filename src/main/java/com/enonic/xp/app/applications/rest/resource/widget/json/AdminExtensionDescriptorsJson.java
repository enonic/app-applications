package com.enonic.xp.app.applications.rest.resource.widget.json;

import java.util.List;

import com.enonic.xp.admin.extension.AdminExtensionDescriptor;
import com.enonic.xp.descriptor.Descriptors;

import static java.util.stream.Collectors.toList;


@SuppressWarnings("UnusedDeclaration")
public class AdminExtensionDescriptorsJson
{
    private final List<AdminExtensionDescriptorJson> descriptorJsonList;

    public AdminExtensionDescriptorsJson( final List<AdminExtensionDescriptorJson> descriptorJsonList )
    {
        this.descriptorJsonList = descriptorJsonList;
    }

    public AdminExtensionDescriptorsJson( final Descriptors<AdminExtensionDescriptor> descriptors )
    {
        this.descriptorJsonList = descriptors.stream().map( AdminExtensionDescriptorJson::new ).collect( toList() );
    }

    public List<AdminExtensionDescriptorJson> getDescriptors()
    {
        return descriptorJsonList;
    }
}
