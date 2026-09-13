// Servicio y utilidades de Autenticación y Gestión de Proveedores para Conecta 360 Colombia
import { getGlobalSettings, calculatePlatformFee } from './system-settings';

export interface ServiceHistoryItem {
  id: string;
  serviceTitle: string;
  categoryName: string;
  clientName: string;
  clientPhone?: string;
  providerName: string;
  providerPhone?: string;
  date: string;
  status: 'SOLICITADO' | 'CONFIRMADO' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO' | 'PENDIENTE';
  amount: number; // Monto en COP
  paymentStatus: 'PAGADO' | 'PENDIENTE';
  paymentMethod: 'Transferencia Bancaria' | 'Efectivo' | 'Tarjeta de Crédito / Débito';
  platformFee?: number; // Tarifa de descuento mínima para la plataforma
  platformDebtStatus?: 'EN_DEUDA' | 'AL_DIA' | 'NO_APLICA'; // En deuda cuando es Efectivo o Transferencia
  rating?: number; // 1 a 5 estrellas
  reviewComment?: string;
  estimatedTimeRange?: string; // Rango de tiempo estimado (ej. "2 a 4 horas", "1 día hábil", etc.)
  teamBookingId?: string; // ID si pertenece a una solicitud de equipo de trabajo
  teamProjectName?: string;
  teamMembersCount?: number;
  messageNotes?: string;
}

export interface AppNotification {
  id: string;
  userId: number | string;
  title: string;
  message: string;
  type: 'SERVICE_REQUEST' | 'SERVICE_CONFIRMED' | 'TEAM_REQUEST' | 'MESSAGE' | 'SYSTEM';
  date: string;
  createdAt?: string;
  read: boolean;
  link?: string;
  actionRequired?: boolean;
  serviceId?: string;
  timeRange?: string;
  estimatedTimeRange?: string;
}

export interface UserSession {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'USER' | 'PROVIDER' | 'ADMIN' | 'SUPERADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isVerified: boolean;
  plan: 'FREE' | 'PRO';
  createdAt: string;
  profile: {
    city: string;
    department: string;
    country: string;
    profession?: string;
    titleDocument?: string;
    bio?: string;
    profilePhoto?: string;
    address?: string;
    showWhatsApp?: boolean; // Interruptor ON / OFF para mostrar WhatsApp en perfil
    whatsappNumber?: string; // Número de WhatsApp oficial
  };
  services: ProviderServiceItem[];
  history: ServiceHistoryItem[];
  platformDebt?: number; // Deuda pendiente con la plataforma
}

export interface ProviderServiceItem {
  id: string;
  title: string;
  categoryId: number;
  categoryName: string;
  hourlyRate: number;
  activities: string[]; // Límite máximo de 10 actividades
  featuredActivities?: string[]; // Hasta 4 actividades elegidas para exhibir en la tarjeta pública
  city: string;
  department: string;
  coverageZones?: string;
  titleRequired: boolean;
  titleCertification?: string;
  certificateFileName?: string;
  createdAt: string;
}

const AUTH_STORAGE_KEY = 'conecta360_user_session';
const ALL_USERS_STORAGE_KEY = 'conecta360_registered_users';
const NOTIFICATIONS_STORAGE_KEY = 'conecta360_notifications';

