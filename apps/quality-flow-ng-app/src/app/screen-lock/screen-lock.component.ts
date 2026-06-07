import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxToastModule } from 'devextreme-angular/ui/toast';

import { ScreenLockStore } from './+store/screen-lock.store';
import { NotificationComponentType } from './models/notification-type.enum';

@Component({
  selector: 'qf-screen-lock',
  standalone: true,
  imports: [DxLoadPanelModule, DxToastModule],
  templateUrl: './screen-lock.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenLockComponent {
  private readonly _store = inject(ScreenLockStore);

  readonly loading = this._store.screenLock;
  readonly toastMessage = this._store.toastMessage;
  readonly notificationComponentType = this._store.notificationComponentType;

  notificationComponentTypeEnum = NotificationComponentType;

  @Input() showPane: boolean = true;
  @Input() showIndicator: boolean = true;

  resetComponentMessage(): void {
    this._store.unlockScreen(undefined, NotificationComponentType.TOAST_NOTIFICATION);
  }
}
