import {ApplicationItemStatisticsPanel} from '../view/ApplicationItemStatisticsPanel';
import {BrowseItemPanel} from 'lib-admin-ui/app/browse/BrowseItemPanel';
import {Application} from 'lib-admin-ui/application/Application';
import {ItemStatisticsPanel} from 'lib-admin-ui/app/view/ItemStatisticsPanel';
import {DivEl} from 'lib-admin-ui/dom/DivEl';

export class ApplicationBrowseItemPanel
    extends BrowseItemPanel {

    constructor() {
        super();
        this.addClass('application-browse-item-panel');

        this.initElements();
    }

    protected initElements(): void {
        const toolbar = this.createItemStatisticsToolbar();
        const backButton = this.createBackButton();
        toolbar.appendChild(backButton);
        this.itemStatisticsPanel.appendChild(toolbar);
    }

    private createItemStatisticsToolbar(): DivEl {
        return new DivEl('application-item-statistics-toolbar');
    }

    private createBackButton(): DivEl {
        const backButton = new DivEl('application-item-statistics-panel-back-button icon-arrow-left2');
        backButton.onClicked(() => {
            this.addClass('hidden');
        });

        return backButton;
    }

    togglePreviewForItem(item?: Application) {
        super.togglePreviewForItem(item);

        if (item) {
            this.removeClass('hidden');
        }
    }

    createItemStatisticsPanel(): ItemStatisticsPanel {
        return new ApplicationItemStatisticsPanel();
    }

}
