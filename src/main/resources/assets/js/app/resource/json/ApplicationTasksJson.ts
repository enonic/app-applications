import '../../../api.ts';

export class ApplicationTaskJson {

    key: string;

    description: string;
}

export class ApplicationTasksJson {
    tasks: ApplicationTaskJson[];
}
