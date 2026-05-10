import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export interface Notification {
  id: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  traceId?: string;
}

interface NotificationState {
  notifications: Notification[];
}

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState<NotificationState>({ notifications: [] }),
  withMethods(store => ({
    push(notif: Omit<Notification, 'id'>) {
      const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      patchState(store, s => ({ notifications: [...s.notifications, { ...notif, id }] }));
      setTimeout(() => this.dismiss(id), 5000);
    },
    dismiss(id: string) {
      patchState(store, s => ({ notifications: s.notifications.filter(n => n.id !== id) }));
    },
  }))
);