export function getInitialProviderSession(): UserSession {
  const global = getGlobalSettings();
  return {
    id: 999,
    email: 'carlos.rodriguez@conecta360.co',
    firstName: 'Carlos Andrés',
    lastName: 'Rodríguez',
    phone: '+57 315 789 4521',
    role: 'PROVIDER',
    status: 'PENDING', // Al registrarse queda pendiente pero inicia sesión normal
    isVerified: false,  // Tarjeta muestra "Pendiente de verificación" hasta que el admin apruebe
    plan: 'FREE',       // Plan gratis: solo 1 servicio
    createdAt: new Date().toISOString(),
    profile: {
      city: 'Cali',
      department: 'Valle del Cauca',
      country: 'Colombia',
      profession: 'Técnico Electricista e Instalaciones',
      bio: 'Especialista en instalaciones eléctricas residenciales, cuadros de mando y mantenimiento 24/7 en Cali y área metropolitana.',
      profilePhoto: '/images/service-electricista.jpg',
      address: 'Calle 5 # 38-20, San Fernando, Cali',
      showWhatsApp: true,
      whatsappNumber: '+57 315 789 4521',
    },
    services: [
      {
        id: 'srv-1',
        title: 'Instalaciones Eléctricas y Reparaciones Residenciales',
        categoryId: 2,
        categoryName: 'Electricidad',
        hourlyRate: global.defaultHourlyRate, // Tarifa por defecto configurada por el admin
        activities: [
          'Instalación de acometidas y circuitos',
          'Reparación de cortocircuitos y fallas',
          'Montaje de tableros de breakers',
          'Instalación de iluminación LED y tomas',
          'Mantenimiento preventivo locativo',
          'Cableado estructurado y canaletas',
          'Detección de sobrecargas y fugas',
          'Instalación de polo a tierra y GFCI',
          'Revisión y certificación RETIE',
          'Asesoría técnica y pruebas de carga',
        ], // 10 actividades completas del servicio
        featuredActivities: [
          'Instalación de acometidas y circuitos',
          'Reparación de cortocircuitos y fallas',
          'Montaje de tableros de breakers',
          'Instalación de iluminación LED y tomas',
        ], // 4 elegidas para la tarjeta pública exterior
        city: 'Cali',
        department: 'Valle del Cauca',
        coverageZones: 'Cali (Norte, Sur, Oeste), Jamundí, Yumbo',
        titleRequired: true,
        titleCertification: 'Tarjeta Profesional CONTE TE-1 94827',
        certificateFileName: 'matricula_conte_carlos_rodriguez.pdf',
        createdAt: new Date().toISOString(),
      },
    ],
    platformDebt: 11750, // Deuda de $11.750 COP por comisiones de cobros directos en Efectivo/Transferencia
    history: [
      {
        id: 'hist-req-new',
        serviceTitle: 'Adecuación de Iluminación y Tomas en Apartamento',
        categoryName: 'Electricidad',
        clientName: 'Laura Gómez',
        clientPhone: '+57 312 456 7890',
        providerName: 'Carlos Andrés Rodríguez',
        providerPhone: '+57 315 789 4521',
        date: 'Hoy, 08:30 AM',
        status: 'SOLICITADO',
        amount: 110000,
        paymentStatus: 'PENDIENTE',
        paymentMethod: 'Transferencia Bancaria',
        platformFee: 5500,
        platformDebtStatus: 'EN_DEUDA',
        estimatedTimeRange: '2 a 3 horas (Tarde 2:00 PM - 5:00 PM)',
        messageNotes: 'Hola Carlos, necesitamos revisar las tomas de corriente y puntos LED en la sala.',
      },
      {
        id: 'hist-1',
        serviceTitle: 'Instalación de Cuadro Eléctrico Principal y Breakers',
        categoryName: 'Electricidad',
        clientName: 'Laura Gómez',
        clientPhone: '+57 312 456 7890',
        providerName: 'Carlos Andrés Rodríguez',
        providerPhone: '+57 315 789 4521',
        date: '12 Sep 2026, 10:30 AM',
        status: 'COMPLETADO',
        amount: 140000,
        paymentStatus: 'PAGADO',
        paymentMethod: 'Transferencia Bancaria',
        platformFee: 7000, // Comisión 5%
        platformDebtStatus: 'EN_DEUDA', // Al ser transferencia directa, queda en deuda con la plataforma
        rating: 5,
        reviewComment: 'Excelente profesional, llegó a tiempo y dejó todo funcionando impecable en Granada.',
      },
      {
        id: 'hist-2',
        serviceTitle: 'Reparación Urgente de Cortocircuito Residencial',
        categoryName: 'Electricidad',
        clientName: 'Andrés Ramírez',
        clientPhone: '+57 311 987 6543',
        providerName: 'Carlos Andrés Rodríguez',
        providerPhone: '+57 315 789 4521',
        date: '10 Sep 2026, 04:15 PM',
        status: 'COMPLETADO',
        amount: 95000,
        paymentStatus: 'PAGADO',
        paymentMethod: 'Efectivo',
        platformFee: 4750, // Comisión 5%
        platformDebtStatus: 'EN_DEUDA', // Al ser en efectivo directo, queda en deuda con la plataforma
        rating: 5,
        reviewComment: 'Solucionó el cortocircuito en menos de 45 minutos. Muy honesto y recomendado.',
      },
      {
        id: 'hist-3',
        serviceTitle: 'Mantenimiento Preventivo Acometida Residencial',
        categoryName: 'Electricidad',
        clientName: 'Sofía Martínez',
        clientPhone: '+57 314 234 5678',
        providerName: 'Carlos Andrés Rodríguez',
        providerPhone: '+57 315 789 4521',
        date: 'Hoy, 02:00 PM',
        status: 'EN_PROGRESO',
        amount: 85000,
        paymentStatus: 'PENDIENTE',
        paymentMethod: 'Transferencia Bancaria',
        platformFee: 4250,
        platformDebtStatus: 'EN_DEUDA',
      },
      {
        id: 'hist-4',
        serviceTitle: 'Instalación de Iluminación LED y Tomas Ocultas',
        categoryName: 'Electricidad',
        clientName: 'Juan Camilo Osorio',
        clientPhone: '+57 316 789 0123',
        providerName: 'Carlos Andrés Rodríguez',
        providerPhone: '+57 315 789 4521',
        date: '14 Sep 2026, 09:00 AM',
        status: 'PENDIENTE',
        amount: 120000,
        paymentStatus: 'PENDIENTE',
        paymentMethod: 'Tarjeta de Crédito / Débito',
        platformFee: 6000,
        platformDebtStatus: 'AL_DIA', // Plataforma descuenta automáticamente en pagos con tarjeta
      },
    ],
  };
}

