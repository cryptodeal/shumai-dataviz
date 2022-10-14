import { writable, derived, type Readable, type Subscriber, type Unsubscriber } from 'svelte/store';
import { setContext, getContext } from 'svelte';
export type NotificationType = 'default' | 'info' | 'success' | 'warning' | 'error';
export interface INotification {
  id: string;
  type: NotificationType;
  message: string;
  timeout: number;
  remove: () => void;
}

export type NotificationStore = {
  subscribe: (this: void, run: Subscriber<INotification[]>) => Unsubscriber;
  send: (message: string, type?: NotificationType, timeout?: number) => void;
  default: (message: string, timeout?: number) => void;
  info: (message: string, timeout?: number) => void;
  success: (message: string, timeout?: number) => void;
  warning: (message: string, timeout?: number) => void;
  error: (message: string, timeout?: number) => void;
  remove: (notificationId: string) => void;
};

export function createNotificationStore(tempTimeout = 2500) {
  const _notifications = writable<INotification[]>([]);

  function send(message: string, type: NotificationType = 'default', timeout = tempTimeout) {
    _notifications.update((state) => {
      const tempId = id();
      const remove = () =>
        _notifications.update((state) =>
          state.filter((notification) => notification.id !== tempId)
        );
      return [...state, { id: tempId, type, message, timeout, remove }];
    });
  }

  const notifications: Readable<INotification[]> = derived(
    _notifications,
    ($_notifications, set) => {
      set($_notifications);
      if ($_notifications.length > 0) {
        const timer = setTimeout(() => {
          _notifications.update((state) => {
            state.shift();
            return state;
          });
        }, $_notifications[0].timeout);
        return () => {
          clearTimeout(timer);
        };
      }
    }
  );
  const { update } = _notifications;
  const { subscribe } = notifications;

  const notifStore = {
    subscribe,
    send,
    default: (msg: string, timeout?: number) => send(msg, 'default', timeout),
    info: (msg: string, timeout?: number) => send(msg, 'info', timeout),
    success: (msg: string, timeout?: number) => send(msg, 'success', timeout),
    warning: (msg: string, timeout?: number) => send(msg, 'warning', timeout),
    error: (msg: string, timeout?: number) => send(msg, 'error', timeout),
    remove: (notificationId: string) =>
      update((state) => state.filter((notification) => notification.id !== notificationId))
  };

  setContext('notifications', notifStore);
}

function id() {
  return '_' + Math.random().toString(36).slice(2, 9);
}

export function getNotificationsStore() {
  const notifStore: undefined | NotificationStore = getContext('notifications');
  if (notifStore !== undefined) {
    return notifStore as NotificationStore;
  } else {
    createNotificationStore();
    return getContext('notifications') as NotificationStore;
  }
}
