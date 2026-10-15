import { Tooltip } from '@enonic/ui';
import { BellDot } from 'lucide-react';

import { useI18n } from '../../../shared/i18n';

export type ApplicationVersionsProps = {
  installed: string;
  updateAvailable?: boolean;
};

const TOOLTIP_DELAY = 300;

/**
 * The version meta cell. The enclosing cell supplies the type scale and the selected-row colour, so
 * this only lays the version out beside the update bell.
 */
export function ApplicationVersions({ installed, updateAvailable }: ApplicationVersionsProps) {
  const updateLabel = useI18n('applications.row.updateAvailable');

  return (
    <span className="inline-flex items-center justify-end gap-1">
      {installed}

      {/* Held open whether or not there is an update, so the versions stay in column down the list. */}
      <span className="inline-flex size-4 shrink-0 items-center justify-center">
        {updateAvailable === true && (
          <Tooltip value={updateLabel} side="top" delay={TOOLTIP_DELAY} asChild>
            {/* The tooltip is hover-only, so the label has to name the glyph as well. */}
            <span role="img" aria-label={updateLabel} className="inline-flex">
              <BellDot size={16} strokeWidth={1.5} aria-hidden />
            </span>
          </Tooltip>
        )}
      </span>
    </span>
  );
}
