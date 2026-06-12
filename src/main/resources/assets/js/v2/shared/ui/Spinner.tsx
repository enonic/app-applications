import {cn} from '@enonic/ui';
import {cva, type VariantProps} from 'class-variance-authority';
import {Loader2} from 'lucide-react';
import type {ComponentPropsWithoutRef, ReactElement} from 'react';

const spinnerVariants = cva('inline-block animate-spin text-subtle', {
    variants: {
        size: {
            sm: 'size-4',
            md: 'size-5',
            lg: 'size-8',
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

export type SpinnerProps = {
    size?: VariantProps<typeof spinnerVariants>['size'];
    /** Accessible label announced to assistive tech. Defaults to "Loading". */
    label?: string;
} & ComponentPropsWithoutRef<'span'>;

export const Spinner = ({size, label = 'Loading', className, ...rest}: SpinnerProps): ReactElement => {
    return (
        <span
            role="status"
            aria-live="polite"
            aria-label={label}
            className={cn('inline-flex', className)}
            {...rest}
        >
            <Loader2 className={spinnerVariants({size})} aria-hidden="true" />
        </span>
    );
};

Spinner.displayName = 'Spinner';
