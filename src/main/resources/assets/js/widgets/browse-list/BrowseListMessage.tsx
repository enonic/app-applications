import type { ReactNode } from 'react';

export type BrowseListMessageProps = {
  children: ReactNode;
  tone?: 'subtle' | 'error';
};

export function BrowseListMessage({ children, tone = 'subtle' }: BrowseListMessageProps) {
  return (
    <p
      role={tone === 'error' ? 'alert' : undefined}
      className={
        tone === 'error' ? 'text-error px-2.5 py-1 text-sm' : 'text-subtle px-2.5 py-1 text-sm'
      }
    >
      {children}
    </p>
  );
}
