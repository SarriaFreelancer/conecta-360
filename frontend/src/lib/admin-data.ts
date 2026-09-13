// Centralized Admin Data Service for Conecta 360
// Connects to backend on port 3003 with offline-first resilient fallback

const apiPort = process.env.NEXT_PUBLIC_API_PORT || '3003';

// En el navegador, si se accede por túnel (ngrok, móvil o IP externa), usamos el proxy interno /api/backend
// para que no intente conectarse al localhost del propio teléfono móvil.
const isClient = typeof window !== 'undefined';
const isRemoteHost = isClient && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

export const API_BASE_URL = isRemoteHost
  ? '/api/backend'
  : (process.env.NEXT_PUBLIC_API_URL || `http://localhost:${apiPort}`);

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  services: { id: number; name: string; slug: string }[];
  requirements: { id: number; title: string; type: string; isRequired: boolean }[];
  totalPersons?: number;
}

export interface AdminService {
  id: number;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  category: {
    id: number;
    name: string;
  };
}

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL';
  isActive: boolean;
  createdAt: string;
  role: {
    id: number;
    name: string;
    description?: string;
  };
  profile?: {
    city?: string;
    department?: string;
    profession?: string;
    bio?: string;
  };
  providerProfile?: {
    hourlyRate?: number;
    rating?: number;
    totalReviews?: number;
    isVerified?: boolean;
    providerServices?: {
      service: {
        id: number;
        name: string;
        category: {
          id: number;
          name: string;
        };
      };
    }[];
  };
}

