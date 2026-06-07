import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { ToastMessage } from '../models/notification-message.model';
import { NotificationComponentType } from '../models/notification-type.enum';
import { ScreenLockState } from './screen-lock.state';

const initialState: ScreenLockState = {
  screenLock: false,
  autoUnlock: true,
  toastMessage: null,
  notificationComponentType: NotificationComponentType.TOAST_NOTIFICATION,
};

export const ScreenLockStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    lockScreen() {
      patchState(store, { screenLock: true });
    },

    unlockScreen(toastMessage: ToastMessage | null = null, notificationComponentType?: NotificationComponentType) {
      patchState(store, {
        screenLock: false,
        toastMessage,
        notificationComponentType: notificationComponentType ?? NotificationComponentType.TOAST_NOTIFICATION,
      });
    },

    setToastMessage(toastMessage: ToastMessage | null) {
      patchState(store, { toastMessage });
    },

    setNotificationComponentType(notificationComponentType: NotificationComponentType) {
      patchState(store, {
        notificationComponentType: notificationComponentType ?? NotificationComponentType.TOAST_NOTIFICATION,
      });
    },

    setAutoUnlock(autoUnlock: boolean) {
      patchState(store, { autoUnlock });
    },
  })),
);
