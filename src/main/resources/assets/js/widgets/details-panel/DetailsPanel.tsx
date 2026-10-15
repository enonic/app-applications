import { ListItem, Separator } from '@enonic/ui';
import type { ReactNode } from 'react';

import { useI18n } from '../../shared/i18n';
import { ItemLabel } from '../../shared/ui/ItemLabel';
import { withCount } from './details-panel';
import { DetailsEmpty } from './DetailsEmpty';
import { DetailsSkeleton } from './DetailsSkeleton';

export type DetailsPanelProps = {
  children: ReactNode;
  'data-component'?: string;
};

const DETAILS_PANEL_NAME = 'DetailsPanel';
// The parts are named the way the library names its own (`Dialog.Content`), and each takes the
// caller's name instead, so a section's block reads as that block rather than as a generic part.
const DETAILS_HEADER_NAME = 'DetailsPanel.Header';
const DETAILS_SECTION_NAME = 'DetailsPanel.Section';
const DETAILS_SUBSECTION_NAME = 'DetailsPanel.Subsection';
const DETAILS_FIELD_NAME = 'DetailsPanel.Field';

export type DetailsHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  /** Inline after the title, e.g. a link out to the item's page on another site. */
  titleAction?: ReactNode;
  /** Under the title block, e.g. the Applications state dropdown. */
  action?: ReactNode;
  'data-component'?: string;
};

export type DetailsSectionProps = {
  labelKey: string;
  /** Appended to the label as `(7)`. */
  count?: number;
  /** Rendered at the end of the section, e.g. the Edit button. */
  action?: ReactNode;
  /**
   * Optional, because a section whose size is known before its contents are is a heading and a
   * number on its own — `Users (4213)` says something, an empty list under it does not.
   */
  children?: ReactNode;
  'data-component'?: string;
};

export type DetailsSubsectionProps = {
  labelKey: string;
  /** Appended to the label as `(6)`. */
  count?: number;
  children: ReactNode;
  'data-component'?: string;
};

export type DetailsFieldProps = {
  labelKey: string;
  children: ReactNode;
  'data-component'?: string;
};

export type DetailsListProps = {
  children: ReactNode;
};

export type DetailsListItemProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  /** Right-aligned, single cell — not the array `BrowseRow.meta` uses. */
  meta?: ReactNode;
};

function DetailsPanelRoot({
  children,
  'data-component': componentName = DETAILS_PANEL_NAME,
}: DetailsPanelProps) {
  return (
    <div data-component={componentName} className="flex min-h-0 flex-col gap-5 overflow-auto p-10">
      {children}
    </div>
  );
}

DetailsPanelRoot.displayName = DETAILS_PANEL_NAME;

export function DetailsHeader({
  title,
  subtitle,
  icon,
  titleAction,
  action,
  'data-component': componentName = DETAILS_HEADER_NAME,
}: DetailsHeaderProps) {
  return (
    <div data-component={componentName} className="flex items-center gap-5">
      {icon && <div className="flex size-12 shrink-0 items-center justify-center">{icon}</div>}

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate text-2xl font-semibold">{title}</h3>
          {titleAction}
        </div>

        {subtitle && <p className="text-subtle truncate text-base">{subtitle}</p>}

        {action && <div className="flex">{action}</div>}
      </div>
    </div>
  );
}

DetailsHeader.displayName = DETAILS_HEADER_NAME;

export function DetailsSection({
  labelKey,
  count,
  action,
  children,
  'data-component': componentName = DETAILS_SECTION_NAME,
}: DetailsSectionProps) {
  const label = useI18n(labelKey);

  return (
    <section data-component={componentName} className="flex flex-col gap-2.5">
      <Separator label={withCount(label, count)} className="text-base" />
      {children}
      {action && <div className="flex justify-end">{action}</div>}
    </section>
  );
}

DetailsSection.displayName = DETAILS_SECTION_NAME;

export function DetailsSubsection({
  labelKey,
  count,
  children,
  'data-component': componentName = DETAILS_SUBSECTION_NAME,
}: DetailsSubsectionProps) {
  const label = useI18n(labelKey);

  return (
    <div data-component={componentName} className="flex flex-col gap-2.5">
      <h4 className="text-sm font-semibold">{withCount(label, count)}</h4>
      {children}
    </div>
  );
}

DetailsSubsection.displayName = DETAILS_SUBSECTION_NAME;

export function DetailsField({
  labelKey,
  children,
  'data-component': componentName = DETAILS_FIELD_NAME,
}: DetailsFieldProps) {
  const label = useI18n(labelKey);

  return (
    <div data-component={componentName} className="flex flex-col gap-1">
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-xs font-normal wrap-anywhere">{children}</span>
    </div>
  );
}

DetailsField.displayName = DETAILS_FIELD_NAME;

export function DetailsList({ children }: DetailsListProps) {
  return (
    <div role="list" className="flex flex-col">
      {children}
    </div>
  );
}

export function DetailsListItem({ title, subtitle, icon, meta }: DetailsListItemProps) {
  return (
    <ListItem className="px-0">
      <ListItem.Content>
        <ItemLabel icon={icon} primary={title} secondary={subtitle} />
      </ListItem.Content>
      <ListItem.Right>
        {meta && <span className="text-subtle text-sm whitespace-nowrap">{meta}</span>}
      </ListItem.Right>
    </ListItem>
  );
}

export const DetailsPanel = Object.assign(DetailsPanelRoot, {
  Empty: DetailsEmpty,
  Skeleton: DetailsSkeleton,
  Header: DetailsHeader,
  Section: DetailsSection,
  Subsection: DetailsSubsection,
  Field: DetailsField,
  List: DetailsList,
  ListItem: DetailsListItem,
});
