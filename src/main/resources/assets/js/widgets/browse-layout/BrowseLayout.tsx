import type { JSX } from 'preact';
import { useRef, useState } from 'preact/hooks';
import type { ReactNode } from 'react';

import { useI18n } from '../../shared/i18n';
import { DetailsEmpty } from '../details-panel/DetailsEmpty';
import {
  clampDetailsWidth,
  MIN_LIST_WIDTH,
  readDetailsWidth,
  RESIZE_STEP,
  writeDetailsWidth,
} from './browse-layout';

export type BrowseLayoutProps = {
  toolbar: ReactNode;
  list: ReactNode;
  /** The details column, always on screen; empty until an item is on show. */
  details?: ReactNode;
  /**
   * Whether that item is there yet. ! A prop rather than a route match: this widget is mounted inside the
   * shell, not under a router of its own, so only the section — which owns its sub-path — knows.
   */
  detailsShown?: boolean;
};

// Content Studio's SplitView.Handle, thin variant: a 1px line whose grab area is wider than
// it is, the way react-resizable-panels expands the hit target around its separator.
const HANDLE_CLASS =
  'bg-bdr-soft hover:bg-bdr-select data-[dragging]:bg-bdr-select focus-visible:ring-ring ' +
  'relative z-10 w-px shrink-0 cursor-col-resize transition-colors outline-none ' +
  'focus-visible:ring-3 after:absolute after:inset-y-0 after:-inset-x-2 after:content-[""]';

export function BrowseLayout({ toolbar, list, details, detailsShown }: BrowseLayoutProps) {
  const resizeLabel = useI18n('browse.details.resize');
  const columnsRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [detailsWidth, setDetailsWidth] = useState(readDetailsWidth);
  const [dragging, setDragging] = useState(false);

  const resize = (width: number): number => {
    const columns = columnsRef.current;
    const applied = clampDetailsWidth(width, columns?.getBoundingClientRect().width ?? width);
    setDetailsWidth(applied);
    return applied;
  };

  const handlePointerDown = (event: JSX.TargetedPointerEvent<HTMLDivElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    setDragging(true);
  };

  const handlePointerMove = (event: JSX.TargetedPointerEvent<HTMLDivElement>): void => {
    const columns = columnsRef.current;
    if (!draggingRef.current || !columns) {
      return;
    }

    resize(columns.getBoundingClientRect().right - event.clientX);
  };

  const handlePointerUp = (event: JSX.TargetedPointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    draggingRef.current = false;
    setDragging(false);
    writeDetailsWidth(detailsWidth);
  };

  const handleKeyDown = (event: JSX.TargetedKeyboardEvent<HTMLDivElement>): void => {
    const steps: Record<string, number> = { ArrowLeft: RESIZE_STEP, ArrowRight: -RESIZE_STEP };
    const step = steps[event.key];
    if (step === undefined) {
      return;
    }

    event.preventDefault();
    writeDetailsWidth(resize(detailsWidth + step));
  };

  const detailsColumn =
    details == null ? undefined : (
      <>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={resizeLabel}
          tabIndex={0}
          data-dragging={dragging || undefined}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          className={HANDLE_CLASS}
        />

        <div
          // ? A dragged width is a pixel value; no utility can express it. maxWidth keeps a
          // ? width stored in a wider window from squeezing the list below its minimum.
          style={{
            width: `${detailsWidth}px`,
            maxWidth: `calc(100% - ${MIN_LIST_WIDTH}px)`,
          }}
          className="bg-surface-neutral flex min-h-0 shrink-0 flex-col overflow-auto"
        >
          {detailsShown === true ? details : <DetailsEmpty labelKey="browse.details.empty" />}
        </div>
      </>
    );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {toolbar}

      <div ref={columnsRef} className="flex min-h-0 flex-1">
        {/* ? The column owns the spacing of search, list header and list: 20px around and
            between them. The three blocks bring none of their own. */}
        <div className="bg-surface-neutral flex min-h-0 min-w-0 flex-1 flex-col gap-5 p-5">
          {list}
        </div>
        {detailsColumn}
      </div>
    </div>
  );
}
