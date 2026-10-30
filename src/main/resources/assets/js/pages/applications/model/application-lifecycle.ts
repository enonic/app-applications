import type { Application } from '../../../entities/application';
import { $config } from '../../../shared/config';

// A schema application is always started: XP refuses to start or stop one, so neither is offered.
export function isStartable(application: Application): boolean {
  return application.state === 'STOPPED' && !application.schema;
}

export function isStoppable(application: Application): boolean {
  return (
    application.state === 'STARTED' &&
    !application.system &&
    !application.schema &&
    !isOwnApplication(application)
  );
}

export function isUninstallable(application: Application): boolean {
  return !application.system && !application.local && !isOwnApplication(application);
}

function isOwnApplication({ key }: Application): boolean {
  return key === $config.get()?.appId;
}
