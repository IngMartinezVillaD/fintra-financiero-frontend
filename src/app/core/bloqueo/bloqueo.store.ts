import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TasasService } from '../../features/configuracion/tasas-periodo/data-access/tasas.service';
import { BloqueoSistema } from '../../features/configuracion/tasas-periodo/domain/tasa-periodo.model';

interface BloqueoState {
  bloqueo: BloqueoSistema | null;
  checking: boolean;
}

export const BloqueoStore = signalStore(
  { providedIn: 'root' },
  withState<BloqueoState>({ bloqueo: null, checking: false }),
  withMethods((store, svc = inject(TasasService)) => ({
    verificar() {
      patchState(store, { checking: true });
      svc.estadoBloqueo().subscribe({
        next: bloqueo => patchState(store, { bloqueo, checking: false }),
        error: ()     => patchState(store, { checking: false }),
      });
    },
  }))
);
