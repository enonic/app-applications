import Application = api.application.Application;
import MarketApplication = api.application.MarketApplication;
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

    static fetchInstalledApps(version: string, installedApplications: Application[]): wemQ.Promise<MarketApplication[]> {
        return new ListMarketApplicationsRequest()
            .setStart(0)
            .setCount(-1)
            .setIds(installedApplications.map(app => app.getId()))
            .setVersion(version)
            .sendAndParse()
            .then((response: MarketApplicationResponse) => response.getApplications());
    }
}
