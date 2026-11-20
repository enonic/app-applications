package com.enonic.xp.app.applications.lib.graphql;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CountAliasesHandlerTest
{
    @Test
    public void countsNoneWithoutAliases()
    {
        assertEquals( 0, count( "{ applications { key displayName } }" ) );
    }

    @Test
    public void countsTopLevelAlias()
    {
        assertEquals( 1, count( "{ apps: applications { key } }" ) );
    }

    @Test
    public void countsNestedAlias()
    {
        assertEquals( 1, count( "{ applications { info { id: key } } }" ) );
    }

    @Test
    public void countsAliasesInFragments()
    {
        final String query = """
            { applications { ...Named ... on Application { inline: key } } }
            fragment Named on Application { named: key }
            """;

        assertEquals( 2, count( query ) );
    }

    @Test
    public void ignoresAliasSyntaxInStringsAndComments()
    {
        final String query = """
            {
              # a: b
              application(key: "a: b") { key }
            }
            """;

        assertEquals( 0, count( query ) );
    }

    @Test
    public void countsNoneWhenDocumentDoesNotParse()
    {
        assertEquals( 0, count( "{ apps: applications {" ) );
    }

    private static int count( final String query )
    {
        final CountAliasesHandler handler = new CountAliasesHandler();
        handler.setQuery( query );
        return handler.execute();
    }
}
