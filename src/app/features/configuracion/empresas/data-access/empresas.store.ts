import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { EmpresasService } from './empresas.service';
import { Empresa, EmpresaListItem, PagedResponse } from '../domain/empresa.model';

interface EmpresasState {
  page: PagedResponse<EmpresaListItem> | null;
  selected: Empresa | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  filtros: { estado?: string; rolPermitido?: string; busqueda?: string; page: number; size: number };
}

const initialState: EmpresasState = {
  page: null,
  selected: null,
  loading: false,
  saving: false,
  error: null,
  filtros: { page: 0, size: 10 },
};

export const EmpresasStore = signalStore(
  { providedIn: 'root' },
  withState<EmpresasState>(initialState),
  withComputed(store => ({
    items:      computed(() => store.page()?.content ?? []),
    totalPages: computed(() => store.page()?.totalPages ?? 1),
    currentPage: computed(() => (store.page()?.number ?? 0) + 1),
  })),
  withMethods((store, svc = inject(EmpresasService)) => ({

    cargar: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true, error: null })),
      switchMap(() => svc.listar(store.filtros()).pipe(
        tapResponse({
          next: page => patchState(store, { page, loading: false }),
          error: () => patchState(store, { loading: false, error: 'Error cargando empresas' }),
        })
      ))
    )),

    setFiltros(filtros: Partial<EmpresasState['filtros']>) {
      patchState(store, { filtros: { ...store.filtros(), ...filtros, page: 0 } });
    },

    setPage(page: number) {
      patchState(store, { filtros: { ...store.filtros(), page: page - 1 } });
    },

    cargarDetalle: rxMethod<number>(pipe(
      tap(() => patchState(store, { loading: true, error: null, selected: null })),
      switchMap(id => svc.obtener(id).pipe(
        tapResponse({
          next: selected => patchState(store, { selected, loading: false }),
          error: () => patchState(store, { loading: false, error: 'Error cargando empresa' }),
        })
      ))
    )),

    clearSelected() {
      patchState(store, { selected: null });
    },

    setSaving(saving: boolean) {
      patchState(store, { saving });
    },

    setError(error: string | null) {
      patchState(store, { error });
    },
  }))
);
