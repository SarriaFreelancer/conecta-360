// Configuración global del sistema gestionada por el Superadmin / Admin

export interface GlobalPlatformSettings {
  platformName: string;
  country: string;
  currency: string;
  defaultCity: string;
  defaultDepartment: string;
  defaultHourlyRate: number; // Tarifa por defecto configurada por el admin
  minHourlyRate: number;
  freePlanMaxServices: number; // 1 servicio en plan gratis
  maxActivitiesPerService: number; // 10 actividades relacionadas límite
  requireVerificationDocument: boolean;
  platformCommission: number; // Tarifa de descuento mínima para la plataforma (%)
  minPlatformFee: number; // Tarifa fija mínima de intermediación en COP
  cashTransferDebtEnabled: boolean; // Cobros en efectivo/transferencia generan deuda con la plataforma
}

export const DEFAULT_GLOBAL_SETTINGS: GlobalPlatformSettings = {
  platformName: 'CONECTA 360',
  country: 'Colombia',
  currency: 'COP ($)',
  defaultCity: 'Cali',
  defaultDepartment: 'Valle del Cauca',
  defaultHourlyRate: 45000, // $45.000 COP/hora
  minHourlyRate: 25000,     // $25.000 COP/hora
  freePlanMaxServices: 1,   // Plan gratis: exactamente 1 servicio
  maxActivitiesPerService: 10, // Límite de 10 actividades
  requireVerificationDocument: true,
  platformCommission: 5.0, // Tarifa de descuento mínima del 5% para la plataforma
  minPlatformFee: 2500,    // Tarifa mínima de $2.500 COP por servicio
  cashTransferDebtEnabled: true, // Persona queda en deuda con la plataforma por transferencias o efectivo
};

const SETTINGS_STORAGE_KEY = 'conecta360_global_settings';

export function getGlobalSettings(): GlobalPlatformSettings {
  if (typeof window === 'undefined') return DEFAULT_GLOBAL_SETTINGS;
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_GLOBAL_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error reading global settings from localStorage:', e);
  }
  return DEFAULT_GLOBAL_SETTINGS;
}

export function saveGlobalSettings(newSettings: Partial<GlobalPlatformSettings>): GlobalPlatformSettings {
  if (typeof window === 'undefined') return DEFAULT_GLOBAL_SETTINGS;
  try {
    const current = getGlobalSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving global settings to localStorage:', e);
    return DEFAULT_GLOBAL_SETTINGS;
  }
}

export function calculatePlatformFee(amount: number): number {
  const settings = getGlobalSettings();
  const feeByPercent = Math.round((amount * (settings.platformCommission || 5)) / 100);
  return Math.max(feeByPercent, settings.minPlatformFee || 2500);
}

