<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-icon name="smartphone" size="32px" class="q-mr-sm" />
        <q-toolbar-title>
          Taller Don Efraín
          <div class="text-caption">Servicio técnico de celulares y tablets</div>
        </q-toolbar-title>
        
        <q-btn
          flat
          round
          dense
          icon="filter_list"
          class="q-mr-xs"
          @click="mostrarFiltros = !mostrarFiltros"
        >
          <q-tooltip>Mostrar / Ocultar Filtros</q-tooltip>
        </q-btn>

        <!-- Botón para vaciar todos los registros -->
        <q-btn
          flat
          round
          dense
          icon="delete_sweep"
          color="white"
          @click="limpiarTodosLosServicios"
        >
          <q-tooltip>Vaciar todos los registros de prueba</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="bg-grey-2 q-pa-md">

        <!-- Resumen rápido -->
        <div class="row q-col-gutter-sm q-mb-md items-stretch">
          <div class="col-4">
            <q-card class="card-resumen">
              <div class="text-h6 text-primary">{{ servicios.length }}</div>
              <div class="text-caption text-grey-8">Total Registros</div>
            </q-card>
          </div>
          <div class="col-4">
            <q-card class="card-resumen bg-red-1">
              <div class="text-h6 text-negative">{{ contarPendientesPago() }}</div>
              <div class="text-caption text-grey-8">Pago Pendiente</div>
            </q-card>
          </div>
          <div class="col-4">
            <q-card class="card-resumen bg-orange-1">
              <div class="text-h6 text-orange-9">{{ contarSinEntregar() }}</div>
              <div class="text-caption text-grey-8">Sin Entregar</div>
            </q-card>
          </div>
        </div>

        <!-- Filtros -->
        <div v-show="mostrarFiltros" class="q-mb-md">
          <q-card class="q-pa-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="busqueda"
                  dense
                  outlined
                  clearable
                  label="Buscar por cliente, marca o modelo"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="filtroEstadoEquipo"
                  dense
                  outlined
                  clearable
                  emit-value
                  map-options
                  :options="opcionesEstadoEquipoFiltro"
                  label="Filtrar por estado del equipo"
                />
              </div>
            </div>
          </q-card>
        </div>

        <!-- Listado de servicios -->
        <div class="q-pb-xl">
          <div v-if="serviciosFiltrados().length === 0" class="text-center text-grey-6 q-pa-xl">
            <q-icon name="inbox" size="72px" />
            <div class="text-subtitle1 q-mt-sm">No hay servicios registrados</div>
            <div class="text-caption">Toca el botón "+" para registrar el primer equipo</div>
          </div>

          <div v-else class="row q-col-gutter-md items-stretch">
            <div
              v-for="servicio in serviciosFiltrados()"
              :key="servicio.id"
              class="col-12 col-sm-6 col-md-4 flex"
            >
              <q-card :class="claseTarjeta(servicio)" class="tarjeta-servicio fit shadow-2">
                <q-card-section>
                  <div class="row items-center no-wrap">
                    <div class="col">
                      <div class="text-subtitle1 text-weight-bold">
                        {{ servicio.cliente || '(Cliente sin nombre)' }}
                      </div>
                      <div class="text-subtitle2 text-primary">
                        <q-icon name="phone_android" size="18px" />
                        {{ obtenerNombreEquipo(servicio) }}
                      </div>
                    </div>
                    <div class="col-auto">
                      <q-chip
                        dense
                        :color="colorChipEstado(servicio.estadoEquipo)"
                        text-color="white"
                        class="text-weight-bold"
                      >
                        {{ servicio.estadoEquipo || 'recibido' }}
                      </q-chip>
                    </div>
                  </div>

                  <div class="q-mt-sm">
                    <q-badge outline color="primary">{{ servicio.tipoReparacion || 'General' }}</q-badge>
                    <q-badge v-if="servicio.tecnico" outline color="secondary" class="q-ml-xs">{{ servicio.tecnico }}</q-badge>
                  </div>

                  <div class="q-mt-sm row items-center justify-between">
                    <div class="text-h6">${{ formatearPrecio(servicio.precio) }}</div>
                    <div>
                      <q-badge v-if="servicio.estadoPago === 'pagado'" color="positive">Pagado</q-badge>
                      <q-badge v-else-if="servicio.estadoPago === 'abono'" color="warning" text-color="black">Abono</q-badge>
                      <q-badge v-else color="negative">Pendiente</q-badge>
                    </div>
                  </div>

                  <!-- Detalle de abono -->
                  <div v-if="servicio.estadoPago === 'abono' && servicio.montoAbono" class="q-mt-xs bg-amber-1 q-pa-xs rounded-borders">
                    <div class="row justify-between text-caption text-weight-bold">
                      <span class="text-positive">
                        <q-icon name="payments" size="14px" /> Abonado: ${{ formatearPrecio(servicio.montoAbono) }}
                      </span>
                      <span class="text-negative">
                        <q-icon name="money_off" size="14px" /> Falta: ${{ formatearPrecio((servicio.precio || 0) - servicio.montoAbono) }}
                      </span>
                    </div>
                  </div>

                  <div class="text-caption text-grey-7 q-mt-sm">
                    <q-icon name="payments" size="16px" /> {{ servicio.metodoPago || 'Sin pago' }}
                    &nbsp;•&nbsp;
                    <q-icon name="event" size="16px" /> {{ servicio.fechaRecepcion }} {{ servicio.horaRecepcion }}
                  </div>

                  <!-- Calificación del cliente solo si ya fue entregado -->
                  <div v-if="servicio.estadoEquipo === 'entregado'" class="q-mt-xs bg-grey-3 q-pa-xs rounded-borders">
                    <div class="text-caption text-weight-bold text-grey-9">Calificación del cliente:</div>
                    <q-rating
                      v-model="servicio.calificacion"
                      readonly
                      size="20px"
                      color="amber"
                      icon="star"
                    />
                  </div>

                  <div v-if="servicio.observaciones" class="text-caption text-grey-8 q-mt-xs">
                    <q-icon name="sticky_note_2" size="16px" /> {{ servicio.observaciones }}
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-actions align="between">
                  <!-- Botón de entregar si aún no está entregado -->
                  <q-btn
                    v-if="servicio.estadoEquipo !== 'entregado'"
                    flat
                    dense
                    size="sm"
                    :color="esPagoPendiente(servicio) ? 'orange-9' : 'positive'"
                    :icon="esPagoPendiente(servicio) ? 'lock' : 'check_circle'"
                    :label="esPagoPendiente(servicio) ? 'Pago pendiente' : 'Entregar'"
                    @click="iniciarEntrega(servicio)"
                  >
                    <q-tooltip v-if="esPagoPendiente(servicio)">
                      No se puede entregar: El equipo tiene un pago pendiente o saldo por pagar
                    </q-tooltip>
                  </q-btn>
                  <div v-else class="text-caption text-positive text-weight-bold q-px-xs">
                    <q-icon name="lock" /> Entregado (Finalizado)
                  </div>

                  <div>
                    <q-btn
                      flat
                      dense
                      round
                      icon="edit"
                      color="primary"
                      :disable="servicio.estadoEquipo === 'entregado'"
                      @click="abrirEdicion(servicio)"
                    >
                      <q-tooltip v-if="servicio.estadoEquipo === 'entregado'">
                        Un registro entregado ya no se puede editar
                      </q-tooltip>
                      <q-tooltip v-else>
                        Editar servicio
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      :disable="servicio.estadoEquipo === 'entregado'"
                      @click="confirmarEliminar(servicio)"
                    >
                      <q-tooltip v-if="servicio.estadoEquipo === 'entregado'">
                        Un registro entregado ya no se puede eliminar
                      </q-tooltip>
                      <q-tooltip v-else>
                        Eliminar registro
                      </q-tooltip>
                    </q-btn>
                  </div>
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Botón flotante para agregar -->
        <q-page-sticky position="bottom-right" :offset="[20, 20]">
          <q-btn fab icon="add" color="primary" @click="abrirNuevo" />
        </q-page-sticky>

        <!-- Modal Formulario (Crear / Editar) -->
        <q-dialog v-model="mostrarFormulario" persistent>
          <q-card style="width: 520px; max-width: 95vw;">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">
                <span v-if="modoEdicion">Editar servicio</span>
                <span v-else>Nuevo servicio</span>
              </div>
            </q-card-section>

            <q-card-section style="max-height: 70vh" class="scroll">
              <q-form ref="formularioRef" class="q-gutter-md">
                
                <!-- Cliente -->
                <q-input
                  v-model="formulario.cliente"
                  outlined
                  dense
                  label="Nombre del cliente"
                />

                <!-- Marca (Select) y Modelo (Input) -->
                <div class="row q-col-gutter-sm">
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="formulario.marca"
                      outlined
                      dense
                      label="Marca del equipo"
                      :options="opcionesMarca"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <q-input
                      v-model="formulario.modelo"
                      outlined
                      dense
                      label="Modelo del equipo"
                      hint="Ej: Galaxy A15, iPhone 13..."
                    />
                  </div>
                </div>

                <!-- Tipo de Reparación -->
                <q-select
                  v-model="formulario.tipoReparacion"
                  outlined
                  dense
                  label="Tipo de reparación"
                  :options="opcionesTipoReparacion"
                />

                <q-input
                  v-if="formulario.tipoReparacion === 'Otros'"
                  v-model="formulario.otroTipoReparacion"
                  outlined
                  dense
                  label="Especifica la reparación"
                />

                <!-- Técnico -->
                <q-select
                  v-model="formulario.tecnico"
                  outlined
                  dense
                  label="Técnico asignado"
                  :options="opcionesTecnicos"
                />

                <!-- Fecha y Hora automáticas no editables -->
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-input
                      v-model="formulario.fechaRecepcion"
                      outlined
                      dense
                      disable
                      label="Fecha de recepción"
                      hint="Automática del sistema"
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      v-model="formulario.horaRecepcion"
                      outlined
                      dense
                      disable
                      label="Hora de recepción"
                      hint="Automática del sistema"
                    />
                  </div>
                </div>

                <!-- Precio -->
                <q-input
                  v-model.number="formulario.precio"
                  outlined
                  dense
                  type="number"
                  prefix="$"
                  label="Precio del servicio"
                />

                <!-- Método de Pago y Estado del Pago -->
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-select
                      v-model="formulario.metodoPago"
                      outlined
                      dense
                      label="Método de pago"
                      :options="opcionesMetodoPago"
                    />
                  </div>
                  <div class="col-6">
                    <q-select
                      v-model="formulario.estadoPago"
                      outlined
                      dense
                      emit-value
                      map-options
                      label="Estado del pago"
                      :options="opcionesEstadoPago"
                    />
                  </div>
                </div>

                <!-- Caja para ingresar valor del Abono -->
                <div v-if="formulario.estadoPago === 'abono'" class="q-pa-sm bg-amber-1 border-amber rounded-borders">
                  <q-input
                    v-model.number="formulario.montoAbono"
                    outlined
                    dense
                    type="number"
                    prefix="$"
                    label="Valor / Monto abonado"
                    hint="Ingrese la cantidad entregada como abono"
                  />
                  <div v-if="formulario.precio && formulario.montoAbono !== null" class="row justify-between text-caption text-weight-bold q-mt-xs">
                    <span>Abonado: ${{ formatearPrecio(formulario.montoAbono) }}</span>
                    <span :class="(formulario.precio - formulario.montoAbono) > 0 ? 'text-negative' : 'text-positive'">
                      Saldo restante: ${{ formatearPrecio((formulario.precio || 0) - (formulario.montoAbono || 0)) }}
                    </span>
                  </div>
                </div>

                <!-- Estado del Equipo (Inicialmente Recibido en nuevo) -->
                <div>
                  <q-select
                    v-model="formulario.estadoEquipo"
                    outlined
                    dense
                    emit-value
                    map-options
                    label="Estado del equipo"
                    :options="opcionesEstadoEquipoFiltradas"
                    :disable="!modoEdicion"
                  />
                  <div v-if="!modoEdicion" class="text-caption text-grey-7 q-mt-xs">
                    El estado inicial de todo registro nuevo es <b>Recibido</b>.
                  </div>
                  <div v-else-if="esPagoPendiente(formulario)" class="text-caption text-negative q-mt-xs">
                    <q-icon name="lock" size="14px" /> La opción &quot;Entregado&quot; está deshabilitada mientras exista un pago pendiente o saldo sin abonar.
                  </div>
                </div>

                <!-- Observaciones -->
                <q-input
                  v-model="formulario.observaciones"
                  outlined
                  dense
                  type="textarea"
                  autogrow
                  label="Observaciones (opcional)"
                />
              </q-form>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat label="Cancelar" color="grey-8" v-close-popup @click="cerrarFormulario" />
              <q-btn unelevated label="Guardar" color="primary" @click="guardarServicio" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Modal de Entrega y Calificación del Cliente -->
        <q-dialog v-model="mostrarModalEntrega" persistent>
          <q-card style="width: 440px; max-width: 95vw;">
            <q-card-section class="bg-positive text-white">
              <div class="text-h6 row items-center">
                <q-icon name="check_circle" class="q-mr-sm" size="28px" />
                Entregar Equipo al Cliente
              </div>
            </q-card-section>

            <q-card-section class="q-pa-md">
              <div class="text-subtitle1 text-weight-bold">
                {{ servicioAEntregar?.cliente }} - {{ obtenerNombreEquipo(servicioAEntregar) }}
              </div>

              <div class="q-my-md">
                <div class="text-subtitle2 text-grey-9 q-mb-xs">Calificación del cliente (1 a 5 estrellas):</div>
                <div class="row justify-center q-py-sm bg-grey-2 rounded-borders">
                  <q-rating
                    v-model="calificacionEntrega"
                    size="36px"
                    color="amber"
                    icon="star_border"
                    icon-selected="star"
                  />
                </div>
              </div>

              <div class="text-caption text-grey-7">
                <q-icon name="info" color="info" /> Al confirmar la entrega, el registro quedará finalizado.
              </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
              <q-btn unelevated label="Finalizar y Entregar" color="positive" icon="done" @click="confirmarEntrega" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Modal de Confirmación de Eliminación -->
        <q-dialog v-model="mostrarConfirmacion">
          <q-card style="width: 420px; max-width: 95vw;">
            <q-card-section class="row items-center">
              <q-icon name="warning" color="negative" size="36px" class="q-mr-sm" />
              <div class="text-subtitle1">
                ¿Eliminar el registro de <b>{{ servicioAEliminar?.cliente || 'este cliente' }}</b>?
              </div>
            </q-card-section>
            <q-card-section class="text-body2 text-grey-8">
              <div v-if="servicioAEliminar?.estadoEquipo === 'entregado'" class="text-negative text-weight-bold q-mb-xs">
                <q-icon name="report_problem" /> Nota: Este registro figura como ENTREGADO.
              </div>
              Esta acción eliminará el servicio de forma permanente.
            </q-card-section>
            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
              <q-btn unelevated label="Eliminar" color="negative" icon="delete" v-close-popup @click="eliminarServicio" />
            </q-card-actions>
          </q-card>
        </q-dialog>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Persistencia
