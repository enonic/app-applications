import type { ReactNode } from 'react';

export type BrowseListMessageProps = {
  children: ReactNode;
  tone?: 'subtle' | 'error';
  'data-component'?: string;
};

const BROWSE_LIST_MESSAGE_NAME = 'BrowseListMessage';

export function BrowseListMessage({
  children,
  tone = 'subtle',
  'data-component': componentName = BROWSE_LIST_MESSAGE_NAME,
}: BrowseListMessageProps) {
  return (
    <p
      data-component={componentName}
      role={tone === 'error' ? 'alert' : undefined}
      className={
        tone === 'error' ? 'text-error px-2.5 py-1 text-sm' : 'text-subtle px-2.5 py-1 text-sm'
      }
    >
      {children}
    </p>
  );
}

BrowseListMessage.displayName = BROWSE_LIST_MESSAGE_NAME;
