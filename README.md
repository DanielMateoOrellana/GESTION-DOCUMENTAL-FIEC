# Sistema de Gestión Documental FIEC – Manual de Desarrollo

Proyecto de tesis: sistema de gestión / registro de evidencias para la FIEC.

Stack principal:

- **Backend:** NestJS + TypeScript + Prisma + PostgreSQL
- **Frontend:** React + Vite + TypeScript + Tailwind / shadcn
- **Base de datos:** PostgreSQL 16 en Docker

Este documento explica cómo levantar **backend**, **frontend** y la **base de datos** en un entorno local de desarrollo y cómo seguir agregando funcionalidades.

---

## 1. Requisitos previos

Instalar en la máquina de desarrollo:

- Node.js ≥ 18 (ideal 20 LTS)
- npm (incluido con Node)
- Docker Desktop (o Docker Engine)
- Cliente Git
- Opcional: cliente SQL (DBeaver, pgAdmin, etc.)

Verificar versiones:

```bash
node -v
npm -v
docker -v
git --version
```

---

## 2. Estructura general del repositorio

Ejemplo de estructura:

```text
.
├─ .gitignore
├─ README.md              # Este archivo
├─ estructura_proyecto.txt
├─ backend
│  └─ api
│     ├─ .env
│     ├─ package.json
│     ├─ tsconfig*.json
│     ├─ nest-cli.json
│     ├─ prisma
│     │  ├─ schema.prisma
│     │  └─ migrations/
│     └─ src
│        ├─ app.module.ts
│        ├─ app.controller.ts
│        ├─ app.service.ts
│        ├─ prisma/
│        │  ├─ prisma.module.ts
│        │  └─ prisma.service.ts
│        ├─ process-categories/
│        ├─ process-templates/
│        ├─ process-instances/
│        └─ step-files/
└─ frontend
   ├─ .env.local
   ├─ package.json
   ├─ tsconfig.json
   ├─ vite.config.ts
   ├─ index.html
   └─ src
      ├─ main.tsx
      ├─ App.tsx
      ├─ index.css
      ├─ api/
      ├─ components/
      ├─ pages/
      ├─ styles/
      └─ types/
```

---

## 3. Base de datos local con Docker (PostgreSQL)

La base de datos de desarrollo se levanta en un contenedor Docker con:

- **Base:** `fiec_docs`
- **Usuario:** `fiec_user`
- **Contraseña:** `fiec_pass`
- **Puerto host:** `5433` (redireccionado al `5432` del contenedor)

### 3.1 Crear el contenedor de PostgreSQL

#### Windows (PowerShell / CMD)

```bash
docker run --name fiec-postgres ^
  -e POSTGRES_DB=fiec_docs ^
  -e POSTGRES_USER=fiec_user ^
  -e POSTGRES_PASSWORD=fiec_pass ^
  -p 5433:5432 ^
  -v fiec_pgdata:/var/lib/postgresql/data ^
  -d postgres:16
```

#### Linux / macOS

```bash
docker run --name fiec-postgres \
  -e POSTGRES_DB=fiec_docs \
  -e POSTGRES_USER=fiec_user \
  -e POSTGRES_PASSWORD=fiec_pass \
  -p 5433:5432 \
  -v fiec_pgdata:/var/lib/postgresql/data \
  -d postgres:16
```

### 3.2 Comandos útiles de Docker

```bash
# Ver contenedores corriendo
docker ps

# Ver todos los contenedores (incluyendo detenidos)
docker ps -a

# Detener la base
docker stop fiec-postgres

# Arrancar de nuevo la base
docker start fiec-postgres

# Ver logs (útil para errores de arranque)
docker logs fiec-postgres
```

> Nota: el volumen `fiec_pgdata` guarda los datos para que no se pierdan al apagar el contenedor.

---

## 4. Backend – NestJS + Prisma

El backend está en `backend/api`.

### 4.1 Instalación de dependencias

```bash
cd backend/api
npm install
```

### 4.2 Configuración del `.env` del backend

Crear (o editar) `backend/api/.env` con al menos:

```env
DATABASE_URL="postgresql://fiec_user:fiec_pass@localhost:5433/fiec_docs?schema=public"
```

