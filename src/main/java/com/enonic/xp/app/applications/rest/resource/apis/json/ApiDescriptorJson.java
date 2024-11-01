package com.enonic.xp.app.applications.rest.resource.apis.json;

import java.util.List;

import com.enonic.xp.api.ApiDescriptor;
import com.enonic.xp.security.PrincipalKey;

public final class ApiDescriptorJson
{
    public String key;

    public String name;

    public String displayName;

    public String description;

    public String documentationUrl;

    public boolean mount;

    public List<String> allowedPrincipals;

    public ApiDescriptorJson( final ApiDescriptor apiDescriptor )
    {
        this.key = apiDescriptor.getKey().toString();
        this.name = apiDescriptor.getKey().getName();
        this.displayName = apiDescriptor.getDisplayName();
        this.description = apiDescriptor.getDescription();
        this.documentationUrl = apiDescriptor.getDocumentationUrl();
        this.mount = apiDescriptor.isMount();
        this.allowedPrincipals = apiDescriptor.getAllowedPrincipals().getSet().stream().map( PrincipalKey::toString ).toList();
    }
}
