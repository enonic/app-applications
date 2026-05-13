import {Button, Input} from '@enonic/ui';
import {Download} from 'lucide-react';
import type {ReactElement} from 'react';
import {useState} from 'react';
import {installApplicationFromUrl} from '../../features/api/install';
import {useI18n} from '../../features/hooks/useI18n';

const URL_PATTERN = /^https?:\/\/\S+$/i;

/**
 * Single row inside the install dialog for the "install from URL" flow. Mirrors
 * the legacy `ApplicationInput` URL handling but lives outside the search field
 * so the layout is unambiguous. Errors are surfaced inline via the `Input`
 * error slot; success is signalled through the `INSTALLED` server event, which
 * the existing app-actions / applications bridge already handles.
 *
 * No per-row `setInstalling` marker is recorded here: the URL install does not
 * know the target app key in advance, and the server-side `PROGRESS` /
 * `INSTALLED` events (see `applicationEvents.ts`) already drive the global
 * install indicator using the authoritative key.
 */
export const UrlInstallRow = (): ReactElement => {
    const placeholder = useI18n('dialog.install.url.placeholder');
    const installLabel = useI18n('action.install');
    const errorMessage = useI18n('dialog.install.url.invalid');

    const [url, setUrl] = useState('');
    const [error, setError] = useState<string | undefined>(undefined);
    const [busy, setBusy] = useState(false);

    const isValid = URL_PATTERN.test(url.trim());

    const handleSubmit = async (): Promise<void> => {
        const trimmed = url.trim();
        if (!URL_PATTERN.test(trimmed)) {
            setError(errorMessage);
            return;
        }
        setError(undefined);
        setBusy(true);
        try {
            await installApplicationFromUrl(trimmed);
            setUrl('');
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : String(cause));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex items-start gap-3" data-testid="UrlInstallRow">
            <Input
                type="url"
                placeholder={placeholder}
                value={url}
                onInput={(event): void => setUrl((event.target as HTMLInputElement).value)}
                error={error}
                className="flex-1"
                disabled={busy}
                data-testid="UrlInstallRow.Input"
                onKeyDown={(event): void => {
                    if ((event as unknown as KeyboardEvent).key === 'Enter') {
                        event.preventDefault();
                        void handleSubmit();
                    }
                }}
            />
            <Button
                variant="solid"
                size="md"
                startIcon={Download}
                label={installLabel}
                disabled={!isValid || busy}
                onClick={(): void => {
                    void handleSubmit();
                }}
                data-testid="UrlInstallRow.Submit"
            />
        </div>
    );
};

UrlInstallRow.displayName = 'UrlInstallRow';
