import '../../../api.ts';

export class ApplicationIdProviderJson {

    mode: string;

    userStores: ApplicationUserStoreJson[];

}

export class ApplicationUserStoreJson {
    displayName: string;

    path: string;
}