export interface AdminRole {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

// 8 Categorías Oficiales (Prisma Seed & Maqueta)
export const INITIAL_CATEGORIES: AdminCategory[] = [
  {
    id: 1,
    name: 'Cerrajería',
    slug: 'cerrajeria',
    description: 'Servicios de apertura de puertas, cambio e instalación de cerraduras residenciales y automotrices.',
    icon: 'wrench',
    isActive: true,
    totalPersons: 14,
    requirements: [
      { id: 1, title: 'Certificación Técnica en Cerrajería', type: 'CERTIFICATION', isRequired: true },
      { id: 2, title: 'Cédula de Ciudadanía', type: 'IDENTITY_DOCUMENT', isRequired: true }
    ],
    services: [
      { id: 1, name: 'Apertura de puertas de emergencia', slug: 'apertura-de-puertas' },
      { id: 2, name: 'Cambio de cerraduras y cilindros', slug: 'cambio-de-cerraduras' },
      { id: 3, name: 'Instalación de cerraduras de seguridad', slug: 'instalacion-cerraduras-seguridad' }
    ]
  },
  {
    id: 2,
    name: 'Electricidad',
    slug: 'electricidad',
    description: 'Instalaciones eléctricas residenciales e industriales, tableros y certificación de redes.',
    icon: 'zap',
    isActive: true,
    totalPersons: 28,
    requirements: [
      { id: 3, title: 'Matrícula Profesional CONTE / COPNIA', type: 'PROFESSIONAL_CARD', isRequired: true },
      { id: 4, title: 'Certificado de Alturas Vigente', type: 'CERTIFICATION', isRequired: false }
    ],
    services: [
      { id: 4, name: 'Reparación de cortocircuitos', slug: 'reparacion-cortocircuitos' },
      { id: 5, name: 'Instalación de iluminación LED y domótica', slug: 'instalacion-iluminacion-led' },
      { id: 6, name: 'Mantenimiento de tableros eléctricos', slug: 'mantenimiento-tableros-electricos' }
    ]
  },
  {
    id: 3,
    name: 'Tecnología',
    slug: 'tecnologia',
    description: 'Desarrollo de software, soporte técnico informático, redes, cámaras y telecomunicaciones.',
    icon: 'monitor',
    isActive: true,
    totalPersons: 22,
    requirements: [
      { id: 5, title: 'Certificación o Título en TI / Sistemas', type: 'CERTIFICATION', isRequired: false }
    ],
    services: [
      { id: 7, name: 'Desarrollo web y aplicaciones móviles', slug: 'desarrollo-web-apps' },
      { id: 8, name: 'Soporte técnico y mantenimiento de PCs', slug: 'soporte-tecnico-mantenimiento' },
      { id: 9, name: 'Instalación de redes WiFi y cableado estructurado', slug: 'redes-wifi-cableado' }
    ]
  },
  {
    id: 4,
    name: 'Reparaciones',
    slug: 'reparaciones',
    description: 'Mantenimiento del hogar, electrodomésticos, carpintería, persianas y estructuras.',
    icon: 'hammer',
    isActive: true,
    totalPersons: 19,
    requirements: [
      { id: 6, title: 'Certificado de Idoneidad u Oficio', type: 'CERTIFICATION', isRequired: false }
    ],
    services: [
      { id: 10, name: 'Reparación de electrodomésticos y lavadoras', slug: 'reparacion-electrodomesticos' },
      { id: 11, name: 'Carpintería y restauración de muebles', slug: 'carpinteria-muebles' },
      { id: 12, name: 'Mantenimiento de persianas, ventanas y puertas', slug: 'mantenimiento-persianas-puertas' }
    ]
  },
  {
    id: 5,
    name: 'Educación',
    slug: 'educacion',
    description: 'Clases particulares, tutorías académicas escolares, universitarias y enseñanza de idiomas.',
    icon: 'graduation-cap',
    isActive: true,
    totalPersons: 15,
    requirements: [
      { id: 7, title: 'Título Profesional o Licenciatura Docente', type: 'PROFESSIONAL_TITLE', isRequired: true }
    ],
    services: [
      { id: 13, name: 'Clases de matemáticas, cálculo y física', slug: 'clases-matematicas-fisica' },
      { id: 14, name: 'Tutorías de inglés y preparación TOEFL', slug: 'tutorias-ingles' },
      { id: 15, name: 'Refuerzo escolar integral de primaria y bachillerato', slug: 'refuerzo-escolar' }
    ]
  },
  {
    id: 6,
    name: 'Diseño',
    slug: 'diseno',
    description: 'Diseño gráfico publicitario, branding, diseño UI/UX, renders y producción audiovisual.',
    icon: 'palette',
    isActive: true,
    totalPersons: 17,
    requirements: [
      { id: 8, title: 'Portafolio de Trabajos Realizados', type: 'PORTFOLIO', isRequired: false }
    ],
    services: [
      { id: 16, name: 'Diseño de logotipos e identidad de marca', slug: 'diseno-logos-branding' },
      { id: 17, name: 'Diseño de interfaces UI/UX web y móvil', slug: 'diseno-ui-ux' },
      { id: 18, name: 'Material publicitario, catálogos y flyers', slug: 'material-publicitario' }
    ]
  },
  {
    id: 7,
    name: 'Salud y Bienestar',
    slug: 'salud',
    description: 'Atención domiciliaria en salud, fisioterapia, enfermería, nutrición y cuidado integral.',
    icon: 'heart-pulse',
    isActive: true,
    totalPersons: 12,
    requirements: [
      { id: 9, title: 'Registro RETHUS / Tarjeta Profesional de Salud', type: 'PROFESSIONAL_CARD', isRequired: true },
      { id: 10, title: 'Documento de Identidad Vigente', type: 'IDENTITY_DOCUMENT', isRequired: true }
    ],
    services: [
      { id: 19, name: 'Fisioterapia y rehabilitación física a domicilio', slug: 'fisioterapia-domicilio' },
      { id: 20, name: 'Acompañamiento y cuidados de enfermería', slug: 'cuidados-enfermeria' },
      { id: 21, name: 'Consulta y plan nutricional personalizado', slug: 'plan-nutricional' }
    ]
  },
  {
    id: 8,
    name: 'Plomería y Construcción',
    slug: 'plomeria',
    description: 'Instalaciones hidrosanitarias, detección de fugas, pintura, drywall y reformas generales.',
    icon: 'droplet',
    isActive: true,
    totalPersons: 31,
    requirements: [
      { id: 11, title: 'Certificación SENA en Plomería / Construcción', type: 'CERTIFICATION', isRequired: true }
    ],
    services: [
      { id: 22, name: 'Destape de tuberías y corrección de fugas', slug: 'destape-tuberias-fugas' },
      { id: 23, name: 'Instalación de grifería y sanitarios', slug: 'instalacion-griferia-sanitarios' },
      { id: 24, name: 'Pintura y acabados en estuco y drywall', slug: 'pintura-drywall-acabados' }
    ]
  }
];

// 24 Servicios Oficiales
export const INITIAL_SERVICES: AdminService[] = [
  { id: 1, name: 'Apertura de puertas de emergencia', slug: 'apertura-de-puertas', description: 'Apertura residencial y vehicular sin daños las 24 horas.', isActive: true, category: { id: 1, name: 'Cerrajería' } },
  { id: 2, name: 'Cambio de cerraduras y cilindros', slug: 'cambio-de-cerraduras', description: 'Reemplazo de guardas, cilindros de alta seguridad y cerrojos.', isActive: true, category: { id: 1, name: 'Cerrajería' } },
  { id: 3, name: 'Instalación de cerraduras de seguridad', slug: 'instalacion-cerraduras-seguridad', description: 'Montaje de cerraduras biométricas, electrónicas y multipunto.', isActive: true, category: { id: 1, name: 'Cerrajería' } },

  { id: 4, name: 'Reparación de cortocircuitos', slug: 'reparacion-cortocircuitos', description: 'Detección y solución inmediata de fallas eléctricas residenciales.', isActive: true, category: { id: 2, name: 'Electricidad' } },
  { id: 5, name: 'Instalación de iluminación LED y domótica', slug: 'instalacion-iluminacion-led', description: 'Diseño e instalación de luces LED, interruptores inteligentes y dimerización.', isActive: true, category: { id: 2, name: 'Electricidad' } },
  { id: 6, name: 'Mantenimiento de tableros eléctricos', slug: 'mantenimiento-tableros-electricos', description: 'Balance de cargas, cambio de breakers y certificación RETIE.', isActive: true, category: { id: 2, name: 'Electricidad' } },

  { id: 7, name: 'Desarrollo web y aplicaciones móviles', slug: 'desarrollo-web-apps', description: 'Creación de sitios web corporativos, tiendas online y apps multiplataforma.', isActive: true, category: { id: 3, name: 'Tecnología' } },
  { id: 8, name: 'Soporte técnico y mantenimiento de PCs', slug: 'soporte-tecnico-mantenimiento', description: 'Formateo, optimización, limpieza física y eliminación de virus.', isActive: true, category: { id: 3, name: 'Tecnología' } },
  { id: 9, name: 'Instalación de redes WiFi y cableado estructurado', slug: 'redes-wifi-cableado', description: 'Puntos de red Cat 6/6A, repetidores mesh y configuración de routers.', isActive: true, category: { id: 3, name: 'Tecnología' } },

  { id: 10, name: 'Reparación de electrodomésticos y lavadoras', slug: 'reparacion-electrodomesticos', description: 'Servicio técnico especializado en neveras, lavadoras y microondas.', isActive: true, category: { id: 4, name: 'Reparaciones' } },
  { id: 11, name: 'Carpintería y restauración de muebles', slug: 'carpinteria-muebles', description: 'Fabricación y reparación de closets, puertas de madera y cocinas integrales.', isActive: true, category: { id: 4, name: 'Reparaciones' } },
  { id: 12, name: 'Mantenimiento de persianas, ventanas y puertas', slug: 'mantenimiento-persianas-puertas', description: 'Ajuste de rieles, cambio de cordones, telas y rodamientos.', isActive: true, category: { id: 4, name: 'Reparaciones' } },

  { id: 13, name: 'Clases de matemáticas, cálculo y física', slug: 'clases-matematicas-fisica', description: 'Refuerzo universitario y de secundaria con docentes titulados.', isActive: true, category: { id: 5, name: 'Educación' } },
  { id: 14, name: 'Tutorías de inglés y preparación TOEFL', slug: 'tutorias-ingles', description: 'Clases conversacionales personalizadas para adultos y jóvenes.', isActive: true, category: { id: 5, name: 'Educación' } },
  { id: 15, name: 'Refuerzo escolar integral de primaria y bachillerato', slug: 'refuerzo-escolar', description: 'Acompañamiento en tareas escolares y técnicas de estudio.', isActive: true, category: { id: 5, name: 'Educación' } },

  { id: 16, name: 'Diseño de logotipos e identidad de marca', slug: 'diseno-logos-branding', description: 'Manual de marca completo, paleta de color y vectores profesionales.', isActive: true, category: { id: 6, name: 'Diseño' } },
  { id: 17, name: 'Diseño de interfaces UI/UX web y móvil', slug: 'diseno-ui-ux', description: 'Prototipos interactivos en Figma centrados en experiencia de usuario.', isActive: true, category: { id: 6, name: 'Diseño' } },
  { id: 18, name: 'Material publicitario, catálogos y flyers', slug: 'material-publicitario', description: 'Diseño para redes sociales, pendones, empaques y catálogos impresos.', isActive: true, category: { id: 6, name: 'Diseño' } },

  { id: 19, name: 'Fisioterapia y rehabilitación física a domicilio', slug: 'fisioterapia-domicilio', description: 'Terapia postquirúrgica, manejo del dolor y rehabilitación motriz.', isActive: true, category: { id: 7, name: 'Salud y Bienestar' } },
  { id: 20, name: 'Acompañamiento y cuidados de enfermería', slug: 'cuidados-enfermeria', description: 'Curación de heridas, administración de medicamentos y cuidado de adultos.', isActive: true, category: { id: 7, name: 'Salud y Bienestar' } },
  { id: 21, name: 'Consulta y plan nutricional personalizado', slug: 'plan-nutricional', description: 'Evaluación antropométrica y plan de alimentación según objetivos.', isActive: true, category: { id: 7, name: 'Salud y Bienestar' } },

  { id: 22, name: 'Destape de tuberías y corrección de fugas', slug: 'destape-tuberias-fugas', description: 'Sonda eléctrica para cañerías, bajantes y reparación de filtraciones.', isActive: true, category: { id: 8, name: 'Plomería y Construcción' } },
  { id: 23, name: 'Instalación de grifería y sanitarios', slug: 'instalacion-griferia-sanitarios', description: 'Montaje de lavamanos, lavaplatos, calentadores de paso e hidrogrupos.', isActive: true, category: { id: 8, name: 'Plomería y Construcción' } },
  { id: 24, name: 'Pintura y acabados en estuco y drywall', slug: 'pintura-drywall-acabados', description: 'Acabados finos interiores y exteriores con garantía de calidad.', isActive: true, category: { id: 8, name: 'Plomería y Construcción' } }
];

// Usuarios Oficiales
export const INITIAL_USERS: AdminUser[] = [
  {
    id: 1,
    email: 'superadmin@conecta360.com',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+57 300 000 0001',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z',
    role: { id: 1, name: 'SUPERADMIN', description: 'Super Administrador con control total del sistema' },
    profile: { city: 'Bogotá', department: 'Cundinamarca', profession: 'Administrador de Plataforma' }
  },
  {
    id: 2,
    email: 'admin@conecta360.com',
    firstName: 'Admin',
    lastName: 'Operaciones',
    phone: '+57 300 000 0002',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2026-01-15T11:00:00Z',
    role: { id: 2, name: 'ADMIN', description: 'Administrador del sistema y gestión de operaciones' },
    profile: { city: 'Cali', department: 'Valle del Cauca', profession: 'Coordinador Operativo' }
  },
  {
    id: 3,
    email: 'juan.perez@conecta360.com',
    firstName: 'Juan',
    lastName: 'Pérez',
    phone: '+57 312 456 7890',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2026-02-01T08:30:00Z',
    role: { id: 6, name: 'PROVIDER', description: 'Prestador de servicios verificado' },
    profile: { city: 'Cali', department: 'Valle del Cauca', profession: 'Técnico Cerrajero Maestro' },
    providerProfile: {
      hourlyRate: 35000,
      rating: 4.9,
      totalReviews: 128,
      isVerified: true,
      providerServices: [
        { service: { id: 1, name: 'Apertura de puertas de emergencia', category: { id: 1, name: 'Cerrajería' } } },
        { service: { id: 2, name: 'Cambio de cerraduras y cilindros', category: { id: 1, name: 'Cerrajería' } } }
      ]
    }
  },
  {
    id: 4,
    email: 'carlos.ruiz@conecta360.com',
    firstName: 'Carlos',
    lastName: 'Ruiz',
    phone: '+57 310 789 0123',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2026-02-05T09:15:00Z',
    role: { id: 6, name: 'PROVIDER', description: 'Prestador de servicios verificado' },
    profile: { city: 'Cali', department: 'Valle del Cauca', profession: 'Ingeniero Electricista Certificado' },
    providerProfile: {
      hourlyRate: 45000,
      rating: 4.8,
      totalReviews: 94,
      isVerified: true,
      providerServices: [
        { service: { id: 4, name: 'Reparación de cortocircuitos', category: { id: 2, name: 'Electricidad' } } },
        { service: { id: 6, name: 'Mantenimiento de tableros eléctricos', category: { id: 2, name: 'Electricidad' } } }
      ]
    }
  },
  {
    id: 5,
    email: 'diana.martinez@conecta360.com',
    firstName: 'Diana',
    lastName: 'Martínez',
    phone: '+57 301 234 5678',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2026-02-12T14:20:00Z',
    role: { id: 6, name: 'PROVIDER', description: 'Prestador de servicios verificado' },
    profile: { city: 'Cali', department: 'Valle del Cauca', profession: 'Diseñadora UI/UX Senior' },
    providerProfile: {
      hourlyRate: 50000,
      rating: 5.0,
      totalReviews: 43,
      isVerified: true,
      providerServices: [
        { service: { id: 16, name: 'Diseño de logotipos e identidad de marca', category: { id: 6, name: 'Diseño' } } },
        { service: { id: 17, name: 'Diseño de interfaces UI/UX web y móvil', category: { id: 6, name: 'Diseño' } } }
      ]
    }
  },
  {
    id: 6,
    email: 'andres.gomez@conecta360.com',
    firstName: 'Andrés',
    lastName: 'Gómez',
    phone: '+57 315 987 6543',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2026-02-18T16:40:00Z',
    role: { id: 6, name: 'PROVIDER', description: 'Prestador de servicios verificado' },
    profile: { city: 'Cali', department: 'Valle del Cauca', profession: 'Maestro Plomero e Instalador' },
    providerProfile: {
      hourlyRate: 38000,
      rating: 4.7,
      totalReviews: 81,
      isVerified: true,
      providerServices: [
        { service: { id: 22, name: 'Destape de tuberías y corrección de fugas', category: { id: 8, name: 'Plomería y Construcción' } } }
      ]
    }
  },
  {
    id: 7,
    email: 'laura.gutierrez@gmail.com',
    firstName: 'Laura',
    lastName: 'Gutiérrez',
    phone: '+57 318 654 3210',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2026-03-01T10:10:00Z',
    role: { id: 3, name: 'USER', description: 'Usuario estándar / Cliente del servicio' },
    profile: { city: 'Cali', department: 'Valle del Cauca', profession: 'Cliente Particular' }
  },
  {
    id: 8,
    email: 'mateo.silva@conecta360.com',
    firstName: 'Mateo',
    lastName: 'Silva',
    phone: '+57 310 333 2211',
    status: 'ACTIVE',
    isActive: true,
    createdAt: '2026-03-05T12:00:00Z',
    role: { id: 6, name: 'PROVIDER', description: 'Prestador de servicios verificado' },
    profile: { city: 'Cali', department: 'Valle del Cauca', profession: 'Ebanista y Carpintero' },
    providerProfile: {
      hourlyRate: 40000,
      rating: 4.8,
      totalReviews: 62,
      isVerified: true,
      providerServices: [
        { service: { id: 11, name: 'Carpintería y restauración de muebles', category: { id: 4, name: 'Reparaciones' } } }
      ]
    }
  }
];

// 7 Roles del Sistema
export const INITIAL_ROLES: AdminRole[] = [
  { id: 1, name: 'SUPERADMIN', description: 'Super Administrador con control total del sistema y acceso a configuraciones críticas.', createdAt: '2026-01-01' },
  { id: 2, name: 'ADMIN', description: 'Administrador operativo con gestión de usuarios, servicios, aprobaciones y soporte.', createdAt: '2026-01-01' },
  { id: 3, name: 'USER', description: 'Usuario estándar / Cliente que busca y contrata servicios o cuadrillas.', createdAt: '2026-01-01' },
  { id: 4, name: 'MODERATOR', description: 'Moderador de contenido, calificaciones y publicaciones de la comunidad.', createdAt: '2026-01-01' },
  { id: 5, name: 'SUPPORT', description: 'Personal de atención y resolución de disputas para clientes y servidores.', createdAt: '2026-01-01' },
  { id: 6, name: 'PROVIDER', description: 'Prestador de servicios profesional verificado con catálogo de oficios activo.', createdAt: '2026-01-01' },
  { id: 7, name: 'COMPANY', description: 'Empresa o cuadrilla constituida con capacidad de atención corporativa.', createdAt: '2026-01-01' }
];

// LocalStorage Persistence Keys
const CATS_KEY = 'conecta360_admin_categories_v2';
const SRVS_KEY = 'conecta360_admin_services_v2';
const USRS_KEY = 'conecta360_admin_users_v2';

// 1. Fetch Categories with Fallback
export async function getAdminCategories(): Promise<AdminCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(CATS_KEY, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (err) {
    console.warn(`[Conecta360 API] Backend en ${API_BASE_URL}/categories no disponible. Usando datos locales.`);
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CATS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }

  return INITIAL_CATEGORIES;
}

// 2. Fetch Services with Fallback
export async function getAdminServices(): Promise<AdminService[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/services`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(SRVS_KEY, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (err) {
    console.warn(`[Conecta360 API] Backend en ${API_BASE_URL}/services no disponible. Usando datos locales.`);
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SRVS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }

  return INITIAL_SERVICES;
}

// 3. Fetch Users with Fallback
export async function getAdminUsers(role?: string, category?: string, search?: string): Promise<AdminUser[]> {
  try {
    const params = new URLSearchParams();
    if (role && role !== 'ALL') params.append('role', role);
    if (category && category !== 'ALL') params.append('category', category);
    if (search && search.trim()) params.append('search', search.trim());

    const url = `${API_BASE_URL}/users${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(USRS_KEY, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (err) {
    console.warn(`[Conecta360 API] Backend en ${API_BASE_URL}/users no disponible. Usando datos locales.`);
  }

  let list: AdminUser[] = INITIAL_USERS;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(USRS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      } catch (e) {}
    }
  }

  // Filtrado local
  return list.filter((u) => {
    const matchesRole =
      !role ||
      role === 'ALL' ||
      u.role?.name === role ||
      (role === 'PROVIDER' && u.providerProfile) ||
      (role === 'USER' && !u.providerProfile);

    const matchesCat =
      !category ||
      category === 'ALL' ||
      u.providerProfile?.providerServices?.some((ps) => ps.service.category.name.toLowerCase().includes(category.toLowerCase())) ||
      u.profile?.profession?.toLowerCase().includes(category.toLowerCase());

    const q = (search || '').toLowerCase();
    const matchesSearch =
      !q ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      (u.profile?.city && u.profile.city.toLowerCase().includes(q));

    return matchesRole && matchesCat && matchesSearch;
  });
}

// 4. Fetch Roles with Fallback
export async function getAdminRoles(): Promise<AdminRole[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/roles`, { signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn(`[Conecta360 API] Backend en ${API_BASE_URL}/roles no disponible. Usando roles iniciales.`);
  }
  return INITIAL_ROLES;
}

// ==========================================
// 5. RESERVAS & ÓRDENES (Bookings) API
// ==========================================
export async function createBookingBackend(dto: {
  clientId: number;
  providerId: number;
  serviceTitle: string;
  categoryName: string;
  amount: number;
  paymentMethod?: string;
  estimatedTimeRange?: string;
  locationZone?: string;
  dateString?: string;
  notes?: string;
  teamBookingId?: string;
  teamProjectName?: string;
  teamMembersCount?: number;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Conecta360 API] Error guardando reserva en backend:', err);
  }
  return null;
}

export async function fetchBookingsByClient(clientId: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/client/${clientId}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Conecta360 API] Error consultando reservas de cliente en backend:', err);
  }
  return [];
}

export async function fetchBookingsByProvider(providerId: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/provider/${providerId}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Conecta360 API] Error consultando reservas de prestador en backend:', err);
  }
  return [];
}

export async function updateBookingStatusBackend(
  bookingId: number,
  status: 'CONFIRMADO' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO' | 'RECHAZADO',
  rejectionReason?: string,
  rejectionExplanation?: string
) {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rejectionReason, rejectionExplanation }),
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Conecta360 API] Error actualizando estado de reserva en backend:', err);
  }
  return null;
}

// ==========================================
// 6. RESEÑAS & CALIFICACIONES (Reviews) API
// ==========================================
export async function createReviewBackend(dto: {
  clientId: number;
  providerId: number;
  bookingId?: number;
  rating: number;
  comment?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Conecta360 API] Error guardando reseña en backend:', err);
  }
  return null;
}

export async function fetchReviewsByProvider(providerId: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/provider/${providerId}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Conecta360 API] Error consultando reseñas en backend:', err);
  }
  return [];
}

// ==========================================
// 7. NOTIFICACIONES (Notifications) API
// ==========================================
export async function fetchNotificationsByUser(userId: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/user/${userId}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Conecta360 API] Error consultando notificaciones en backend:', err);
  }
  return [];
}

export async function markNotificationAsReadBackend(notifId: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${notifId}/read`, {
      method: 'PATCH',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Conecta360 API] Error marcando notificación como leída:', err);
  }
  return null;
}