const servicios = useLocalStorage('taller-efrain-servicios', [])

// Opciones
const opcionesMarca = [
  'Samsung',
  'Apple',
  'Xiaomi',
  'Motorola',
  'Huawei',
  'Oppo',
  'Vivo',
  'Realme',
  'Infinix',
  'Honor',
  'ZTE',
  'Nokia',
  'Alcatel',
  'Lenovo',
  'iPad / Tablet',
  'Otra'
]

const opcionesTipoReparacion = [
  'Cambio de pantalla',
  'Cambio de batería',
  'Cambio de pin de carga',
  'Liberación',
  'Mantenimiento de software',
  'Cambio de flex',
  'Otros'
]

const opcionesTecnicos = ['Don Efraín', 'Camila Torres', 'Jhonatan Ruiz']

const opcionesMetodoPago = ['Efectivo', 'Transferencia', 'Tarjeta']

const opcionesEstadoPago = [
  { label: 'Pagado', value: 'pagado' },
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Abono', value: 'abono' }
]

const opcionesEstadoEquipo = [
  { label: 'Recibido', value: 'recibido' },
  { label: 'En reparación', value: 'en reparación' },
  { label: 'Listo para entregar', value: 'listo para entregar' },
  { label: 'Entregado', value: 'entregado' }
]