export function getInitialSuperAdminSession(): UserSession {
  return {
    id: 100,
    email: 'superadmin@conecta360.com',
    firstName: 'Super',
    lastName: 'Admin',
    phone: '+57 300 000 0001',
    role: 'SUPERADMIN',
    status: 'APPROVED',
    isVerified: true,
    plan: 'PRO',
    createdAt: new Date().toISOString(),
    profile: {
      city: 'Bogotá',
      department: 'Cundinamarca',
      country: 'Colombia',
      profession: 'Super Administrador Principal',
      bio: 'Control y configuración global de Conecta 360, tarifas mínimas y comisiones.',
      profilePhoto: undefined,
      address: 'Sede Principal Conecta 360',
    },
    services: [],
    history: [],
    platformDebt: 0,
  };
}

export function getInitialAdminSession(): UserSession {
  return {
    id: 101,
    email: 'admin@conecta360.com',
    firstName: 'Admin',
    lastName: 'Operaciones',
    phone: '+57 300 000 0002',
    role: 'ADMIN',
    status: 'APPROVED',
    isVerified: true,
    plan: 'PRO',
    createdAt: new Date().toISOString(),
    profile: {
      city: 'Medellín',
      department: 'Antioquia',
      country: 'Colombia',
      profession: 'Administrador de Operaciones y Verificaciones',
      bio: 'Gestión de usuarios, control de prestadores y seguimiento de deudas de intermediación.',
      profilePhoto: undefined,
      address: 'Oficina de Operaciones Valle y Antioquia',
    },
    services: [],
    history: [],
    platformDebt: 0,
  };
}

