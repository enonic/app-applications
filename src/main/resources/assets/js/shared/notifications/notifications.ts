import { getHost } from '../host';
import type { Notification } from '../sections';

export type NotificationTone = Notification['level'];

export type NotifyOptions = {
  /** `false` keeps it up until the reader dismisses it; a number overrides the host's own lifetime. */
  autoClose?: number | false;
  action?: { label: string; onAction: () => void };
};

/** Takes the notification down again. */
export type Dismiss = () => void;

const NOOP: Dismiss = () => {};

/**
 * A toast on the host's stack, with the text already localized — no i18n key crosses the boundary.
 * ! Hands back a dismiss rather than the host's id: the stack, its limit, lifetimes and dedup are the
 * ! shell's, and it revokes what a mount raised on unmount, so nothing is tracked here.
 */
export function notify(
  tone: NotificationTone,
  message: string,
  options: NotifyOptions = {},
): Dismiss {
  return getHost()?.notify({ level: tone, message, ...options }) ?? NOOP;
}

export function notifySuccess(message: string, options?: NotifyOptions): Dismiss {
  return notify('success', message, options);
}

export function notifyInfo(message: string, options?: NotifyOptions): Dismiss {
  return notify('info', message, options);
}

export function notifyWarning(message: string, options?: NotifyOptions): Dismiss {
  return notify('warning', message, options);
}

export function notifyError(message: string, options?: NotifyOptions): Dismiss {
  return notify('error', message, options);
}
