<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-icon name="smartphone" size="28px" class="q-mr-sm" />
        <q-toolbar-title>
          Taller Don Efraín
          <div class="text-caption">Servicio técnico de celulares y tablets</div>
        </q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="filter_list"
          @click="mostrarFiltros = !mostrarFiltros"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="bg-grey-2">

        <!-- Resumen rápido -->
        <div class="row q-col-gutter-sm q-pa-md items-stretch">
          <div class="col-4">
            <q-card class="card-resumen">
              <div class="text-h6">{{ servicios.length }}</div>
              <div class="text-caption text-grey-8">Total</div>
            </q-card>
          </div>
          <div class="col-4">
            <q-card class="card-resumen bg-red-1">
              <div class="text-h6 text-negative">{{ contarPendientesPago() }}</div>
              <div class="text-caption text-grey-8">Pago pendiente</div>
            </q-card>
          </div>
          <div class="col-4">
            <q-card class="card-resumen bg-orange-1">
              <div class="text-h6 text-orange-9">{{ contarSinEntregar() }}</div>
              <div class="text-caption text-grey-8">Sin entregar</div>
            </q-card>
          </div>
        </div>

        <!-- Filtros -->
        <div v-show="mostrarFiltros" class="q-px-md q-pb-sm">
          <q-card class="q-pa-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="busqueda"
                  dense
                  outlined
                  clearable
                  label="Buscar por cliente o equipo"
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

        <!-- Listado -->
        <div class="q-px-md q-pb-xl">
          <div v-if="serviciosFiltrados().length === 0" class="text-center text-grey-6 q-pa-xl">
            <q-icon name="inbox" size="64px" />
            <div class="text-subtitle1 q-mt-sm">No hay servicios registrados todavía</div>
            <div class="text-caption">Toca el botón "+" para registrar el primer equipo</div>
          </div>

          <div v-else class="row q-col-gutter-md items-stretch">
            <div
              v-for="servicio in serviciosFiltrados()"
              :key="servicio.id"
              class="col-12 col-sm-6 col-md-4 flex"
            >
              <q-card :class="claseTarjeta(servicio)" class="tarjeta-servicio fit">
                <q-card-section>
                  <div class="row items-center no-wrap">
                    <div class="col">
                      <div class="text-subtitle1 text-weight-bold">{{ servicio.cliente }}</div>
                      <div class="text-caption text-grey-8">{{ servicio.equipo }}</div>
                    </div>
                    <div class="col-auto">
                      <q-icon
                        v-if="servicio.estadoEquipo === 'recibido'"
                        name="move_to_inbox"
                        size="28px"
                        color="blue-grey"
                      />
                      <q-icon
                        v-else-if="servicio.estadoEquipo === 'en reparación'"
                        name="build"
                        size="28px"
                        color="orange"
                      />
                      <q-icon
                        v-else-if="servicio.estadoEquipo === 'listo para entregar'"
                        name="inventory_2"
                        size="28px"
                        color="info"
                      />
                      <q-icon
                        v-else-if="servicio.estadoEquipo === 'entregado'"
                        name="check_circle"
                        size="28px"
                        color="positive"
                      />
                    </div>
                  </div>

                  <div class="q-mt-sm">
                    <q-badge outline color="primary">{{ servicio.tipoReparacion }}</q-badge>
                    <q-badge outline color="secondary" class="q-ml-xs">{{ servicio.tecnico }}</q-badge>
                  </div>

                  <div class="q-mt-sm row items-center justify-between">
                    <div class="text-h6">${{ formatearPrecio(servicio.precio) }}</div>
                    <div>
                      <q-badge v-if="servicio.estadoPago === 'pagado'" color="positive">Pagado</q-badge>
                      <q-badge v-else-if="servicio.estadoPago === 'abono'" color="warning" text-color="black">Abono</q-badge>
                      <q-badge v-else-if="servicio.estadoPago === 'pendiente'" color="negative">Pendiente</q-badge>
                    </div>
                  </div>

                  <!-- Detalle de abono en tarjeta -->
                  <div v-if="servicio.estadoPago === 'abono' && servicio.montoAbono" class="q-mt-xs">
                    <div class="row justify-between text-caption">
                      <span class="text-positive">
                        <q-icon name="payments" size="13px" /> Abonado: ${{ formatearPrecio(servicio.montoAbono) }}
                      </span>
                      <span class="text-negative">
                        <q-icon name="money_off" size="13px" /> Falta: ${{ formatearPrecio(servicio.precio - servicio.montoAbono) }}
                      </span>
                    </div>
                  </div>

                  <div class="text-caption text-grey-7 q-mt-xs">
                    <q-icon name="payments" size="14px" /> {{ servicio.metodoPago }}
                    &nbsp;•&nbsp;
                    <q-icon name="event" size="14px" /> {{ servicio.fechaRecepcion }} {{ servicio.horaRecepcion }}
                  </div>

                  <div v-if="servicio.estadoEquipo !== 'entregado'" class="q-mt-xs">
                    <q-badge color="grey-8">SIN ENTREGAR</q-badge>
                  </div>

                  <div v-if="servicio.calificacion && servicio.estadoEquipo === 'entregado'" class="q-mt-xs">
                    <q-rating
                      v-model="servicio.calificacion"
                      readonly
                      size="18px"
                      color="amber"
                      icon="star"
                    />
                  </div>

                  <div v-if="servicio.observaciones" class="text-caption text-grey-8 q-mt-xs">
                    <q-icon name="sticky_note_2" size="14px" /> {{ servicio.observaciones }}
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-actions align="right">
                  <q-btn flat dense round icon="edit" color="primary" @click="abrirEdicion(servicio)" />
                  <q-btn flat dense round icon="delete" color="negative" @click="confirmarEliminar(servicio)" />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Botón flotante para agregar -->
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
          <q-btn fab icon="add" color="primary" @click="abrirNuevo" />
        </q-page-sticky>

        <!-- Modal formulario (crear / editar) -->
        <q-dialog v-model="mostrarFormulario" persistent>
          <q-card style="width: 500px; max-width: 95vw;">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">
                <span v-if="modoEdicion">Editar servicio</span>
                <span v-else>Nuevo servicio</span>
              </div>
            </q-card-section>

            <q-card-section style="max-height: 65vh" class="scroll">
              <q-form ref="formularioRef" class="q-gutter-md">
                <q-input
                  v-model="formulario.cliente"
                  outlined
                  dense
                  label="Nombre del cliente *"
                  :rules="[val => (val && val.trim().length >= 3) || 'Ingresa el nombre del cliente (mín. 3 letras)']"
                />

                <q-input
                  v-model="formulario.equipo"
                  outlined
                  dense
                  label="Marca y modelo del equipo *"
                  hint="Ej: iPhone 12, Samsung A15..."
                  :rules="[val => (val && val.trim().length >= 3) || 'Ingresa la marca y el modelo']"
                />

                <q-select
                  v-model="formulario.tipoReparacion"
                  outlined
                  dense
                  label="Tipo de reparación *"
                  :options="opcionesTipoReparacion"
                  :rules="[val => !!val || 'Selecciona el tipo de reparación']"
                />

                <!-- Especificación cuando se elige 'Otros' -->
                <q-input
                  v-if="formulario.tipoReparacion === 'Otros'"
                  v-model="formulario.otroTipoReparacion"
                  outlined
                  dense
                  label="Especifica la reparación *"
                  hint="Ej: cambio de cámara, cambio de micrófono..."
                  :rules="[val => (val && val.trim().length >= 3) || 'Describe la reparación (mín. 3 caracteres)']"
                />


                <q-select
                  v-model="formulario.tecnico"
                  outlined
                  dense
                  label="Técnico que atendió *"
                  :options="opcionesTecnicos"
                  :rules="[val => !!val || 'Selecciona el técnico']"
                />

                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-input
                      v-model="formulario.fechaRecepcion"
                      outlined
                      dense
                      type="date"
                      label="Fecha de recepción *"
                      :rules="[val => !!val || 'Requerido']"
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      v-model="formulario.horaRecepcion"
                      outlined
                      dense
                      type="time"
                      label="Hora de recepción *"
                      :rules="[val => !!val || 'Requerido']"
                    />
                  </div>
                </div>

                <q-input
                  v-model.number="formulario.precio"
                  outlined
                  dense
                  type="number"
                  prefix="$"
                  label="Precio cobrado *"
                  :rules="[val => (val !== null && val !== '' && val >= 0) || 'Ingresa un precio válido']"
                />

                <q-select
                  v-model="formulario.metodoPago"
                  outlined
                  dense
                  label="Método de pago *"
                  :options="opcionesMetodoPago"
                  :rules="[val => !!val || 'Selecciona el método de pago']"
                />

                <q-select
                  v-model="formulario.estadoPago"
                  outlined
                  dense
                  emit-value
                  map-options
                  label="Estado del pago *"
                  :options="opcionesEstadoPago"
                  :rules="[val => !!val || 'Selecciona el estado del pago']"
                />

                <!-- Campo monto abonado: visible solo cuando estadoPago = 'abono' -->
                <q-input
                  v-if="formulario.estadoPago === 'abono'"
                  v-model.number="formulario.montoAbono"
                  outlined
                  dense
                  type="number"
                  prefix="$"
                  label="Monto abonado *"
                  :rules="[
                    val => (val !== null && val !== '' && val > 0) || 'Ingresa el monto abonado',
                    val => val < formulario.precio || 'El abono debe ser menor al total (si ya pagó todo, usa Pagado)'
                  ]"
                />

                <q-select
                  v-model="formulario.estadoEquipo"
                  outlined
                  dense
                  emit-value
                  map-options
                  label="Estado del equipo *"
                  :options="opcionesEstadoEquipoFiltradas"
                  :rules="[val => !!val || 'Selecciona el estado del equipo']"
                />
                <div
                  v-if="formulario.estadoPago === 'pendiente' || formulario.estadoPago === 'abono'"
                  class="text-caption text-negative q-mt-none"
                >
                  <q-icon name="lock" size="13px" /> La opción &quot;Entregado&quot; está bloqueada mientras haya pago pendiente.
                </div>

                <div v-if="formulario.estadoEquipo === 'entregado'">
                  <div class="text-caption text-grey-8 q-mb-xs">Calificación del cliente</div>
                  <q-rating
                    v-model="formulario.calificacion"
                    size="32px"
                    color="amber"
                    icon="star_border"
                    icon-selected="star"
                  />
                </div>
                <div v-else class="text-caption text-grey-6">
                  La calificación se registra cuando el cliente recoge el equipo.
                </div>

                <q-input
                  v-model="formulario.observaciones"
                  outlined
                  dense
                  type="textarea"
                  autogrow
                  label="Observaciones (opcional)"
                  hint="Ej: pantalla partida, no prende, respaldar fotos..."
                />
              </q-form>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat label="Cancelar" color="grey-8" v-close-popup @click="cerrarFormulario" />
              <q-btn unelevated label="Guardar" color="primary" @click="guardarServicio" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Modal confirmación de eliminación -->
        <q-dialog v-model="mostrarConfirmacion">
          <q-card style="width: 380px; max-width: 95vw;">
            <q-card-section class="row items-center">
              <q-icon name="warning" color="negative" size="32px" class="q-mr-sm" />
              <div class="text-subtitle1">
                ¿Eliminar el servicio de
                <b v-if="servicioAEliminar">{{ servicioAEliminar.cliente }}</b>?
              </div>
            </q-card-section>
            <q-card-section class="text-caption text-grey-7">
              Esta acción no se puede deshacer.
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
              <q-btn unelevated label="Eliminar" color="negative" v-close-popup @click="eliminarServicio" />
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

