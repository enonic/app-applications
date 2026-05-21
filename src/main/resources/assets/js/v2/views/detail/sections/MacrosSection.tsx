import type {ReactElement} from 'react';
import {useI18n} from '../../../features/hooks/useI18n';
import type {ApplicationInfoDto} from '../../../features/types/application-info';
import {Section, SectionRow} from '../Section';
import {NameList} from './NameList';

interface Props {
    info: ApplicationInfoDto;
}

export const MacrosSection = ({info}: Props): ReactElement | null => {
    const title = useI18n('field.macros');
    const nameLabel = useI18n('field.name');

    const names = info.macros.map((m) => m.displayName);
    if (names.length === 0) return null;

    return (
        <Section title={title} data-testid="DetailPanel.MacrosSection">
            <SectionRow label={nameLabel}>
                <NameList items={names} />
            </SectionRow>
        </Section>
    );
};

MacrosSection.displayName = 'DetailPanel.MacrosSection';
