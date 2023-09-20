export interface BaseDescriptorsJson {
    descriptors: BaseDescriptorJson[];
}

export interface BaseDescriptorJson {
    key: string;

    name: string;

    displayName: string;

    description: string;
}
