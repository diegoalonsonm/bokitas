# Plan: Corregir Discrepancias entre Politica de Privacidad y Codigo

**Fecha:** 17 de febrero de 2026
**Estado:** Pendiente
**Archivo destino:** `docs/planning/privacy-policy-fixes.md`

---

## Contexto

Se realizo una auditoria exhaustiva comparando la politica de privacidad (`politica-privacidad.md`) contra el codigo real del proyecto. Se encontraron **16 discrepancias** clasificadas en 3 niveles de prioridad.

---

## Discrepancias Encontradas

### ALTA PRIORIDAD — La politica dice algo incorrecto

| # | Area | La politica dice | El codigo hace | Archivos |
|---|---|---|---|---|
| 1 | **Segundo apellido en registro** | Se recopila en el registro (opcional) | El formulario tiene el campo pero **nunca se envia al API** — se descarta silenciosamente | `mobile/app/(auth)/register.tsx:78-83`, `backend/src/Models/validations/authValidation.ts` |
| 2 | **Limite de comentario en resenas** | "hasta 1000 caracteres" (implicito en Seccion 1.1) | Mobile aplica 1000, pero el **backend permite hasta 2000** caracteres | `mobile/app/modals/create-review.tsx:161` vs `backend/src/Models/validations/reviewValidation.ts:13` |
| 3 | **Fotos de resenas (hasta 5)** | "fotografias de restaurantes (hasta 5 por resena)" | El endpoint de fotos usa **subida de archivo unico** (`uploadSingle`), y el modelo almacena `urlfotoreview` como **una sola URL**, no un array | `backend/src/Routes/reviewRouter.ts:25`, `backend/src/Middleware/uploadMiddleware.ts:21-23` |
| 4 | **Descripcion de Eatlists** | "nombre de la lista y restaurantes seleccionados" | Las eatlists **no tienen campo de nombre** — son un sistema plano de bookmarks con `userId`, `restaurantId` y un `hasBeenFlag` (visitado/quiero visitar) | `backend/src/types/entities/eatlist.types.ts`, `backend/src/Models/validations/eatlistValidation.ts` |
| 5 | **Edicion de nombre de usuario** | Seccion 6 dice que se puede editar "nombre de usuario" | La pantalla de edicion tiene el campo en la UI, pero `handleSave` **nunca lo envia** al API. El schema de validacion del backend tampoco tiene el campo | `mobile/app/(tabs)/profile/edit.tsx:74`, `backend/src/Models/validations/userValidation.ts` |
| 6 | **Eliminacion de cuenta: UI vs politica** | La politica dice "eliminacion logica (soft delete)" | La politica es correcta sobre el soft delete, pero **la UI le dice al usuario** que sus datos seran "eliminados permanentemente" — contradiccion | `mobile/app/(tabs)/profile/settings.tsx:53-87` |

### MEDIA PRIORIDAD — La politica omite algo que la app hace

| # | Area | Que falta en la politica | Que hace el codigo | Archivos |
|---|---|---|---|---|
| 7 | **Historial de busqueda** | No se menciona | Hasta 10 consultas de busqueda se guardan en **AsyncStorage en texto plano** en el dispositivo | `mobile/lib/stores/useSearchStore.ts:4-5,59` |
| 8 | **Emails de restablecimiento de contrasena** | No menciona comunicacion por email | La app envia emails de restablecimiento via Supabase Auth (`resetPasswordForEmail`) | `mobile/app/(auth)/forgot-password.tsx`, `backend/src/Controllers/authController.ts` |
| 9 | **UI de notificaciones push** | No se mencionan | Existe un toggle "Notificaciones push" en configuracion (no funcional, SDK no instalado) | `mobile/app/(tabs)/profile/settings.tsx:120-128` |
| 10 | **Expo como servicio de terceros** | No aparece en la Seccion 3 | Servicios de Expo (EAS Build, expo-dev-client) se usan. Expo puede recopilar telemetria de builds e info del dispositivo | `mobile/eas.json`, `mobile/app.config.ts:63` |
| 11 | **Endpoints publicos de perfil** | La politica dice que las resenas son visibles para "otros usuarios" pero no aclara que es publico | Perfiles, resenas, eatlist y top-4 son accesibles **sin autenticacion** (no hay authMiddleware) | `backend/src/Routes/userRouter.ts:9,13-15` |
| 12 | **Logging del servidor** | La politica no dice nada sobre logs del servidor | El backend registra IDs de usuario, errores de auth, URLs de Foursquare y objetos de error completos via `console.log`/`console.error` | `backend/src/config/httpClient.ts:28`, `backend/src/Controllers/authController.ts`, `backend/src/Middleware/errorMiddleware.ts:232,239` |
| 13 | **Google user ID** | La politica dice que Google provee "nombre, correo, foto de perfil" | El ID token de Google tambien incluye el **user ID de Google (claim sub)**, que no se menciona | Google OAuth JWT standard, `backend/src/Controllers/authController.ts` |

### BAJA PRIORIDAD — Menores / cosmeticos

