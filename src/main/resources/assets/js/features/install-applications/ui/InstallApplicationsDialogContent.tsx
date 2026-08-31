import { cn, Dialog, Tab } from '@enonic/ui';
import { useStore } from '@nanostores/preact';
import { Box } from 'lucide-react';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { loadMarketApplications, useMarketApplications } from '../../../entities/market';
import { useI18n } from '../../../shared/i18n';
import { DropZone } from '../../../shared/ui/DropZone';
import { marketInstallIntent, runMarketInstall } from '../model/install-market-application';
import { $marketInstalls } from '../model/install.store';
import { JAR_ACCEPT } from '../model/jar-files';
import { fallbackBucket, type MarketBucket } from '../model/market-filter';
import type { MarketRow } from '../model/market-rows';
import { marketView } from '../model/market-view';
import { runJarUpload } from '../model/upload-applications';
import { ConfirmMajorUpdate } from './ConfirmMajorUpdate';
import { MarketApplicationList } from './MarketApplicationList';
import { MarketFilterBar } from './MarketFilterBar';

const MARKET_TAB = 'market';
const UPLOAD_TAB = 'upload';

/** Where an application comes from: Enonic Market, or a jar the operator has in front of them */
export function InstallApplicationsDialogContent() {
  const { status, items } = useMarketApplications();
  const installs = useStore($marketInstalls);

  const title = useI18n('applications.dialog.install.title');
  const marketLabel = useI18n('applications.dialog.install.market');
  const uploadLabel = useI18n('applications.dialog.install.upload');
  const uploadHint = useI18n('applications.dialog.install.uploadHint');

  const [tab, setTab] = useState<string>(MARKET_TAB);
  const [query, setQuery] = useState('');
  const [bucket, setBucket] = useState<MarketBucket>('all');
  const [confirming, setConfirming] = useState<MarketRow | undefined>(undefined);

  const { counts, totals, rows } = useMemo(
    () => marketView(items, query, bucket),
    [items, query, bucket],
  );

  useEffect(() => {
    setBucket((current) => fallbackBucket(current, totals));
  }, [items]);

  const handleInstall = (row: MarketRow): void => {
    const intent = marketInstallIntent(row);

    if (intent === 'confirm') {
      setConfirming(row);
      return;
    }

    if (intent === 'install') {
      void runMarketInstall(row);
    }
  };

  const handleConfirm = (row: MarketRow): void => {
    setConfirming(undefined);
    void runMarketInstall(row);
  };

  return (
    <Dialog.Content
      // A fixed height while browsing: the drop zone fills what it is given, and the dialog must
      // not resize as the tabs switch.
      className={cn('gap-6 max-lg:p-5', confirming ? 'max-w-160' : 'h-176 max-w-5xl')}
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
          <Dialog.DefaultHeader title={title} withClose />

          <Tab.Root value={tab} onValueChange={setTab} className="min-h-0 flex-1 gap-6">
            <Tab.List>
              <Tab.Trigger value={MARKET_TAB}>{marketLabel}</Tab.Trigger>
              <Tab.Trigger value={UPLOAD_TAB}>{uploadLabel}</Tab.Trigger>
            </Tab.List>

            <Tab.Content value={MARKET_TAB} className="mt-0 flex min-h-0 flex-1 flex-col gap-6">
              <MarketFilterBar
                bucket={bucket}
                counts={counts}
                totals={totals}
                query={query}
                onBucketChange={setBucket}
                onQueryChange={setQuery}
              />

              <Dialog.Body>
                <MarketApplicationList
                  status={status}
                  rows={rows}
                  narrowed={query.trim().length > 0 || bucket !== 'all'}
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
                onFiles={(files) => void runJarUpload(files)}
              />
            </Tab.Content>
          </Tab.Root>
        </>
      )}
    </Dialog.Content>
  );
}
