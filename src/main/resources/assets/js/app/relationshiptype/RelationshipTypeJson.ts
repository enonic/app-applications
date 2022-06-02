import {SchemaJson} from '@enonic/lib-admin-ui/schema/SchemaJson';

export interface RelationshipTypeJson
    extends SchemaJson {

    fromSemantic: string;

    toSemantic: string;

    allowedFromTypes: string[];

    allowedToTypes: string[];
}