const opcionesEstadoEquipoFiltro = opcionesEstadoEquipo

// Estado de UI
const mostrarFiltros = ref(false)
const busqueda = ref('')
const filtroEstadoEquipo = ref(null)

const mostrarFormulario = ref(false)
const modoEdicion = ref(false)
const formularioRef = ref(null)
const idEnEdicion = ref(null)

const mostrarConfirmacion = ref(false)
const servicioAEliminar = ref(null)

const mostrarModalEntrega = ref(false)
const servicioAEntregar = ref(null)
const calificacionEntrega = ref(5)

function formularioVacio() {
  return {
    cliente: '',
    marca: 'Samsung',
    modelo: '',
    equipo: '',
    tipoReparacion: '',
    tecnico: '',
    fechaRecepcion: fechaHoy(),
    horaRecepcion: horaAhora(),
    precio: null,
    metodoPago: '',
    estadoPago: 'pendiente',
    estadoEquipo: 'recibido',
    montoAbono: null,
    otroTipoReparacion: '',
    calificacion: 0,
    observaciones: ''
  }
}

const formulario = ref(formularioVacio())

// Función para determinar si el pago está incompleto o pendiente
function esPagoPendiente(s) {
  if (!s) return false
  if (s.estadoPago === 'pendiente' || !s.estadoPago) return true
  if (s.estadoPago === 'abono') {
    const precio = Number(s.precio || 0)
    const abono = Number(s.montoAbono || 0)
    return (precio - abono) > 0
  }
  return false
}

