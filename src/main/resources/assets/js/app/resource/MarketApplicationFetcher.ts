import ListMarketApplicationsRequest = api.application.ListMarketApplicationsRequest;
import MarketApplicationResponse = api.application.MarketApplicationResponse;

export class MarketApplicationFetcher {

    static fetchApps(version: string, from: number = 0, size: number = -1): wemQ.Promise<MarketApplicationResponse> {
        return new ListMarketApplicationsRequest()
            .setStart(from)
            .setCount(size)
            .setVersion(version)
            .sendAndParse();
    }
}
