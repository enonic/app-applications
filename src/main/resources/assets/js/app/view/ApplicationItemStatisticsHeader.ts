import {ItemStatisticsHeader} from '@enonic/lib-admin-ui/app/view/ItemStatisticsHeader';
import {Application} from '@enonic/lib-admin-ui/application/Application';
import {DivEl} from '@enonic/lib-admin-ui/dom/DivEl';

export class ApplicationItemStatisticsHeader
    extends ItemStatisticsHeader {

    constructor() {
        super();

        const wrapper: DivEl = new DivEl();
        wrapper.appendChildren(...this.getChildren());
        this.appendChild(wrapper);
    }

    setItem(item: Application): void {
        super.setItem(item);

        if (item.hasIconUrl()) {
            this.setIconUrl(item.getIconUrl());
        }

        if (item.hasDescription()) {
            this.setHeaderSubtitle(item.getDescription(), 'app-description');
            this.removeClass('no-description');
        } else {
            this.addClass('no-description');
        }
    }

}
