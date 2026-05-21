import {cn} from '@enonic/ui';
import {cva, type VariantProps} from 'class-variance-authority';
import type {ComponentPropsWithoutRef, ReactElement} from 'react';

const badgeVariants = cva(
    'inline-flex items-center font-semibold rounded-sm whitespace-nowrap',
    {
        variants: {
            tone: {
                neutral: 'bg-bdr-subtle/40 text-subtle',
                info: 'bg-info/15 text-info',
                success: 'bg-success/15 text-success',
                warning: 'bg-warn/15 text-warn',
                error: 'bg-error/15 text-error',
            },
            size: {
                sm: 'text-xs uppercase tracking-wide px-2 py-0.5',
                md: 'text-sm px-3 py-1.5',
            },
        },
        defaultVariants: {
            tone: 'neutral',
            size: 'sm',
        },
    },
);

export type BadgeProps = {
    tone?: VariantProps<typeof badgeVariants>['tone'];
    size?: VariantProps<typeof badgeVariants>['size'];
} & ComponentPropsWithoutRef<'span'>;

export const Badge = ({tone, size, className, children, ...rest}: BadgeProps): ReactElement => {
    return (
        <span className={cn(badgeVariants({tone, size}), className)} {...rest}>
            {children}
        </span>
    );
};

Badge.displayName = 'Badge';
