# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar OpenSSL y herramientas necesarias para compilar Prisma en Alpine
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Instalar OpenSSL en el contenedor de producción para el runtime de Prisma
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && node dist/main"]
