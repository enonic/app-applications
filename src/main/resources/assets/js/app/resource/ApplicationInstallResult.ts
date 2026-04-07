import {Application} from '@enonic/lib-admin-ui/application/Application';
import {ApplicationJson} from '@enonic/lib-admin-ui/application/json/ApplicationJson';
import {Equitable} from '@enonic/lib-admin-ui/Equitable';
import {ObjectHelper} from '@enonic/lib-admin-ui/ObjectHelper';
import {ApplicationInstallResultJson} from './json/ApplicationInstallResultJson';

interface ApplicationJsonWithTitle extends ApplicationJson {
    title?: string;
}

export class ApplicationInstallResult
    implements Equitable {

    private application: Application;

    private failure: string;

    static fromJson(json: ApplicationJson): ApplicationInstallResult {
        let result = new ApplicationInstallResult();
        result.application = Application.fromJson(json);
        return result;
    }

    setFailure(value: string): void {
        this.failure = value;
    }

    setApplication(application: Application): void {
        this.application = application;
    }

    public getApplication(): Application {
        return this.application;
    }

    public getFailure(): string {
        return this.failure;
    }

    equals(o: Equitable): boolean {

        if (!ObjectHelper.iFrameSafeInstanceOf(o, ApplicationInstallResult)) {
            return false;
        }

        const other: ApplicationInstallResult = o as ApplicationInstallResult;
        return ObjectHelper.stringEquals(this.failure, other.failure) &&
               ObjectHelper.equals(this.application, other.application);
    }
}
