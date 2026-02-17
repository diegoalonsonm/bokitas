# Plan de Cumplimiento: Terminos de Servicio vs Codigo

Este documento lista todas las diferencias encontradas entre los Terminos de Servicio (`terminos-servicio.md`) y la implementacion real del codigo. Cada item incluye la seccion del ToS afectada, el problema, la evidencia en el codigo y la accion requerida.

---

## Prioridad: CRITICA

Elementos donde los Terminos prometen algo que no existe en absoluto en el codigo.

---

### 1. Verificacion de edad (13+)

- **Seccion ToS:** 2.1
- **Problema:** Los terminos exigen que los usuarios tengan al menos 13 anos. No existe ningun mecanismo de verificacion de edad en el proyecto.
- **Evidencia:**
  - `mobile/app/(auth)/register.tsx` -- El `FormData` no tiene campo de fecha de nacimiento ni edad.
  - `backend/src/Models/validations/authValidation.ts` -- `registerSchema` no valida edad.
  - `backend/docs/entities/usuario.md` -- La tabla `usuario` no tiene columna de fecha de nacimiento.
  - `mobile/lib/utils/validators.ts` -- No existe validador de edad.
- **Accion requerida:**
  - Agregar campo `fechanacimiento` a la tabla `usuario` (migracion de BD).
  - Agregar campo de fecha de nacimiento al formulario de registro mobile.
  - Agregar validacion backend en `registerSchema` que rechace menores de 13.
  - Agregar validacion frontend.
  - **Alternativa minima:** Agregar un checkbox de auto-declaracion "Confirmo que tengo al menos 13 anos" en el registro.

---

### 2. Aceptacion de Terminos de Servicio en registro

- **Seccion ToS:** 2.2
- **Problema:** Los terminos dicen "Al crear una cuenta...aceptas estos Terminos". No existe checkbox, enlace ni mecanismo de aceptacion explicita durante el registro.
- **Evidencia:**
  - `mobile/app/(auth)/register.tsx` -- El formulario solo tiene campos de nombre, apellidos, email, password. No hay checkbox ni texto de aceptacion.
  - `mobile/types/auth.types.ts` -- `RegisterData` no tiene campo `termsAccepted`.
  - `backend/src/types/api/auth.api.types.ts` -- `RegisterBody` no tiene campo de aceptacion.
  - La tabla `usuario` no tiene columna `terms_accepted_at`.
- **Accion requerida:**
  - Agregar checkbox en pantalla de registro: "He leido y acepto los [Terminos de Servicio] y la [Politica de Privacidad]" con links.
  - Agregar campo `termsAccepted: boolean` al payload de registro.
  - Agregar validacion backend que rechace registro sin aceptacion.
  - Agregar columna `terms_accepted_at` a la tabla `usuario`.

---

### 3. Prevencion de spam en resenas

- **Seccion ToS:** 3
- **Problema:** Los terminos prohiben spam y resenas falsas. No existe ningun limite de resenas por restaurante, por usuario, ni cooldown entre publicaciones.
- **Evidencia:**
  - `backend/src/Controllers/reviewController.ts` (lineas 42-68) -- `create` no verifica resenas duplicadas ni limites.
  - `backend/src/Models/reviewModel.ts` (lineas 39-78) -- Inserta directamente sin chequeo de duplicados.
  - `backend/src/Models/restaurantModel.ts` (lineas 404-442) -- `updateRating` recalcula promedio de TODAS las resenas activas; manipulable con multiples resenas.
- **Accion requerida:**
  - Implementar restriccion de una resena por usuario por restaurante (constraint unico en BD o check en modelo).
  - Considerar cooldown entre resenas (ej: maximo 1 resena cada 5 minutos).
  - Considerar limite diario de resenas por usuario.

---

### 4. Proteccion contra bots/scrapers

