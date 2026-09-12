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

export default function AdminSettingsPage() {
  const [generalConfig, setGeneralConfig] = useState({
    platformName: 'CONECTA 360',
    primarySlogan: 'Conecta lo que necesitas con quien puede hacerlo.',
    secondarySlogan: 'Necesitas. Encuentras. Contratas.',
    supportEmail: 'contacto@conecta360.com',
    supportPhone: '+593 98 123 4567',
    currency: 'USD ($)',
    country: 'Ecuador'
  });

  const [securityRules, setSecurityRules] = useState({
    requireIdentityVerification: true,
    requirePoliceRecord: true,
    allowPublicReviews: true,
    moderateServicesBeforePublish: false,
    autoApproveFreePlan: true
  });

  const [financialRules, setFinancialRules] = useState({
    platformCommission: '8.5',
    minHourlyRate: '10.00',
    allowCardPayments: true,
    allowBankTransfer: true,
    allowCashOnDelivery: true
  });

  const [cities, setCities] = useState([
    { name: 'Quito', province: 'Pichincha', active: true },
    { name: 'Guayaquil', province: 'Guayas', active: true },
    { name: 'Cuenca', province: 'Azuay', active: true },
    { name: 'Ambato', province: 'Tungurahua', active: true },
    { name: 'Manta', province: 'Manabí', active: true },
    { name: 'Loja', province: 'Loja', active: true },
    { name: 'Machala', province: 'El Oro', active: true },
    { name: 'Santo Domingo', province: 'Santo Domingo', active: false }
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
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-2 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </header>

        <div className="p-8 max-w-5xl w-full mx-auto space-y-8">
          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md flex items-center justify-between animate-fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>✓ Parámetros de CONECTA 360 guardados y sincronizados correctamente.</span>
              </div>
              <button onClick={() => setSavedSuccess(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-8">
            {/* 1. Datos Generales */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Identidad y Marca</h3>
                  <p className="text-xs text-slate-400 font-medium">Textos principales visibles en la portada y motores de búsqueda</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre de la Plataforma</label>
                  <input
                    type="text"
                    value={generalConfig.platformName}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, platformName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Moneda del Sistema</label>
                  <input
                    type="text"
                    value={generalConfig.currency}
                    disabled
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Eslogan Principal</label>
                  <input
                    type="text"
                    value={generalConfig.primarySlogan}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, primarySlogan: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Eslogan Secundario</label>
                  <input
                    type="text"
                    value={generalConfig.secondarySlogan}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, secondarySlogan: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email de Soporte</span>
                  </label>
                  <input
                    type="email"
                    value={generalConfig.supportEmail}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, supportEmail: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Teléfono / WhatsApp Oficial</span>
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
                  <p className="text-xs text-slate-400 font-medium">Porcentajes de monetización del marketplace</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Comisión Estándar por Servicio (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={financialRules.platformCommission}
                      onChange={(e) => setFinancialRules({ ...financialRules, platformCommission: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarifa Mínima por Hora ($ USD)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1.0"
                      value={financialRules.minHourlyRate}
                      onChange={(e) => setFinancialRules({ ...financialRules, minHourlyRate: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">USD</span>
                  </div>
                </div>
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
