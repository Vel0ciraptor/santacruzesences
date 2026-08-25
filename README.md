# CRM Perfumería — Santa Cruz Essence 🌹✨

Sistema CRM y Catálogo Web completo desarrollado para **Santa Cruz Essence**. Permite ventas en tienda (POS con escáner QR), catálogo público con pedidos automáticos por WhatsApp (+591 68919448), ruleta de sorteos en vivo para clientes, control de inventario con alertas de stock mínimo, importación/exportación masiva en Excel y respaldos completos JSON para producción.

---

## 🎨 Paleta & Branding
- **Línea de diseño:** Verdes Esmeralda y Azules Marino con acentos dorados y glassmorphism.
- **Marca:** Santa Cruz Essence.
- **Moneda oficial:** Bolivianos (Bs.).

---

## 🚀 Subir a GitHub (Paso a Paso)

Sigue estos comandos en tu terminal desde la raíz del proyecto (`santa cruz perfumeria`):

```bash
# 1. Inicializar Git (si no está inicializado)
git init

# 2. Agregar todos los archivos (respetando el .gitignore seguro)
git add .

# 3. Crear el commit inicial
git commit -m "feat: Santa Cruz Essence CRM & Catálogo con carga/descarga masiva y producción"

# 4. Configurar la rama principal
git branch -M main

# 5. Conectar con tu repositorio de GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# 6. Subir los cambios a GitHub
git push -u origin main
```

---

## 📦 Importación y Exportación Rápida de Datos

El sistema incluye dos herramientas potentes para subir y bajar información de forma ultra rápida:

1. **Catálogo de Productos en Excel (.xlsx)**:
   - **Descargar Plantilla:** Descarga un modelo con las columnas exactas (`SKU`, `Nombre`, `Precio`, etc.).
   - **Exportar Todo el Catálogo:** Descarga el inventario actual completo a Excel con un clic.
   - **Carga Masiva / Upsert:** Sube tu archivo Excel. Si un producto ya existe, se actualizan sus precios y datos automáticamente; si es nuevo, se crea con su stock inicial.

2. **Copia de Seguridad del Sistema (Backup JSON)** en `/admin/reportes`:
   - **Descargar Backup Completo:** Genera un archivo `.json` con todas las tablas (productos, stocks, clientes, usuarios, premios).
   - **Restaurar / Importar Backup:** Sube el JSON para migrar la base de datos de local a producción en 1 segundo.

---

## 🌐 Despliegue en Producción con Docker (VPS / Dokploy / Coolify)

1. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus contraseñas seguras y dominio
   ```

2. **Levantar contenedores con Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

3. **Verificación de servicios:**
   - **Frontend:** `http://tudominio.com` o `http://IP:80`
   - **Backend API:** `http://tudominio.com/api/v1` o `http://IP:3000/api/v1`

---

## 🔑 Credenciales por Defecto (Seeder Inicial)

- **Email:** `admin@santacruzessence.com`
- **Contraseña:** `Admin123!`
- **Rol:** `ADMIN`

---

## 💻 Desarrollo Local (Sin Docker)

### Backend (NestJS + Prisma):
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run start:dev
```

### Frontend (React + Vite):
```bash
cd frontend
npm install
npm run dev
```
