import { Button, cn, Dialog, IconButton, type ButtonVariant } from '@enonic/ui';
import { X } from 'lucide-react';
import type { ReactNode, Ref } from 'react';

import { useDialogLayer } from './dialog-stack';

export type ModalDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  /** Shown in place of the title row — an icon and the item's name, as the wizards do. */
  header?: ReactNode;
  /**
   * A question needs no more room than its own text; `medium` is for one carrying a control, and
   * `wide` for a form.
   */
  size?: 'default' | 'medium' | 'wide';
  primaryLabel?: string;
  primaryDisabled?: boolean;
  /** For a caller that has to move the focus onto the primary button once it means something. */
  primaryRef?: Ref<HTMLButtonElement>;
  /** `danger` paints the primary button red, for an action there is no undoing. */
  intent?: 'default' | 'danger';
  cancelLabel: string;
  /** `outline` gives the two answers of a question equal weight; a form's Cancel stays quiet. */
  cancelVariant?: ButtonVariant;
  /** Why the dialog is still open, shown beside its buttons — a rejected save is the case. */
  error?: string;
  closeLabel: string;
  /** Where the focus lands as the dialog opens. `preventDefault()` first, then focus your own. */
  onOpenAutoFocus?: (event: Event) => void;
  children?: ReactNode;
  onClose: () => void;
  onPrimary?: () => void;
};

// `medium` follows Content Studio's confirmation: wide enough for a control, floored so it does not
// shrink to the text around it.
const SIZES = {
  default: 'max-w-lg',
  medium: 'max-w-180 sm:min-w-152',
  wide: 'max-w-4xl',
} as const;

export function ModalDialog({
  open,
  title,
  description,
  header,
  size = 'default',
  primaryLabel,
  primaryDisabled,
  primaryRef,
  intent = 'default',
  cancelLabel,
  cancelVariant = 'text',
  error,
  closeLabel,
  onOpenAutoFocus,
  children,
  onClose,
  onPrimary,
}: ModalDialogProps) {
  const { blocked, nested } = useDialogLayer(open);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        {/* ! A nested overlay masks what is under it by sitting on `z-40` — the z the library hardcodes
            ! on the wrapper around every dialog's content — so paint order decides, and DOM order puts
            ! it after the open dialog's content and before this dialog's own. A higher z would cover
            ! this dialog too: `className` reaches the inner box, not that wrapper. */}
        <Dialog.Overlay
          className={nested ? 'z-40' : undefined}
          // ! The attribute belongs on the mask as well as on the content: a click on the mask is
          // ! outside this dialog's content, and without it the dialog underneath reads that click as
          // ! its own outside-click and closes along with this one.
          {...(nested && { 'data-click-outside-ignore': '' })}
        />

        <Dialog.Content
          className={cn('gap-5 p-5 md:p-7.5', SIZES[size])}
          // ! Both keep this dialog from being dismissed by a gesture meant for the one above it: the
          // ! attribute takes it out of the other dialog's outside-click test, and the prevented default
          // ! stops the library's Escape handler, which listens on the document per dialog.
          {...(nested && { 'data-click-outside-ignore': '' })}
          onOpenAutoFocus={onOpenAutoFocus}
          onEscapeKeyDown={(event) => {
            if (blocked) {
              event.preventDefault();
            }
          }}
        >
          <Dialog.Header className="grid-cols-[minmax(0,1fr)_auto] items-start">
            {header === undefined ? (
              <Dialog.Title className="col-start-1 row-start-1 min-w-0">{title}</Dialog.Title>
            ) : (
              <>
                <Dialog.Title className="sr-only">{title}</Dialog.Title>
                <div className="col-start-1 row-start-1 min-w-0">{header}</div>
              </>
            )}

            <Dialog.Close asChild>
              <IconButton
                aria-label={closeLabel}
                className="col-start-2 row-span-2 row-start-1 self-start justify-self-end"
                icon={X}
                size="lg"
                iconSize={28}
                iconStrokeWidth={1.5}
                shape="round"
                variant="filled"
              />
            </Dialog.Close>

            {description !== undefined && (
              <Dialog.Description className="row-start-2">{description}</Dialog.Description>
            )}
          </Dialog.Header>

          <Dialog.Body className="-mx-2 flex flex-col gap-7 px-2 py-1">{children}</Dialog.Body>

          <Dialog.Footer className="items-center">
            {error !== undefined && (
              <p className="text-error mr-auto text-sm" role="alert">
                {error}
              </p>
            )}

            <Button variant={cancelVariant} label={cancelLabel} onClick={onClose} />
            {primaryLabel !== undefined && (
              <Button
                ref={primaryRef}
                variant="solid"
                label={primaryLabel}
                disabled={primaryDisabled}
                className={cn(
                  intent === 'danger' &&
                    'bg-btn-error text-alt hover:bg-btn-error-hover active:bg-btn-error-active focus-visible:ring-error/50',
                )}
                onClick={onPrimary}
              />
            )}
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
