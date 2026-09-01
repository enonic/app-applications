import { uploadApplications } from '../../../entities/application';
import { i18n } from '../../../shared/i18n';
import { notifyError } from '../../../shared/notifications';
import { closeInstallDialog } from './install-dialog.store';
import { partitionJarFiles } from './jar-files';

/**
 * Installs the jars the operator picked, saying so for anything that was not one.
 *
 * The dialog closes as soon as there is something to install, because the browse list behind it is
 * where an upload in flight shows — a pick that was all rejected leaves it open to try again.
 */
export async function runJarUpload(files: readonly File[]): Promise<void> {
  const { accepted, rejected } = partitionJarFiles(files);

  rejected.forEach((name) => notifyError(i18n('applications.dialog.install.notJar', name)));

  if (accepted.length === 0) {
    return;
  }

  closeInstallDialog();

  await uploadApplications(accepted);
}
