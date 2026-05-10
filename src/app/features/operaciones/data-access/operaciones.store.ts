import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { OperacionesService } from './operaciones.service';
import { Operacion, OperacionListItem, PagedResponse } from '../domain/operacion.model';

interface OperacionesState {
  page: PagedResponse<OperacionListItem> | null;
  selected: Operacion | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  filtros: { estado?: string; prestamistaId?: number; prestatariaId?: number; referencia?: string; page: number; size: number };
}

const initial: OperacionesState = {
  page: null, selected: null, loading: false, saving: false, error: null,
  filtros: { page: 0, size: 10 },
};

export const OperacionesStore = signalStore(
  { providedIn: 'root' },
  withState<OperacionesState>(initial),
  withComputed(s => ({
    items:      computed(() => s.page()?.content ?? []),
    totalPages: computed(() => s.page()?.totalPages ?? 1),
    currentPage: computed(() => (s.page()?.number ?? 0) + 1),
  })),
  withMethods((store, svc = inject(OperacionesService)) => ({

    cargar: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(() => svc.listar(store.filtros()).pipe(
        tapResponse({
          next: page => patchState(store, { page, loading: false }),
          error: ()   => patchState(store, { loading: false, error: 'Error cargando operaciones' }),
        })
      ))
    )),

    cargarDetalle: rxMethod<number>(pipe(
      tap(() => patchState(store, { loading: true, selected: null })),
      switchMap(id => svc.obtener(id).pipe(
        tapResponse({
          next: selected => patchState(store, { selected, loading: false }),
          error: ()      => patchState(store, { loading: false, error: 'Error cargando operación' }),
        })
      ))
    )),

    setFiltros(f: Partial<OperacionesState['filtros']>) {
      patchState(store, { filtros: { ...store.filtros(), ...f, page: 0 } });
    },
    setPage(p: number)              { patchState(store, { filtros: { ...store.filtros(), page: p - 1 } }); },
    setSaving(saving: boolean)      { patchState(store, { saving }); },
    setError(error: string | null)  { patchState(store, { error }); },
    clearSelected()                 { patchState(store, { selected: null }); },
  }))
);
