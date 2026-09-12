'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Users,
  Layers,
  Wrench,
  ShieldAlert,
  Award,
  CreditCard,
  LayoutDashboard,
  Save,
  CheckCircle2,
  Globe,
  ShieldCheck,
  Percent,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { getGlobalSettings, saveGlobalSettings } from '@/lib/system-settings';

export default function AdminSettingsPage() {
  const [globalSettings, setGlobalSettings] = useState(getGlobalSettings());

  const [generalConfig, setGeneralConfig] = useState({
    platformName: globalSettings.platformName || 'CONECTA 360',
    primarySlogan: 'Conecta lo que necesitas con quien puede hacerlo.',
    secondarySlogan: 'Necesitas. Encuentras. Contratas.',
    supportEmail: 'contacto@conecta360.co',
    supportPhone: '+57 315 789 4521',
    currency: 'COP ($)',
    country: 'Colombia'
  });

  const [securityRules, setSecurityRules] = useState({
    requireIdentityVerification: true,
    requirePoliceRecord: true,
    allowPublicReviews: true,
    moderateServicesBeforePublish: false,
    autoApproveFreePlan: true
  });

  const [financialRules, setFinancialRules] = useState({
    platformCommission: String(globalSettings.platformCommission || 5.0),
    minPlatformFee: String(globalSettings.minPlatformFee || 2500),
    minHourlyRate: String(globalSettings.minHourlyRate || 25000),
    cashTransferDebtEnabled: globalSettings.cashTransferDebtEnabled ?? true,
    allowCardPayments: true,
    allowBankTransfer: true,
    allowCashOnDelivery: true
  });

  const [cities, setCities] = useState([
    { name: 'Cali', province: 'Valle del Cauca', active: true },
    { name: 'Jamundí', province: 'Valle del Cauca', active: true },
    { name: 'Yumbo', province: 'Valle del Cauca', active: true },
    { name: 'Palmira', province: 'Valle del Cauca', active: true },
    { name: 'Buga', province: 'Valle del Cauca', active: true },
    { name: 'Tuluá', province: 'Valle del Cauca', active: true },
    { name: 'Cartago', province: 'Valle del Cauca', active: false },
    { name: 'Buenaventura', province: 'Valle del Cauca', active: false }
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Categorías', href: '/admin/categories', icon: Layers },
    { name: 'Servicios', href: '/admin/services', icon: Wrench },
    { name: 'Roles', href: '/admin/roles', icon: ShieldAlert },
    { name: 'Verificaciones', href: '/admin/verifications', icon: Award },
    { name: 'Suscripciones', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Configuración', href: '/admin/settings', icon: Settings, active: true },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveGlobalSettings({
      platformName: generalConfig.platformName,
      country: generalConfig.country,
      currency: generalConfig.currency,
      platformCommission: parseFloat(financialRules.platformCommission) || 5.0,
      minPlatformFee: parseFloat(financialRules.minPlatformFee) || 2500,
      minHourlyRate: parseFloat(financialRules.minHourlyRate) || 25000,
      cashTransferDebtEnabled: financialRules.cashTransferDebtEnabled,
    });
    setGlobalSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const toggleCity = (index: number) => {
    setCities((prev) =>
      prev.map((c, i) => (i === index ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar - Always displays all 8 modules */}
      <AdminSidebar currentPath="/admin/settings" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="text-slate-400 hover:text-slate-600 md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Settings className="w-6 h-6 text-blue-600" />
              <span>Configuración de la Plataforma</span>
            </h2>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-[#0056d2] hover:bg-[#0046a8] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </header>

        {savedSuccess && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configuración de tarifas y comisiones guardada exitosamente</span>
          </div>
        )}

        <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. Datos Generales */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Identidad de la Plataforma</h3>
                  <p className="text-xs text-slate-400 font-medium">Configuración de nombre, país y datos institucionales</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    value={generalConfig.platformName}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, platformName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">País Principal</label>
                  <input
                    type="text"
                    value={generalConfig.country}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, country: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Moneda del Sistema</label>
                  <input
                    type="text"
                    value={generalConfig.currency}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, currency: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Correo de Soporte</span>
                  </label>
                  <input
                    type="email"
                    value={generalConfig.supportEmail}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, supportEmail: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Teléfono / WhatsApp Oficial en Colombia</span>
                  </label>
                  <input
                    type="text"
                    value={generalConfig.supportPhone}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, supportPhone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Reglas de Verificación y Seguridad */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Seguridad y Verificación</h3>
                  <p className="text-xs text-slate-400 font-medium">Políticas de validación de documentos y confianza ciudadana</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">Exigir verificación de identidad para publicar servicios</p>
                    <p className="text-slate-500 text-[11px]">Los prestadores deben subir documento de identidad antes de aparecer en el catálogo público</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityRules.requireIdentityVerification}
                    onChange={(e) => setSecurityRules({ ...securityRules, requireIdentityVerification: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">Exigir certificado de antecedentes penales en servicios a domicilio</p>
                    <p className="text-slate-500 text-[11px]">Obligatorio para categorías como Reparaciones, Cerrajería, Electricidad y Plomería</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityRules.requirePoliceRecord}
                    onChange={(e) => setSecurityRules({ ...securityRules, requirePoliceRecord: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <div>
                    <p className="font-bold text-slate-900">Permitir calificaciones públicas de clientes a prestadores</p>
                    <p className="text-slate-500 text-[11px]">Los usuarios verificados que hayan contratado pueden puntuar con estrellas y comentarios</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityRules.allowPublicReviews}
                    onChange={(e) => setSecurityRules({ ...securityRules, allowPublicReviews: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* 3. Comisiones y Pagos */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Comisiones y Parámetros Financieros</h3>
                  <p className="text-xs text-slate-400 font-medium">Tarifa de descuento para la plataforma y reglas de cobro en Colombia</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Comisión Mínima (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      value={financialRules.platformCommission}
                      onChange={(e) => setFinancialRules({ ...financialRules, platformCommission: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Tarifa mínima del 5%</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarifa Fija Mínima ($ COP)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="500"
                      value={financialRules.minPlatformFee}
                      onChange={(e) => setFinancialRules({ ...financialRules, minPlatformFee: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">COP</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Piso mínimo $2.500 COP</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarifa Sugerida Mínima ($ COP/h)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="5000"
                      value={financialRules.minHourlyRate}
                      onChange={(e) => setFinancialRules({ ...financialRules, minHourlyRate: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">COP</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Mínimo sugerido $25.000 COP</p>
                </div>
              </div>

              {/* Regla de Deuda en Efectivo y Transferencia Bancaria */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
                <label className="flex items-start justify-between cursor-pointer">
                  <div className="space-y-0.5 pr-4">
                    <p className="font-extrabold text-slate-900 text-xs">
                      Deuda Automática por Cobros Directos (Efectivo y Transferencia Bancaria)
                    </p>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Cuando un cliente paga mediante <strong>Transferencia Bancaria directa</strong> o en <strong>Efectivo</strong>, el prestador de servicios recibe el 100% del dinero directamente en sus manos. Al activar esta regla, el prestador queda registrado con un <strong>saldo en deuda</strong> correspondiente a la comisión mínima de la plataforma (5% o mín. $2.500 COP), que debe abonar posteriormente a Conecta 360.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={financialRules.cashTransferDebtEnabled}
                    onChange={(e) => setFinancialRules({ ...financialRules, cashTransferDebtEnabled: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded mt-1 shrink-0"
                  />
                </label>
              </div>
            </div>

            {/* 4. Cobertura Geográfica */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Ciudades y Cobertura Activa</h3>
                  <p className="text-xs text-slate-400 font-medium">Habilitación de ciudades en el buscador y mapa de servicios</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {cities.map((city, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleCity(idx)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      city.active
                        ? 'bg-blue-50 border-blue-200 text-blue-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{city.name}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${city.active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-normal">{city.province}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-[#0056d2] hover:bg-[#0046a8] text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Todos los Cambios</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
