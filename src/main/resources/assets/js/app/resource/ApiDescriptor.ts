import {ApiDescriptorJson} from './json/ApiDescriptorsJson';

export class ApiDescriptor {

    private readonly key: string;

    private readonly name: string;

    private readonly title: string;

    private readonly description: string;

    private readonly documentationUrl: string;

    private readonly mount: string[];

    private readonly allowedPrincipals: string[];

    public constructor(builder: ApiDescriptorBuilder) {
        this.key = builder.key;
        this.name = builder.name;
        this.title = builder.title;
        this.description = builder.description;
        this.documentationUrl = builder.documentationUrl;
        this.mount = builder.mount;
        this.allowedPrincipals = builder.allowedPrincipals;
    }

    public static create(): ApiDescriptorBuilder {
        return new ApiDescriptorBuilder();
    }

    public static fromJson(json: ApiDescriptorJson): ApiDescriptor {
        return ApiDescriptor.create()
            .setKey(json.key)
            .setName(json.name)
            .setTitle(json.title)
            .setDescription(json.description)
            .setDocumentationUrl(json.documentationUrl)
            .setMount(json.mount)
            .setAllowedPrincipals(json.allowedPrincipals)
            .build();
    }

    getKey(): string {
        return this.key;
    }

    getName(): string {
        return this.name;
    }

    getTitle(): string {
        return this.title;
    }

    getDescription(): string {
        return this.description;
    }

    getDocumentationUrl(): string {
        return this.documentationUrl;
    }

    getMount(): string[] {
        return this.mount;
    }

    getAllowedPrincipals(): string[] {
        return this.allowedPrincipals;
    }
}

class ApiDescriptorBuilder {

    key: string;

    name: string;

    title: string;

    description: string;

    documentationUrl: string;

    mount: string[];

    allowedPrincipals: string[];

    public setKey(value: string) {
        this.key = value;
        return this;
    }


    public setName(value: string) {
        this.name = value;
        return this;
    }

    public setTitle(value: string) {
        this.title = value;
        return this;
    }

    public setDescription(value: string) {
        this.description = value;
        return this;
    }

    public setDocumentationUrl(value: string) {
        this.documentationUrl = value;
        return this;
    }

    public setMount(value: string[]) {
        this.mount = value;
        return this;
    }

    public setAllowedPrincipals(value: string[]) {
        this.allowedPrincipals = value;
        return this;
    }

    public build(): ApiDescriptor {
        return new ApiDescriptor(this);
    }
}
