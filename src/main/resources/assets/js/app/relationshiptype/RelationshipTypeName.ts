import {ApplicationBasedName} from 'lib-admin-ui/application/ApplicationBasedName';
import {assertNotNull} from 'lib-admin-ui/util/Assert';
import {ApplicationKey} from 'lib-admin-ui/application/ApplicationKey';

export class RelationshipTypeName
    extends ApplicationBasedName {

    constructor(name: string) {
        assertNotNull(name, `RelationshipType name can't be null`);
        let parts = name.split(ApplicationBasedName.SEPARATOR);
        super(ApplicationKey.fromString(parts[0]), parts[1]);
    }

}
