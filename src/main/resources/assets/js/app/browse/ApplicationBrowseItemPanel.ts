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
        this.createBackButton();
    }

    private createBackButton() {
        let backButton = new DivEl('application-item-statistics-panel-back-button icon-arrow-left');
        backButton.onClicked(() => {
            this.addClass('hidden');
        });

        this.itemStatisticsPanel.appendChild(backButton);
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
