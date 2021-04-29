import {ApplicationTaskJson} from './json/ApplicationTasksJson';

export class ApplicationTask {

    private key: string;

    private description: string;

    public static fromJson(json: ApplicationTaskJson) {
        const result = new ApplicationTask();

        result.key = json.key;
        result.description = json.description;

        return result;
    }

    public getDescription(): string {
        return this.description;
    }

    public getKey(): string {
        return this.key;
    }
}
