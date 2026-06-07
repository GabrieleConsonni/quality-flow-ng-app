import { Injectable } from '@angular/core';

@Injectable()
export class AppInfoService {
  public get title() {
    return 'Quality Flow';
  }

  public get currentYear() {
    return new Date().getFullYear();
  }
}
