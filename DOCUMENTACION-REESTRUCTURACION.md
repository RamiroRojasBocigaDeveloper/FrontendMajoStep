# Documentación de Reestructuración Frontend

Este documento detalla los cambios realizados en el frontend para adaptarlo al patrón plano de módulos (basado en `front_compras`), y enumera los módulos que faltan por implementar.

## Patrón de Arquitectura

El nuevo patrón elimina las carpetas `core/` y `features/`. Todos los módulos son carpetas de primer nivel bajo `src/app/`.

Cada módulo de entidad (ej. `categorias`) debe contener:
- `[singular].ts`: Define la **Interfaz** (modelo de datos) y el **Servicio** HTTP en el mismo archivo.
- `[plural].ts, .html, .css`: El componente principal (tabla/vista). Debe ser **Standalone Component**. La clase no lleva el sufijo `Component`.
- `[singular]-dialog/`: Carpeta con el modal para crear/editar registros (`.ts`, `.html`, `.css`).

## Progreso Actual

Se han completado los pasos 1 a 3 del plan de migración:

- ✅ **Auth**: Configurado en `app/auth/` (contiene `auth.ts`, `auth-guard.ts`, `auth-interceptor.ts`).
- ✅ **Login**: Configurado en `app/login/` (`login.ts`, `.html`, `.css`).
- ✅ **Categorías**: Configurado en `app/categorias/` (`categoria.ts`, `categorias.ts/html/css`, `categoria-dialog/`).
  - *Nota:* Se eliminó el campo local `descripcion` ya que no es manejado por el backend real.
- ✅ **Limpieza**: Se eliminaron las carpetas inyectadas por la arquitectura antigua (`core/guards`, `core/interceptors`, `core/services/auth.service.ts`, `features/auth`, `features/inventario/categorias`).

## Pendientes Módulos Antiguos por Migrar

Los siguientes módulos del frontend todavía usan la estructura antigua o están en la ubicación incorrecta:

1. **Menú Principal**: Actualmente en `core/layout/main-layout.component.ts`. Falta extraer su HTML/CSS y moverlo a `app/menu-principal/`.
2. **Ventas (TPV)**: Actualmente en `features/ventas/venta.component.ts`. Falta moverlo a `app/ventas/ventas.ts` y separar sus archivos.
3. **Servicios de Producto y Venta**: Actualmente están en `core/services/`. Deben moverse a `app/productos/` y `app/ventas/` respectivamente con sus propios modelos e interfaces.

*Importante: `app.routes.ts` y los componentes viejos ya fueron actualizados para importar desde las nuevas ubicaciones (como `app/auth/auth`), por lo que el proyecto compila correctamente en su estado actual.*

## Módulos Nuevos Pendientes (Basados en el Backend)

El backend expone 10 módulos que aún necesitan ser contruidos en el frontend:

1. **Productos** (`/api/productos`) -> `app/productos/`
2. **Usuarios** (`/api/usuarios`) -> `app/usuarios/`
3. **Gastos** (`/api/gastos`) -> `app/gastos/`
4. **Cat. Gasto** (`/api/categorias-gasto`) -> `app/categorias-gasto/`
5. **Subcat. Gasto** (`/api/subcategorias-gasto`) -> `app/subcategorias-gasto/`
6. **Métodos Pago** (`/api/metodos-pago`) -> `app/metodos-pago/`
7. **Mov. Inventario** (`/api/movimientos-inventario`) -> `app/movimientos-inventario/`
8. **Reportes** (`/api/reportes`) -> `app/reportes/`
9. **Sesión Trabajo** (`/api/sesiones-trabajo`) -> `app/sesiones-trabajo/`
10. **Sueldos** (`/api/sueldos-pagados`) -> `app/sueldos-pagados/`

### Notas sobre los Módulos Futuros
- `VentaRequest`: Se actualizó el envío para que solo solicite `{ sesionId, metodoPagoId, descuento, detalles }` según el backend.
- Cuando crees los módulos pendientes, consulta los DTOs en `src/main/java/com/chancla/chancla_lite_auth/dto/` dentro de tu proyecto backend para definir las interfaces correspondientes.
