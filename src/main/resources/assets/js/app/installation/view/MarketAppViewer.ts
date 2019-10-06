import * as Q from 'q';
import {Viewer} from 'lib-admin-ui/ui/Viewer';
import {NamesAndIconView, NamesAndIconViewBuilder} from 'lib-admin-ui/app/NamesAndIconView';
import {AEl} from 'lib-admin-ui/dom/AEl';
import {MarketApplication} from 'lib-admin-ui/application/MarketApplication';
import {NamesAndIconViewSize} from 'lib-admin-ui/app/NamesAndIconViewSize';

export class MarketAppViewer
    extends Viewer<MarketApplication> {

    private namesAndIconView: NamesAndIconView;

    private relativePath: boolean;

    private size: NamesAndIconViewSize;

    public static debug: boolean = false;

    constructor(className?: string, size: NamesAndIconViewSize = NamesAndIconViewSize.small) {
        super(className);

        this.size = size;
    }

    setObject(object: MarketApplication, relativePath: boolean = false): Q.Promise<boolean> {
        this.relativePath = relativePath;
        super.setObject(object);

        return Q(true);
    }

    resolveDisplayName(object: MarketApplication): string {
        let appLink = new AEl().setUrl(object.getUrl(), '_blank').setHtml(object.getDisplayName(), false);
        return appLink.toString();
    }

    resolveSubName(object: MarketApplication, relativePath: boolean = false): string {
        return object.getDescription();
    }

    resolveSubTitle(object: MarketApplication): string {
        return object.getDescription();
    }

    resolveIconUrl(object: MarketApplication): string {
        return object.getIconUrl();
    }

    getPreferredHeight(): number {
        return 50;
    }

    doLayout(object: MarketApplication) {
        super.doLayout(object);

        if (MarketAppViewer.debug) {
            console.debug('MarketAppViewer.doLayout');
        }

        if (!this.namesAndIconView) {
            this.namesAndIconView = new NamesAndIconViewBuilder().setSize(this.size).build();
            this.appendChild(this.namesAndIconView);
        }

        if (object) {
            let displayName = this.resolveDisplayName(object);
            let subName = this.resolveSubName(object, this.relativePath);
            let subTitle = this.resolveSubTitle(object);
            let iconUrl = this.resolveIconUrl(object);

            this.namesAndIconView.getNamesView().setMainName(displayName, false).setSubName(subName, subTitle);
            if (!!subTitle) {
                this.namesAndIconView.getEl().setTitle(subTitle);
            } else if (!!subName) {
                this.namesAndIconView.getEl().setTitle(subName);
            }
            if (!!iconUrl) {
                this.namesAndIconView.setIconUrl(iconUrl);
            }
            this.namesAndIconView.getIconImageEl().onError(() => {
                this.namesAndIconView.setIconClass('icon-puzzle icon-large');
                this.namesAndIconView.getIconImageEl().setSrc('');
            });
        }
    }
}
