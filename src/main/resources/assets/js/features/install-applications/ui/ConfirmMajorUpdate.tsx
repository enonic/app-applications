import { Button, Dialog, Link } from '@enonic/ui';

import { useI18n } from '../../../shared/i18n';
import type { MarketRow } from '../model/market-rows';

export type ConfirmMajorUpdateProps = {
  row: MarketRow;
  onConfirm: () => void;
  /** Back to the list, not out of the dialog: the operator answered the question, not the dialog. */
  onCancel: () => void;
};

/**
 * The install dialog's other view: what it asks before an update crosses a major version, which is
 * where an application may change behaviour.
 *
 * The header and footer belong to the dialog around it — this renders inside its `Dialog.Content`.
 */
export function ConfirmMajorUpdate({ row, onConfirm, onCancel }: ConfirmMajorUpdateProps) {
  const title = useI18n('applications.dialog.update.title', row.displayName, row.availableVersion);
  const question = useI18n(
    'applications.dialog.update.question',
    row.displayName,
    row.installedVersion ?? '',
  );
  const releaseNotesLabel = useI18n('applications.dialog.update.releaseNotes', row.displayName);
  const confirmLabel = useI18n('applications.dialog.install.update');
  const cancelLabel = useI18n('applications.dialog.install.cancel');

  return (
    <>
      <Dialog.DefaultHeader
        title={title}
        description={
          <>
            {question}{' '}
            {row.pageUrl != null && (
              <Link href={row.pageUrl} newTab>
                {releaseNotesLabel}
              </Link>
            )}
          </>
        }
      />

      <Dialog.Footer>
        <Button variant="outline" label={cancelLabel} onClick={onCancel} />
        <Button variant="solid" label={confirmLabel} onClick={onConfirm} />
      </Dialog.Footer>
    </>
  );
}
