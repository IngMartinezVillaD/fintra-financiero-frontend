import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { SeguimientoService } from './seguimiento.service';
import { RegistrarAbonoResponse, SeguimientoOperacion } from '../domain/seguimiento.model';
import { OperacionListItem } from '../../domain/operacion.model';

interface SeguimientoState {
  vigentes: OperacionListItem[];
  detalle: SeguimientoOperacion | null;
  preview: RegistrarAbonoResponse | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initial: SeguimientoState = {
  vigentes: [], detalle: null, preview: null,
  loading: false, saving: false, error: null,
};

export const SeguimientoStore = signalStore(
  { providedIn: 'root' },
  withState<SeguimientoState>(initial),
  withMethods((store, svc = inject(SeguimientoService)) => ({

    cargarVigentes: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(() => svc.listarVigentes().pipe(
        tapResponse({
          next: vigentes => patchState(store, { vigentes, loading: false }),
          error: ()       => patchState(store, { loading: false, error: 'Error cargando operaciones' }),
        })
      ))
    )),

    cargarDetalle: rxMethod<number>(pipe(
      tap(() => patchState(store, { loading: true, detalle: null })),
      switchMap(id => svc.obtener(id).pipe(
        tapResponse({
          next: detalle => patchState(store, { detalle, loading: false }),
          error: ()      => patchState(store, { loading: false, error: 'Error cargando seguimiento' }),
        })
      ))
    )),

    setSaving(saving: boolean)                      { patchState(store, { saving }); },
    setError(error: string | null)                  { patchState(store, { error }); },
    setPreview(preview: RegistrarAbonoResponse | null) { patchState(store, { preview }); },
  }))
);
