package com.enonic.xp.app.applications.lib.graphql;

import graphql.language.Field;
import graphql.language.Node;
import graphql.parser.InvalidSyntaxException;
import graphql.parser.Parser;

public final class CountAliasesHandler
{
    private String query;

    public void setQuery( final String query )
    {
        this.query = query;
    }

    public int execute()
    {
        // graphql-java's own parser, the one lib-graphql is about to run the document through, so what
        // is counted here is what will execute: operations, nested selections and fragments alike. A
        // scan on the JS side would have to mirror its lexer string by string to say the same.
        try
        {
            return count( Parser.parse( query ) );
        }
        catch ( InvalidSyntaxException e )
        {
            // Not this handler's to report: execution refuses the document with the parser's message.
            return 0;
        }
    }

    private static int count( final Node<?> node )
    {
        int aliases = node instanceof Field field && field.getAlias() != null ? 1 : 0;
        for ( final Node<?> child : node.getChildren() )
        {
            aliases += count( child );
        }
        return aliases;
    }
}
