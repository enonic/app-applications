import { cn } from '@enonic/ui';
import type { JSX } from 'preact';
import { useId, useRef, useState } from 'preact/hooks';
import type { ReactNode } from 'react';

export type DropZoneProps = {
  onFiles: (files: readonly File[]) => void;
  icon?: ReactNode;
  hint?: ReactNode;
  /**
   * What the file picker offers. ? Dropped files are not filtered against it: discarding them silently
   * tells the operator nothing, where the caller can say what it would not take.
   */
  accept?: string;
  multiple?: boolean;
  /** Overrides the zone's own drag state, for a drop target larger than the zone. */
  isDragging?: boolean;
  className?: string;
};

/** A box to click or drop files onto. Content Studio v6 has the same component; keep the two portable. */
export function DropZone({
  onFiles,
  icon,
  hint,
  accept,
  multiple = false,
  isDragging,
  className,
}: DropZoneProps) {
  const inputId = `drop-zone-${useId()}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleChange = (): void => {
    const input = inputRef.current;
    if (input?.files == null || input.files.length === 0) {
      return;
    }

    onFiles([...input.files]);

    // ! Cleared, or picking the same file again fires no change event and the operator gets nothing.
    input.value = '';
  };

  const handleDrop = (event: JSX.TargetedDragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setDragging(false);

    const files = event.dataTransfer?.files;
    if (files != null && files.length > 0) {
      onFiles([...files]);
    }
  };

  return (
    <div
      className={cn('size-full', className)}
      onDrop={handleDrop}
      onDragOver={(event) => {
        // ! Without this the browser navigates to the file instead of letting the drop through.
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="peer sr-only"
      />

      <label
        htmlFor={inputId}
        className={cn(
          'dash-border flex size-full cursor-pointer flex-col items-center justify-center gap-2.5 p-5 transition-all',
          'peer-focus-visible:ring-ring peer-focus-visible:ring-offset-ring-offset peer-focus-visible:ring-3 peer-focus-visible:ring-offset-3 peer-focus-visible:outline-none',
          (isDragging ?? dragging) && 'dash-border-select bg-bdr-select/8',
        )}
      >
        {icon}
        {hint != null && <p className="text-subtle">{hint}</p>}
      </label>
    </div>
  );
}
