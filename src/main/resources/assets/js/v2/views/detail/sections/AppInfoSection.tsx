import {IconButton, Tooltip} from '@enonic/ui';
import {Copy} from 'lucide-react';
import type {ReactElement} from 'react';
import {useI18n} from '../../../features/hooks/useI18n';
import type {ApplicationDto} from '../../../features/types/application';
import {formatDateTime} from '../formatDate';
import {Section, SectionRow} from '../Section';

interface Props {
    app: ApplicationDto;
}

export const AppInfoSection = ({app}: Props): ReactElement => {
    const title = useI18n('field.application');
    const displayNameLabel = useI18n('field.displayName');
    const installedLabel = useI18n('field.installed');
    const versionLabel = useI18n('field.version');
    const keyLabel = useI18n('field.key');
    const sysReqLabel = useI18n('field.systemRequired');
    const sysReqValue = useI18n('field.systemRequired.value', app.minSystemVersion);
    const sourceLabel = useI18n('field.source');
    const sourceValue = useSourceValue(app);
    const installedAt = formatDateTime(app.modifiedTime);

    const handleCopyKey = (): void => {
        void navigator.clipboard.writeText(app.key).catch(() => {
            // ? Clipboard API may reject in insecure contexts. Failing silently
            // is fine here; the surrounding UI will not change.
        });
    };

    return (
        <Section title={title} data-testid="DetailPanel.AppInfoSection">
            <SectionRow label={displayNameLabel}>{app.displayName}</SectionRow>
            <SectionRow
                label={keyLabel}
                trailing={
                    <Tooltip delay={300} value={keyLabel}>
                        <IconButton
                            variant="text"
                            size="sm"
                            icon={Copy}
                            className="size-6"
                            iconSize={14}
                            onClick={handleCopyKey}
                            title={keyLabel}
                            data-testid="DetailPanel.AppInfoSection.Copy"
                        />
                    </Tooltip>
                }
            >
                <span className="font-mono break-all">{app.key}</span>
            </SectionRow>
            <SectionRow label={versionLabel}>
                <span className="font-mono">{app.version}</span>
            </SectionRow>
            {installedAt ? <SectionRow label={installedLabel}>{installedAt}</SectionRow> : null}
            <SectionRow label={sysReqLabel}>{sysReqValue}</SectionRow>
            <SectionRow label={sourceLabel}>{sourceValue}</SectionRow>
        </Section>
    );
};

AppInfoSection.displayName = 'DetailPanel.AppInfoSection';

function useSourceValue(app: ApplicationDto): string {
    const local = useI18n('field.source.local');
    const system = useI18n('field.source.system');
    const market = useI18n('field.source.market');
    if (app.system) return system;
    if (app.local) return local;
    return market;
}
