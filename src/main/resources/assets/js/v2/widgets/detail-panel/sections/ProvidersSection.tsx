import type {ReactElement} from 'react';
import {useI18n} from '../../../shared/i18n/useI18n';
import type {ApplicationInfoDto} from '../../../entities/application/types/ApplicationInfo';
import {Section, SectionRow} from '../Section';
import {NameList} from './NameList';

interface Props {
    info: ApplicationInfoDto;
}

export const ProvidersSection = ({info}: Props): ReactElement | null => {
    const title = useI18n('field.idProviderApplications');
    const modeLabel = useI18n('field.mode');
    const usedByLabel = useI18n('field.usedBy');

    const provider = info.idProviderApplication;
    if (!provider?.mode) return null;

    const paths = provider.idProviders.map((p) => p.path).filter(Boolean);

    return (
        <Section title={title} data-component="DetailPanel.ProvidersSection">
            <SectionRow label={modeLabel}>{provider.mode}</SectionRow>
            {paths.length > 0 ? (
                <SectionRow label={usedByLabel}>
                    <NameList items={paths} />
                </SectionRow>
            ) : null}
        </Section>
    );
};

ProvidersSection.displayName = 'DetailPanel.ProvidersSection';