- **Seccion ToS:** 3
- **Problema:** Los terminos prohiben bots y scrapers. No existe CAPTCHA, validacion de user-agent, ni API key para la app movil.
- **Evidencia:**
  - `backend/package.json` -- No hay paquetes de rate-limit ni CAPTCHA.
  - `backend/src/index.ts` (lineas 21-28) -- Middleware solo incluye `cors()` y `express.json()`.
  - Endpoints publicos (`GET /users/:id`, `GET /restaurants`, reviews) son accesibles sin autenticacion.
  - `backend/BACKEND.md` (linea 519) -- Listado como TODO pendiente.
- **Accion requerida:**
  - Implementar rate limiting global y por endpoint (ej: `express-rate-limit`).
  - Agregar API key para la app movil.
  - Considerar `helmet` para headers de seguridad.
  - Evaluar CAPTCHA para registro y login.

---

### 5. Mecanismo de suspension de cuentas

- **Seccion ToS:** 8.1
- **Problema:** Los terminos dicen "Podemos suspender tu cuenta". La constante `ESTADO.BLOQUEADO` existe pero nunca se verifica. Un usuario bloqueado puede seguir usando la API normalmente.
- **Evidencia:**
  - `backend/src/Utils/constants.ts` (linea 4) -- `ESTADO.BLOQUEADO` definido pero no utilizado en logica.
  - `backend/src/Middleware/authMiddleware.ts` -- Solo valida JWT, no verifica `idestado` del usuario.
  - `backend/src/Controllers/authController.ts` (lineas 68-100) -- Login no verifica si el usuario esta bloqueado.
  - No existe endpoint de admin para suspender cuentas.
- **Accion requerida:**
  - Modificar `authMiddleware` para consultar `idestado` del usuario y rechazar si es `BLOQUEADO`.
  - Modificar login para verificar estado del usuario antes de emitir sesion.
  - Crear endpoint de admin para cambiar estado de usuario a `BLOQUEADO`.
  - Implementar sistema basico de roles (admin vs usuario regular).

---

### 6. Anonimizacion de resenas al eliminar cuenta

- **Seccion ToS:** 8.2
- **Problema:** Los terminos dicen que las resenas "podran permanecer de forma anonimizada". No existe logica de anonimizacion. Las resenas quedan con el nombre real y foto del usuario eliminado.
- **Evidencia:**
  - `backend/src/Models/userModel.ts` (lineas 173-191) -- `softDelete` solo cambia `active` e `idestado`, no toca resenas.
  - `backend/src/Models/reviewModel.ts` (linea 87) -- Las queries de resenas hacen JOIN con `usuario` y devuelven nombre/foto sin filtrar por `active`.
  - `backend/src/Models/restaurantModel.ts` (linea 357) -- Mismo problema en reviews de restaurante.
  - Busqueda de "anonym"/"anonimiz" en el codebase: cero resultados fuera del ToS.
- **Accion requerida:**
  - **Opcion A:** Al hacer soft-delete, actualizar todas las resenas del usuario para reemplazar `idusuario` con un usuario sentinel/anonimo.
  - **Opcion B:** En la capa de queries, detectar cuando el usuario del JOIN tiene `active = false` y reemplazar nombre/foto con placeholders ("Usuario eliminado").

---

## Prioridad: ALTA

Brechas significativas entre los terminos y la implementacion.

---

### 7. Sistema de moderacion de contenido

- **Seccion ToS:** 3, 4.5
- **Problema:** Los terminos reservan el derecho de eliminar contenido inapropiado. No existe sistema de moderacion, filtro de contenido ni panel de administracion.
- **Evidencia:**
  - Las resenas se publican instantaneamente con `ESTADO.ACTIVO` (`reviewModel.ts` linea 59).
  - No hay filtro de profanidad ni deteccion de spam.
  - No hay endpoint de reportes de contenido.
  - `DELETE /reviews/:id` solo permite al propietario eliminar (`reviewController.ts` linea 162).
  - `backend/BACKEND.md` (lineas 517-521) -- Listado explicitamente como TODO.
