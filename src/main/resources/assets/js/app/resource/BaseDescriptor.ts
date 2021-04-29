import {BaseDescriptorJson} from './json/BaseDescriptorJson';

export class BaseDescriptor {
    key: string;

    name: string;

    displayName: string;

    description: string;

    constructor(builder: BaseDescriptorBuilder) {
        this.name = builder.name;
        this.key = builder.key;
        this.displayName = builder.displayName;
        this.description = builder.description;
    }

    static fromJson(json: BaseDescriptorJson): BaseDescriptor {
        return BaseDescriptorBuilder.fromJson(json).build();
    }

    getKey(): string {
        return this.key;
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
}

export class BaseDescriptorBuilder {

    key: string;

    name: string;

    displayName: string;

    description: string;

    constructor(source?: BaseDescriptor) {
        if (source) {
            this.key = source.getKey();
            this.name = source.getName();
            this.displayName = source.getDisplayName();
            this.description = source.getDescription();
        }
    }

    static fromJson(json: BaseDescriptorJson): BaseDescriptorBuilder {

        return new BaseDescriptorBuilder()
            .setName(json.name)
            .setDisplayName(json.displayName)
            .setDescription(json.description)
            .setKey(json.key);
    }

    public setKey(value: string): BaseDescriptorBuilder {
        this.key = value;
        return this;
    }

    public setName(value: string): BaseDescriptorBuilder {
        this.name = value;
        return this;
    }

    public setDisplayName(value: string): BaseDescriptorBuilder {
        this.displayName = value;
        return this;
    }

    public setDescription(value: string): BaseDescriptorBuilder {
        this.description = value;
        return this;
    }

    public build(): BaseDescriptor {
        return new BaseDescriptor(this);
    }
}
