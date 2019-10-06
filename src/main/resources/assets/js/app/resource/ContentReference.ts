import {ContentReferenceJson} from './json/ContentReferencesJson';
import {ContentTypeName} from 'lib-admin-ui/schema/content/ContentTypeName';
import {ContentPath} from 'lib-admin-ui/content/ContentPath';

export class ContentReference {

    private type: ContentTypeName;

    private displayName: string;

    private path: ContentPath;

    getType(): ContentTypeName {
        return this.type;
    }

    getDisplayName(): string {
        return this.displayName;
    }

    getContentPath(): ContentPath {
        return this.path;
    }

    public static fromJson(json: ContentReferenceJson) {
        const result = new ContentReference();

        result.type = new ContentTypeName(json.type);
        result.displayName = json.displayName;
        result.path = ContentPath.fromString(json.path);

        return result;
    }
}
