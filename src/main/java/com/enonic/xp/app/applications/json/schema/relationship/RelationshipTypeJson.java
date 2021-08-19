package com.enonic.xp.app.applications.json.schema.relationship;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.enonic.xp.app.applications.json.ItemJson;
import com.enonic.xp.schema.content.ContentTypeName;
import com.enonic.xp.schema.relationship.RelationshipType;

public class RelationshipTypeJson
    implements ItemJson
{
    private final RelationshipType relationshipType;

    private final List<String> allowedFromTypes;

    private final List<String> allowedToTypes;

    public RelationshipTypeJson( final RelationshipType type )
    {
        this.relationshipType = type;

        this.allowedFromTypes = new ArrayList<>( relationshipType.getAllowedFromTypes().getSize() );
        for ( ContentTypeName allowedFromType : relationshipType.getAllowedFromTypes() )
        {
            this.allowedFromTypes.add( allowedFromType.toString() );
        }

        this.allowedToTypes = new ArrayList<>( relationshipType.getAllowedToTypes().getSize() );
        for ( ContentTypeName allowedToType : relationshipType.getAllowedToTypes() )
        {
            this.allowedToTypes.add( allowedToType.toString() );
        }
    }

    public String getName()
    {
        return relationshipType.getName() != null ? relationshipType.getName().toString() : null;
    }

    public String getDisplayName()
    {
        return relationshipType.getDisplayName();
    }

    public String getDescription()
    {
        return relationshipType.getDescription();
    }

    public Instant getCreatedTime()
    {
        return relationshipType.getCreatedTime();
    }

    public Instant getModifiedTime()
    {
        return relationshipType.getModifiedTime();
    }

    public String getFromSemantic()
    {
        return relationshipType.getFromSemantic();
    }

    public String getToSemantic()
    {
        return relationshipType.getToSemantic();
    }

    public List<String> getAllowedFromTypes()
    {
        return this.allowedFromTypes;
    }

    public List<String> getAllowedToTypes()
    {
        return allowedToTypes;
    }

    @Override
    public boolean getEditable()
    {
        return false;
    }

    @Override
    public boolean getDeletable()
    {
        return false;
    }
}
