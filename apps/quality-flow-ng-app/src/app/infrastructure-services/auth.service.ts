import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface IUser {
  email: string;
  avatarUrl?: string;
}

const defaultPath = '/';
const defaultUser = {
  email: 'quality-flow@example.com',
  avatarUrl: '',
};

@Injectable()
export class AuthService {
  private _user: IUser | null = defaultUser;
  get loggedIn(): boolean {
    return !!this._user;
  }

  private _lastAuthenticatedPath: string = defaultPath;
  set lastAuthenticatedPath(value: string) {
    this._lastAuthenticatedPath = value;
  }

  constructor(private router: Router) {}

  async logIn(email: string, _password: string) {
    try {
      this._user = { ...defaultUser, email };
      this.router.navigate([this._lastAuthenticatedPath]);
      return { isOk: true, data: this._user };
    } catch {
      return { isOk: false, message: 'Authentication failed' };
    }
  }

  async getUser() {
    try {
      return { isOk: true, data: this._user };
    } catch {
      return { isOk: false, data: null };
    }
  }

  async logOut() {
    this._user = null;
    this.router.navigate(['/login-form']);
  }
}
