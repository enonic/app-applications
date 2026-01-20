package com.enonic.xp.app.main;

public @interface MarketConfig
{
    String DEFAULT_MARKET_API_URL = "https://market.enonic.com/api/graphql";

    String marketApiUrl() default DEFAULT_MARKET_API_URL;
}
