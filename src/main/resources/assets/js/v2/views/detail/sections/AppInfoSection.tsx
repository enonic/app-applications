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
    const installedLabel = useI18n('status.installed');
    const versionLabel = useI18n('field.version');
    const keyLabel = useI18n('field.key');
    const sysReqLabel = useI18n('field.systemRequired');
    const sysReqValue = useI18n('field.systemRequired.value', app.minSystemVersion);
    const installedAt = formatDateTime(app.modifiedTime);

    return (
        <Section title={title} data-testid="DetailPanel.AppInfoSection">
            {installedAt ? <SectionRow label={installedLabel}>{installedAt}</SectionRow> : null}
            <SectionRow label={versionLabel}>{app.version}</SectionRow>
            <SectionRow label={keyLabel}>{app.key}</SectionRow>
            <SectionRow label={sysReqLabel}>{sysReqValue}</SectionRow>
        </Section>
    );
};

AppInfoSection.displayName = 'DetailPanel.AppInfoSection';
