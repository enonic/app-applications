export interface ApiDescriptorsJson {
    descriptors: ApiDescriptorJson[];
}

export interface ApiDescriptorJson {
    key: string;
    name: string;
    mount: string[];
    allowedPrincipals: string[];
    title?: string;
    description?: string;
    documentationUrl?: string;
}
