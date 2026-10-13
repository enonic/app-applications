import { Link } from '@enonic/ui';
import type { ReactNode } from 'react';

import { useI18n } from '../../../shared/i18n';
import type { MarketRow } from '../model/market-rows';

export type MajorUpdateQuestion = {
  title: string;
  /** The question, with a link to the release notes where the market has a page for them. */
  description: ReactNode;
  confirmLabel: string;
};

/**
 * What is asked before an update crosses a major version, worded once for both places that ask it:
 * the install dialog's own view and the dialog a details panel opens. No row reads as empty text, for
 * a dialog that is closed.
 */
export function useMajorUpdateQuestion(row: MarketRow | undefined): MajorUpdateQuestion {
  const title = useI18n(
    'applications.dialog.update.title',
    row?.displayName ?? '',
    row?.availableVersion ?? '',
  );
  const question = useI18n(
    'applications.dialog.update.question',
    row?.displayName ?? '',
    row?.installedVersion ?? '',
  );
  const releaseNotesLabel = useI18n(
    'applications.dialog.update.releaseNotes',
    row?.displayName ?? '',
  );
  const confirmLabel = useI18n('applications.dialog.install.update');

  const description = (
    <>
      {question}{' '}
      {row?.pageUrl != null && (
        <Link href={row.pageUrl} newTab>
          {releaseNotesLabel}
        </Link>
      )}
    </>
  );

  return { title, description, confirmLabel };
}
