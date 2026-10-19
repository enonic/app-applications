import { Toggle, Tooltip } from '@enonic/ui';
import { Settings } from 'lucide-react';

import { useI18n } from '../../shared/i18n';

export type SystemApplicationsToggleProps = {
  shown: boolean;
  onShownChange: (shown: boolean) => void;
};

const SYSTEM_APPLICATIONS_TOGGLE_NAME = 'SystemApplicationsToggle';
const TOOLTIP_DELAY = 300;

/** The list header's switch for the applications XP ships, beside the sort and as quiet as Refresh. */
export function SystemApplicationsToggle({ shown, onShownChange }: SystemApplicationsToggleProps) {
  const label = useI18n(shown ? 'applications.list.hideSystem' : 'applications.list.showSystem');

  return (
    <Tooltip value={label} side="top" delay={TOOLTIP_DELAY} asChild>
      <Toggle
        data-component={SYSTEM_APPLICATIONS_TOGGLE_NAME}
        variant="text"
        startIcon={Settings}
        aria-label={label}
        pressed={shown}
        onPressedChange={onShownChange}
        className="px-2.5"
      />
    </Tooltip>
  );
}

SystemApplicationsToggle.displayName = SYSTEM_APPLICATIONS_TOGGLE_NAME;
