import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { DesembolsoService } from './desembolso.service';
import { Desembolso, GmfResumen } from '../domain/desembolso.model';
import { OperacionListItem } from '../../domain/operacion.model';

interface DesembolsoState {
  pendientes: OperacionListItem[];
  gmfPreview: GmfResumen | null;
  ultimo: Desembolso | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initial: DesembolsoState = {
  pendientes: [], gmfPreview: null, ultimo: null,
  loading: false, saving: false, error: null,
};

export const DesembolsoStore = signalStore(
  { providedIn: 'root' },
  withState<DesembolsoState>(initial),
  withMethods((store, svc = inject(DesembolsoService)) => ({

    cargarPendientes: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(() => svc.pendientes().pipe(
        tapResponse({
          next: pendientes => patchState(store, { pendientes, loading: false }),
          error: ()        => patchState(store, { loading: false, error: 'Error cargando pendientes' }),
        })
      ))
    )),

    cargarGmfPreview: rxMethod<{ operacionId: number; monto: string }>(pipe(
      switchMap(({ operacionId, monto }) => svc.gmfPreview(operacionId, monto).pipe(
        tapResponse({
          next: gmfPreview => patchState(store, { gmfPreview }),
          error: ()        => patchState(store, { gmfPreview: null }),
        })
      ))
    )),

    setSaving(saving: boolean)     { patchState(store, { saving }); },
    setError(error: string | null) { patchState(store, { error }); },
    setUltimo(ultimo: Desembolso)  { patchState(store, { ultimo }); },
    clearGmf()                     { patchState(store, { gmfPreview: null }); },
  }))
);