- **Accion requerida:**
  - Crear sistema de reportes (modelo, endpoint `POST /reports`, UI movil).
  - Crear panel o endpoints de admin para revisar y eliminar contenido.
  - Considerar filtro basico de palabras prohibidas.

---

### 8. Eliminacion de contenido por admin

- **Seccion ToS:** 4.5
- **Problema:** "Nos reservamos el derecho de eliminar cualquier contenido". No existe rol de admin ni endpoints de admin.
- **Evidencia:**
  - No hay sistema de roles en el codebase.
  - `foodTypeRouter.ts` (linea 15) -- Comentario: "admin check deferred to Phase 2".
  - Cualquier usuario autenticado puede crear food types.
- **Accion requerida:**
  - Implementar sistema de roles (columna `rol` en `usuario` o tabla separada).
  - Crear middleware `adminMiddleware` que verifique rol.
  - Crear endpoints de admin: `DELETE /admin/reviews/:id`, `PUT /admin/users/:id/status`.

---

### 9. Sanitizacion de inputs (XSS)

- **Seccion ToS:** 3
- **Problema:** Los terminos prohiben interferir con el funcionamiento de la app. No hay sanitizacion de HTML/XSS en inputs de usuario.
- **Evidencia:**
  - `backend/package.json` -- No hay librerias de sanitizacion (`xss`, `sanitize-html`, `dompurify`).
  - `backend/src/Models/validations/reviewValidation.ts` -- Solo valida longitud, no contenido.
  - `backend/BACKEND.md` (linea 521) -- Listado como TODO pendiente.
  - Los comentarios de resenas, nombres y bios aceptan tags HTML/script.
- **Accion requerida:**
  - Instalar libreria de sanitizacion (ej: `xss` o `sanitize-html`).
  - Crear middleware o utilidad que sanitice todos los campos de texto antes de guardar.
  - Agregar `.trim()` a los schemas de Zod para eliminar espacios innecesarios.

---

### 10. Mecanismo de eliminacion completa de datos

- **Seccion ToS:** 8.2
- **Problema:** Los terminos dicen que los usuarios pueden solicitar eliminacion completa via support@bokitas.app. No existe herramienta ni proceso para cumplir esta solicitud.
- **Evidencia:**
  - No existe endpoint de hard-delete.
  - No hay script ni herramienta de admin para eliminar datos.
  - No se elimina el usuario de `auth.users` (Supabase Auth).
  - No se eliminan fotos de Supabase Storage.
- **Accion requerida:**
  - Crear script o endpoint de admin para eliminacion completa:
    1. Eliminar/anonimizar resenas del usuario.
    2. Eliminar entradas de eatlist.
    3. Eliminar fotos de perfil del bucket `profile-photos`.
    4. Eliminar fotos de resenas del bucket `review-photos`.
    5. Eliminar registro de `usuario`.
    6. Eliminar usuario de `auth.users` via `supabase.auth.admin.deleteUser(authId)`.

---

### 11. Google Sign-In no listado en servicios de terceros

- **Seccion ToS:** 12
- **Problema:** Google Sign-In (`@react-native-google-signin/google-signin`) se usa para autenticacion OAuth pero no esta listado en la Seccion 12 del ToS.
- **Evidencia:**
  - `mobile/package.json` -- Incluye `@react-native-google-signin/google-signin`.
  - `mobile/lib/stores/useAuthStore.ts` -- Implementa flujo de Google Sign-In.
  - `terminos-servicio.md` (lineas 161-167) -- Solo lista Supabase, Foursquare, Google Maps y Expo.
- **Accion requerida:**
  - Agregar "Google Sign-In (autenticacion OAuth)" a la lista de servicios de terceros en Seccion 12 del ToS.

---

### 12. Rate limiting en endpoints

