// Servicio y utilidades de Autenticación y Gestión de Proveedores para Conecta 360 Colombia
import { getGlobalSettings } from './system-settings';

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

export function logout(): void {
  setCurrentUser(null);
}
