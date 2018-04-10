import '../../api.ts';
import ContentTypeName = api.schema.content.ContentTypeName;
import ContentPath = api.content.ContentPath;
import {ContentReferenceJson} from './json/ContentReferencesJson';

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
