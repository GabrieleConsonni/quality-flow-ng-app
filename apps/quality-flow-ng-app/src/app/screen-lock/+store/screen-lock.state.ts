import { ToastMessage } from '../models/notification-message.model';
import { NotificationComponentType } from '../models/notification-type.enum';

export interface ScreenLockState {
  screenLock: boolean;
  autoUnlock: boolean;
  toastMessage: ToastMessage | null;
  notificationComponentType: NotificationComponentType | null;
}
