export interface ApiDescriptorsJson {
    descriptors: ApiDescriptorJson[];
}

export interface ApiDescriptorJson {
    key: string;
    name: string;
    mount: boolean;
    allowedPrincipals: string[];
    displayName?: string;
    description?: string;
    documentationUrl?: string;
}
