import type { Application } from '../../../entities/application';
import { $config } from '../../../shared/config';

export function isStartable(application: Application): boolean {
  return application.state === 'STOPPED';
}

export function isStoppable(application: Application): boolean {
  return application.state === 'STARTED' && !application.system && !isOwnApplication(application);
}

export function isUninstallable(application: Application): boolean {
  return !application.system && !application.local && !isOwnApplication(application);
}

function isOwnApplication({ key }: Application): boolean {
  return key === $config.get()?.appId;
}
