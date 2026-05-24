import {Tooltip} from '@enonic/ui';
import type {ReactElement, ReactNode} from 'react';
import {useI18n} from '../../../shared/i18n/useI18n';
import type {ApiDescriptorDto, ApplicationInfoDto, ExtensionDto} from '../../../entities/application/types/ApplicationInfo';
import {Section, SectionRow} from '../Section';

interface Props {
    info: ApplicationInfoDto;
}

export const ExtensionsSection = ({info}: Props): ReactElement | null => {
    const title = useI18n('field.extensions');
    const toolsLabel = useI18n('field.tools');
    const widgetsLabel = useI18n('field.widgets');
    const apisLabel = useI18n('field.apis');

    const tools = sortBy(info.tools, (t) => t.title);
    const widgets = sortBy(info.widgets, (w) => widgetDisplay(w));
    const apis = sortBy(info.apis, (a) => apiDisplay(a));

    if (tools.length + widgets.length + apis.length === 0) return null;

    return (
        <Section title={title} data-testid="DetailPanel.ExtensionsSection">
            {tools.length > 0 ? (
                <SectionRow label={toolsLabel}>
                    <InlineList>
                        {tools.map((t) => (
                            <Tooltip key={t.key} value={t.key}>
                                <a
                                    href={t.toolUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-link underline-offset-2 hover:underline"
                                >
                                    {t.title}
                                </a>
                            </Tooltip>
                        ))}
                    </InlineList>
                </SectionRow>
            ) : null}
            {widgets.length > 0 ? (
                <SectionRow label={widgetsLabel}>
                    <InlineList>
                        {widgets.map((w) => (
                            <Tooltip key={w.key} value={w.key}>
                                <span>{widgetDisplay(w)}</span>
                            </Tooltip>
                        ))}
                    </InlineList>
                </SectionRow>
            ) : null}
            {apis.length > 0 ? (
                <SectionRow label={apisLabel}>
                    <InlineList>
                        {apis.map((a) => (
                            <Tooltip key={a.key} value={a.key}>
                                <span>{apiDisplay(a)}</span>
                            </Tooltip>
                        ))}
                    </InlineList>
                </SectionRow>
            ) : null}
        </Section>
    );
};

ExtensionsSection.displayName = 'DetailPanel.ExtensionsSection';

const InlineList = ({children}: {children: ReactNode[]}): ReactElement => {
    return (
        <span className="text-main">
            {children.map((child, idx) => (
                <span key={idx}>
                    {idx > 0 ? ', ' : ''}
                    {child}
                </span>
            ))}
        </span>
    );
};

InlineList.displayName = 'DetailPanel.InlineList';

function widgetDisplay(w: ExtensionDto): string {
    const interfaces = w.interfaces.join(', ');
    return interfaces ? `${w.displayName} (${interfaces})` : w.displayName;
}

function apiDisplay(a: ApiDescriptorDto): string {
    return a.title || a.name;
}

function sortBy<T>(items: T[], key: (item: T) => string): T[] {
    return [...items].sort((a, b) => key(a).toLocaleLowerCase().localeCompare(key(b).toLocaleLowerCase()));
}
