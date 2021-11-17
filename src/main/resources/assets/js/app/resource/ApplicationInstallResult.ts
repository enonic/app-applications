import {Application} from 'lib-admin-ui/application/Application';
import {Equitable} from 'lib-admin-ui/Equitable';
import {ObjectHelper} from 'lib-admin-ui/ObjectHelper';
import {ApplicationInstallResultJson} from './json/ApplicationInstallResultJson';

export class ApplicationInstallResult
    implements Equitable {

    private application: Application;

    private failure: string;

    static fromJson(json: ApplicationInstallResultJson): ApplicationInstallResult {
        let result = new ApplicationInstallResult();
        const applicationJson = json.applicationInstalledJson?.application;
        result.application = applicationJson ? Application.fromJson(applicationJson) : null;
        result.failure = json.failure;
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

        let other = <ApplicationInstallResult>o;
        return ObjectHelper.stringEquals(this.failure, other.failure) &&
               ObjectHelper.equals(this.application, other.application);
    }
}