- **Seccion ToS:** 3
- **Problema:** No hay rate limiting en ningun endpoint. Login, registro y password reset son completamente ilimitados.
- **Evidencia:**
  - `backend/package.json` -- No hay `express-rate-limit` ni similar.
  - `backend/src/index.ts` -- No hay middleware de rate limiting.
  - `backend/BACKEND.md` (linea 517) -- Listado como TODO.
  - Endpoint `/auth/forgot-password` puede disparar emails ilimitados.
  - Endpoint `/restaurants/search` proxea a Foursquare (10K calls/mes gratis).
- **Accion requerida:**
  - Instalar `express-rate-limit`.
  - Aplicar limites globales (ej: 100 req/min por IP).
  - Aplicar limites estrictos en auth endpoints (ej: 5 intentos de login/min, 3 password resets/hora).
  - Aplicar limite en busqueda de restaurantes para proteger cuota de Foursquare.

---

## Prioridad: MEDIA

Inconsistencias o cumplimiento parcial.

---

### 13. Fuga de datos de usuarios eliminados en resenas

- **Seccion ToS:** 8.2
- **Problema:** "Tu perfil dejara de ser visible". El endpoint de perfil filtra correctamente por `active = true`, pero los JOINs de resenas siguen mostrando nombre y foto del usuario eliminado.
- **Evidencia:**
  - `backend/src/Models/userModel.ts` (linea 49) -- `getById` filtra `active = true` (correcto).
  - `backend/src/Models/reviewModel.ts` (linea 87) -- JOIN con `usuario` no filtra por `active`.
  - `backend/src/Models/restaurantModel.ts` (linea 357) -- Mismo problema.
- **Accion requerida:**
  - Filtrar usuarios inactivos en JOINs de resenas, o resolver via la anonimizacion del punto #6.

---

### 14. Mensaje contradictorio de eliminacion de cuenta

- **Seccion ToS:** 8.2
- **Problema:** Los terminos dicen que la eliminacion es "desactivacion (eliminacion logica)". La app movil dice "Todos tus datos seran eliminados permanentemente".
- **Evidencia:**
  - `mobile/app/(tabs)/profile/settings.tsx` (linea 56) -- Dialogo de confirmacion: "Todos tus datos seran eliminados permanentemente".
  - `mobile/app/(tabs)/profile/settings.tsx` (linea 164) -- Descripcion del boton: "Elimina permanentemente tu cuenta".
  - `terminos-servicio.md` (linea 121) -- "La eliminacion es un proceso de desactivacion".
- **Accion requerida:**
  - Actualizar los textos en `settings.tsx` para reflejar que es una desactivacion: "Tu cuenta sera desactivada y tu perfil dejara de ser visible. Tus resenas podran permanecer de forma anonimizada."

---

### 15. Limitacion de una cuenta por persona

- **Seccion ToS:** 2.3
- **Problema:** Los terminos dicen "Cada persona podra tener una unica cuenta". Solo se aplica unicidad de email.
- **Evidencia:**
  - `backend/src/Controllers/authController.ts` (lineas 39-43) -- Verifica email duplicado.
  - La columna `telefono` no tiene constraint de unicidad.
  - No hay fingerprinting de dispositivo ni verificacion de IP.
- **Accion requerida:**
  - Considerar agregar unicidad de telefono si se hace obligatorio.
  - Aceptar que la limitacion es "mejor esfuerzo" y ajustar el ToS si es necesario.
  - **Alternativa:** Mantener como esta; la mayoria de plataformas solo aplican unicidad de email.

---

### 16. Permiso de ubicacion excesivo

- **Seccion ToS:** 7.1
- **Problema:** La configuracion solicita `locationAlwaysAndWhenInUsePermission` (acceso permanente) pero el codigo solo usa `requestForegroundPermissionsAsync()` (solo en primer plano).
- **Evidencia:**
  - `mobile/app.config.ts` (linea 38) -- Usa key `locationAlwaysAndWhenInUsePermission`.
  - `mobile/lib/hooks/useLocation.ts` (lineas 71-73) -- Solo llama `requestForegroundPermissionsAsync()`.
- **Accion requerida:**
  - Cambiar la key en `app.config.ts` a `locationWhenInUsePermission`.

