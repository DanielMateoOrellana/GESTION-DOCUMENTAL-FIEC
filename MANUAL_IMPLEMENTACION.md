# Manual de Implementación y Desarrollo
## Sistema de Gestión Documental - FIEC

---

## 1. Introducción

Este documento técnico describe la arquitectura, configuración e implementación del Sistema de Gestión Documental desarrollado para la Facultad de Ingeniería en Electricidad y Computación (FIEC). Está dirigido a desarrolladores y administradores de sistemas que necesiten instalar, configurar, mantener o extender el sistema.

---

## 2. Arquitectura del Sistema

### 2.1 Visión General

El sistema sigue una arquitectura de tres capas con separación clara entre frontend y backend:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTE                               │
│                   (Navegador Web)                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND                               │
│              React + TypeScript + Vite                       │
│                    Puerto: 5173                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│               NestJS + Prisma ORM                            │
│                    Puerto: 4000                              │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│      BASE DE DATOS      │     │   ALMACENAMIENTO R2/S3      │
│       PostgreSQL        │     │   (Cloudflare R2)           │
└─────────────────────────┘     └─────────────────────────────┘
```

### 2.2 Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Frontend | React | 18.x |
| Bundler | Vite | 5.x |
| Lenguaje Frontend | TypeScript | 5.x |
| Estilos | Tailwind CSS | 3.x |
| Componentes UI | shadcn/ui | - |
| Backend | NestJS | 10.x |
| ORM | Prisma | 6.x |
| Base de Datos | PostgreSQL | 14+ |
| Almacenamiento | Cloudflare R2 | - |
| Autenticación | JWT | - |
| Runtime | Node.js | 18.x+ |

---

## 3. Estructura del Proyecto

```
GESTION-DOCUMENTAL-FIEC/
├── frontend/                    # Aplicación React
│   ├── src/
│   │   ├── api/                 # Funciones de llamadas API
│   │   ├── components/          # Componentes React
│   │   │   └── ui/              # Componentes base (shadcn)
│   │   ├── hooks/               # Custom hooks
│   │   ├── types/               # Definiciones TypeScript
│   │   └── App.tsx              # Componente principal
│   ├── public/                  # Archivos estáticos
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   └── api/                     # API NestJS
│       ├── src/
│       │   ├── auth/            # Módulo de autenticación
│       │   ├── users/           # Módulo de usuarios
│       │   ├── process-types/   # Tipos de proceso
│       │   ├── process-templates/ # Plantillas
│       │   ├── process-instances/ # Instancias de proceso
│       │   ├── step-files/      # Gestión de archivos
│       │   ├── audit-log/       # Registro de auditoría
│       │   ├── r2/              # Servicio almacenamiento
│       │   └── prisma/          # Servicio Prisma
│       ├── prisma/
│       │   ├── schema.prisma    # Esquema de BD
│       │   └── migrations/      # Migraciones
│       └── package.json
│
├── MANUAL_USUARIO.md
└── MANUAL_IMPLEMENTACION.md
```

---

## 4. Requisitos del Sistema

### 4.1 Requisitos de Hardware (Producción)

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Almacenamiento | 20 GB SSD | 50 GB SSD |

### 4.2 Requisitos de Software

- Node.js 18.x o superior
- npm 9.x o superior
- PostgreSQL 14 o superior
- Git

### 4.3 Servicios Externos

- Cuenta de Cloudflare R2 (para almacenamiento de archivos)
- Servidor SMTP (opcional, para notificaciones)

---

## 5. Instalación y Configuración

### 5.1 Clonar el Repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd GESTION-DOCUMENTAL-FIEC
```

### 5.2 Configurar el Backend

#### 5.2.1 Instalar Dependencias

```bash
cd backend/api
npm install
```

#### 5.2.2 Variables de Entorno

Crear archivo `.env` en `backend/api/`:

```env
# Base de Datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/gestion_documental"

# JWT
JWT_SECRET="clave_secreta_segura_de_al_menos_32_caracteres"
JWT_EXPIRATION="7d"

# Cloudflare R2
R2_ACCOUNT_ID="tu_account_id"
R2_ACCESS_KEY_ID="tu_access_key"
R2_SECRET_ACCESS_KEY="tu_secret_key"
R2_BUCKET_NAME="gestion-documental-fiec-files"
R2_PUBLIC_URL="https://tu-bucket.r2.dev"

# Servidor
PORT=4000
NODE_ENV=development
```

