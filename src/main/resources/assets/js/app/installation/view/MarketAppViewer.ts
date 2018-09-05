import NamesAndIconViewSize = api.app.NamesAndIconViewSize;
import i18n = api.util.i18n;
import {MarketApplication} from '../../market/MarketApplication';

export class MarketAppViewer extends api.ui.Viewer<MarketApplication> {

    private namesAndIconView: api.app.NamesAndIconView;

    private relativePath: boolean;

    private size: NamesAndIconViewSize;

    public static debug: boolean = false;

    constructor(className?: string, size: NamesAndIconViewSize = NamesAndIconViewSize.small) {
        super(className);

        this.size = size;
    }

    setObject(object: MarketApplication, relativePath: boolean = false): wemQ.Promise<boolean> {
        this.relativePath = relativePath;
        super.setObject(object);

        return wemQ(true);
    }

    resolveDisplayName(object: MarketApplication): string {
        const appLink = new api.dom.AEl('app-name').setUrl('#').setHtml(object.getDisplayName(), false);
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
            this.namesAndIconView = new api.app.NamesAndIconViewBuilder().setSize(this.size).build();
            this.appendChild(this.namesAndIconView);
        }

        if (object) {
            const displayName = this.resolveDisplayName(object);
            const subName = this.resolveSubName(object, this.relativePath);
            const subTitle = this.resolveSubTitle(object);
            const iconUrl = this.resolveIconUrl(object);

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

            const isReadMoreSectionAdded: boolean = this.namesAndIconView.getNamesView().getChildren().length > 2;
            if (!isReadMoreSectionAdded) {
                const readMoreSection: api.dom.Element = new api.dom.DivEl('app-more');
                readMoreSection.appendChild(
                    new api.dom.AEl().setUrl(object.getUrl(), '_blank').setHtml(i18n('market.app.readmore'), false));
                this.namesAndIconView.getNamesView().appendChild(readMoreSection);
            }
        }
    }
}
