import {MarketApplicationResponse} from './MarketApplicationResponse';
import {MarketApplication} from './MarketApplication';
import {MarketApplicationMetadata} from './MarketApplicationMetadata';
import * as Q from 'q';
import {PostRequest} from 'lib-admin-ui/rest/PostRequest';
import {UriHelper} from 'lib-admin-ui/util/UriHelper';
import {JsonResponse} from 'lib-admin-ui/rest/JsonResponse';
import {MarketApplicationsListJson} from './json/MarketApplicationsListJson';

export class ListMarketApplicationsRequest
    extends PostRequest {

    private static DEFAULT_MARKET_URL: string = 'https://market.enonic.com/applications';

    private version: string;
    private start: number = 0;
    private count: number = 10;
    private ids: string[] = [];

    setIds(ids: string[]): ListMarketApplicationsRequest {
        this.ids = ids;
        return this;
    }

    setVersion(version: string, preprocess: boolean = true): ListMarketApplicationsRequest {
        this.version = preprocess ? version.replace(/-.*$/, '') : version;
        return this;
    }

    setStart(start: number): ListMarketApplicationsRequest {
        this.start = start;
        return this;
    }

    setCount(count: number): ListMarketApplicationsRequest {
        this.count = count;
        return this;
    }

    protected createRequestURI(): string {
        const marketUrl = (window['CONFIG'] && window['CONFIG']['marketUrl']) || ListMarketApplicationsRequest.DEFAULT_MARKET_URL;

        return UriHelper.appendUrlParams(marketUrl, this.params);
    }

    protected createRequestData(): Object {

        if (this.ids && this.ids.length > 0) {
            this.params = {
                ids: this.ids
            };
        }

        return super.createRequestData();
    }

    sendAndParse(): Q.Promise<MarketApplicationResponse> {
        this.params = {
            xpVersion: this.version,
            start: this.start,
            count: this.count
        };

        return this.send().then((rawResponse: Object) => {
            const response = new JsonResponse<MarketApplicationsListJson>(rawResponse);
            return ListMarketApplicationsRequest.parseResponse(response);
        });
    }

    private static parseResponse(response: JsonResponse<MarketApplicationsListJson>): MarketApplicationResponse {
        const applications: MarketApplication[] = MarketApplication.fromJsonArray(response.getResult().hits);
        const hits: number = applications.length;
        const totalHits: number = response.getResult().total;
        return new MarketApplicationResponse(applications, new MarketApplicationMetadata(hits, totalHits));
    }
}
