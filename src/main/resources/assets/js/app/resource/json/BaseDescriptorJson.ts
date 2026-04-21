export interface BaseDescriptorsJson {
    descriptors: BaseDescriptorJson[];
}

export interface BaseDescriptorJson {
    key: string;

    name: string;

    title: string;

    description: string;
}
