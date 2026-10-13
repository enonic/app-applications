import { Button, Dialog } from '@enonic/ui';

import { useI18n } from '../../../shared/i18n';
import type { MarketRow } from '../model/market-rows';
import { useMajorUpdateQuestion } from './useMajorUpdateQuestion';

export type ConfirmMajorUpdateProps = {
  row: MarketRow;
  onConfirm: () => void;
  /** Back to the list, not out of the dialog: the operator answered the question, not the dialog. */
  onCancel: () => void;
  /** On the header: the view has no root of its own, it renders into the dialog's content. */
  'data-component'?: string;
};

const CONFIRM_MAJOR_UPDATE_NAME = 'ConfirmMajorUpdate';

/**
 * The install dialog's other view: what it asks before an update crosses a major version, which is
 * where an application may change behaviour.
 *
 * The header and footer belong to the dialog around it — this renders inside its `Dialog.Content`.
 */
export function ConfirmMajorUpdate({
  row,
  onConfirm,
  onCancel,
  'data-component': componentName = CONFIRM_MAJOR_UPDATE_NAME,
}: ConfirmMajorUpdateProps) {
  const { title, description, confirmLabel } = useMajorUpdateQuestion(row);
  const cancelLabel = useI18n('applications.dialog.install.cancel');

  return (
    <>
      <Dialog.DefaultHeader
        data-component={componentName}
        title={title}
        description={description}
      />

      <Dialog.Footer>
        <Button variant="outline" label={cancelLabel} onClick={onCancel} />
        <Button variant="solid" label={confirmLabel} onClick={onConfirm} />
      </Dialog.Footer>
    </>
  );
}

ConfirmMajorUpdate.displayName = CONFIRM_MAJOR_UPDATE_NAME;
