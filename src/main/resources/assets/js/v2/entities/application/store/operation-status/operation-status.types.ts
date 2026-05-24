export interface ProgressJson {
    /** Application key the progress belongs to. */
    key: string;
    /** Progress percentage 0..100. `undefined` when indeterminate. */
    progress?: number;
    /** Optional human-readable status, e.g. "Downloading", "Installing". */
    label?: string;
}

export interface OperationStatusState {
    installing: Record<string, ProgressJson>;
    starting: Set<string>;
    stopping: Set<string>;
}
