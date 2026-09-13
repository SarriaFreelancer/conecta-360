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

export type GlobalSettings = GlobalPlatformSettings;

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

import { fetchPlatformSettingsBackend, updatePlatformSettingsBackend } from './admin-data';

export function saveGlobalSettings(newSettings: Partial<GlobalPlatformSettings>): GlobalPlatformSettings {
  if (typeof window === 'undefined') return DEFAULT_GLOBAL_SETTINGS;
  try {
    const current = getGlobalSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));

    // Sincronizar de forma asíncrona y transparente con MySQL
    updatePlatformSettingsBackend({
      platformName: updated.platformName,
      country: updated.country,
      currency: updated.currency,
      defaultCity: updated.defaultCity,
      defaultDepartment: updated.defaultDepartment,
      platformCommission: updated.platformCommission,
      minPlatformFee: updated.minPlatformFee,
      minHourlyRate: updated.minHourlyRate,
      cashTransferDebtEnabled: updated.cashTransferDebtEnabled,
      freePlanMaxServices: updated.freePlanMaxServices,
      maxActivitiesPerService: updated.maxActivitiesPerService,
      requireIdentityVerification: updated.requireVerificationDocument,
    }).catch((err) => {
      console.warn('[Settings] Error actualizando configuración en MySQL:', err);
    });

    return updated;
  } catch (e) {
    console.error('Error saving global settings to localStorage:', e);
    return DEFAULT_GLOBAL_SETTINGS;
  }
}

export async function syncGlobalSettingsFromBackend(): Promise<GlobalPlatformSettings> {
  try {
    const remote = await fetchPlatformSettingsBackend();
    if (remote) {
      const merged: GlobalPlatformSettings = {
        platformName: remote.platformName || DEFAULT_GLOBAL_SETTINGS.platformName,
        country: remote.country || DEFAULT_GLOBAL_SETTINGS.country,
        currency: remote.currency || DEFAULT_GLOBAL_SETTINGS.currency,
        defaultCity: remote.defaultCity || DEFAULT_GLOBAL_SETTINGS.defaultCity,
        defaultDepartment: remote.defaultDepartment || DEFAULT_GLOBAL_SETTINGS.defaultDepartment,
        defaultHourlyRate: Number(remote.defaultHourlyRate || DEFAULT_GLOBAL_SETTINGS.defaultHourlyRate),
        minHourlyRate: Number(remote.minHourlyRate || DEFAULT_GLOBAL_SETTINGS.minHourlyRate),
        freePlanMaxServices: Number(remote.freePlanMaxServices || DEFAULT_GLOBAL_SETTINGS.freePlanMaxServices),
        maxActivitiesPerService: Number(remote.maxActivitiesPerService || DEFAULT_GLOBAL_SETTINGS.maxActivitiesPerService),
        requireVerificationDocument: remote.requireIdentityVerification ?? DEFAULT_GLOBAL_SETTINGS.requireVerificationDocument,
        platformCommission: Number(remote.platformCommission || DEFAULT_GLOBAL_SETTINGS.platformCommission),
        minPlatformFee: Number(remote.minPlatformFee || DEFAULT_GLOBAL_SETTINGS.minPlatformFee),
        cashTransferDebtEnabled: remote.cashTransferDebtEnabled ?? DEFAULT_GLOBAL_SETTINGS.cashTransferDebtEnabled,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch (err) {
    console.warn('[Settings] Fallback a configuración local:', err);
  }
  return getGlobalSettings();
}

export function calculatePlatformFee(amount: number): number {
  const settings = getGlobalSettings();
  const feeByPercent = Math.round((amount * (settings.platformCommission || 5)) / 100);
  return Math.max(feeByPercent, settings.minPlatformFee || 2500);
}

// ----------------------------------------------------
// Gestión de Motivos de Rechazo de Servicios (Admin Panel)
// ----------------------------------------------------
export interface RejectionReasonItem {
  id: string;
  label: string;
  isJustified: boolean; // Si es true, 0 puntos negativos; si es false, incurre en penalización
  penaltyPoints?: number;
  description?: string;
  createdAt?: string;
}

export const DEFAULT_REJECTION_REASONS: RejectionReasonItem[] = [
  {
    id: 'reason-1',
    label: 'El lugar está muy lejos de mi zona de cobertura (Fuera de perímetro)',
    isJustified: true,
    penaltyPoints: 0,
    description: 'Válido - 0 puntos negativos si la ubicación excede el radio pactado.',
  },
  {
    id: 'reason-2',
    label: 'Cruce de horarios / Ya tengo otro servicio asignado',
    isJustified: true,
    penaltyPoints: 0,
    description: 'Válido con explicación clara de agenda.',
  },
  {
    id: 'reason-3',
    label: 'No cuento con repuestos o herramientas especializadas requeridas',
    isJustified: true,
    penaltyPoints: 0,
    description: 'Válido si requiere insumos técnicos no disponibles.',
  },
  {
    id: 'reason-4',
    label: 'Motivo de fuerza mayor, calamidad o salud',
    isJustified: true,
    penaltyPoints: 0,
    description: 'Válido por incapacidad o imprevisto mayor.',
  },
  {
    id: 'reason-5',
    label: 'Sin justificación / No deseo tomar el servicio',
    isJustified: false,
    penaltyPoints: 10,
    description: 'Injustificado - Aplica -10 puntos negativos a la reputación.',
  },
];

const REJECTION_REASONS_STORAGE_KEY = 'conecta360_rejection_reasons';

export function getRejectionReasons(): RejectionReasonItem[] {
  if (typeof window === 'undefined') return DEFAULT_REJECTION_REASONS;
  try {
    const saved = localStorage.getItem(REJECTION_REASONS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading rejection reasons:', e);
  }
  return DEFAULT_REJECTION_REASONS;
}

export function saveRejectionReasons(reasons: RejectionReasonItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REJECTION_REASONS_STORAGE_KEY, JSON.stringify(reasons));
    window.dispatchEvent(new Event('rejection-reasons-updated'));
  } catch (e) {
    console.error('Error saving rejection reasons:', e);
  }
}

export function addRejectionReason(
  label: string,
  isJustified: boolean,
  penaltyPoints: number = 0,
  description?: string
): RejectionReasonItem {
  const current = getRejectionReasons();
  const newItem: RejectionReasonItem = {
    id: `reason-${Date.now()}`,
    label: label.trim(),
    isJustified,
    penaltyPoints: isJustified ? 0 : Math.max(0, penaltyPoints),
    description: description?.trim() || (isJustified ? 'Causa justificada (0 pts negativos)' : `Aplica -${penaltyPoints} pts negativos`),
    createdAt: new Date().toISOString(),
  };
  const updated = [...current, newItem];
  saveRejectionReasons(updated);
  return newItem;
}

export function deleteRejectionReason(id: string): void {
  const current = getRejectionReasons();
  const updated = current.filter((r) => r.id !== id);
  saveRejectionReasons(updated.length > 0 ? updated : DEFAULT_REJECTION_REASONS);
}



