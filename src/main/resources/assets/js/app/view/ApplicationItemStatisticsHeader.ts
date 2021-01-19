import {ItemStatisticsHeader} from 'lib-admin-ui/app/view/ItemStatisticsHeader';
import {Application} from 'lib-admin-ui/application/Application';

export class ApplicationItemStatisticsHeader
    extends ItemStatisticsHeader {

    setItem(item: Application): void {
        super.setItem(item);

        if (item.hasIconUrl()) {
            this.setIconUrl(item.getIconUrl());
        }

        if (item.hasDescription()) {
            this.setHeaderSubtitle(item.getDescription(), 'app-description');
        }

        this.appendToHeaderPath(item.getName(), 'parent-path');
    }

}
