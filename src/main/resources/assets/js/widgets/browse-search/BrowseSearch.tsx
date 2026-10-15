import { SearchField } from '@enonic/ui';

import { useI18n } from '../../shared/i18n';

export type BrowseSearchProps = {
  value: string;
  onChange: (value: string) => void;
  /** Searching is not wired yet — see docs/browse-framework.md § 3.6. */
  disabled?: boolean;
  'data-component'?: string;
};

const BROWSE_SEARCH_NAME = 'BrowseSearch';

export function BrowseSearch({
  value,
  onChange,
  disabled,
  'data-component': componentName = BROWSE_SEARCH_NAME,
}: BrowseSearchProps) {
  const placeholder = useI18n('browse.search.placeholder');
  const clearLabel = useI18n('browse.search.clear');
  const inputLabel = useI18n('browse.search.label');

  return (
    <SearchField
      data-component={componentName}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      clearLabel={clearLabel}
      className="shrink-0"
    >
      <SearchField.Icon />
      <SearchField.Input aria-label={inputLabel} />
      <SearchField.Clear />
    </SearchField>
  );
}

BrowseSearch.displayName = BROWSE_SEARCH_NAME;
