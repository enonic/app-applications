import {Button} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {Upload, X} from 'lucide-react';
import type {ReactElement} from 'react';
import {useEffect, useRef, useState} from 'react';
import {uploadApplication} from '../../features/install-app/api/install';
import {useI18n} from '../../shared/i18n/useI18n';
import {
    $upload,
    patchUpload,
    removeUpload,
    setUpload,
} from '../../features/install-app/store/upload';

const ALLOWED_EXTENSIONS = ['.jar', '.zip'];

let uploadCounter = 0;

/**
 * Drop zone + file picker for installing applications from a local artifact.
 * Drags the file straight to `uploadApplication`, which surfaces progress via
 * XHR upload events. Per-file rows read from `$upload.uploads` so the dialog
 * keeps a single source of truth and the row can be cancelled by removing it
 * from the store.
 *
 * Drag-over state is local (cleaner cleanup); progress and final result live
 * in the store so they survive component re-mounts.
 */
export const UploadDropZone = (): ReactElement => {
    const {uploads} = useStore($upload);
    const dropZoneRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const dropHere = useI18n('dialog.install.drop');
    const browse = useI18n('dialog.install.browse');
    const remove = useI18n('action.remove');
    const allowed = useI18n('dialog.install.allowed');

    useEffect(() => {
        const node = dropZoneRef.current;
        if (!node) return undefined;

        const onDragOver = (event: DragEvent): void => {
            event.preventDefault();
            setDragOver(true);
        };
        const onDragLeave = (event: DragEvent): void => {
            if (event.target === node) setDragOver(false);
        };
        const onDrop = (event: DragEvent): void => {
            event.preventDefault();
            setDragOver(false);
            const files = event.dataTransfer?.files;
            if (files && files.length > 0) startUpload(files);
        };

        node.addEventListener('dragover', onDragOver);
        node.addEventListener('dragleave', onDragLeave);
        node.addEventListener('drop', onDrop);
        return (): void => {
            node.removeEventListener('dragover', onDragOver);
            node.removeEventListener('dragleave', onDragLeave);
            node.removeEventListener('drop', onDrop);
        };
    }, []);

    const items = Object.values(uploads);

    return (
        <div className="flex flex-col gap-2" data-testid="UploadDropZone">
            <div
                ref={dropZoneRef}
                className={
                    'flex flex-col items-center justify-center gap-2 px-5 py-6 border-2 border-dashed rounded-md text-sm transition-colors ' +
                    (dragOver
                        ? 'border-interactive-primary bg-surface-interactive-soft text-interactive-primary'
                        : 'border-bdr-soft bg-surface-secondary text-subtle')
                }
                data-state={dragOver ? 'over' : 'idle'}
                data-testid="UploadDropZone.Target"
            >
                <Upload className="size-6" />
                <p className="text-center">{dropHere}</p>
                <p className="text-xs text-subtle">{allowed}</p>
                <Button
                    variant="outline"
                    size="sm"
                    label={browse}
                    onClick={(): void => fileInputRef.current?.click()}
                    data-testid="UploadDropZone.Browse"
                />
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_EXTENSIONS.join(',')}
                    multiple
                    className="hidden"
                    onChange={(event): void => {
                        const files = (event.target as HTMLInputElement).files;
                        if (files && files.length > 0) startUpload(files);
                        (event.target as HTMLInputElement).value = '';
                    }}
                />
            </div>
            {items.length > 0 ? (
                <ul className="flex flex-col gap-1" data-testid="UploadDropZone.List">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center gap-2 px-3 py-2 border border-bdr-soft rounded-md text-sm"
                            data-status={item.status}
                            data-testid="UploadDropZone.Item"
                        >
                            <span className="flex-1 truncate" title={item.name}>{item.name}</span>
                            <span className="text-subtle w-16 text-right tabular-nums">{formatProgress(item)}</span>
                            <Button
                                variant="text"
                                size="sm"
                                startIcon={X}
                                title={remove}
                                aria-label={remove}
                                onClick={(): void => removeUpload(item.id)}
                                data-testid="UploadDropZone.Remove"
                            />
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
};

UploadDropZone.displayName = 'UploadDropZone';

function startUpload(files: FileList): void {
    for (const file of Array.from(files)) {
        if (!isAllowed(file)) continue;
        const id = `upload-${++uploadCounter}`;
        setUpload({id, name: file.name, status: 'queued', progress: 0});
        void runUpload(id, file);
    }
}

async function runUpload(id: string, file: File): Promise<void> {
    patchUpload(id, {status: 'uploading', progress: 0});
    try {
        await uploadApplication(file, {
            onProgress: ({loaded, total}): void => {
                const progress = total > 0 ? Math.round((loaded / total) * 100) : undefined;
                patchUpload(id, {progress});
            },
        });
        patchUpload(id, {status: 'done', progress: 100});
    } catch (cause) {
        patchUpload(id, {
            status: 'error',
            error: cause instanceof Error ? cause.message : String(cause),
        });
    }
}

function isAllowed(file: File): boolean {
    const name = file.name.toLowerCase();
    return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function formatProgress(item: {status: string; progress?: number; error?: string}): string {
    if (item.status === 'error') return '!';
    if (item.status === 'done') return '100%';
    if (item.progress === undefined) return '…';
    return `${item.progress}%`;
}
