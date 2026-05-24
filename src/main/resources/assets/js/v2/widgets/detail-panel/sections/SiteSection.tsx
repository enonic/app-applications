import type {ReactElement} from 'react';
import {useI18n} from '../../../shared/i18n/useI18n';
import type {ApplicationInfoDto, DescriptorDto} from '../../../entities/application/types/ApplicationInfo';
import {Section, SectionRow} from '../Section';
import {NameList} from './NameList';

interface Props {
    info: ApplicationInfoDto;
}

export const SiteSection = ({info}: Props): ReactElement | null => {
    const title = useI18n('field.site');
    const contentTypesLabel = useI18n('field.contentTypes');
    const pageLabel = useI18n('field.page');
    const partLabel = useI18n('field.part');
    const layoutLabel = useI18n('field.layout');

    const contentTypes = sortAlpha(info.contentTypes);
    const pages = descriptorNames(info.pages);
    const parts = descriptorNames(info.parts);
    const layouts = descriptorNames(info.layouts);

    if (contentTypes.length + pages.length + parts.length + layouts.length === 0) return null;

    return (
        <Section title={title} data-testid="DetailPanel.SiteSection">
            {contentTypes.length > 0 ? (
                <SectionRow label={contentTypesLabel}>
                    <NameList items={contentTypes} />
                </SectionRow>
            ) : null}
            {pages.length > 0 ? (
                <SectionRow label={pageLabel}>
                    <NameList items={pages} />
                </SectionRow>
            ) : null}
            {parts.length > 0 ? (
                <SectionRow label={partLabel}>
                    <NameList items={parts} />
                </SectionRow>
            ) : null}
            {layouts.length > 0 ? (
                <SectionRow label={layoutLabel}>
                    <NameList items={layouts} />
                </SectionRow>
            ) : null}
        </Section>
    );
};

SiteSection.displayName = 'DetailPanel.SiteSection';

function descriptorNames(descriptors: DescriptorDto[]): string[] {
    return sortAlpha(descriptors.map((d) => d.name));
}

function sortAlpha(items: string[]): string[] {
    return [...items].sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
}
