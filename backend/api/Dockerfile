FROM node:22-alpine

# Instalar dependencias necesarias para Prisma (OpenSSL)
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (incluyendo devDependencies para build)
RUN npm install

# Copiar el código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# Exponer puerto (por defecto NestJS usa 3000)
EXPOSE 4000

# Comando para iniciar (se puede sobreescribir en docker-compose para migraciones)
CMD ["npm", "run", "start:prod"]
