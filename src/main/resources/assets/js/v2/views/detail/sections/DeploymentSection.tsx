import type {ReactElement} from 'react';
import {useI18n} from '../../../features/hooks/useI18n';
import type {ApplicationInfoDto} from '../../../features/types/application-info';
import {Section, SectionRow} from '../Section';

interface Props {
    info: ApplicationInfoDto;
}

export const DeploymentSection = ({info}: Props): ReactElement | null => {
    const title = useI18n('field.webApp');
    const deploymentLabel = useI18n('field.deployment');

    if (!info.deploymentUrl) return null;

    return (
        <Section title={title} data-testid="DetailPanel.DeploymentSection">
            <SectionRow label={deploymentLabel}>
                <a
                    href={info.deploymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link underline-offset-2 hover:underline break-all"
                >
                    {info.deploymentUrl}
                </a>
            </SectionRow>
        </Section>
    );
};

DeploymentSection.displayName = 'DetailPanel.DeploymentSection';
