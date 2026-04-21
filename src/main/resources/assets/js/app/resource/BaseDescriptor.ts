import {BaseDescriptorJson} from './json/BaseDescriptorJson';

export class BaseDescriptor {
    key: string;

    name: string;

    title: string;

    description: string;

    constructor(builder: BaseDescriptorBuilder) {
        this.name = builder.name;
        this.key = builder.key;
        this.title = builder.title;
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

    getTitle(): string {
        return this.title;
    }

    getDescription(): string {
        return this.description;
    }
}

export class BaseDescriptorBuilder {

    key: string;

    name: string;

    title: string;

    description: string;

    constructor(source?: BaseDescriptor) {
        if (source) {
            this.key = source.getKey();
            this.name = source.getName();
            this.title = source.getTitle();
            this.description = source.getDescription();
        }
    }

    static fromJson(json: BaseDescriptorJson): BaseDescriptorBuilder {

        return new BaseDescriptorBuilder()
            .setName(json.name)
            .setTitle(json.title)
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

    public setTitle(value: string): BaseDescriptorBuilder {
        this.title = value;
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