// Opciones de estado filtradas dinámicamente según el pago
const opcionesEstadoEquipoFiltradas = computed(() => {
  const pagoIncompleto = esPagoPendiente(formulario.value)
  return opcionesEstadoEquipo.map(op => ({
    ...op,
    disable: op.value === 'entregado' && pagoIncompleto
  }))
})

// Si cambia tipo de reparación distinto de 'Otros', limpia la especificación
watch(
  () => formulario.value.tipoReparacion,
  (nuevo) => {
    if (nuevo !== 'Otros') formulario.value.otroTipoReparacion = ''
  }
)

// Utilidades de fecha
function fechaHoy() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return hoy.getFullYear() + '-' + mes + '-' + dia
}

function horaAhora() {
  const ahora = new Date()
  const horas = String(ahora.getHours()).padStart(2, '0')
  const minutos = String(ahora.getMinutes()).padStart(2, '0')
  return horas + ':' + minutos
}

function formatearPrecio(precio) {
  return Number(precio || 0).toLocaleString('es-CO')
}

function obtenerNombreEquipo(s) {
  if (!s) return ''
  if (s.marca || s.modelo) {
    return `${s.marca || ''} ${s.modelo || ''}`.trim()
  }
  return s.equipo || 'Equipo sin especificar'
}

