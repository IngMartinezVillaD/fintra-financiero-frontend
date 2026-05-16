import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmpresasService } from '../data-access/empresas.service';
import { EmpresasStore } from '../data-access/empresas.store';
import { Banco, CuentaBancaria } from '../domain/empresa.model';
import { getErrorMessage, markAllAsTouched } from '@shared/utils/form.utils';
import { GeoService, PaisDto, DepartamentoDto, CiudadDto } from '@shared/services/geo.service';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto">

      <!-- Page header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <button (click)="volver()" class="text-neutral-400 hover:text-neutral-700 transition-colors mt-0.5">
            <span class="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 class="text-[17px] font-bold text-neutral-900">
              {{ esNueva() ? 'Nueva empresa' : 'Editar empresa' }}
            </h1>
            <p class="text-[12px] text-neutral-400 mt-0.5">
              {{ esNueva() ? 'Registra una nueva empresa en el sistema' : 'Actualiza los datos de la empresa' }}
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <button type="button" (click)="volver()"
                  class="px-3.5 py-[7px] rounded-lg bg-neutral-100 text-neutral-600 text-xs font-semibold hover:bg-neutral-200 transition-colors">
            Cancelar
          </button>
          <button type="button" (click)="guardar()" [disabled]="saving()"
                  class="flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg bg-brand-primary text-white text-xs font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50">
            @if (saving()) {
              <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            }
            {{ esNueva() ? 'Crear empresa' : 'Guardar cambios' }}
          </button>
        </div>
      </div>

      <form [formGroup]="form" class="space-y-3">

        <!-- ① Datos generales -->
        <div class="section-block">
          <div class="section-header">
            <span class="step-num">1</span>
            <span class="section-title">Datos generales</span>
          </div>

          <!-- Fila 1: Identificación -->
          <div class="grid grid-cols-3 gap-3 p-3.5 pb-0">
            <div class="flex flex-col gap-1">
              <label class="field-label">Razón Social <span class="text-danger">*</span></label>
              <input formControlName="razonSocial" class="field-input" placeholder="Nombre legal de la empresa">
              @if (err('razonSocial')) { <span class="text-[10px] text-danger">{{ err('razonSocial') }}</span> }
            </div>
            <div class="flex flex-col gap-1">
              <label class="field-label">NIT <span class="text-danger">*</span></label>
              <input formControlName="nit" class="field-input" placeholder="900123456-7">
              @if (err('nit')) { <span class="text-[10px] text-danger">{{ err('nit') }}</span> }
            </div>
            <div class="flex flex-col gap-1">
              <label class="field-label">Código interno</label>
              @if (esNueva()) {
                <div class="field-input bg-neutral-50 text-neutral-400 italic text-xs flex items-center gap-1 cursor-not-allowed select-none">
                  <span class="material-symbols-outlined text-[14px]">auto_awesome</span>
                  Se asignará automáticamente
                </div>
              } @else {
                <div class="field-input bg-neutral-50 font-mono font-semibold text-neutral-700 cursor-not-allowed select-none">
                  {{ store.selected()?.codigoInterno }}
                </div>
              }
            </div>
          </div>

          <!-- Fila 2: Ubicación jerárquica País → Departamento → Ciudad -->
          <div class="grid grid-cols-3 gap-3 p-3.5 pb-0">
            <div class="flex flex-col gap-1">
              <label class="field-label">País</label>
              <select formControlName="pais" class="field-input"
                      (change)="onPaisChange($any($event.target).value)">
                <option value="">Seleccionar...</option>
                @for (p of paises(); track p.codigoIso2) {
                  <option [value]="p.nombre">{{ p.nombre }}</option>
                }
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="field-label">Departamento</label>
              <select formControlName="departamento" class="field-input"
                      (change)="onDepartamentoChange($any($event.target).value)">
                <option value="">
                  {{ form.get('pais')?.value ? 'Seleccionar...' : 'Primero seleccione un país' }}
                </option>
                @for (dep of departamentos(); track dep.codigoDane) {
                  <option [value]="dep.nombre">{{ dep.nombre }}</option>
                }
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="field-label">Ciudad / Municipio</label>
              <select formControlName="ciudad" class="field-input">
                <option value="">
                  {{ form.get('departamento')?.value ? 'Seleccionar...' : 'Primero seleccione un departamento' }}
                </option>
                @for (c of ciudades(); track c.codigoDane) {
                  <option [value]="c.nombre">
                    {{ c.nombre }}{{ c.codigoPostal ? ' — CP ' + c.codigoPostal : '' }}
                  </option>
                }
              </select>
            </div>
          </div>

          <!-- Fila 3: Configuración -->
          <div class="grid grid-cols-3 gap-3 p-3.5">
            <div class="flex flex-col gap-1">
              <label class="field-label">Rol permitido <span class="text-danger">*</span></label>
              <select formControlName="rolPermitido" class="field-input">
                <option value="">Seleccionar...</option>
                <option value="PRESTAMISTA">Prestamista</option>
                <option value="PRESTATARIA">Prestataria</option>
                <option value="AMBOS">Ambos</option>
              </select>
              @if (err('rolPermitido')) { <span class="text-[10px] text-danger">{{ err('rolPermitido') }}</span> }
            </div>
            <div class="flex flex-col gap-1">
              <label class="field-label">ERP utilizado</label>
              <select formControlName="erpUtilizado" class="field-input">
                <option value="">Sin ERP</option>
                <option value="APOTHEOSYS">Apotheosys</option>
                <option value="SIIGO">Siigo</option>
              </select>
            </div>
          </div>
        </div>

        <!-- ② Representante legal -->
        <div class="section-block">
          <div class="section-header">
            <span class="step-num">2</span>
            <span class="section-title">Representante legal</span>
          </div>
          <div class="grid grid-cols-3 gap-3 p-3.5">
            <div class="flex flex-col gap-1">
              <label class="field-label">Nombre</label>
              <input formControlName="representanteLegalNombre" class="field-input">
            </div>
            <div class="flex flex-col gap-1">
              <label class="field-label">Correo electrónico</label>
              <input formControlName="representanteLegalEmail" class="field-input" type="email">
              @if (err('representanteLegalEmail')) {
                <span class="text-[10px] text-danger">{{ err('representanteLegalEmail') }}</span>
              }
            </div>
            <div class="flex flex-col gap-1">
              <label class="field-label">Teléfono</label>
              <input formControlName="representanteLegalTelefono" class="field-input" placeholder="+57 310 000 0000">
            </div>
          </div>
        </div>

        <!-- ⑤ Cuentas bancarias -->
        <div class="section-block">
          <div class="section-header">
            <span class="step-num">5</span>
            <span class="section-title">Cuentas bancarias</span>
            @if (esNueva()) {
              <button type="button" (click)="agregarCuenta()"
                      class="ml-auto flex items-center gap-1 px-3 py-[5px] rounded-md border border-brand-primary text-brand-primary text-[11px] font-semibold hover:bg-brand-light transition-colors">
                + Agregar cuenta
              </button>
            } @else if (editandoCuentaId() === null) {
              <button type="button" (click)="iniciarNuevaCuenta()"
                      class="ml-auto flex items-center gap-1 px-3 py-[5px] rounded-md border border-brand-primary text-brand-primary text-[11px] font-semibold hover:bg-brand-light transition-colors">
                + Agregar cuenta
              </button>
            }
          </div>

          @if (esNueva()) {
            <!-- ── MODO CREACIÓN: FormArray ── -->
            @if (cuentasArray.length === 0) {
              <p class="text-[11px] text-neutral-400 text-center py-5">Sin cuentas bancarias registradas.</p>
            }
            <div formArrayName="cuentasBancarias" class="p-3.5 pt-3 space-y-3">
              @for (ctrl of cuentasArray.controls; track $index) {
                <div [formGroupName]="$index" class="bg-white border-[1.5px] border-neutral-200 rounded-lg overflow-hidden">
                  <div class="flex items-center justify-between px-3.5 py-2 bg-neutral-50 border-b border-neutral-200">
                    <span class="text-[11px] font-bold text-neutral-700">Cuenta #{{ $index + 1 }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-light text-brand-primary">Activa</span>
                      <button type="button" (click)="eliminarCuenta($index)"
                              class="text-[11px] text-danger font-medium hover:underline">Eliminar</button>
                    </div>
                  </div>
                  <div class="grid grid-cols-4 gap-3 px-3.5 pt-3 pb-0">
                    <div class="flex flex-col gap-1">
                      <label class="field-label">Banco <span class="text-danger">*</span></label>
                      <select formControlName="bancoCodigo" class="field-input">
                        <option value="">Seleccionar...</option>
                        @for (banco of bancos(); track banco.codigo) {
                          <option [value]="banco.codigo">{{ banco.nombre }}</option>
                        }
                      </select>
                      @if (errCuenta($index, 'bancoCodigo')) { <span class="text-[10px] text-danger">{{ errCuenta($index, 'bancoCodigo') }}</span> }
                    </div>
                    <div class="flex flex-col gap-1">
                      <label class="field-label">Tipo <span class="text-danger">*</span></label>
                      <select formControlName="tipo" class="field-input">
                        <option value="">Seleccionar...</option>
                        <option value="CORRIENTE">Cuenta Corriente</option>
                        <option value="AHORROS">Cuenta de Ahorros</option>
                      </select>
                      @if (errCuenta($index, 'tipo')) { <span class="text-[10px] text-danger">{{ errCuenta($index, 'tipo') }}</span> }
                    </div>
                    <div class="flex flex-col gap-1">
                      <label class="field-label">Número <span class="text-danger">*</span></label>
                      <input formControlName="numeroCuenta" class="field-input" placeholder="XXX-XXXXXX-XX">
                      @if (errCuenta($index, 'numeroCuenta')) { <span class="text-[10px] text-danger">{{ errCuenta($index, 'numeroCuenta') }}</span> }
                    </div>
                    <div class="flex flex-col gap-1">
                      <label class="field-label">Titular <span class="text-danger">*</span></label>
                      <input formControlName="titular" class="field-input">
                      @if (errCuenta($index, 'titular')) { <span class="text-[10px] text-danger">{{ errCuenta($index, 'titular') }}</span> }
                    </div>
                  </div>
                  <div class="px-3.5 pt-3 pb-0">
                    <div class="flex flex-col gap-1 max-w-xs">
                      <label class="field-label">Código contable</label>
                      <input formControlName="codigoContable" class="field-input" placeholder="Ej: 1110001">
                    </div>
                  </div>
                  <div class="px-3.5 pt-3 pb-3.5">
                    <div class="flex flex-col gap-1 max-w-xs">
                      <label class="field-label">¿Exenta de GMF? <span class="text-danger">*</span></label>
                      <select formControlName="exentaGmf" class="field-input"
                              [class.border-danger]="!ctrl.get('exentaGmf')?.value"
                              [class.bg-red-50]="!ctrl.get('exentaGmf')?.value"
                              [class.text-danger]="!ctrl.get('exentaGmf')?.value"
                              [class.font-semibold]="!ctrl.get('exentaGmf')?.value">
                        <option [value]="false">NO – Aplica 4×1000</option>
                        <option [value]="true">SÍ – Exenta GMF</option>
                      </select>
                    </div>
                    @if (!ctrl.get('exentaGmf')?.value) {
                      <div class="mt-2 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-md px-3 py-2">
                        <span class="text-orange-500 text-sm shrink-0">⚡</span>
                        <p class="text-[11px] text-orange-700"><strong>Aplica GMF 4×1000</strong> — Al desembolsar desde esta cuenta se generan asientos de GMF y registro extracontable.</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

          } @else {
            <!-- ── MODO EDICIÓN: tabla + formularios inline ── -->

            <!-- Tabla de cuentas existentes -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th class="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Banco</th>
                    <th class="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Tipo</th>
                    <th class="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Número</th>
                    <th class="px-4 py-2.5 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Titular</th>
                    <th class="px-4 py-2.5 text-center text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">GMF</th>
                    <th class="px-4 py-2.5 text-center text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Estado</th>
                    <th class="px-4 py-2.5 text-center text-[11px] font-semibold text-neutral-500 uppercase tracking-wide w-20">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100">
                  @if (cuentasExistentes.length === 0) {
                    <tr>
                      <td colspan="7" class="px-4 py-6 text-center text-[11px] text-neutral-400">
                        Sin cuentas bancarias registradas.
                      </td>
                    </tr>
                  }
                  @for (c of cuentasExistentes; track c.id) {
                    <!-- Fila normal -->
                    <tr [class]="editandoCuentaId() === c.id ? 'bg-brand-light/40' : 'hover:bg-neutral-50 transition-colors'">
                      <td class="px-4 py-2.5 text-xs font-medium text-neutral-800">{{ c.bancoNombre }}</td>
                      <td class="px-4 py-2.5 text-xs text-neutral-600">{{ c.tipo === 'CORRIENTE' ? 'Corriente' : 'Ahorros' }}</td>
                      <td class="px-4 py-2.5 text-xs font-mono text-neutral-700">{{ c.numeroCuenta }}</td>
                      <td class="px-4 py-2.5 text-xs text-neutral-600 max-w-[160px] truncate">{{ c.titular }}</td>
                      <td class="px-4 py-2.5 text-center">
                        <span class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              [class]="c.exentaGmf ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'">
                          {{ c.exentaGmf ? 'Sin GMF' : '4×1000' }}
                        </span>
                      </td>
                      <td class="px-4 py-2.5 text-center">
                        <span class="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              [class]="c.activa ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'">
                          {{ c.activa ? 'Activa' : 'Inactiva' }}
                        </span>
                      </td>
                      <td class="px-4 py-2.5 text-center">
                        <div class="flex items-center justify-center gap-2">
                          <button type="button" (click)="iniciarEditarCuenta(c)"
                                  title="Editar"
                                  class="text-brand-primary hover:text-brand-secondary transition-colors">
                            <span class="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          @if (c.activa) {
                            <button type="button" (click)="desactivarCuenta(c.id)"
                                    [disabled]="desactivandoId() === c.id"
                                    title="Anular"
                                    class="text-danger hover:text-danger/70 transition-colors disabled:opacity-40">
                              @if (desactivandoId() === c.id) {
                                <span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                              } @else {
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                              }
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                    <!-- Fila de formulario inline (se expande debajo de la fila cuando se edita) -->
                    @if (editandoCuentaId() === c.id) {
                      <tr>
                        <td colspan="7" class="px-4 py-3 bg-brand-light/30 border-b-2 border-brand-primary/30">
                          <div [formGroup]="cuentaEditForm" class="space-y-3">
                            <p class="text-[11px] font-bold text-brand-primary mb-2">Editando cuenta</p>
                            <div class="grid grid-cols-4 gap-3">
                              <div class="flex flex-col gap-1">
                                <label class="field-label">Banco <span class="text-danger">*</span></label>
                                <select formControlName="bancoCodigo" class="field-input">
                                  <option value="">Seleccionar...</option>
                                  @for (banco of bancos(); track banco.codigo) { <option [value]="banco.codigo">{{ banco.nombre }}</option> }
                                </select>
                                @if (errEdit('bancoCodigo')) { <span class="text-[10px] text-danger">{{ errEdit('bancoCodigo') }}</span> }
                              </div>
                              <div class="flex flex-col gap-1">
                                <label class="field-label">Tipo <span class="text-danger">*</span></label>
                                <select formControlName="tipo" class="field-input">
                                  <option value="">Seleccionar...</option>
                                  <option value="CORRIENTE">Cuenta Corriente</option>
                                  <option value="AHORROS">Cuenta de Ahorros</option>
                                </select>
                                @if (errEdit('tipo')) { <span class="text-[10px] text-danger">{{ errEdit('tipo') }}</span> }
                              </div>
                              <div class="flex flex-col gap-1">
                                <label class="field-label">Número <span class="text-danger">*</span></label>
                                <input formControlName="numeroCuenta" class="field-input" placeholder="XXX-XXXXXX-XX">
                                @if (errEdit('numeroCuenta')) { <span class="text-[10px] text-danger">{{ errEdit('numeroCuenta') }}</span> }
                              </div>
                              <div class="flex flex-col gap-1">
                                <label class="field-label">Titular <span class="text-danger">*</span></label>
                                <input formControlName="titular" class="field-input">
                                @if (errEdit('titular')) { <span class="text-[10px] text-danger">{{ errEdit('titular') }}</span> }
                              </div>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                              <div class="flex flex-col gap-1">
                                <label class="field-label">Código contable</label>
                                <input formControlName="codigoContable" class="field-input" placeholder="Ej: 1110001">
                              </div>
                              <div class="flex flex-col gap-1">
                                <label class="field-label">¿Exenta de GMF? <span class="text-danger">*</span></label>
                                <select formControlName="exentaGmf" class="field-input">
                                  <option [value]="false">NO – Aplica 4×1000</option>
                                  <option [value]="true">SÍ – Exenta GMF</option>
                                </select>
                              </div>
                            </div>
                            <div class="flex justify-end gap-2">
                              <button type="button" (click)="cancelarCuentaEdicion()"
                                      class="px-3.5 py-[7px] rounded-lg bg-neutral-100 text-neutral-600 text-xs font-semibold hover:bg-neutral-200 transition-colors">
                                Cancelar
                              </button>
                              <button type="button" (click)="guardarCuentaEdicion(c.id)" [disabled]="savingCuenta()"
                                      class="flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg bg-brand-primary text-white text-xs font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50">
                                @if (savingCuenta()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> }
                                Guardar cuenta
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>

            <!-- Formulario para nueva cuenta -->
            @if (editandoCuentaId() === 'nueva') {
              <div class="bg-white border-[1.5px] border-brand-primary rounded-lg overflow-hidden mx-3.5 mb-3.5">
                <div class="flex items-center justify-between px-3.5 py-2 bg-brand-light border-b border-brand-primary/20">
                  <span class="text-[11px] font-bold text-brand-primary">Nueva cuenta bancaria</span>
                  <button type="button" (click)="cancelarCuentaEdicion()" class="text-[11px] text-neutral-500 hover:text-neutral-700 font-medium">Cancelar</button>
                </div>
                <div [formGroup]="cuentaEditForm" class="p-3.5 space-y-3">
                  <div class="grid grid-cols-4 gap-3">
                    <div class="flex flex-col gap-1">
                      <label class="field-label">Banco <span class="text-danger">*</span></label>
                      <select formControlName="bancoCodigo" class="field-input">
                        <option value="">Seleccionar...</option>
                        @for (banco of bancos(); track banco.codigo) { <option [value]="banco.codigo">{{ banco.nombre }}</option> }
                      </select>
                      @if (errEdit('bancoCodigo')) { <span class="text-[10px] text-danger">{{ errEdit('bancoCodigo') }}</span> }
                    </div>
                    <div class="flex flex-col gap-1">
                      <label class="field-label">Tipo <span class="text-danger">*</span></label>
                      <select formControlName="tipo" class="field-input">
                        <option value="">Seleccionar...</option>
                        <option value="CORRIENTE">Cuenta Corriente</option>
                        <option value="AHORROS">Cuenta de Ahorros</option>
                      </select>
                      @if (errEdit('tipo')) { <span class="text-[10px] text-danger">{{ errEdit('tipo') }}</span> }
                    </div>
                    <div class="flex flex-col gap-1">
                      <label class="field-label">Número <span class="text-danger">*</span></label>
                      <input formControlName="numeroCuenta" class="field-input" placeholder="XXX-XXXXXX-XX">
                      @if (errEdit('numeroCuenta')) { <span class="text-[10px] text-danger">{{ errEdit('numeroCuenta') }}</span> }
                    </div>
                    <div class="flex flex-col gap-1">
                      <label class="field-label">Titular <span class="text-danger">*</span></label>
                      <input formControlName="titular" class="field-input">
                      @if (errEdit('titular')) { <span class="text-[10px] text-danger">{{ errEdit('titular') }}</span> }
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="flex flex-col gap-1">
                      <label class="field-label">Código contable</label>
                      <input formControlName="codigoContable" class="field-input" placeholder="Ej: 1110001">
                    </div>
                    <div class="flex flex-col gap-1">
                      <label class="field-label">¿Exenta de GMF? <span class="text-danger">*</span></label>
                      <select formControlName="exentaGmf" class="field-input">
                        <option [value]="false">NO – Aplica 4×1000</option>
                        <option [value]="true">SÍ – Exenta GMF</option>
                      </select>
                    </div>
                  </div>
                  <div class="flex justify-end gap-2">
                    <button type="button" (click)="cancelarCuentaEdicion()"
                            class="px-3.5 py-[7px] rounded-lg bg-neutral-100 text-neutral-600 text-xs font-semibold hover:bg-neutral-200 transition-colors">
                      Cancelar
                    </button>
                    <button type="button" (click)="guardarNuevaCuenta()" [disabled]="savingCuenta()"
                            class="flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg bg-brand-primary text-white text-xs font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-50">
                      @if (savingCuenta()) { <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span> }
                      Agregar cuenta
                    </button>
                  </div>
                </div>
              </div>
            }
          }
        </div>

        <!-- ⑥ Estado -->
        <div class="section-block">
          <div class="section-header">
            <span class="step-num">6</span>
            <span class="section-title">Estado</span>
          </div>
          <div class="grid grid-cols-2 gap-3 p-3.5">
            <div class="flex flex-col gap-1">
              <label class="field-label">Estado <span class="text-danger">*</span></label>
              <select formControlName="estado" class="field-input">
                <option value="ACTIVA">Activa – habilitada para operar</option>
                <option value="INACTIVA">Inactiva</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="field-label">Observaciones</label>
              <input formControlName="observaciones" class="field-input" placeholder="Notas para el administrador…">
            </div>
          </div>
        </div>

        <!-- Error general -->
        @if (error()) {
          <div class="flex items-center gap-2 bg-danger-light border border-danger/30 text-danger text-xs rounded-lg px-4 py-3" role="alert">
            <span class="material-symbols-outlined text-base">error</span>
            {{ error() }}
          </div>
        }

      </form>
    </div>
  `,
})
export class EmpresaFormPage implements OnInit {
  private readonly svc    = inject(EmpresasService);
  private readonly geo    = inject(GeoService);
  private readonly toast  = inject(ToastService);
  protected readonly store  = inject(EmpresasStore);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  private readonly fb     = inject(FormBuilder);

  protected esNueva       = signal(true);
  protected saving        = signal(false);
  protected error         = signal<string | null>(null);
  protected bancos        = signal<Banco[]>([]);
  protected paises        = signal<PaisDto[]>([]);
  protected departamentos = signal<DepartamentoDto[]>([]);
  protected ciudades      = signal<CiudadDto[]>([]);

  private empresaId: number | null = null;
  private pendingDepartamento = '';

  protected editandoCuentaId = signal<number | 'nueva' | null>(null);
  protected savingCuenta     = signal(false);
  protected desactivandoId   = signal<number | null>(null);

  constructor() {
    effect(() => {
      const empresa = this.store.selected();
      if (empresa && !this.esNueva()) {
        this.form.patchValue({
          razonSocial:                empresa.razonSocial,
          nit:                        empresa.nit,
          pais:                       empresa.pais,
          departamento:               empresa.departamento ?? '',
          ciudad:                     empresa.ciudad ?? '',
          rolPermitido:               empresa.rolPermitido,
          erpUtilizado:               empresa.erpUtilizado ?? '',
          representanteLegalNombre:   empresa.representanteLegalNombre ?? '',
          representanteLegalEmail:    empresa.representanteLegalEmail ?? '',
          representanteLegalTelefono: empresa.representanteLegalTelefono ?? '',
          estado:                     empresa.estado,
          observaciones:              empresa.observaciones ?? '',
        });
        // Si el país de la empresa no es Colombia, carga los departamentos del país correcto
        const pais = this.paises().find(p => p.nombre === empresa.pais);
        const cargaDeps = (codigoIso2: string) => {
          this.geo.departamentos(codigoIso2).subscribe(deps => {
            this.departamentos.set(deps);
            if (empresa.departamento) {
              const dep = deps.find(d => d.nombre === empresa.departamento);
              if (dep) this.geo.ciudades(dep.codigoDane).subscribe(c => this.ciudades.set(c));
            }
          });
        };
        if (pais && pais.codigoIso2 !== 'CO') {
          cargaDeps(pais.codigoIso2);
        } else if (empresa.departamento) {
          const dep = this.departamentos().find(d => d.nombre === empresa.departamento);
          if (dep) {
            this.geo.ciudades(dep.codigoDane).subscribe(c => this.ciudades.set(c));
          } else {
            this.pendingDepartamento = empresa.departamento;
          }
        }
      }
    });
  }

  protected readonly form = this.fb.group({
    razonSocial:                ['', [Validators.required, Validators.maxLength(200)]],
    nit:                        ['', [Validators.required, Validators.maxLength(20)]],
    pais:                       ['Colombia'],
    departamento:               [''],
    ciudad:                     [''],
    rolPermitido:               ['', [Validators.required]],
    erpUtilizado:               [''],
    representanteLegalNombre:   [''],
    representanteLegalEmail:    ['', [Validators.email]],
    representanteLegalTelefono: [''],
    estado:                     ['ACTIVA', [Validators.required]],
    observaciones:              [''],
    cuentasBancarias:           this.fb.array([]),
  });

  get cuentasArray(): FormArray {
    return this.form.get('cuentasBancarias') as FormArray;
  }

  protected get cuentasExistentes(): CuentaBancaria[] {
    return this.store.selected()?.cuentasBancarias ?? [];
  }

  protected cuentaEditForm = this.fb.group({
    bancoCodigo:    ['', [Validators.required]],
    tipo:           ['', [Validators.required]],
    numeroCuenta:   ['', [Validators.required, Validators.maxLength(30)]],
    titular:        ['', [Validators.required, Validators.maxLength(200)]],
    codigoContable: [''],
    exentaGmf:      [false as boolean],
  });

  ngOnInit(): void {
    this.svc.listarBancos().subscribe({ next: b => this.bancos.set(b) });

    this.geo.paises().subscribe(ps => {
      this.paises.set(ps);
      // Pre-cargar departamentos de Colombia (caso más común)
      const co = ps.find(p => p.codigoIso2 === 'CO');
      if (co) {
        this.geo.departamentos(co.codigoIso2).subscribe(deps => {
          this.departamentos.set(deps);
          if (this.pendingDepartamento) {
            const dep = deps.find(d => d.nombre === this.pendingDepartamento);
            if (dep) this.geo.ciudades(dep.codigoDane).subscribe(c => this.ciudades.set(c));
            this.pendingDepartamento = '';
          }
        });
      }
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nueva') {
      this.esNueva.set(false);
      this.empresaId = +id;
      this.store.cargarDetalle(this.empresaId);
    }
  }

  protected onPaisChange(nombre: string): void {
    this.form.get('departamento')?.setValue('');
    this.form.get('ciudad')?.setValue('');
    this.departamentos.set([]);
    this.ciudades.set([]);
    if (!nombre) return;
    const pais = this.paises().find(p => p.nombre === nombre);
    if (pais) this.geo.departamentos(pais.codigoIso2).subscribe(d => this.departamentos.set(d));
  }

  protected onDepartamentoChange(nombre: string): void {
    this.form.get('ciudad')?.setValue('');
    this.ciudades.set([]);
    if (!nombre) return;
    const dep = this.departamentos().find(d => d.nombre === nombre);
    if (dep) this.geo.ciudades(dep.codigoDane).subscribe(c => this.ciudades.set(c));
  }

  private crearCuentaGroup() {
    return this.fb.group({
      bancoCodigo:    ['', [Validators.required]],
      tipo:           ['', [Validators.required]],
      numeroCuenta:   ['', [Validators.required, Validators.maxLength(30)]],
      titular:        ['', [Validators.required, Validators.maxLength(200)]],
      codigoContable: [''],
      exentaGmf:      [false],
    });
  }

  protected agregarCuenta(): void {
    this.cuentasArray.push(this.crearCuentaGroup());
  }

  protected eliminarCuenta(index: number): void {
    this.cuentasArray.removeAt(index);
  }

  protected err(field: string): string {
    return getErrorMessage(this.form.get(field)) ?? '';
  }

  protected errCuenta(index: number, field: string): string {
    return getErrorMessage(this.cuentasArray.at(index)?.get(field)) ?? '';
  }

  protected guardar(): void {
    if (this.form.invalid) { markAllAsTouched(this.form); return; }
    this.saving.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();
    const payload: any = {
      razonSocial:                value.razonSocial,
      nit:                        value.nit,
      pais:                       value.pais || undefined,
      departamento:               value.departamento || undefined,
      ciudad:                     value.ciudad || undefined,
      rolPermitido:               value.rolPermitido,
      erpUtilizado:               value.erpUtilizado || undefined,
      representanteLegalNombre:   value.representanteLegalNombre || undefined,
      representanteLegalEmail:    value.representanteLegalEmail || undefined,
      representanteLegalTelefono: value.representanteLegalTelefono || undefined,
      estado:                     value.estado,
      observaciones:              value.observaciones || undefined,
      cuentasBancarias:           (value.cuentasBancarias as any[])?.length ? value.cuentasBancarias : undefined,
    };

    const req$ = this.esNueva()
      ? this.svc.crear(payload)
      : this.svc.actualizar(this.empresaId!, payload);

    req$.subscribe({
      next: (empresa) => {
        this.saving.set(false);
        this.toast.success(this.esNueva() ? 'Empresa creada exitosamente' : 'Empresa actualizada exitosamente');
        this.router.navigate(['/configuracion/empresas', empresa.id]);
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err.error?.message ?? 'Error al guardar la empresa';
        this.error.set(msg);
        this.toast.error(msg);
      },
    });
  }

  protected errEdit(field: string): string {
    return getErrorMessage(this.cuentaEditForm.get(field)) ?? '';
  }

  protected iniciarEditarCuenta(c: CuentaBancaria): void {
    this.cuentaEditForm.setValue({
      bancoCodigo:    c.bancoCodigo,
      tipo:           c.tipo,
      numeroCuenta:   c.numeroCuenta,
      titular:        c.titular,
      codigoContable: c.codigoContable ?? '',
      exentaGmf:      c.exentaGmf,
    });
    this.editandoCuentaId.set(c.id);
  }

  protected iniciarNuevaCuenta(): void {
    this.cuentaEditForm.reset({ exentaGmf: false });
    this.editandoCuentaId.set('nueva');
  }

  protected cancelarCuentaEdicion(): void {
    this.editandoCuentaId.set(null);
  }

  protected guardarCuentaEdicion(cuentaId: number): void {
    if (this.cuentaEditForm.invalid) { this.cuentaEditForm.markAllAsTouched(); return; }
    const v = this.cuentaEditForm.value as any;
    this.savingCuenta.set(true);
    this.svc.editarCuenta(this.empresaId!, cuentaId, v).subscribe({
      next: () => {
        this.savingCuenta.set(false);
        this.editandoCuentaId.set(null);
        this.toast.success('Cuenta actualizada exitosamente');
        this.store.cargarDetalle(this.empresaId!);
      },
      error: (err) => {
        this.savingCuenta.set(false);
        this.toast.error(err.error?.message ?? 'Error al actualizar la cuenta');
      },
    });
  }

  protected guardarNuevaCuenta(): void {
    if (this.cuentaEditForm.invalid) { this.cuentaEditForm.markAllAsTouched(); return; }
    const v = this.cuentaEditForm.value as any;
    this.savingCuenta.set(true);
    this.svc.agregarCuenta(this.empresaId!, v).subscribe({
      next: () => {
        this.savingCuenta.set(false);
        this.editandoCuentaId.set(null);
        this.toast.success('Cuenta agregada exitosamente');
        this.store.cargarDetalle(this.empresaId!);
      },
      error: (err) => {
        this.savingCuenta.set(false);
        this.toast.error(err.error?.message ?? 'Error al agregar la cuenta');
      },
    });
  }

  protected desactivarCuenta(cuentaId: number): void {
    this.desactivandoId.set(cuentaId);
    this.svc.desactivarCuenta(this.empresaId!, cuentaId).subscribe({
      next: () => {
        this.desactivandoId.set(null);
        this.toast.success('Cuenta desactivada');
        this.store.cargarDetalle(this.empresaId!);
      },
      error: () => {
        this.desactivandoId.set(null);
        this.toast.error('Error al desactivar la cuenta');
      },
    });
  }

  protected volver(): void {
    this.router.navigate(['/configuracion/empresas']);
  }
}
