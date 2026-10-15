import { useI18n } from '../../shared/i18n';

export type DetailsEmptyProps = {
  labelKey: string;
  'data-component'?: string;
};

const DETAILS_EMPTY_NAME = 'DetailsEmpty';

/** The details column with nothing to show: no item route, or an id nothing answers to. */
export function DetailsEmpty({
  labelKey,
  'data-component': componentName = DETAILS_EMPTY_NAME,
}: DetailsEmptyProps) {
  const message = useI18n(labelKey);

  return (
    <p
      data-component={componentName}
      className="text-subtle flex flex-1 items-center justify-center px-5 text-center text-sm"
    >
      {message}
    </p>
  );
}

DetailsEmpty.displayName = DETAILS_EMPTY_NAME;
