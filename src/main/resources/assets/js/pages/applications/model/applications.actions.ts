import {
  type Application,
  startApplications,
  stopApplications,
} from '../../../entities/application';
import { openInstallDialog } from '../../../features/install-applications';
import { openUninstallDialog } from '../../../features/uninstall-applications';
import type { Notify } from '../../../shared/host';
import {
  type ActionContext,
  actionTargets,
  type SectionAction,
} from '../../../widgets/browse-toolbar/actions';
import { isStartable, isStoppable, isUninstallable } from './application-lifecycle';

function startTargets(ctx: ActionContext<Application>): readonly Application[] {
  return actionTargets(ctx).filter(isStartable);
}

function stopTargets(ctx: ActionContext<Application>): readonly Application[] {
  return actionTargets(ctx).filter(isStoppable);
}

function uninstallable(ctx: ActionContext<Application>): boolean {
  const targets = actionTargets(ctx);
  return targets.length > 0 && targets.every(isUninstallable);
}

/**
 * The section's toolbar, built over the `notify` of the mount that renders it: an action's outcome is
 * toasted through that mount's frame, and a module constant could name no mount.
 */
export function applicationActions(notify: Notify): readonly SectionAction<Application>[] {
  return [
    {
      id: 'install',
      labelKey: 'applications.action.install',
      enabled: () => true,
      run: () => openInstallDialog(),
    },
    {
      id: 'uninstall',
      labelKey: 'applications.action.uninstall',
      enabled: uninstallable,
      run: (ctx) => openUninstallDialog(actionTargets(ctx)),
    },
    {
      id: 'start',
      labelKey: 'applications.action.start',
      enabled: (ctx) => startTargets(ctx).length > 0,
      run: (ctx) => startApplications(startTargets(ctx), notify),
    },
    {
      id: 'stop',
      labelKey: 'applications.action.stop',
      enabled: (ctx) => stopTargets(ctx).length > 0,
      run: (ctx) => stopApplications(stopTargets(ctx), notify),
    },
  ];
}