// ---------- Persistencia ----------
const servicios = useLocalStorage('taller-efrain-servicios', [])

// ---------- Opciones fijas ----------
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

// ---------- Estado de UI ----------
const mostrarFiltros = ref(false)
const busqueda = ref('')
const filtroEstadoEquipo = ref(null)

const mostrarFormulario = ref(false)
const modoEdicion = ref(false)
const formularioRef = ref(null)
const idEnEdicion = ref(null)

const mostrarConfirmacion = ref(false)
const servicioAEliminar = ref(null)

function formularioVacio() {
  return {
    cliente: '',
    equipo: '',
    tipoReparacion: '',
    tecnico: '',
    fechaRecepcion: fechaHoy(),
    horaRecepcion: horaAhora(),
    precio: null,
    metodoPago: '',
    estadoPago: '',
    estadoEquipo: 'recibido',
    montoAbono: null,
    otroTipoReparacion: '',
    calificacion: 0,
    observaciones: ''
  }
}

const formulario = ref(formularioVacio())

// Limpia el campo personalizado si se cambia el tipo de reparación a algo distinto de 'Otros'
watch(
  () => formulario.value.tipoReparacion,
  (nuevo) => {
    if (nuevo !== 'Otros') formulario.value.otroTipoReparacion = ''
  }
)

