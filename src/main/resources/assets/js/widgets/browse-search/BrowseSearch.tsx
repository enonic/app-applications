import { SearchField } from '@enonic/ui';

import { useI18n } from '../../shared/i18n';

export type BrowseSearchProps = {
  value: string;
  onChange: (value: string) => void;
  /** Searching is not wired yet — see docs/browse-framework.md § 3.6. */
  disabled?: boolean;
};

export function BrowseSearch({ value, onChange, disabled }: BrowseSearchProps) {
  const placeholder = useI18n('browse.search.placeholder');
  const clearLabel = useI18n('browse.search.clear');
  const inputLabel = useI18n('browse.search.label');

  return (
    <SearchField
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