| # | Area | Nota |
|---|---|---|
| 14 | **Limites de tamano de fotos** | La politica no especifica limites de tamano (5MB perfil, 10MB resenas) — no es obligatorio pero seria util para transparencia |
| 15 | **Detalles de cache TTL** | La politica menciona "datos no sensibles de forma temporal" pero no especifica el mecanismo de TTL ni que el historial de busqueda esta entre los datos cacheados |
| 16 | **Datos compartidos con Foursquare** | La politica dice correctamente "coordenadas y terminos de busqueda" pero podria mencionar tambien `radius`, `sort` y filtros de `category` |

---

## Plan de Accion

### Paso 1: Actualizar la politica de privacidad

**Archivo:** `politica-privacidad.md`

Cambios necesarios:

1. **Seccion 1.1 — Registro:** Remover "segundo apellido (opcional)" de la lista de datos recopilados en el registro, o alternativamente arreglar el codigo para que realmente lo envie (ver Paso 2 opcion A).
2. **Seccion 1.1 — Resenas:** Cambiar "fotografias (hasta 5 por resena)" a "fotografia (1 por resena)" para reflejar la implementacion actual, o cambiar despues de implementar multiples fotos (ver Paso 2 opcion B).
3. **Seccion 1.1 — Eatlists:** Cambiar "nombre de la lista y restaurantes seleccionados" a "restaurantes guardados con indicador de visitado/por visitar" para reflejar el sistema actual.
4. **Seccion 1.2 — Agregar historial de busqueda:** Anadir un punto que diga que se almacenan hasta 10 busquedas recientes en el dispositivo para mejorar la experiencia, y que el usuario puede borrar este historial.
5. **Seccion 2 — Agregar comunicacion por email:** Mencionar que se envian correos para restablecimiento de contrasena.
6. **Seccion 3 — Tabla de terceros:** Agregar una fila para Expo (Expo/EAS) como servicio usado para la compilacion y distribucion de la app. Actualizar la descripcion de Google Sign-In para mencionar que el ID token puede incluir un identificador unico de Google.
7. **Seccion 4 — Agregar nota sobre logs:** Mencionar que el servidor puede registrar datos operacionales (IDs de sesion, errores) para fines de depuracion y mantenimiento, y que estos logs no contienen contrasenas ni datos financieros.
8. **Seccion 5 — Datos publicos:** Aclarar que los perfiles de usuario, resenas, listas de restaurantes y top-4 son de acceso publico dentro de la aplicacion.
9. **Seccion 6 — Edicion de username:** Remover "nombre de usuario" de la lista de campos editables hasta que la funcionalidad se implemente realmente.
10. **Seccion 6 — Detalles adicionales:** Mencionar que el usuario puede borrar su historial de busqueda desde la app.

### Paso 2: Corregir el codigo (decisiones necesarias)

Algunas discrepancias se pueden resolver desde la politica, desde el codigo, o ambos. El desarrollador debe decidir:

#### Opcion A: Segundo apellido en registro
- **A1 (Arreglar codigo):** Enviar `segundoapellido` al API en `register.tsx:78-83`, agregar el campo al schema de validacion en `authValidation.ts`, y actualizar el modelo/controlador para guardarlo.
- **A2 (Arreglar politica):** Remover la mencion del segundo apellido en el registro de la politica. Mantener el campo solo en la edicion de perfil si aplica.

#### Opcion B: Multiples fotos por resena
- **B1 (Arreglar codigo para soportar 5 fotos):** Cambiar `uploadSingle` a `uploadMultiple` en `reviewRouter.ts`, actualizar el modelo de resena para almacenar un array de URLs, actualizar el controlador y el frontend.
- **B2 (Arreglar politica):** Cambiar "hasta 5 fotografias" a "una fotografia" en la politica.

#### Opcion C: Limite de comentarios
- **C1 (Alinear a 1000):** Cambiar el backend en `reviewValidation.ts:13` de 2000 a 1000 caracteres.
- **C2 (Alinear a 2000):** Cambiar el mobile en `create-review.tsx:161` de 1000 a 2000 y actualizar la politica.

#### Opcion D: Nombre de usuario
- **D1 (Implementar la funcionalidad):** Hacer que `handleSave` en `edit.tsx` envie el username, agregar el campo al schema `userValidation.ts`, actualizar el controlador y modelo del backend.
- **D2 (Remover de la UI):** Quitar el campo de username de la pantalla de edicion y removerlo de la politica.

#### Opcion E: Mensaje de eliminacion de cuenta
- **Arreglar UI:** Cambiar el texto en `settings.tsx:53-87` de "eliminados permanentemente" a algo que refleje el soft delete, como "tu cuenta sera desactivada y tu informacion dejara de ser accesible publicamente".

#### Opcion F: Toggle de notificaciones push
- **F1 (Remover UI):** Quitar el toggle de notificaciones de `settings.tsx:120-128` ya que no es funcional.
- **F2 (Agregar a politica):** Si se planea implementar push notifications pronto, agregar una seccion a la politica.

---

## Orden de Ejecucion Sugerido

1. Tomar decisiones sobre opciones A-F con el desarrollador.
2. Aplicar los cambios de codigo segun las decisiones.
3. Actualizar `politica-privacidad.md` con todos los cambios del Paso 1.
4. Revisar la politica final para asegurar coherencia.