Si en algún momento se cambia usuario, contraseña, base o puerto, hay que actualizar también esta URL.

> Importante: no commitear `.env` al repositorio.

### 4.3 Migraciones de Prisma

El esquema de la base está en `prisma/schema.prisma`. Las migraciones en `prisma/migrations`.

Para aplicar todas las migraciones sobre la base creada en Docker:

```bash
cd backend/api

# Aplica migraciones pendientes y genera el cliente Prisma
npx prisma migrate dev

# (Opcional) Formatear el schema
npx prisma format

# (Opcional) Abrir Prisma Studio para ver datos
npx prisma studio
```

Si se necesita resetear la base de datos de desarrollo:

```bash
npx prisma migrate reset
```

> Esto borra todo el contenido de la base, recrea el esquema y vuelve a aplicar las migraciones.

### 4.4 Arrancar el backend en modo desarrollo

Asegurarse primero de que el contenedor `fiec-postgres` esté corriendo:

```bash
docker start fiec-postgres
```

Luego, desde `backend/api`:

```bash
npm run start:dev
```

Si el script no existe, se puede usar:

```bash
npx nest start --watch
```

Por defecto, el backend expone la API en:

```text
http://localhost:3000
```

(Verificar en `main.ts` o en las variables de entorno si se usa otro puerto.)

### 4.5 Comandos útiles de Nest

Desde `backend/api`:

```bash
# Servidor dev con watch
npm run start:dev

# Build de producción
npm run build

# Tests unitarios (si están configurados)
npm run test

# Tests end-to-end (si están configurados)
npm run test:e2e
```

Generación de código:

```bash
# Nuevo módulo
npx nest g module nombre

# Nuevo servicio
npx nest g service nombre

# Nuevo controlador
npx nest g controller nombre

# Recurso CRUD completo (REST)
npx nest g resource nombre-recurso
```

> Al generar recursos, seguir la estructura ya usada en `process-categories`, `process-templates`, `process-instances`, `step-files`, etc.

### 4.6 Flujo para agregar nuevas funcionalidades (backend)

**Caso A: Nueva entidad/tablas**

1. Editar `prisma/schema.prisma` y agregar un nuevo `model`.
2. Crear migración:

   ```bash
   npx prisma migrate dev --name nombre_migracion
   ```

3. (Opcional) `npx prisma generate` si fuera necesario reconstruir el cliente.
4. Crear módulo Nest:

   ```bash
   npx nest g resource nombre-recurso
   ```

5. Inyectar `PrismaService` en el servicio y usar `this.prisma.<modelo>` para consultas.
6. Exponer endpoints en el controlador (`@Get`, `@Post`, `@Patch`, `@Delete`).
7. Probar con Postman / Thunder Client.

**Caso B: Lógica adicional en módulos existentes**

1. Ubicar el módulo (por ejemplo `process-templates`).
2. Revisar:
   - `process-templates.module.ts`
   - `process-templates.service.ts`
   - `process-templates.controller.ts`
   - DTOs en `process-templates/dto/`
3. Agregar métodos nuevos en el `service`.
4. Exponer endpoints adicionales en el `controller`.
5. Actualizar DTOs y validaciones según sea necesario.

---

## 5. Frontend – React + Vite + TypeScript

El frontend está en la carpeta `frontend`.

### 5.1 Instalación de dependencias

```bash
cd frontend
npm install
```

### 5.2 Variables de entorno del frontend (`.env.local`)

Crear o editar `frontend/.env.local`:

```env
VITE_API_BASE_URL="http://localhost:4000"
```

Usar el mismo puerto que el backend. Ver `src/api/http.ts` (o equivalente) para confirmar cómo se usa esta variable.

> Cada vez que se cambia `.env.local`, es recomendable reiniciar `npm run dev` en el frontend.

### 5.3 Arrancar el frontend

Desde `frontend`:

```bash
npm run dev
```

Vite expone por defecto la app en:

```text
http://localhost:5173
```

Flujo normal para levantar todo el sistema:

1. Arrancar base de datos:

   ```bash
   docker start fiec-postgres
   ```

2. Arrancar backend:

   ```bash
   cd backend/api
   npm run start:dev
   ```

3. Arrancar frontend:

   ```bash
   cd frontend
   npm run dev
   ```