// Abrir modales
function abrirNuevo() {
  modoEdicion.value = false
  idEnEdicion.value = null
  formulario.value = formularioVacio()
  mostrarFormulario.value = true
}

function abrirEdicion(servicio) {
  if (servicio.estadoEquipo === 'entregado') {
    $q.notify({
      type: 'warning',
      message: 'Un registro en estado entregado no se puede editar.'
    })
    return
  }
  modoEdicion.value = true
  idEnEdicion.value = servicio.id
  formulario.value = {
    cliente: servicio.cliente || '',
    marca: servicio.marca || 'Samsung',
    modelo: servicio.modelo || '',
    equipo: servicio.equipo || '',
    tipoReparacion: servicio.tipoReparacion || '',
    tecnico: servicio.tecnico || '',
    fechaRecepcion: servicio.fechaRecepcion || fechaHoy(),
    horaRecepcion: servicio.horaRecepcion || horaAhora(),
    precio: servicio.precio,
    metodoPago: servicio.metodoPago || '',
    estadoPago: servicio.estadoPago || 'pendiente',
    estadoEquipo: servicio.estadoEquipo || 'recibido',
    montoAbono: servicio.montoAbono !== undefined ? servicio.montoAbono : null,
    otroTipoReparacion: servicio.otroTipoReparacion || '',
    calificacion: servicio.calificacion || 0,
    observaciones: servicio.observaciones || ''
  }
  mostrarFormulario.value = true
}

