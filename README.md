# CONECTA 360 — Plataforma de Servicios

> **Eslogan principal:** Conecta lo que necesitas con quien puede hacerlo.
> **Eslogan secundario:** Necesitas. Encuentras. Contratas.

CONECTA 360 es un marketplace de servicios profesional, modular y altamente escalable desarrollado con **NestJS**, **Prisma ORM**, **MySQL** y **Next.js (App Router)** utilizando `pnpm` como gestor de paquetes.

---

## 🚀 Requisitos Previos

- **Node.js** v18+
- **pnpm** (`npm install -g pnpm`)
- **MySQL Server** (escuchando en `localhost:3306` con usuario `root` y contraseña `root`)

---

## 🛠️ Estructura del Proyecto

```text
conecta360/
├── backend/                  # API REST en NestJS + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma     # Modelos de base de datos MySQL
│   │   ├── seed.ts           # Carga de roles, SuperAdmin, Admin y datos de demo
│   │   └── migrations/       # Historial de migraciones SQL
│   ├── src/
│   │   ├── users/            # Módulo y endpoints REST de Usuarios
│   │   ├── profiles/         # Módulo y endpoints REST de Perfiles
│   │   ├── roles/            # Módulo y endpoints REST de Roles
│   │   └── prisma/           # Servicio global Prisma
│   ├── .env                  # Variables de entorno (Ignorado por Git)
│   └── .env.example          # Plantilla de variables de entorno
│
└── frontend/                 # Aplicación Web en Next.js (App Router) + Tailwind CSS
    ├── src/
    │   └── app/
    │       ├── page.tsx          # Landing Page principal
    │       ├── admin/
    │       │   ├── page.tsx      # Dashboard Administrativo
    │       │   └── users/        # Gestión de Usuarios
    │       └── profile/[id]/     # Vista de Perfil de Usuario
```

---

## ⚙️ Configuración del Backend

1. **Entrar al directorio del backend:**
   ```bash
   cd backend
   ```

2. **Instalar dependencias con `pnpm`:**
   ```bash
   npx pnpm install
   ```

3. **Verificar el archivo `.env`:**
   ```env
   DATABASE_URL="mysql://root:root@localhost:3306/conecta360"
   PORT=3001

   SUPERADMIN_EMAIL="superadmin@conecta360.com"
   SUPERADMIN_PASSWORD="SuperSecretPassword123!"

   ADMIN_EMAIL="admin@conecta360.com"
   ADMIN_PASSWORD="AdminSecretPassword123!"
   ```

4. **Ejecutar migraciones de Prisma:**
   ```bash
   npx prisma migrate dev
   ```

5. **Ejecutar el Seed inicial:**
   ```bash
   npx prisma db seed
   ```

6. **Iniciar el servidor backend en desarrollo:**
   ```bash
   npx pnpm start:dev
   ```
   El backend estará disponible en `http://localhost:3001`.

---

## 💻 Configuración del Frontend

1. **Entrar al directorio del frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias con `pnpm`:**
   ```bash
   npx pnpm install
   ```

3. **Iniciar el servidor del frontend:**
   ```bash
   npx pnpm dev
   ```
   El frontend estará disponible en `http://localhost:3000`.

---

## 📌 Endpoints de la API REST

### Usuarios (`/users`)
- `GET /users` — Lista todos los usuarios (sin exponer contraseñas).
- `GET /users/:id` — Obtiene detalles de un usuario por ID incremental o UUID.
- `POST /users` — Crea un nuevo usuario con contraseña hasheada en bcrypt.
- `PATCH /users/:id` — Actualiza un usuario existente.
- `DELETE /users/:id` — Elimina un usuario por ID.

### Perfiles (`/profiles`)
- `GET /profiles/:userId` — Obtiene el perfil asociado a un usuario.
- `POST /profiles/:userId` — Crea o actualiza el perfil de un usuario.
- `PATCH /profiles/:userId` — Actualiza campos del perfil.

### Roles (`/roles`)
- `GET /roles` — Consulta los roles disponibles.
- `GET /roles/:id` — Obtiene detalles de un rol.

---

## 🌟 Rutas Visuales del Frontend

- `/` — Landing Page principal con buscador visual de servicios y categorías populares.
- `/admin` — Panel Administrativo general con estadísticas e indicadores del marketplace.
- `/admin/users` — Gestión administrativa de usuarios registrados.
- `/profile/1` — Vista detallada de perfil de usuario.

---

## 🔐 Seguridad e Identidad

- Contraseñas encriptadas con `bcrypt`.
- Identificadores públicos en `uuid` para evitar la exposición de IDs secuenciales.
- DTOs validados con `class-validator` y `class-transformer` (`whitelist` y `forbidNonWhitelisted`).
- Protección de cabeceras mediante `Helmet` y CORS configurado.
