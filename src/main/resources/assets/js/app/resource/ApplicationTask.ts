import {ApplicationTaskJson} from './json/ApplicationTasksJson';
import DescriptorKey = api.content.page.DescriptorKey;

export class ApplicationTask {

    private key: DescriptorKey;

    private description: string;

    public static fromJson(json: ApplicationTaskJson) {
        const result = new ApplicationTask();

        result.key = DescriptorKey.fromString(json.key);
        result.description = json.description;

        return result;
    }

    public getDescription(): string {
        return this.description;
    }

    public getKey(): DescriptorKey {
        return this.key;
    }
}
