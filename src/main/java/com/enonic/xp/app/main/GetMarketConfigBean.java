package com.enonic.xp.app.main;

import java.util.function.Supplier;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public final class GetMarketConfigBean
    implements ScriptBean
{
    private Supplier<MarketConfigService> marketConfigSupplier;

    @Override
    public void initialize( final BeanContext context )
    {
        this.marketConfigSupplier = context.getService( MarketConfigService.class );
    }

    public String getMarketApiUrl()
    {
        if ( marketConfigSupplier.get() != null )
        {
            return marketConfigSupplier.get().getMarketApiUrl();
        }

        return MarketConfig.DEFAULT_MARKET_API_URL;
    }
}
