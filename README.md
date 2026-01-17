# Sistema de Gestión Documental FIEC

Sistema web para la gestión de procesos documentales de la Facultad de Ingeniería en Electricidad y Computación (FIEC) - ESPOL.

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Backend | NestJS + TypeScript |
| ORM | Prisma |
| Base de Datos | PostgreSQL |
| Almacenamiento | Cloudflare R2 |
| Autenticación | JWT |

## Características Principales

- **Gestión de Procesos**: Crear, editar y dar seguimiento a procesos documentales
- **Plantillas Configurables**: Definir estructuras de procesos reutilizables con pasos obligatorios y opcionales
- **Gestión de Documentos**: Subida, descarga y versionado de archivos por paso
- **Delegación**: Asignar procesos a usuarios responsables
- **Roles de Usuario**: Administrador, Gestor, Lector, Ayudante
- **Reportes**: Exportación de procesos y documentos en ZIP
- **Ordenamiento y Filtros**: Tablas ordenables por columnas con filtros avanzados

## Requisitos Previos

- Node.js ≥ 18
- Docker Desktop
- Git

## Instalación Rápida

### 1. Base de Datos

```bash
docker run --name fiec-postgres \
  -e POSTGRES_DB=fiec_docs \
  -e POSTGRES_USER=fiec_user \
  -e POSTGRES_PASSWORD=fiec_pass \
  -p 5433:5432 \
  -v fiec_pgdata:/var/lib/postgresql/data \
  -d postgres:16
```

### 2. Backend

```bash
cd backend/api
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales

# Aplicar migraciones
npx prisma migrate dev

# Iniciar servidor
npm run start:dev
```

### 3. Frontend

```bash
cd frontend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con URL del backend

# Iniciar servidor
npm run dev
```

### 4. Acceder

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## Variables de Entorno

### Backend (`backend/api/.env`)

```env
DATABASE_URL="postgresql://fiec_user:fiec_pass@localhost:5433/fiec_docs"
JWT_SECRET="clave_secreta_segura"
JWT_EXPIRATION="7d"
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_URL="..."
PORT=4000
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:4000
```

## Estructura del Proyecto

```
├── backend/
│   └── api/
│       ├── src/
│       │   ├── auth/              # Autenticación JWT
│       │   ├── users/             # Gestión de usuarios
│       │   ├── process-types/     # Tipos de proceso
│       │   ├── process-templates/ # Plantillas
│       │   ├── process-instances/ # Instancias de proceso
│       │   ├── step-files/        # Archivos de pasos
│       │   └── r2/                # Almacenamiento
│       └── prisma/
│           └── schema.prisma      # Modelo de datos
│
├── frontend/
│   └── src/
│       ├── api/                   # Llamadas HTTP
│       ├── components/            # Componentes React
│       │   └── ui/                # Componentes base (shadcn)
│       ├── hooks/                 # Custom hooks
│       └── types/                 # Definiciones TypeScript
│
├── MANUAL_USUARIO.md              # Manual de usuario
└── MANUAL_IMPLEMENTACION.md       # Manual técnico
```

## Comandos Útiles

### Backend

```bash
npm run start:dev     # Desarrollo con hot-reload
npm run build         # Build de producción
npx prisma studio     # Explorador de BD visual
npx prisma migrate dev --name <nombre>  # Nueva migración
```

### Frontend

```bash
npm run dev           # Desarrollo
npm run build         # Build de producción
npm run preview       # Previsualizar build
```

## Documentación

- [Manual de Usuario](./MANUAL_USUARIO.md)
- [Manual de Implementación](./MANUAL_IMPLEMENTACION.md)

## Licencia

Proyecto de tesis - ESPOL 2026
