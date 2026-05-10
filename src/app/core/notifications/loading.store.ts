import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

export const LoadingStore = signalStore(
  { providedIn: 'root' },
  withState({ count: 0 }),
  withComputed(store => ({ isLoading: computed(() => store.count() > 0) })),
  withMethods(store => ({
    increment() { patchState(store, s => ({ count: s.count + 1 })); },
    decrement() { patchState(store, s => ({ count: Math.max(0, s.count - 1) })); },
  }))
);
