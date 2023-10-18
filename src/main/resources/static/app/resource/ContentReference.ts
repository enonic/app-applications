import {ContentReferenceJson} from './json/ContentReferencesJson';
import {ContentTypeName} from '@enonic/lib-admin-ui/schema/content/ContentTypeName';

export class ContentReference {

    private type: ContentTypeName;

    private displayName: string;

    private path: string;

    getType(): ContentTypeName {
        return this.type;
    }

    getDisplayName(): string {
        return this.displayName;
    }

    getContentPath(): string {
        return this.path;
    }

    public static fromJson(json: ContentReferenceJson) {
        const result = new ContentReference();

        result.type = new ContentTypeName(json.type);
        result.displayName = json.displayName;
        result.path = json.path;

        return result;
    }
}
