import type {ReactElement, ReactNode} from 'react';

interface SectionProps {
    title: string;
    'data-testid'?: string;
    children: ReactNode;
}

export const Section = ({title, 'data-testid': testId, children}: SectionProps): ReactElement => {
    return (
        <section className="border-b border-bdr-subtle py-6" data-testid={testId}>
            <h2 className="mb-3 text-base font-semibold text-subtle">{title}</h2>
            <div className="flex flex-col gap-3">{children}</div>
        </section>
    );
};

Section.displayName = 'DetailPanel.Section';

interface SectionRowProps {
    label: string;
    children: ReactNode;
}

/** Single label/value row inside a `Section`. The value cell takes the remaining width. */
export const SectionRow = ({label, children}: SectionRowProps): ReactElement => {
    return (
        <div className="grid grid-cols-[minmax(8rem,12rem)_minmax(0,1fr)] items-baseline gap-3 text-sm">
            <dt className="font-medium text-subtle">{label}</dt>
            <dd className="min-w-0 break-words text-main">{children}</dd>
        </div>
    );
};

SectionRow.displayName = 'DetailPanel.SectionRow';
