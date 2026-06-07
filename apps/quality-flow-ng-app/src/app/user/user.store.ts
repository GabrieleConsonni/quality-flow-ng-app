import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { UserState } from './user.state';

const initialState: UserState = {
  language: 'en',
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setLanguage(language: string) {
      patchState(store, { language: language });
    },
  })),
);