function cerrarFormulario() {
  mostrarFormulario.value = false
}

// Guardar (crear o actualizar)
function guardarServicio() {
  if (formulario.value.estadoEquipo === 'entregado' && esPagoPendiente(formulario.value)) {
    $q.notify({
      type: 'warning',
      icon: 'lock',
      message: 'No se puede marcar el equipo como Entregado mientras el pago esté pendiente o con abono incompleto.'
    })
    return
  }

  if (modoEdicion.value) {
    const indice = servicios.value.findIndex(s => s.id === idEnEdicion.value)
    if (indice !== -1) {
      servicios.value[indice] = {
        id: idEnEdicion.value,
        ...formulario.value
      }
      $q.notify({
        type: 'positive',
        message: 'Servicio actualizado correctamente.'
      })
    }
  } else {
    servicios.value.unshift({
      id: Date.now() + '-' + Math.floor(Math.random() * 1000),
      ...formulario.value
    })
    $q.notify({
      type: 'positive',
      message: 'Nuevo servicio registrado con éxito.'
    })
  }

  mostrarFormulario.value = false
}

// Entrega y calificación
function iniciarEntrega(servicio) {
  if (servicio.estadoEquipo === 'entregado') return

  if (esPagoPendiente(servicio)) {
    const falta = servicio.estadoPago === 'abono'
      ? ` (Falta abonar: $${formatearPrecio((servicio.precio || 0) - (servicio.montoAbono || 0))})`
      : ''
    $q.notify({
      type: 'warning',
      icon: 'lock',
      message: `No se puede entregar el equipo mientras el pago esté pendiente${falta}. Por favor registre el pago completo antes de entregar.`,
      timeout: 5000
    })
    return
  }

  servicioAEntregar.value = servicio
  calificacionEntrega.value = servicio.calificacion || 5
  mostrarModalEntrega.value = true
}

function confirmarEntrega() {
  if (!servicioAEntregar.value) return

  if (esPagoPendiente(servicioAEntregar.value)) {
    $q.notify({
      type: 'warning',
      icon: 'lock',
      message: 'No se puede entregar el equipo mientras tenga un pago pendiente.'
    })
    return
  }

  const indice = servicios.value.findIndex(s => s.id === servicioAEntregar.value.id)
  if (indice !== -1) {
    servicios.value[indice].estadoEquipo = 'entregado'
    servicios.value[indice].calificacion = calificacionEntrega.value
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: `El servicio de ${servicioAEntregar.value.cliente} ha sido entregado y finalizado.`
    })
  }
  mostrarModalEntrega.value = false
  servicioAEntregar.value = null
}

