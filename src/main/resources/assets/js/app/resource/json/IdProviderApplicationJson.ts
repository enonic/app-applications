import '../../../api.ts';

export class IdProviderApplicationJson {

    mode: string;

    idProviders: ApplicationIdProviderJson[];

}

export class ApplicationIdProviderJson {
    displayName: string;

    path: string;
}
