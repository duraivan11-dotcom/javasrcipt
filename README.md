# Taller Don Efraín — CRUD de servicio técnico

App de una sola página (Vue 3 + Quasar) para registrar, consultar, editar y
eliminar los servicios técnicos de un taller de celulares y tablets.

## Requisitos

- Node.js 18+

## Instalación y ejecución local

```bash
npm install
npm run dev
```

Esto instalará las dependencias (incluida `@vueuse/core`, usada para la
persistencia con `useLocalStorage`) y levantará el servidor de desarrollo.

## Build de producción

```bash
npm run build
```

El resultado queda en la carpeta `dist/`.

## Despliegue

Cualquiera de estas opciones sirve (el proyecto es un build estático de Vite):

### Vercel
1. Sube el repo a GitHub.
2. Entra a vercel.com -> "Add New Project" -> importa el repo.
3. Framework preset: **Vite**. Build command: `npm run build`. Output dir: `dist`.
4. Deploy.

### Netlify
1. Sube el repo a GitHub.
2. "Add new site" -> "Import an existing project".
3. Build command: `npm run build`. Publish directory: `dist`.

### GitHub Pages
1. Agrega `base: '/nombre-del-repo/'` en `vite.config.js` dentro de `defineConfig`.
2. `npm run build`
3. Publica el contenido de `dist/` en la rama `gh-pages` (por ejemplo con el
   paquete `gh-pages`, o con GitHub Actions).

## Funcionalidad implementada

- Alta, edicion y eliminacion (con confirmacion) de servicios tecnicos.
- Formulario en modal (`q-dialog`) con validaciones de Quasar (`rules`).
- Persistencia en `localStorage` mediante `useLocalStorage` de `@vueuse/core`,
  asi los datos sobreviven al recargar la pagina.
- Tarjetas con informacion condicional:
  - Borde e icono segun el estado del equipo (recibido, en reparacion,
    listo para entregar, entregado).
  - Color de tarjeta distinto cuando el pago esta pendiente o en abono.
  - Etiqueta "SIN ENTREGAR" para los equipos que el cliente aun no recoge.
  - Estrellas de calificacion, visibles solo cuando el equipo ya fue entregado.
- Filtro por texto (cliente/equipo) y por estado del equipo.
- Resumen rapido de totales, pagos pendientes y equipos sin entregar.

Toda la logica esta resuelta con `ref()` y funciones normales invocadas desde
el template (`@click`, `@submit`, `v-for`, etc.), sin `computed`, `watch`,
Pinia ni Vue Router, segun lo pedido en el ejercicio.
