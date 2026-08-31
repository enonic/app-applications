import { useI18n } from '../../shared/i18n';

export type DetailsEmptyProps = {
  labelKey: string;
};

/** The details column with nothing to show: no item route, or an id nothing answers to. */
export function DetailsEmpty({ labelKey }: DetailsEmptyProps) {
  const message = useI18n(labelKey);

  return (
    <p className="text-subtle flex flex-1 items-center justify-center px-5 text-center text-sm">
      {message}
    </p>
  );
}
