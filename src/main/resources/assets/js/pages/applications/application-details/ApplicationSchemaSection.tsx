import type { ApplicationInfo } from '../../../entities/application';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';
import { schemaGroups } from '../model/application-schema';

export type ApplicationSchemaSectionProps = {
  info?: ApplicationInfo;
};

export function ApplicationSchemaSection({ info }: ApplicationSchemaSectionProps) {
  const groups = schemaGroups(info);

  if (groups.length === 0) {
    return null;
  }

  return (
    <DetailsPanel.Section labelKey="applications.details.schemas">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-6">
        {groups.map(({ labelKey, items }) => (
          <DetailsPanel.Subsection key={labelKey} labelKey={labelKey}>
            <div className="flex flex-col gap-1">
              {items.map(({ key, name }) => (
                <span key={key} className="text-xs wrap-anywhere">
                  {name}
                </span>
              ))}
            </div>
          </DetailsPanel.Subsection>
        ))}
      </div>
    </DetailsPanel.Section>
  );
}