4. Abrir el navegador en `http://localhost:5173`.

### 5.4 Scripts útiles del frontend

Desde `frontend`:

```bash
# Servidor dev
npm run dev

# Build de producción
npm run build

# Previsualizar build
npm run preview

# Linter (si está configurado)
npm run lint
```

### 5.5 Organización básica del código (frontend)

- `src/main.tsx`: punto de entrada de React.
- `src/App.tsx`: estructura principal de la aplicación (layout, rutas).
- `src/api/`: funciones para llamadas HTTP al backend (ej. `processTemplates.ts`, `processInstances.ts`).
- `src/components/`: componentes reutilizables (tablas, formularios, modales, layouts).
- `src/styles/` y `src/components/ui/`: estilos globales, componentes base (shadcn, Tailwind).

**Recomendaciones:**

- Centralizar llamadas HTTP en `src/api` para no duplicar lógica.
- Reutilizar componentes de UI (botones, inputs, diálogos, tablas).
- Mantener consistencia de diseño con el resto del sistema.

### 5.6 Flujo para agregar nuevas funcionalidades (frontend)

1. Confirmar qué endpoint(s) tiene el backend o si hay que crearlos.
2. Crear/actualizar módulo en `src/api/` para consumir el endpoint.
3. Crear componentes en `src/components`:
   - Formularios
   - Tablas/listados
   - Modales de detalle / edición
4. Conectar componentes a la API usando hooks (`useEffect`, `useState`, o hooks personalizados).
5. Probar flujos completos en el navegador.

---

## 6. Módulo de subida de documentos (step-files)

En el backend, el módulo `step-files` maneja archivos asociados a pasos de procesos. A nivel conceptual:

- Cada archivo está vinculado a un `stepId`.
- Se guardan metadatos:
  - `originalName`
  - `mimeType`
  - `sizeBytes`
  - `version`
  - `uploadedById`
  - `uploadedAt`

Frontend típico:

- Formularios o modales para subir archivos a un paso.
- Listados de archivos asociados a un paso, con opciones de descarga o vista.

Cuando se cambie esta parte:

- Mantener el contrato del API o coordinar cambios simultáneos en frontend y backend.
- Verificar siempre con pruebas manuales (subir, listar, descargar).

---

## 7. Buenas prácticas en el proyecto

- No modificar migraciones antiguas; crear nuevas siempre.
- Mantener consistencia de nombres:
  - Modelos de Prisma en PascalCase: `ProcessCategory`, `ProcessTemplate`, etc.
  - Carpetas/módulos en kebab-case: `process-categories`, `process-templates`.
- Usar DTOs y `class-validator` en el backend para validar datos de entrada.
- Reutilizar componentes de UI en el frontend para mantener el diseño coherente.
- Probar endpoints con Postman / Thunder Client antes de integrarlos al frontend.
- Evitar lógica de negocio duplicada: preferir servicios reutilizables.

---

## 8. Checklist rápido para montar el entorno desde cero

1. **Instalar herramientas:**
   - Node, npm, Docker, Git.

2. **Crear base de datos en Docker:**

   ```bash
   docker run --name fiec-postgres \
     -e POSTGRES_DB=fiec_docs \
     -e POSTGRES_USER=fiec_user \
     -e POSTGRES_PASSWORD=fiec_pass \
     -p 5433:5432 \
     -v fiec_pgdata:/var/lib/postgresql/data \
     -d postgres:16
   ```

3. **Clonar el repositorio:**

   ```bash
   git clone <URL_DEL_REPO>
   ```

4. **Backend:**

   ```bash
   cd backend/api
   npm install
   # Crear/editar .env con DATABASE_URL a la base de Docker
   npx prisma migrate dev
   npm run start:dev
   ```

5. **Frontend:**

   ```bash
   cd frontend
   npm install
   # Crear/editar .env.local con VITE_API_BASE_URL
   npm run dev
   ```

6. **Verificar en navegador:**
   - Backend: `http://localhost:3000` (si hay endpoint de prueba, por ejemplo `/health`).
   - Frontend: `http://localhost:5173`.

Con esto, cualquier miembro del equipo puede levantar el sistema completo (base de datos, backend y frontend) y continuar desarrollando nuevas funcionalidades.
