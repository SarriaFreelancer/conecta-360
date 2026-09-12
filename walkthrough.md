# Walkthrough: Logo Oficial, Contexto Colombia (Cali), Autenticación y Panel de Control de Prestadores

Se implementaron todos los requerimientos solicitados para la plataforma **CONECTA 360**:

---

## 1. Logo Oficial en la Barra de Navegación
- **Imagen Procesada**: Se tomó la imagen de alta resolución provista por el usuario, se recortaron márgenes sobrantes y se convirtió el fondo a transparencia pura (`frontend/public/images/logo-conecta-nav.png`).
- **Ajuste de Tamaño**: Se configuró en la barra de navegación superior con una escala equilibrada (`h-8 sm:h-9 w-auto object-contain`), luciendo nítido tanto en pantallas de escritorio como móviles sin desbordar los límites del header.

---

## 2. Contexto Geográfico de Colombia con Núcleo Inicial en Cali
- **Módulo de Datos Geográficos (`frontend/src/lib/colombia-data.ts`)**:
  - Incorpora todos los departamentos de Colombia y sus municipios/ciudades con terminales terrestres y aeropuertos.
  - Sede inicial y predeterminada: **Cali** (Valle del Cauca), con cobertura metropolitana a Palmira, Jamundí, Yumbo, Buenaventura, Tuluá, Buga y Cartago.
  - Ciudades nacionales conectadas: Bogotá D.C., Medellín, Barranquilla, Bucaramanga, Cartagena, Pereira, Manizales, Santa Marta, Cúcuta, Ibagué, Pasto, etc.
- **Selector de Ciudad en la Barra de Búsqueda (Hero)**:
  - Inicialmente activo en **Cali**.
  - Menú interactivo con buscador para filtrar por cualquier ciudad de Colombia o seleccionar "Toda Colombia".
  - Las tarjetas de prestadores se filtran de forma dinámica en tiempo real según la ciudad seleccionada.
- **Base de Datos MySQL y Tarjetas**:
  - Se actualizaron los perfiles de MySQL y los prestadores de respaldo a ciudades de Colombia, teléfonos colombianos (`+57`) y tarifas en Pesos Colombianos (`$ COP/h`).

---

## 3. Autenticación de Usuarios (`/login` y `/register`)
- **Registro (`/register`)**:
  - Permite registrarse como **Cliente** ("Quiero contratar") o **Prestador** ("Quiero ofrecer servicios").
  - Selector de Departamento y Ciudad de Colombia (predeterminado Valle del Cauca y Cali).
  - Teléfono con prefijo Colombia (`+57`).
  - Al registrarse como prestador, el usuario inicia sesión inmediatamente y su estado queda en **`PENDING`** ("Pendiente de Verificación"), permitiéndole configurar sus servicios de inmediato.
- **Inicio de Sesión (`/login`)**:
  - Formulario con diseño corporativo y Colombia context.
  - Botones de acceso rápido para pruebas ("Soy Prestador en Cali", "Soy Cliente").
  - Redirección inteligente: si es prestador va directamente a su panel de control (`/dashboard`).

---

## 4. Panel de Control del Usuario / Prestador (`/dashboard`)
- **Regla del Plan Gratuito (1 Solo Servicio)**:
  - Monitorea el número de servicios publicados (1/1).
  - Si el usuario intenta agregar un segundo servicio en el plan gratis, se abre una ventana modal que le notifica el límite del Plan Gratuito y le ofrece la opción de actualizar a Plan Pro.
- **Tarifa Base Global del Administrador**:
  - El formulario de nuevo servicio obtiene por defecto la tarifa configurada por el Superadmin en la configuración global (`$45.000 COP / hora`).
  - Indica al usuario que es la tarifa sugerida por la plataforma, permitiéndole adaptarla.
- **Límite de 10 Actividades Relacionadas**:
  - Campo interactivo para añadir especialidades / tags.
  - Contador en tiempo real `X / 10 actividades permitidas`.
  - Impide agregar más de 10 actividades.
- **Ubicación y Cobertura**:
  - Selector de Departamento y Ciudad de Colombia con acceso a transportes (Cali preseleccionada).
  - Campo de zonas de cobertura y desplazamiento.
- **Validación Condicional de Título Profesional**:
  - Detecta si la categoría seleccionada (ej. Electricidad, Cerrajería, Salud, Educación, Plomería) exige acreditación técnica.
  - Solicita obligatoriamente el número de matrícula / título profesional y permite adjuntar el documento de soporte.
- **Estado de Verificación Única**:
  - Badge visual en el perfil: **"Pendiente de Verificación"** (ámbar) vs **"Profesional Verificado"** (azul/verde).
  - Previsualización en vivo de la tarjeta pública idéntica a cómo la verán los clientes en Cali, mostrando el badge de verificación correspondiente.
  - Botón de simulación para alternar entre "Pendiente" y "Verificado" y probar el comportamiento en las tarjetas públicas.

---

## 5. Navegación Dinámica en la Página Principal
- Si el usuario está autenticado, la barra de navegación muestra su nombre, estado, botón a **"Mi Panel"** y opción de **"Cerrar Sesión"**.
- El botón **"Quiero ofrecer"** redirige a `/dashboard` si ya inició sesión, o al registro como prestador (`/register?role=provider`) si es un visitante nuevo.
- Cualquier servicio publicado por el usuario se integra inmediatamente en las tarjetas de búsqueda de Cali y Colombia.

---

## Verificación de Compilación y Servidores
- `next build`: **18/18 rutas estáticas y dinámicas compiladas exitosamente (0 errores)**.
- Servidores activos:
  - Frontend: `http://localhost:3000` (Status 200 en `/`, `/login`, `/register`, `/dashboard`, `/admin`).
  - Backend NestJS + Prisma MySQL: `http://localhost:3001` (Status 200 en `/providers`, `/categories`).