// Opciones de estado de equipo: deshabilita 'entregado' si hay pago pendiente o abono
const opcionesEstadoEquipoFiltradas = computed(() => {
  const pagoIncompleto =
    formulario.value.estadoPago === 'pendiente' ||
    formulario.value.estadoPago === 'abono'
  return opcionesEstadoEquipo.map(op => ({
    ...op,
    disable: op.value === 'entregado' && pagoIncompleto
  }))
})

// Si el pago cambia a pendiente/abono y el equipo estaba en 'entregado', lo resetea
watch(
  () => formulario.value.estadoPago,
  (nuevoPago) => {
    if (
      (nuevoPago === 'pendiente' || nuevoPago === 'abono') &&
      formulario.value.estadoEquipo === 'entregado'
    ) {
      formulario.value.estadoEquipo = 'listo para entregar'
    }
    if (nuevoPago !== 'abono') {
      formulario.value.montoAbono = null
    }
  }
)

// ---------- Utilidades de fecha ----------
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

// ---------- Abrir modales ----------
function abrirNuevo() {
  modoEdicion.value = false
  idEnEdicion.value = null
  formulario.value = formularioVacio()
  mostrarFormulario.value = true
}

function abrirEdicion(servicio) {
  modoEdicion.value = true
  idEnEdicion.value = servicio.id
  formulario.value = {
    cliente: servicio.cliente,
    equipo: servicio.equipo,
    tipoReparacion: servicio.tipoReparacion,
    tecnico: servicio.tecnico,
    fechaRecepcion: servicio.fechaRecepcion,
    horaRecepcion: servicio.horaRecepcion,
    precio: servicio.precio,
    metodoPago: servicio.metodoPago,
    estadoPago: servicio.estadoPago,
    estadoEquipo: servicio.estadoEquipo,
    montoAbono: servicio.montoAbono || null,
    otroTipoReparacion: servicio.otroTipoReparacion || '',
    calificacion: servicio.calificacion || 0,
    observaciones: servicio.observaciones
  }
  mostrarFormulario.value = true
}