#### 5.2.3 Configurar Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate deploy

# (Opcional) Poblar datos iniciales
npx prisma db seed
```

#### 5.2.4 Iniciar Backend

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

### 5.3 Configurar el Frontend

#### 5.3.1 Instalar Dependencias

```bash
cd frontend
npm install
```

#### 5.3.2 Variables de Entorno

Crear archivo `.env` en `frontend/`:

```env
VITE_API_URL=http://localhost:4000
```

#### 5.3.3 Iniciar Frontend

```bash
# Desarrollo
npm run dev

# Producción (generar build)
npm run build
```

---

## 6. Modelo de Datos

### 6.1 Diagrama Entidad-Relación Simplificado

```
┌──────────────┐     ┌───────────────────┐     ┌─────────────────┐
│     User     │────<│  ProcessInstance  │>────│ ProcessTemplate │
└──────────────┘     └───────────────────┘     └─────────────────┘
                              │                        │
                              │                        │
                              ▼                        ▼
                     ┌──────────────┐        ┌────────────────────┐
                     │ StepInstance │        │ProcessTemplateStep │
                     └──────────────┘        └────────────────────┘
                              │
                              ▼
                     ┌──────────────┐
                     │   StepFile   │
                     └──────────────┘
```

### 6.2 Entidades Principales

#### User
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | Identificador único |
| email | String | Correo electrónico (único) |
| fullName | String | Nombre completo |
| password | String | Contraseña hasheada |
| role | UserRole | ADMINISTRADOR, GESTOR, LECTOR, AYUDANTE |
| isActive | Boolean | Estado del usuario |

#### ProcessTemplate
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | Identificador único |
| name | String | Nombre de la plantilla |
| description | String | Descripción |
| processTypeId | Int | FK a ProcessType |
| isActive | Boolean | Disponibilidad |
| isLocked | Boolean | Bloqueada para edición |
| steps | Relation | Pasos de la plantilla |

#### ProcessInstance
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | Identificador único |
| title | String | Título del proceso |
| estado | EstadoProceso | PENDIENTE, EN_PROGRESO, COMPLETADO |
| processTypeId | Int | FK a ProcessType |
| templateId | Int | FK a ProcessTemplate |
| createdById | Int | Usuario creador |
| responsibleUserId | Int | Usuario responsable |
| year | Int | Año del proceso |
| month | Int | Mes del proceso |
| dueAt | DateTime | Fecha límite |

#### StepInstance
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | Identificador único |
| title | String | Nombre del paso |
| estado | EstadoPaso | PENDIENTE, COMPLETADO |
| processInstanceId | Int | FK a ProcessInstance |
| templateStepId | Int | FK a ProcessTemplateStep |
| completedAt | DateTime | Fecha de completado |

#### StepFile
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | Identificador único |
| name | String | Nombre del archivo |
| r2Key | String | Clave en R2 |
| mimeType | String | Tipo MIME |
| size | Int | Tamaño en bytes |
| stepInstanceId | Int | FK a StepInstance |
| uploadedById | Int | Usuario que subió |

---

## 7. API REST

### 7.1 Autenticación

Todas las rutas (excepto login) requieren el header:
```
Authorization: Bearer <token_jwt>
```

### 7.2 Endpoints Principales

#### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/login | Iniciar sesión |
| GET | /auth/profile | Obtener perfil actual |

#### Usuarios
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /users | Listar usuarios |
| POST | /users | Crear usuario |
| PATCH | /users/:id | Actualizar usuario |
| DELETE | /users/:id | Eliminar usuario |

#### Plantillas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /process-templates | Listar plantillas |
| POST | /process-templates | Crear plantilla |
| PATCH | /process-templates/:id | Actualizar plantilla |
| DELETE | /process-templates/:id | Eliminar plantilla |

#### Instancias de Proceso
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /process-instances | Listar procesos |
| POST | /process-instances | Crear proceso |
| GET | /process-instances/:id | Obtener detalle |
| PATCH | /process-instances/:id | Actualizar proceso |
| DELETE | /process-instances/:id | Eliminar proceso |
| PATCH | /process-instances/:id/responsible | Cambiar responsable |

#### Archivos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /steps/:id/files | Listar archivos de paso |
| POST | /steps/:id/files | Subir archivo |
| DELETE | /step-files/:id | Eliminar archivo |
| GET | /step-files/:id/download | Descargar archivo |

---

## 8. Seguridad

### 8.1 Autenticación y Autorización

- **JWT**: Tokens con expiración configurable.
- **Guards**: Protección de rutas por rol.
- **Validación**: DTOs con class-validator.

### 8.2 Control de Acceso

```typescript
// Ejemplo de guard por rol
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMINISTRADOR)
@Delete(':id')
remove(@Param('id') id: string) { ... }
```

### 8.3 Validación de Datos

- Sanitización de entradas
- Validación de tipos con DTOs
- Escape de caracteres especiales

### 8.4 Almacenamiento Seguro

- Contraseñas hasheadas con bcrypt
- Archivos en R2 con URLs pre-firmadas
- Variables sensibles en .env

---

## 9. Despliegue en Producción

### 9.1 Preparación del Backend

```bash
cd backend/api

