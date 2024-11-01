package com.enonic.xp.app.applications.rest.resource.apis.json;

import java.util.List;

public class ApiDescriptorsJson
{
    private final List<ApiDescriptorJson> descriptors;

    public ApiDescriptorsJson( List<ApiDescriptorJson> descriptors )
    {
        this.descriptors = descriptors;
    }

    public List<ApiDescriptorJson> getDescriptors()
    {
        return descriptors;
    }
}