function cerrarFormulario() {
  mostrarFormulario.value = false
}

// ---------- Guardar (crear o actualizar) ----------
function guardarServicio() {
  formularioRef.value.validate().then((esValido) => {
    if (!esValido) return

    if (modoEdicion.value) {
      const indice = servicios.value.findIndex(s => s.id === idEnEdicion.value)
      if (indice !== -1) {
        servicios.value[indice] = {
          id: idEnEdicion.value,
          ...formulario.value
        }
      }
    } else {
      servicios.value.unshift({
        id: Date.now() + '-' + Math.floor(Math.random() * 1000),
        ...formulario.value
      })
    }

    mostrarFormulario.value = false
  })
}

// ---------- Eliminar ----------
function confirmarEliminar(servicio) {
  servicioAEliminar.value = servicio
  mostrarConfirmacion.value = true
}

function eliminarServicio() {
  if (!servicioAEliminar.value) return
  servicios.value = servicios.value.filter(s => s.id !== servicioAEliminar.value.id)
  servicioAEliminar.value = null
}

// ---------- Filtros y listado ----------
function serviciosFiltrados() {
  return servicios.value.filter((s) => {
    let coincideTexto = true
    if (busqueda.value && busqueda.value.trim() !== '') {
      const texto = busqueda.value.toLowerCase()
      coincideTexto =
        s.cliente.toLowerCase().includes(texto) ||
        s.equipo.toLowerCase().includes(texto)
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

// ---------- Estilos condicionales de tarjeta ----------
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
  height: 72px;
  width: 100%;
  text-align: center;
}

.tarjeta-servicio {
  border-left: 6px solid transparent;
  transition: transform 0.15s ease;
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
