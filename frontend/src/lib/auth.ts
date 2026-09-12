// Servicio y utilidades de Autenticación y Gestión de Proveedores para Conecta 360 Colombia
import { getGlobalSettings } from './system-settings';

export interface ServiceHistoryItem {
  id: string;
  serviceTitle: string;
  categoryName: string;
  clientName: string;
  clientPhone?: string;
  providerName: string;
  providerPhone?: string;
  date: string;
  status: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO';
  amount: number; // Monto en COP
  paymentStatus: 'PAGADO' | 'PENDIENTE';
  paymentMethod: 'Transferencia Bancaria' | 'Efectivo' | 'Tarjeta de Crédito / Débito';
  rating?: number; // 1 a 5 estrellas
  reviewComment?: string;
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
  };
  services: ProviderServiceItem[];
  history: ServiceHistoryItem[];
}

export interface ProviderServiceItem {
  id: string;
  title: string;
  categoryId: number;
  categoryName: string;
  hourlyRate: number;
  activities: string[]; // Límite máximo de 10 actividades
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
    },
    services: [
      {
        id: 'srv-1',
        title: 'Instalaciones Eléctricas y Reparaciones Residenciales',
        categoryId: 2,
        categoryName: 'Electricidad',
        hourlyRate: global.defaultHourlyRate, // Tarifa por defecto configurada por el admin
        activities: [
          'Instalación de acometidas',
          'Reparación de cortocircuitos',
          'Tableros de breakers',
          'Iluminación LED y tomas',
          'Mantenimiento preventivo',
        ], // 5/10 actividades
        city: 'Cali',
        department: 'Valle del Cauca',
        coverageZones: 'Cali (Norte, Sur, Oeste), Jamundí, Yumbo',
        titleRequired: true,
        titleCertification: 'Tarjeta Profesional CONTE TE-1 94827',
        certificateFileName: 'matricula_conte_carlos_rodriguez.pdf',
        createdAt: new Date().toISOString(),
      },
    ],
    history: [
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
      },
    ],
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