// Eliminar
function confirmarEliminar(servicio) {
  if (servicio.estadoEquipo === 'entregado') {
    $q.notify({
      type: 'warning',
      icon: 'lock',
      message: 'Un registro en estado entregado ya no se puede ni editar ni eliminar.'
    })
    return
  }
  servicioAEliminar.value = servicio
  mostrarConfirmacion.value = true
}

function eliminarServicio() {
  if (!servicioAEliminar.value) return
  servicios.value = servicios.value.filter(s => s.id !== servicioAEliminar.value.id)
  $q.notify({
    type: 'negative',
    icon: 'delete',
    message: 'Registro eliminado con éxito.'
  })
  servicioAEliminar.value = null
}

// Vaciar todos los registros
function limpiarTodosLosServicios() {
  $q.dialog({
    title: 'Vaciar todos los registros',
    message: '¿Estás seguro de que deseas eliminar TODOS los servicios registrados de la lista?',
    cancel: {
      label: 'Cancelar',
      flat: true,
      color: 'grey-8'
    },
    ok: {
      label: 'Sí, vaciar lista',
      color: 'negative',
      unelevated: true
    },
    persistent: true
  }).onOk(() => {
    servicios.value = []
    try {
      localStorage.removeItem('taller-efrain-servicios')
    } catch (e) {}
    $q.notify({
      type: 'positive',
      icon: 'delete_sweep',
      message: 'Se han eliminado todos los registros correctamente.'
    })
  })
}

// Filtros
function serviciosFiltrados() {
  return servicios.value.filter((s) => {
    let coincideTexto = true
    if (busqueda.value && busqueda.value.trim() !== '') {
      const texto = busqueda.value.toLowerCase()
      const cliente = (s.cliente || '').toLowerCase()
      const marca = (s.marca || '').toLowerCase()
      const modelo = (s.modelo || '').toLowerCase()
      const equipo = (s.equipo || '').toLowerCase()
      coincideTexto =
        cliente.includes(texto) ||
        marca.includes(texto) ||
        modelo.includes(texto) ||
        equipo.includes(texto)
    }

    let coincideEstado = true
    if (filtroEstadoEquipo.value) {
      coincideEstado = s.estadoEquipo === filtroEstadoEquipo.value
    }

    return coincideTexto && coincideEstado
  })
}

function contarPendientesPago() {
  return servicios.value.filter(s => s.estadoPago === 'pendiente' || s.estadoPago === 'abono').length
}

function contarSinEntregar() {
  return servicios.value.filter(s => s.estadoEquipo !== 'entregado').length
}

function colorChipEstado(estado) {
  if (estado === 'recibido') return 'blue-grey'
  if (estado === 'en reparación') return 'orange-8'
  if (estado === 'listo para entregar') return 'info'
  if (estado === 'entregado') return 'positive'
  return 'grey'
}

function claseTarjeta(servicio) {
  if (servicio.estadoPago === 'pendiente') return 'card-pendiente'
  if (servicio.estadoPago === 'abono') return 'card-abono'
  if (servicio.estadoEquipo !== 'entregado') return 'card-sin-entregar'
  return 'card-normal'
}
</script>

<style scoped>
.card-resumen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  width: 100%;
  text-align: center;
}

.tarjeta-servicio {
  border-left: 6px solid transparent;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.tarjeta-servicio:hover {
  transform: translateY(-2px);
}

.card-pendiente {
  border-left-color: #c10015;
  background-color: #fff5f5;
}

.card-abono {
  border-left-color: #f2c037;
  background-color: #fffbf0;
}

.card-sin-entregar {
  border-left-color: #757575;
}

.card-normal {
  border-left-color: #21ba45;
}
</style>
