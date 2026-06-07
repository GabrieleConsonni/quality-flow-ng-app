import { Injectable } from '@angular/core';

@Injectable()
export class MockOAuthService {
  private _token = 'notARealToken';

  constructor() {
    console.log('MockOAuthService initialized');
  }

  configure(_: any) {}
  async loadDiscoveryDocumentAndTryLogin() {
    return true;
  }
  setupAutomaticSilentRefresh() {}
  hasValidAccessToken() {
    return true;
  }
  getAccessToken() {
    return this._token;
  }
  get identityClaims() {
    return {
      sub: 'offline-user',
      name: 'Offline User',
      email: 'offline@example.com',
    };
  }
  logOut() {}
}
