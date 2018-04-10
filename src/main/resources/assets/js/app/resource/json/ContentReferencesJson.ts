import '../../../api.ts';

export class ContentReferenceJson {

    type: string;

    displayName: string;

    path: string;
}

export class ContentReferencesJson {
    references: ContentReferenceJson[];
}
