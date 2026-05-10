import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { TasasService } from './tasas.service';
import { TasaPeriodo } from '../domain/tasa-periodo.model';

interface TasasState {
  tasas: TasaPeriodo[];
  pendientes: TasaPeriodo[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const TasasStore = signalStore(
  { providedIn: 'root' },
  withState<TasasState>({ tasas: [], pendientes: [], loading: false, saving: false, error: null }),
  withMethods((store, svc = inject(TasasService)) => ({

    cargar: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(() => svc.listar().pipe(
        tapResponse({
          next: tasas => patchState(store, { tasas, loading: false }),
          error: ()   => patchState(store, { loading: false, error: 'Error cargando tasas' }),
        })
      ))
    )),

    cargarPendientes: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => svc.listarPendientes().pipe(
        tapResponse({
          next: pendientes => patchState(store, { pendientes, loading: false }),
          error: ()        => patchState(store, { loading: false }),
        })
      ))
    )),

    setSaving: (saving: boolean) => patchState(store, { saving }),
    setError:  (error: string | null) => patchState(store, { error }),
  }))
);
