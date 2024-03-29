package com.enonic.xp.app.applications.json.content.page.region;


import com.enonic.xp.region.RegionDescriptor;

public class RegionDescriptorJson
{
    private final RegionDescriptor regionDescriptor;

    public RegionDescriptorJson( final RegionDescriptor regionDescriptor )
    {
        this.regionDescriptor = regionDescriptor;
    }

    public String getName()
    {
        return this.regionDescriptor.getName();
    }
}
