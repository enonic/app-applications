import {Separator} from '@enonic/ui';
import type {ReactElement, ReactNode} from 'react';

interface SectionProps {
    title: string;
    'data-component'?: string;
    children: ReactNode;
}

/**
 * Section block used inside the right detail panel — uppercase
 * `Separator` label with a 1px baseline rule, followed by a 4 + 12 + 4
 * column layout matching the Enonic UI screenshot pattern.
 */
export const Section = ({title, 'data-component': testId, children}: SectionProps): ReactElement => {
    return (
        <section className="px-6 pt-6" data-component={testId}>
            <Separator label={title} className="mb-3" />
            <div className="flex flex-col gap-2">{children}</div>
        </section>
    );
};

Section.displayName = 'DetailPanel.Section';

interface SectionRowProps {
    label: string;
    children: ReactNode;
    trailing?: ReactNode;
}

/**
 * Single label/value row inside a `Section`. The value cell takes the
 * remaining width; the optional `trailing` slot is intended for actions
 * such as a copy-to-clipboard button.
 */
export const SectionRow = ({label, children, trailing}: SectionRowProps): ReactElement => {
    return (
        <div className="grid grid-cols-[minmax(7rem,9rem)_minmax(0,1fr)_auto] items-baseline gap-3 text-sm">
            <dt className="text-subtle">{label}</dt>
            <dd className="min-w-0 break-words text-main">{children}</dd>
            {trailing ? <div className="self-center">{trailing}</div> : <span />}
        </div>
    );
};

SectionRow.displayName = 'DetailPanel.SectionRow';