# Compilar
npm run build

# Configurar variables de producción
export NODE_ENV=production
export DATABASE_URL="postgresql://..."

# Aplicar migraciones
npx prisma migrate deploy

# Iniciar
npm run start:prod
```

### 9.2 Preparación del Frontend

```bash
cd frontend

# Configurar API de producción
echo "VITE_API_URL=https://api.tudominio.com" > .env.production

# Compilar
npm run build

# Los archivos quedan en /build o /dist
```

### 9.3 Configuración de Nginx (Ejemplo)

```nginx
# Frontend
server {
    listen 80;
    server_name app.tudominio.com;
    root /var/www/gestion-documental/frontend/build;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend (Proxy)
server {
    listen 80;
    server_name api.tudominio.com;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9.4 PM2 (Gestión de Procesos)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar backend
pm2 start dist/main.js --name "gestion-api"

# Configurar inicio automático
pm2 startup
pm2 save
```

---

## 10. Mantenimiento

### 10.1 Respaldo de Base de Datos

```bash
# Crear respaldo
pg_dump -U usuario -d gestion_documental > backup_$(date +%Y%m%d).sql

# Restaurar
psql -U usuario -d gestion_documental < backup_20260111.sql
```

### 10.2 Logs

```bash
# NestJS logs
pm2 logs gestion-api

# Prisma query logs (habilitar en schema.prisma)
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

### 10.3 Actualización del Sistema

```bash
# Obtener cambios
git pull origin main

# Backend
cd backend/api
npm install
npx prisma migrate deploy
npm run build
pm2 restart gestion-api

# Frontend
cd frontend
npm install
npm run build
# Copiar build al servidor web
```

---

## 11. Extensibilidad

### 11.1 Agregar Nuevo Módulo (Backend)

```bash
cd backend/api
nest generate module nombre-modulo
nest generate controller nombre-modulo
nest generate service nombre-modulo
```

### 11.2 Agregar Nueva Entidad (Prisma)

1. Editar `prisma/schema.prisma`
2. Ejecutar `npx prisma migrate dev --name descripcion`
3. El cliente se regenera automáticamente

### 11.3 Agregar Componente (Frontend)

Los componentes se ubican en `frontend/src/components/`. Para componentes reutilizables de UI, usar el directorio `ui/` siguiendo el patrón de shadcn/ui.

---

## 12. Solución de Problemas

### Error: EPERM en Prisma Generate (Windows)

```bash
# Cerrar procesos Node.js
taskkill /F /IM node.exe

# Reintentar
npx prisma generate
```

### Error: Puerto en uso

```bash
# Linux/Mac
lsof -i :4000
kill -9 <PID>

# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Error de CORS

Verificar configuración en `main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:5173', 'https://tudominio.com'],
  credentials: true,
});
```

---

## 13. Referencias

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)

---

*Documento elaborado para el Sistema de Gestión Documental FIEC*  
*Versión 1.0 - Enero 2026*