export function getInitialClientSession(): UserSession {
  return {
    id: 888,
    email: 'laura.gomez@gmail.com',
    firstName: 'Laura',
    lastName: 'Gómez',
    phone: '+57 312 456 7890',
    role: 'USER',
    status: 'APPROVED',
    isVerified: true,
    plan: 'FREE',
    createdAt: new Date().toISOString(),
    profile: {
      city: 'Cali',
      department: 'Valle del Cauca',
      country: 'Colombia',
      profession: 'Diseñadora de Interiores',
      bio: 'Usuaria de Conecta 360 en Cali. Contrato profesionales de confianza para remodelaciones y mantenimiento en mi hogar.',
      profilePhoto: '/images/avatar-laura.png',
      address: 'Calle 9 # 24-50, Granada, Cali',
    },
    services: [],
    history: [
      {
        id: 'hist-c1',
        serviceTitle: 'Instalación de Cuadro Eléctrico Principal y Breakers',
        categoryName: 'Electricidad',
        clientName: 'Laura Gómez',
        clientPhone: '+57 312 456 7890',
        providerName: 'Carlos Andrés Rodríguez',
        providerPhone: '+57 315 789 4521',
        date: '12 Sep 2026, 10:30 AM',
        status: 'COMPLETADO',
        amount: 140000,
        paymentStatus: 'PAGADO',
        paymentMethod: 'Transferencia Bancaria',
        rating: 5,
        reviewComment: 'Excelente trabajo con la caja de breakers, muy puntual y limpio.',
      },
      {
        id: 'hist-c2',
        serviceTitle: 'Apertura de Cerradura de Seguridad Domiciliaria',
        categoryName: 'Cerrajería',
        clientName: 'Laura Gómez',
        clientPhone: '+57 312 456 7890',
        providerName: 'Juan Carlos Pérez',
        providerPhone: '+57 310 123 4567',
        date: '05 Sep 2026, 08:20 PM',
        status: 'COMPLETADO',
        amount: 65000,
        paymentStatus: 'PAGADO',
        paymentMethod: 'Efectivo',
        rating: 5,
        reviewComment: 'Llegó en 20 minutos de noche y abrió la puerta sin romper la chapa.',
      },
      {
        id: 'hist-c3',
        serviceTitle: 'Mantenimiento Preventivo de Aire Acondicionado',
        categoryName: 'Climatización',
        clientName: 'Laura Gómez',
        clientPhone: '+57 312 456 7890',
        providerName: 'Lucía Zambrano',
        providerPhone: '+57 318 678 2345',
        date: 'Hoy, 04:00 PM',
        status: 'EN_PROGRESO',
        amount: 90000,
        paymentStatus: 'PAGADO',
        paymentMethod: 'Transferencia Bancaria',
      },
    ],
  };
}

export function getCurrentUser(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error fetching current user:', err);
  }
  return null;
}

export function setCurrentUser(user: UserSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      // Guardar también en la lista general de usuarios
      saveToAllUsers(user);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error storing current user:', err);
  }
}

function saveToAllUsers(user: UserSession) {
  try {
    const raw = localStorage.getItem(ALL_USERS_STORAGE_KEY);
    const users: UserSession[] = raw ? JSON.parse(raw) : [];
    const index = users.findIndex((u) => u.id === user.id || u.email === user.email);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error updating all users store:', e);
  }
}

export function registerUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  role: 'USER' | 'PROVIDER';
  city?: string;
  department?: string;
  profession?: string;
}): UserSession {
  const global = getGlobalSettings();
  const city = userData.city || global.defaultCity;
  const department = userData.department || global.defaultDepartment;

  const newUser: UserSession = {
    id: Date.now(),
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
    role: userData.role,
    // "verificacion unica al registarse queda pendiente pero inicia sesion normal ese estado le permitira mostrar la tarjeta si esta verificado o aun no"
    status: 'PENDING',
    isVerified: false,
    plan: 'FREE', // Plan gratis: solo 1 servicio
    createdAt: new Date().toISOString(),
    profile: {
      city,
      department,
      country: 'Colombia',
      profession: userData.profession || (userData.role === 'PROVIDER' ? 'Profesional de Servicios' : undefined),
    },
    services: [],
    history: [],
  };

  setCurrentUser(newUser);
  return newUser;
}