---

### 17. Toggle de notificaciones push no funcional

- **Seccion ToS:** 7.1
- **Problema:** Los terminos mencionan notificaciones push futuras. El toggle en settings existe visualmente pero solo cambia estado local de React. `expo-notifications` no esta instalado.
- **Evidencia:**
  - `mobile/app/(tabs)/profile/settings.tsx` (lineas 120-129, 33) -- Toggle visual sin funcionalidad real.
  - `mobile/package.json` -- No incluye `expo-notifications`.
- **Accion requerida:**
  - Remover el toggle hasta que se implemente la funcionalidad real.
  - O agregar label "Proximamente" al toggle y deshabilitarlo.

---

### 18. Link de Buy Me a Coffee no declarado

- **Seccion ToS:** N/A (no mencionado)
- **Problema:** El link externo a `buymeacoffee.com/diegoalonsonm` en la pantalla de settings no esta mencionado en los Terminos ni en la Politica de Privacidad.
- **Evidencia:**
  - `mobile/app/(tabs)/profile/settings.tsx` (linea 102) -- Link externo a Buy Me a Coffee.
- **Accion requerida:**
  - Agregar mencion en el ToS o Politica de Privacidad de que la app contiene links externos a sitios de terceros.
  - O simplemente mantener como esta; es un link voluntario y no recolecta datos del usuario.

---

### 19. Inconsistencia en requisitos de contrasena

- **Seccion ToS:** N/A (no especificado en terminos)
- **Problema:** La documentacion del backend dice minimo 8 caracteres pero el codigo aplica minimo 6.
- **Evidencia:**
  - `backend/docs/endpoints/auth-endpoints.md` (linea 39) -- "Min 8 characters".
  - `backend/src/Models/validations/authValidation.ts` (lineas 8-11) -- `.min(6)`.
  - `mobile/lib/utils/validators.ts` (lineas 29-38) -- Minimo 6 caracteres.
- **Accion requerida:**
  - Decidir el minimo real (recomendado: 8) y unificar en backend, frontend y documentacion.

---

## Resumen por Area

| Area | Items Criticos | Items Altos | Items Medios | Total |
|------|---------------|-------------|--------------|-------|
| Registro y Auth | 2 (#1, #2) | 1 (#12) | 2 (#15, #19) | 5 |
| Contenido y Resenas | 1 (#3) | 3 (#7, #8, #9) | 0 | 4 |
| Ciclo de Cuenta | 2 (#5, #6) | 1 (#10) | 2 (#13, #14) | 5 |
| Seguridad | 1 (#4) | 1 (#12) | 0 | 2 |
| Privacidad y Permisos | 0 | 1 (#11) | 3 (#16, #17, #18) | 4 |
| **Total** | **6** | **6** | **7** | **19** |

---

## Orden de implementacion sugerido

1. **Fase inmediata (antes de publicar en stores):**
   - #2 Checkbox de aceptacion de terminos en registro
   - #14 Corregir mensaje de eliminacion de cuenta en la app
   - #11 Agregar Google Sign-In al ToS
   - #16 Corregir key de permiso de ubicacion
   - #17 Deshabilitar toggle de notificaciones push

2. **Fase corta (1-2 semanas):**
   - #1 Verificacion de edad
   - #3 Limite de una resena por restaurante
   - #9 Sanitizacion de inputs
   - #12 Rate limiting en endpoints
   - #19 Unificar requisitos de contrasena

3. **Fase media (2-4 semanas):**
   - #5 Enforcement de suspension de cuentas
   - #6 Anonimizacion de resenas al eliminar cuenta
   - #13 Filtrar datos de usuarios eliminados en JOINs
   - #4 Proteccion basica contra bots (API key, helmet)

4. **Fase extendida (4-8 semanas):**
   - #7 Sistema de reportes y moderacion
   - #8 Panel/endpoints de admin
   - #10 Herramienta de eliminacion completa de datos
