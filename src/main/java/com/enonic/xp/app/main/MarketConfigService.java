package com.enonic.xp.app.main;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;

@Component(immediate = true, service = MarketConfigService.class, configurationPid = "com.enonic.xp.market")
public class MarketConfigService
{
    private final String marketApiUrl;

    @Activate
    public MarketConfigService( final MarketConfig marketConfig )
    {
        this.marketApiUrl = marketConfig.marketApiUrl();
    }

    public String getMarketApiUrl()
    {
        return marketApiUrl;
    }
}
