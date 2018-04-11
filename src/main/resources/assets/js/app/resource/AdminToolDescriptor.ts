import DescriptorKey = api.content.page.DescriptorKey;
import AdminToolDescriptorJson = api.content.json.AdminToolDescriptorJson;

export class AdminToolDescriptor {

    private key: DescriptorKey;

    private applicationKey: ApplicationKey;

    private name: string;

    private displayName: string;

    private description: string;

    private icon: string;

    private toolUrl: string;

    public constructor(builder: AdminToolDescriptorBuilder) {
        this.key = builder.key;
        this.applicationKey = builder.applicationKey;
        this.name = builder.name;
        this.displayName = builder.displayName;
        this.description = builder.description;
        this.icon = builder.icon;
        this.toolUrl = builder.toolUrl;
    }

    public static create(): AdminToolDescriptorBuilder {
        return new AdminToolDescriptorBuilder();
    }

    public static fromJson(json: AdminToolDescriptorJson): AdminToolDescriptor {
        return AdminToolDescriptor.create()
            .setKey(DescriptorKey.fromString(json.key))
            .setApplicationKey(ApplicationKey.fromString(json.application))
            .setName(json.name)
            .setDisplayName(json.displayName)
            .setDescription(json.description)
            .setIcon(json.icon)
            .setToolUrl(json.toolUrl)
            .build();
    }

    getKey(): DescriptorKey {
        return this.key;
    }

    getApplicationKey(): ApplicationKey {
        return this.applicationKey;
    }

    getName(): string {
        return this.name;
    }

    getDisplayName(): string {
        return this.displayName;
    }

    getDescription(): string {
        return this.description;
    }

    getIcon(): string {
        return this.icon;
    }

    getToolUrl(): string {
        return this.toolUrl;
    }
}

class AdminToolDescriptorBuilder {

    key: DescriptorKey;

    applicationKey: ApplicationKey;

    name: string;

    displayName: string;

    description: string;

    icon: string;

    toolUrl: string;

    public setKey(value: DescriptorKey) {
        this.key = value;
        return this;
    }

    public setApplicationKey(value: ApplicationKey) {
        this.applicationKey = value;
        return this;
    }

    public setName(value: string) {
        this.name = value;
        return this;
    }

    public setDisplayName(value: string) {
        this.displayName = value;
        return this;
    }

    public setDescription(value: string) {
        this.description = value;
        return this;
    }

    public setIcon(value: string) {
        this.icon = value;
        return this;
    }

    public setToolUrl(value: string) {
        this.toolUrl = value;
        return this;
    }

    public build(): AdminToolDescriptor {
        return new AdminToolDescriptor(this);
    }
}
