import { cn, Dialog, Tab } from '@enonic/ui';
import { ActionDialog, EMPTY_FILTER, FilterInput, textOf, type FilterQuery } from '@enonic/ui-kit';
import { useStore } from '@nanostores/preact';
import { Box } from 'lucide-react';
import { useMemo, useState } from 'preact/hooks';

import { loadMarketApplications, useMarketApplications } from '../../../entities/market';
import { useHostFrame } from '../../../shared/host';
import { useI18n } from '../../../shared/i18n';
import { DropZone } from '../../../shared/ui/DropZone';
import { marketInstallIntent, runMarketInstall } from '../model/install-market-application';
import { $marketInstalls } from '../model/install.store';
import { JAR_ACCEPT } from '../model/jar-files';
import { filterMarketRows, marketFields } from '../model/market-filter';
import type { MarketRow } from '../model/market-rows';
import { marketView } from '../model/market-view';
import { runJarUpload } from '../model/upload-applications';
import { ConfirmMajorUpdate } from './ConfirmMajorUpdate';
import { MarketApplicationList } from './MarketApplicationList';

export type InstallApplicationsDialogContentProps = {
  'data-component'?: string;
};

const INSTALL_APPLICATIONS_DIALOG_CONTENT_NAME = 'InstallApplicationsDialogContent';

const MARKET_TAB = 'market';
const UPLOAD_TAB = 'upload';

/** Where an application comes from: Enonic Market, or a jar the operator has in front of them */
export function InstallApplicationsDialogContent({
  'data-component': componentName = INSTALL_APPLICATIONS_DIALOG_CONTENT_NAME,
}: InstallApplicationsDialogContentProps) {
  const { status, items } = useMarketApplications();
  const installs = useStore($marketInstalls);
  const { notify } = useHostFrame();

  const title = useI18n('applications.dialog.install.title');
  const marketLabel = useI18n('applications.dialog.install.market');
  const uploadLabel = useI18n('applications.dialog.install.upload');
  const uploadHint = useI18n('applications.dialog.install.uploadHint');
  const filterPlaceholder = useI18n('applications.dialog.install.filter.placeholder');
  const upgradeFieldLabel = useI18n('applications.filter.upgrade');
  const installedFieldLabel = useI18n('applications.dialog.install.installed');
  const yesLabel = useI18n('applications.filter.yes');
  const noLabel = useI18n('applications.filter.no');

  const [tab, setTab] = useState<string>(MARKET_TAB);
  const [query, setQuery] = useState<FilterQuery>(EMPTY_FILTER);
  const [confirming, setConfirming] = useState<MarketRow | undefined>(undefined);

  // Shared with the field counts below, so the text runs once per render rather than twice.
  const searched = useMemo(() => marketView(items, textOf(query)), [items, query]);
  const rows = useMemo(() => filterMarketRows(searched, query), [searched, query]);

  const fields = useMemo(
    () =>
      marketFields(searched, query, {
        upgrade: upgradeFieldLabel,
        installed: installedFieldLabel,
        yes: yesLabel,
        no: noLabel,
      }),
    [searched, query, upgradeFieldLabel, installedFieldLabel, yesLabel, noLabel],
  );

  const handleInstall = (row: MarketRow): void => {
    const intent = marketInstallIntent(row);

    if (intent === 'confirm') {
      setConfirming(row);
      return;
    }

    if (intent === 'install') {
      void runMarketInstall(row, notify);
    }
  };

  const handleConfirm = (row: MarketRow): void => {
    setConfirming(undefined);
    void runMarketInstall(row, notify);
  };

  return (
    <ActionDialog.Content
      data-component={componentName}
      size={confirming ? 'medium' : 'default'}
      // A fixed height while browsing: the drop zone fills what it is given, and the dialog must
      // not resize as the tabs switch.
      className={cn(!confirming && 'h-176 max-w-5xl')}
      onEscapeKeyDown={(event) => {
        if (confirming) {
          event.preventDefault();
          setConfirming(undefined);
        }
      }}
    >
      {confirming ? (
        <ConfirmMajorUpdate
          row={confirming}
          onConfirm={() => handleConfirm(confirming)}
          onCancel={() => setConfirming(undefined)}
        />
      ) : (
        <>
          <ActionDialog.DefaultHeader title={title} withClose />

          <Tab.Root value={tab} onValueChange={setTab} className="min-h-0 flex-1 gap-6">
            <Tab.List>
              <Tab.Trigger value={MARKET_TAB}>{marketLabel}</Tab.Trigger>
              <Tab.Trigger value={UPLOAD_TAB}>{uploadLabel}</Tab.Trigger>
            </Tab.List>

            <Tab.Content value={MARKET_TAB} className="mt-0 flex min-h-0 flex-1 flex-col gap-6">
              <FilterInput
                fields={fields}
                value={query}
                onChange={setQuery}
                placeholder={filterPlaceholder}
              />

              <Dialog.Body className="-me-5 pe-5 md:-me-7.5 md:pe-7.5">
                <MarketApplicationList
                  status={status}
                  rows={rows}
                  narrowed={query.length > 0}
                  installs={installs}
                  onInstall={handleInstall}
                  onRetry={() => void loadMarketApplications()}
                />
              </Dialog.Body>
            </Tab.Content>

            <Tab.Content value={UPLOAD_TAB} className="mt-0 min-h-0 flex-1">
              <DropZone
                accept={JAR_ACCEPT}
                multiple
                icon={<Box size={28} strokeWidth={1.5} aria-hidden />}
                hint={uploadHint}
                onFiles={(files) => void runJarUpload(files, notify)}
              />
            </Tab.Content>
          </Tab.Root>
        </>
      )}
    </ActionDialog.Content>
  );
}

InstallApplicationsDialogContent.displayName = INSTALL_APPLICATIONS_DIALOG_CONTENT_NAME;