export function addServiceToUser(serviceData: Omit<ProviderServiceItem, 'id' | 'createdAt'>): {
  success: boolean;
  message?: string;
  service?: ProviderServiceItem;
} {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, message: 'Debes iniciar sesión para agregar un servicio.' };
  }

  const global = getGlobalSettings();

  // Validar límite del Plan Gratuito: Solo 1 servicio
  if (user.plan === 'FREE' && user.services.length >= global.freePlanMaxServices) {
    return {
      success: false,
      message: `Has alcanzado el límite de ${global.freePlanMaxServices} servicio permitido en el Plan Gratuito. Actualiza a Plan Pro para publicar más servicios.`,
    };
  }

  // Validar límite de 10 actividades
  if (serviceData.activities.length > global.maxActivitiesPerService) {
    return {
      success: false,
      message: `El límite máximo permitido es de ${global.maxActivitiesPerService} actividades relacionadas.`,
    };
  }

  const newService: ProviderServiceItem = {
    ...serviceData,
    featuredActivities: serviceData.activities.slice(0, 4),
    id: `srv-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  user.services.push(newService);
  setCurrentUser(user);

  return { success: true, service: newService };
}

export function removeServiceFromUser(serviceId: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  user.services = user.services.filter((s) => s.id !== serviceId);
  setCurrentUser(user);
  return true;
}

export function updateServiceHistoryStatus(
  historyId: string,
  newStatus: ServiceHistoryItem['status'],
  rating?: number,
  reviewComment?: string
): boolean {
  const user = getCurrentUser();
  if (!user || !user.history) return false;

  const itemIndex = user.history.findIndex((h) => h.id === historyId);
  if (itemIndex < 0) return false;

  user.history[itemIndex].status = newStatus;
  if (newStatus === 'COMPLETADO') {
    user.history[itemIndex].paymentStatus = 'PAGADO';
  }
  if (rating !== undefined) {
    user.history[itemIndex].rating = rating;
  }
  if (reviewComment !== undefined) {
    user.history[itemIndex].reviewComment = reviewComment;
  }

  setCurrentUser(user);
  return true;
}

export function createServiceBooking(booking: {
  providerId: number | string;
  providerName: string;
  serviceTitle: string;
  categoryName: string;
  amount: number;
  date?: string;
  notes?: string;
  estimatedTimeRange?: string;
  teamBookingId?: string;
  teamProjectName?: string;
  teamMembersCount?: number;
}): boolean {
  const current = getCurrentUser();
  if (!current) return false;

  const newHistoryItem: ServiceHistoryItem = {
    id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    serviceTitle: booking.serviceTitle,
    categoryName: booking.categoryName,
    clientName: `${current.firstName} ${current.lastName}`,
    clientPhone: current.phone,
    providerName: booking.providerName,
    date: booking.date || new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: 'SOLICITADO',
    amount: booking.amount,
    paymentStatus: 'PENDIENTE',
    paymentMethod: 'Transferencia Bancaria',
    platformFee: calculatePlatformFee(booking.amount),
    platformDebtStatus: 'EN_DEUDA', // Cliente paga directo por transferencia -> prestador queda en deuda
    reviewComment: booking.notes,
    estimatedTimeRange: booking.estimatedTimeRange || '2 a 4 horas estimadas',
    teamBookingId: booking.teamBookingId,
    teamProjectName: booking.teamProjectName,
    teamMembersCount: booking.teamMembersCount,
    messageNotes: booking.notes,
  };

  if (!current.history) current.history = [];
  current.history.unshift(newHistoryItem);
  setCurrentUser(current);

  // Generar notificación para el prestador
  addNotification({
    userId: booking.providerId,
    title: 'Nueva Solicitud de Servicio Recibida',
    message: `${current.firstName} ${current.lastName} ha solicitado tu servicio "${booking.serviceTitle}". Rango estimado: ${booking.estimatedTimeRange || '2 a 4 horas'}. Ingresa para confirmar.`,
    type: booking.teamBookingId ? 'TEAM_REQUEST' : 'SERVICE_REQUEST',
    actionRequired: true,
    serviceId: newHistoryItem.id,
    timeRange: booking.estimatedTimeRange || '2 a 4 horas',
  });

  return true;
}

// Confirmar solicitud de servicio por parte del prestador
export function confirmServiceBooking(bookingId: string, confirmedTimeRange?: string): boolean {
  const current = getCurrentUser();
  if (!current || !current.history) return false;

  const item = current.history.find((h) => h.id === bookingId);
  if (!item) return false;

  item.status = 'CONFIRMADO';
  if (confirmedTimeRange) {
    item.estimatedTimeRange = confirmedTimeRange;
  }
  setCurrentUser(current);

  // Despachar notificación de vuelta al cliente
  addNotification({
    userId: item.clientName,
    title: '¡Servicio Confirmado por el Profesional!',
    message: `${item.providerName} ha confirmado la solicitud para "${item.serviceTitle}". Rango de tiempo estimado acordado: ${confirmedTimeRange || item.estimatedTimeRange || 'Confirmado'}.`,
    type: 'SERVICE_CONFIRMED',
    actionRequired: false,
    serviceId: item.id,
    timeRange: confirmedTimeRange || item.estimatedTimeRange,
  });

  return true;
}

// Contratación y solicitud de Equipos de Trabajo (Multi-Profesionales de la misma o varias categorías)
export function createTeamBooking(teamData: {
  projectName: string;
  clientName: string;
  clientPhone: string;
  estimatedTimeRange: string;
  message: string;
  providers: Array<{
    id: number | string;
    name: string;
    title: string;
    categoryName?: string;
    hourlyRate: number;
  }>;
}): { success: boolean; teamBookingId: string } {
  const current = getCurrentUser();
  if (!current) return { success: false, teamBookingId: '' };

  const teamId = `team-${Date.now()}`;

  teamData.providers.forEach((prov) => {
    createServiceBooking({
      providerId: prov.id,
      providerName: prov.name,
      serviceTitle: `${prov.title} (Equipo: ${teamData.projectName})`,
      categoryName: prov.categoryName || 'Cuadrilla de Trabajo',
      amount: Number(prov.hourlyRate) || 45000,
      notes: teamData.message,
      estimatedTimeRange: teamData.estimatedTimeRange,
      teamBookingId: teamId,
      teamProjectName: teamData.projectName,
      teamMembersCount: teamData.providers.length,
    });
  });

  return { success: true, teamBookingId: teamId };
}

// Configurar hasta 4 actividades principales destacadas para la tarjeta pública
export function setFeaturedActivitiesForService(serviceId: string, activities: string[]): boolean {
  const current = getCurrentUser();
  if (!current || !current.services) return false;

  const srv = current.services.find((s) => s.id === serviceId);
  if (!srv) return false;

  // Límite de hasta 4 actividades elegidas
  srv.featuredActivities = activities.slice(0, 4);
  setCurrentUser(current);
  return true;
}

// Activar/desactivar WhatsApp en el perfil público
export function updateWhatsAppSettings(showWhatsApp: boolean, whatsappNumber?: string): boolean {
  const current = getCurrentUser();
  if (!current) return false;

  current.profile.showWhatsApp = showWhatsApp;
  if (whatsappNumber !== undefined) {
    current.profile.whatsappNumber = whatsappNumber;
  }
  setCurrentUser(current);
  return true;
}

// Notificaciones
export function getUserNotifications(userId?: number | string): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    let list: AppNotification[] = raw ? JSON.parse(raw) : [];
    const current = getCurrentUser();

    // Inicializar notificación de bienvenida / solicitud si está vacía
    if (list.length === 0) {
      list = [
        {
          id: 'notif-initial-1',
          userId: 999, // Carlos Rodríguez
          title: 'Nueva Solicitud: Adecuación de Iluminación y Tomas',
          message: 'Laura Gómez te ha enviado una solicitud de servicio en Cali. Rango estimado: 2 a 3 horas. Ingresa para confirmar.',
          type: 'SERVICE_REQUEST',
          date: 'Hoy, 08:30 AM',
          read: false,
          actionRequired: true,
          serviceId: 'hist-req-new',
          timeRange: '2 a 3 horas (Tarde 2:00 PM - 5:00 PM)',
        },
      ];
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    }

    const targetId = userId || (current ? current.id : null);
    if (!targetId && !current) return list;

    return list.filter(
      (n) =>
        String(n.userId).toLowerCase() === String(targetId).toLowerCase() ||
        (current && String(n.userId).toLowerCase() === `${current.firstName} ${current.lastName}`.toLowerCase()) ||
        String(n.userId) === 'all'
    );
  } catch (e) {
    console.error('Error reading notifications:', e);
    return [];
  }
}

export function addNotification(notificationData: Omit<AppNotification, 'id' | 'date' | 'read'>): AppNotification {
  const newNotif: AppNotification = {
    ...notificationData,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: 'Ahora mismo',
    read: false,
  };

  if (typeof window === 'undefined') return newNotif;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const list: AppNotification[] = raw ? JSON.parse(raw) : [];
    list.unshift(newNotif);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving notification:', e);
  }
  return newNotif;
}

export function markNotificationAsRead(notificationId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return;
    const list: AppNotification[] = JSON.parse(raw);
    const updated = list.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error marking notification as read:', e);
  }
}

export function calculateUserPlatformDebt(userOrId?: number | string | UserSession | null | any): number {
  if (!userOrId) {
    const target = getCurrentUser();
    if (!target) return 0;
    if (typeof target.platformDebt === 'number') return target.platformDebt;
    if (Array.isArray(target.history)) {
      return target.history
        .filter((item) => item.platformDebtStatus === 'EN_DEUDA')
        .reduce((acc, item) => acc + (item.platformFee || calculatePlatformFee(item.amount)), 0);
    }
    return 0;
  }

  // Si es un objeto de usuario
  if (typeof userOrId === 'object') {
    if (typeof userOrId.platformDebt === 'number') return userOrId.platformDebt;
    if (Array.isArray(userOrId.history)) {
      return userOrId.history
        .filter((item: any) => item.platformDebtStatus === 'EN_DEUDA')
        .reduce((acc: number, item: any) => acc + (item.platformFee || calculatePlatformFee(item.amount)), 0);
    }
    if (userOrId.id === 1 || String(userOrId.email || '').includes('carlos.rodriguez')) {
      return 11750;
    }
    return 0;
  }

  // Si es un ID o email
  const current = getCurrentUser();
  if (current && (current.id === userOrId || current.email === String(userOrId))) {
    if (typeof current.platformDebt === 'number') return current.platformDebt;
    if (Array.isArray(current.history)) {
      return current.history
        .filter((item) => item.platformDebtStatus === 'EN_DEUDA')
        .reduce((acc, item) => acc + (item.platformFee || calculatePlatformFee(item.amount)), 0);
    }
  }

  if (userOrId === 1 || String(userOrId).toLowerCase().includes('carlos')) {
    return 11750;
  }

  return 0;
}

export function payUserPlatformDebt(userId?: number | string): UserSession | null {
  const user = getCurrentUser();
  if (!user) return null;

  if (user.history) {
    user.history = user.history.map((item) => {
      if (item.platformDebtStatus === 'EN_DEUDA') {
        return { ...item, platformDebtStatus: 'AL_DIA' as const };
      }
      return item;
    });
  }

  user.platformDebt = 0;
  setCurrentUser(user);
  return user;
}

export function updateUserProfile(data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  department?: string;
  profession?: string;
  bio?: string;
  address?: string;
  profilePhoto?: string;
}): UserSession | null {
  const user = getCurrentUser();
  if (!user) return null;

  if (data.firstName) user.firstName = data.firstName;
  if (data.lastName) user.lastName = data.lastName;
  if (data.phone) user.phone = data.phone;
  if (data.city) user.profile.city = data.city;
  if (data.department) user.profile.department = data.department;
  if (data.profession !== undefined) user.profile.profession = data.profession;
  if (data.bio !== undefined) user.profile.bio = data.bio;
  if (data.address !== undefined) user.profile.address = data.address;
  if (data.profilePhoto !== undefined) user.profile.profilePhoto = data.profilePhoto;

  setCurrentUser(user);
  return user;
}

export function toggleUserRole(): UserSession {
  const current = getCurrentUser();
  if (!current) {
    const session = getInitialProviderSession();
    setCurrentUser(session);
    return session;
  }

  // Toggle entre PROVIDER y USER
  if (current.role === 'PROVIDER') {
    const client = getInitialClientSession();
    setCurrentUser(client);
    return client;
  } else {
    const provider = getInitialProviderSession();
    setCurrentUser(provider);
    return provider;
  }
}

export function logout(): void {
  setCurrentUser(null);
}

// Historial personalizado para cada usuario en el panel administrativo
export function getUserHistoryForAdmin(user: {
  id?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  roleName?: string;
  categoryName?: string;
}): ServiceHistoryItem[] {
  const current = getCurrentUser();
  const email = (user.email || '').toLowerCase();
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario';
  const role = user.roleName || (email.includes('proveedor') ? 'PROVIDER' : 'USER');
  const cat = user.categoryName || 'Servicios Generales';

  // Si es el usuario actual y tiene historial
  if (current && (current.id === user.id || current.email.toLowerCase() === email)) {
    if (current.history && current.history.length > 0) return current.history;
  }

  // Si es Carlos Rodríguez
  if (email.includes('carlos.rodriguez') || user.id === 999) {
    return getInitialProviderSession().history;
  }

  // Si es Laura Gómez
  if (email.includes('laura.gomez') || user.id === 888) {
    return getInitialClientSession().history;
  }

  // Generar historial personalizado según rol y categoría del usuario
  if (role === 'PROVIDER' || role === 'Prestador') {
    return [
      {
        id: `adm-p-${user.id || 1}-1`,
        serviceTitle: `Servicio Profesional Especializado de ${cat}`,
        categoryName: cat,
        clientName: 'Andrea Beltrán',
        clientPhone: '+57 310 987 6543',
        providerName: fullName,
        providerPhone: '+57 315 123 4567',
        date: '10 Sep 2026, 11:30 AM',
        status: 'COMPLETADO',
        amount: 125000,
        paymentStatus: 'PAGADO',
        paymentMethod: 'Transferencia Bancaria',
        platformFee: 6250, // 5% comisión
        platformDebtStatus: 'EN_DEUDA', // Pago directo por transferencia -> prestador en deuda
        rating: 5,
        reviewComment: 'Excelente atención en Cali, muy puntual y con acabados impecables.',
      },
      {
        id: `adm-p-${user.id || 1}-2`,
        serviceTitle: `Mantenimiento Preventivo y Diagnóstico en ${cat}`,
        categoryName: cat,
        clientName: 'Héctor Fabio Morales',
        clientPhone: '+57 312 345 6789',
        providerName: fullName,
        date: 'Ayer, 03:00 PM',
        status: 'COMPLETADO',
        amount: 80000,
        paymentStatus: 'PAGADO',
        paymentMethod: 'Efectivo',
        platformFee: 4000, // 5% comisión
        platformDebtStatus: 'EN_DEUDA', // Pago directo en efectivo -> prestador en deuda
        rating: 4,
        reviewComment: 'Trabajo profesional y ordenado.',
      },
      {
        id: `adm-p-${user.id || 1}-3`,
        serviceTitle: `Instalación y Adecuación a Domicilio`,
        categoryName: cat,
        clientName: 'Mariana Ospina',
        clientPhone: '+57 318 765 4321',
        providerName: fullName,
        date: 'Hoy, 09:30 AM',
        status: 'EN_PROGRESO',
        amount: 95000,
        paymentStatus: 'PENDIENTE',
        paymentMethod: 'Transferencia Bancaria',
      },
    ];
  } else {
    // Es Cliente (servicios contratados)
    return [
      {
        id: `adm-c-${user.id || 1}-1`,
        serviceTitle: 'Servicio Contratado de Mantenimiento Residencial',
        categoryName: 'Electricidad',
        clientName: fullName,
        providerName: 'Carlos Andrés Rodríguez',
        providerPhone: '+57 315 789 4521',
        date: '08 Sep 2026, 02:00 PM',
        status: 'COMPLETADO',
        amount: 110000,
        paymentStatus: 'PAGADO',
        paymentMethod: 'Transferencia Bancaria',
        rating: 5,
        reviewComment: 'Servicio contratado a través de Conecta 360, todo salió perfecto.',
      },
      {
        id: `adm-c-${user.id || 1}-2`,
        serviceTitle: 'Apertura e Instalación de Cerradura',
        categoryName: 'Cerrajería',
        clientName: fullName,
        providerName: 'Juan Carlos Pérez',
        providerPhone: '+57 310 123 4567',
        date: '11 Sep 2026, 06:15 PM',
        status: 'COMPLETADO',
        amount: 60000,
        paymentStatus: 'PAGADO',
        paymentMethod: 'Efectivo',
        rating: 5,
        reviewComment: 'Excelente atención.',
      },
    ];
  }
}

// Aprobación de verificación por el admin
export function verifyUserByAdmin(userIdOrEmail: number | string): boolean {
  const current = getCurrentUser();
  if (current) {
    if (current.id === userIdOrEmail || current.email.toLowerCase() === String(userIdOrEmail).toLowerCase()) {
      current.status = 'APPROVED';
      current.isVerified = true;
      setCurrentUser(current);
      return true;
    }
  }
  return true;
}


