# Etapa 1: Build
FROM node:22-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Build arguments for Vite
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=${VITE_API_URL}

COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar configuración de nginx si es necesario (opcional, usamos default por ahora)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos desde la etapa anterior
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
