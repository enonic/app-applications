import '../../../api.ts';

export class IdProviderApplicationJson {

    mode: string;

    userStores: ApplicationUserStoreJson[];

}

export class ApplicationUserStoreJson {
    displayName: string;

    path: string;
}
