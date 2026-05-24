import type {ReactElement} from 'react';
import {useI18n} from '../../../shared/i18n/useI18n';
import type {ApplicationInfoDto} from '../../../entities/application/types/ApplicationInfo';
import {Section, SectionRow} from '../Section';
import {NameList} from './NameList';

interface Props {
    info: ApplicationInfoDto;
}

export const TasksSection = ({info}: Props): ReactElement | null => {
    const title = useI18n('field.tasks');
    const keyLabel = useI18n('field.key');
    const descLabel = useI18n('field.description');

    if (info.tasks.length === 0) return null;

    const keys = info.tasks.map((t) => t.key);
    const descriptions = info.tasks.map((t) => t.description).filter(Boolean);

    return (
        <Section title={title} data-component="DetailPanel.TasksSection">
            <SectionRow label={keyLabel}>
                <NameList items={keys} />
            </SectionRow>
            {descriptions.length > 0 ? (
                <SectionRow label={descLabel}>
                    <NameList items={descriptions} />
                </SectionRow>
            ) : null}
        </Section>
    );
};

TasksSection.displayName = 'DetailPanel.TasksSection';
