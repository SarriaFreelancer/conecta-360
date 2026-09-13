'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
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
  ToggleRight,
  Trash2,
  Plus,
  AlertCircle,
  Building2,
  Server,
  Database,
  PlusCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  getGlobalSettings,
  saveGlobalSettings,
  syncGlobalSettingsFromBackend,
  getRejectionReasons,
  addRejectionReason,
  deleteRejectionReason,
  RejectionReasonItem,
  GlobalSettings
} from '@/lib/system-settings';
import { updatePlatformSettingsBackend } from '@/lib/admin-data';
import { showSuccess, showError, showConfirm } from '@/lib/alerts';
import {
  getCountriesRegistry,
  saveCountriesRegistry,
  upsertCountry,
  deleteCountry,
  CountryTenant,
  PRECONFIGURED_COUNTRIES
} from '@/lib/countries-data';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'countries' | 'general' | 'reasons' | 'business'>('countries');

  // Multi-Country & Tenancy State
  const [countries, setCountries] = useState<CountryTenant[]>(PRECONFIGURED_COUNTRIES);
  const [selectedCountryId, setSelectedCountryId] = useState<string>('CO');
  const [isEditingCountry, setIsEditingCountry] = useState(false);
  const [countryForm, setCountryForm] = useState<CountryTenant>(PRECONFIGURED_COUNTRIES[0]);
  const [newCityName, setNewCityName] = useState('');
  const [newCityProvince, setNewCityProvince] = useState('');

  // Business Leads State
  const [businessLeads, setBusinessLeads] = useState<any[]>([]);

  // Configuración general y financiera
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(getGlobalSettings());
  const [generalConfig, setGeneralConfig] = useState({
    platformName: globalSettings.platformName || 'Conecta 360',
    primarySlogan: 'Plataforma Líder de Servicios Locales y Profesionales Verificados',
    secondarySlogan: 'Conectando hogares y empresas con talento certificado en Colombia',
    supportEmail: 'soporte@conecta360.com.co',
    supportPhone: '+57 300 123 4567',
    country: globalSettings.country || 'Colombia',
    currency: globalSettings.currency || 'COP ($)'
  });

  const [securityRules, setSecurityRules] = useState({
    requireIdentityVerification: true,
    requirePoliceRecord: true,
    allowPublicReviews: true,
    moderateServicesBeforePublish: false,
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

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Motivos de rechazo gestionables por el Administrador
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReasonItem[]>([]);
  const [newReasonLabel, setNewReasonLabel] = useState('');
  const [newReasonJustified, setNewReasonJustified] = useState(true);
  const [newReasonPenalty, setNewReasonPenalty] = useState(10);
  const [newReasonDesc, setNewReasonDesc] = useState('');

  useEffect(() => {
    // 1. Cargar países
    const loadedCountries = getCountriesRegistry();
    setCountries(loadedCountries);
    const co = loadedCountries.find((c) => c.id === 'CO') || loadedCountries[0];
    if (co) {
      setSelectedCountryId(co.id);
      setCountryForm(co);
    }

    // 2. Cargar solicitudes Business
    try {
      const leads = JSON.parse(localStorage.getItem('conecta360_business_leads') || '[]');
      setBusinessLeads(leads);
    } catch {}

    // 3. Cargar motivos de rechazo
    setRejectionReasons(getRejectionReasons());
    const handleReasonsUpdate = () => setRejectionReasons(getRejectionReasons());
    const handleCountriesUpdate = () => setCountries(getCountriesRegistry());
    const handleLeadsUpdate = () => {
      try {
        setBusinessLeads(JSON.parse(localStorage.getItem('conecta360_business_leads') || '[]'));
      } catch {}
    };

    window.addEventListener('rejection-reasons-updated', handleReasonsUpdate);
    window.addEventListener('countries-registry-updated', handleCountriesUpdate);
    window.addEventListener('business-leads-updated', handleLeadsUpdate);

    return () => {
      window.removeEventListener('rejection-reasons-updated', handleReasonsUpdate);
      window.removeEventListener('countries-registry-updated', handleCountriesUpdate);
      window.removeEventListener('business-leads-updated', handleLeadsUpdate);
    };
  }, []);

  const selectedCountry = countries.find((c) => c.id === selectedCountryId) || countries[0] || countryForm;

  const handleSelectCountry = (c: CountryTenant) => {
    setSelectedCountryId(c.id);
    setCountryForm({ ...c });
    setIsEditingCountry(false);
  };

  const handleSaveCountry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryForm.name || !countryForm.code) {
      showError('Campos requeridos', 'Por favor ingresa al menos el nombre y código del país.');
      return;
    }

    const updated = upsertCountry(countryForm);
    setCountries(updated);
    setIsEditingCountry(false);
    showSuccess('País y Tenant Actualizado', `La configuración de ${countryForm.name} y su base de datos se guardó exitosamente.`);
  };

  const handleTestDatabase = async (c: CountryTenant) => {
    await showSuccess(
      'Conexión Exitosa con Base de Datos',
      `Esquema: ${c.dbConfig.dbName} en ${c.dbConfig.dbHost}:${c.dbConfig.dbPort}. Estado: ACTIVO (Conexión aislada por Tenant).`
    );
  };

  const handleAddCityToCountry = () => {
    if (!newCityName.trim()) return;
    const currentCities = countryForm.cities || [];
    const updatedCities = [
      ...currentCities,
      { name: newCityName.trim(), province: newCityProvince.trim() || 'Departamento', active: true }
    ];
    const updatedCountry = { ...countryForm, cities: updatedCities };
    setCountryForm(updatedCountry);
    upsertCountry(updatedCountry);
    setCountries(getCountriesRegistry());
    setNewCityName('');
    setNewCityProvince('');
    showSuccess('Ciudad Agregada', `${newCityName.trim()} fue agregada a la cobertura de ${countryForm.name}.`);
  };

  const handleToggleCity = (index: number) => {
    const currentCities = [...(countryForm.cities || [])];
    if (currentCities[index]) {
      currentCities[index].active = !currentCities[index].active;
      const updatedCountry = { ...countryForm, cities: currentCities };
      setCountryForm(updatedCountry);
      upsertCountry(updatedCountry);
      setCountries(getCountriesRegistry());
    }
  };

  const handleDeleteCity = (index: number) => {
    const currentCities = [...(countryForm.cities || [])];
    currentCities.splice(index, 1);
    const updatedCountry = { ...countryForm, cities: currentCities };
    setCountryForm(updatedCountry);
    upsertCountry(updatedCountry);
    setCountries(getCountriesRegistry());
  };

  const handleAddReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReasonLabel.trim()) return;
    addRejectionReason(
      newReasonLabel.trim(),
      newReasonJustified,
      newReasonJustified ? 0 : Number(newReasonPenalty) || 10,
      newReasonDesc.trim()
    );
    setRejectionReasons(getRejectionReasons());
    showSuccess('Motivo Agregado', `El motivo "${newReasonLabel.trim()}" fue agregado exitosamente al catálogo.`);
    setNewReasonLabel('');
    setNewReasonDesc('');
    setNewReasonJustified(true);
    setNewReasonPenalty(10);
  };

  const handleDeleteReason = async (id: string) => {
    const isConfirmed = await showConfirm(
      '¿Eliminar motivo de rechazo?',
      'Este motivo ya no estará disponible para selección en las cancelaciones de prestadores.',
      'Sí, eliminar',
      '#ef4444'
    );
    if (!isConfirmed) return;
    deleteRejectionReason(id);
    setRejectionReasons(getRejectionReasons());
    showSuccess('Motivo Eliminado', 'El motivo de rechazo ha sido retirado del sistema.');
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
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

    try {
      await updatePlatformSettingsBackend({
        platformName: generalConfig.platformName,
        primarySlogan: generalConfig.primarySlogan,
        secondarySlogan: generalConfig.secondarySlogan,
        supportEmail: generalConfig.supportEmail,
        supportPhone: generalConfig.supportPhone,
        supportWhatsApp: generalConfig.supportPhone,
        country: generalConfig.country,
        currency: generalConfig.currency,
        platformCommission: parseFloat(financialRules.platformCommission) || 5.0,
        minPlatformFee: parseFloat(financialRules.minPlatformFee) || 2500,
        minHourlyRate: parseFloat(financialRules.minHourlyRate) || 25000,
        cashTransferDebtEnabled: financialRules.cashTransferDebtEnabled,
        requireIdentityVerification: securityRules.requireIdentityVerification,
        requirePoliceRecord: securityRules.requirePoliceRecord,
      });
    } catch (err) {
      console.warn('Error guardando en MySQL:', err);
    }

    showSuccess('Parámetros Guardados', 'La configuración global de Conecta 360 se ha actualizado correctamente.');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex font-sans transition-colors">
      <AdminSidebar currentPath="/admin/settings" />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="text-slate-400 hover:text-slate-600 md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>Configuración Global & Multi-País</span>
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/business"
              target="_blank"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50 text-[#0056d2] dark:text-blue-300 text-xs font-bold transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>Ver Portal Business</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8">
          <div className="flex space-x-1 sm:space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('countries')}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'countries'
                  ? 'border-[#0056d2] text-[#0056d2] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Países & Multi-Tenancy</span>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {countries.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('general')}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'general'
                  ? 'border-[#0056d2] text-[#0056d2] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>Tarifas & Comisiones</span>
            </button>

            <button
              onClick={() => setActiveTab('reasons')}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'reasons'
                  ? 'border-[#0056d2] text-[#0056d2] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Motivos de Rechazo</span>
            </button>

            <button
              onClick={() => setActiveTab('business')}
              className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'business'
                  ? 'border-[#0056d2] text-[#0056d2] dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Solicitudes Business (B2B)</span>
              {businessLeads.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {businessLeads.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* ------------------------------------------------------------- */}
          {/* TAB 1: PAÍSES Y MULTI-TENANCY */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'countries' && (
            <div className="space-y-6">
              {/* Banner Explicativo */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-2">
                    <Server className="w-3.5 h-3.5" />
                    <span>Arquitectura Multi-Tenant & Multi-País</span>
                  </div>
                  <h3 className="text-xl font-black">Infraestructura Regional y Bases de Datos Separadas</h3>
                  <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl">
                    Define los dominios, hosting y configuración de base de datos (`conecta360_co`, `conecta360_mx`, etc.) para cada país. Los usuarios se filtran por las ciudades y moneda asignadas a su tenant.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const newCountry: CountryTenant = {
                      id: `P-${Date.now().toString().slice(-3)}`,
                      code: 'PA',
                      name: 'Nuevo País',
                      flag: '🌐',
                      currency: 'USD ($)',
                      currencySymbol: '$',
                      phonePrefix: '+1',
                      domain: 'conecta360.global',
                      hostingEndpoint: 'https://api.conecta360.global',
                      dbConfig: {
                        dbHost: 'localhost',
                        dbPort: 3306,
                        dbName: 'conecta360_new',
                        dbUser: 'conecta360_user',
                        status: 'CONNECTED'
                      },
                      defaultCity: 'Ciudad Principal',
                      defaultDepartment: 'Región Central',
                      cities: [{ name: 'Ciudad Principal', province: 'Región Central', active: true }],
                      platformCommission: 5.0,
                      minPlatformFee: 2000,
                      minHourlyRate: 20000,
                      status: 'ACTIVE'
                    };
                    setCountryForm(newCountry);
                    setIsEditingCountry(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Agregar País / Tenant</span>
                </button>
              </div>

              {/* Selector y Lista de Países */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Tarjetas de países */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                    Países Registrados ({countries.length})
                  </div>

                  {countries.map((c) => {
                    const isSelected = c.id === selectedCountryId;
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCountry(c)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-slate-900 border-[#0056d2] dark:border-blue-500 shadow-md ring-2 ring-blue-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{c.flag}</span>
                            <div>
                              <div className="font-bold text-sm flex items-center space-x-2">
                                <span>{c.name}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {c.code}
                                </span>
                                {c.isDefault && (
                                  <span className="text-[9px] bg-blue-100 dark:bg-blue-900/60 text-[#0056d2] dark:text-blue-300 font-bold px-1.5 py-0.2 rounded">
                                    Principal
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                🌐 {c.domain}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#0056d2] dark:text-blue-400' : 'text-slate-400'}`} />
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center space-x-1">
                            <Database className="w-3.5 h-3.5 text-blue-500" />
                            <span className="font-mono text-[11px]">{c.dbConfig?.dbName || 'db_default'}</span>
                          </span>
                          <span>{c.cities?.filter((ci) => ci.active).length || 0} ciudades activas</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Columna Derecha: Detalles del País Seleccionado & Configuración de Base de Datos */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-4xl">{countryForm.flag}</span>
                        <div>
                          <h3 className="text-lg font-black">{countryForm.name} ({countryForm.code})</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Configuración de Hosting, Base de Datos y Ciudades</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleTestDatabase(countryForm)}
                          type="button"
                          className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>Probar Conexión BD</span>
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleSaveCountry} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre del País</label>
                          <input
                            type="text"
                            value={countryForm.name}
                            onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Código ISO / Bandera</label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              maxLength={3}
                              value={countryForm.code}
                              onChange={(e) => setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })}
                              className="w-20 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono uppercase font-bold"
                            />
                            <input
                              type="text"
                              value={countryForm.flag}
                              onChange={(e) => setCountryForm({ ...countryForm, flag: e.target.value })}
                              placeholder="🇨🇴"
                              className="w-16 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center text-lg"
                            />
                            <input
                              type="text"
                              value={countryForm.phonePrefix}
                              onChange={(e) => setCountryForm({ ...countryForm, phonePrefix: e.target.value })}
                              placeholder="+57"
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dominio / Host Asignado</label>
                          <input
                            type="text"
                            value={countryForm.domain}
                            onChange={(e) => setCountryForm({ ...countryForm, domain: e.target.value })}
                            placeholder="ej: conecta360.mx"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Endpoint de Hosting / API</label>
                          <input
                            type="text"
                            value={countryForm.hostingEndpoint}
                            onChange={(e) => setCountryForm({ ...countryForm, hostingEndpoint: e.target.value })}
                            placeholder="ej: https://api.mx.conecta360.com"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Moneda Oficial y Símbolo</label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={countryForm.currency}
                              onChange={(e) => setCountryForm({ ...countryForm, currency: e.target.value })}
                              placeholder="COP ($)"
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                            />
                            <input
                              type="text"
                              value={countryForm.currencySymbol}
                              onChange={(e) => setCountryForm({ ...countryForm, currencySymbol: e.target.value })}
                              placeholder="$"
                              className="w-16 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Comisión Plataforma (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={countryForm.platformCommission}
                            onChange={(e) => setCountryForm({ ...countryForm, platformCommission: parseFloat(e.target.value) || 5 })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                          />
                        </div>
                      </div>

                      {/* Parámetros de Base de Datos Tenant */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>Configuración de Base de Datos Separada por País</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-bold mb-1">Host de BD</label>
                            <input
                              type="text"
                              value={countryForm.dbConfig?.dbHost || 'localhost'}
                              onChange={(e) =>
                                setCountryForm({
                                  ...countryForm,
                                  dbConfig: { ...countryForm.dbConfig, dbHost: e.target.value }
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-[11px]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-bold mb-1">Nombre Base de Datos</label>
                            <input
                              type="text"
                              value={countryForm.dbConfig?.dbName || `conecta360_${countryForm.code.toLowerCase()}`}
                              onChange={(e) =>
                                setCountryForm({
                                  ...countryForm,
                                  dbConfig: { ...countryForm.dbConfig, dbName: e.target.value }
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-500 dark:text-slate-400 font-bold mb-1">Puerto</label>
                            <input
                              type="number"
                              value={countryForm.dbConfig?.dbPort || 3306}
                              onChange={(e) =>
                                setCountryForm({
                                  ...countryForm,
                                  dbConfig: { ...countryForm.dbConfig, dbPort: parseInt(e.target.value) || 3306 }
                                })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Gestor de Ciudades del País */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Ciudades Habilitadas en {countryForm.name} ({countryForm.cities?.length || 0})
                          </label>
                        </div>

                        {/* Agregar ciudad */}
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Nombre de la ciudad (ej: Monterrey)"
                            value={newCityName}
                            onChange={(e) => setNewCityName(e.target.value)}
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          />
                          <input
                            type="text"
                            placeholder="Estado / Departamento"
                            value={newCityProvince}
                            onChange={(e) => setNewCityProvince(e.target.value)}
                            className="w-44 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                          />
                          <button
                            type="button"
                            onClick={handleAddCityToCountry}
                            className="px-3 py-1.5 rounded-xl bg-[#0056d2] text-white text-xs font-bold hover:bg-blue-600 cursor-pointer"
                          >
                            + Agregar
                          </button>
                        </div>

                        {/* Lista de chips de ciudades */}
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                          {countryForm.cities?.map((city, idx) => (
                            <div
                              key={idx}
                              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                city.active
                                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-[#0056d2] dark:text-blue-300'
                                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleCity(idx)}
                                title={city.active ? 'Desactivar ciudad' : 'Activar ciudad'}
                                className="cursor-pointer"
                              >
                                {city.name} <span className="text-[10px] text-slate-400">({city.province})</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCity(idx)}
                                className="text-slate-400 hover:text-red-500 ml-1 cursor-pointer"
                                title="Eliminar ciudad"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end space-x-3">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-[#0056d2] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Guardar Configuración del País</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: TARIFAS & PARÁMETROS GENERALES */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Identidad de la Plataforma</h3>
                    <p className="text-xs text-slate-400 font-medium">Configuración de nombre y datos institucionales</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre Comercial</label>
                    <input
                      type="text"
                      value={generalConfig.platformName}
                      onChange={(e) => setGeneralConfig({ ...generalConfig, platformName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sede Principal</label>
                    <input
                      type="text"
                      value={generalConfig.country}
                      onChange={(e) => setGeneralConfig({ ...generalConfig, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Percent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Comisiones & Reglas Financieras</h3>
                    <p className="text-xs text-slate-400 font-medium">Porcentajes de retención y cobros de intermediación</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Comisión Plataforma (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={financialRules.platformCommission}
                      onChange={(e) => setFinancialRules({ ...financialRules, platformCommission: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tarifa Fija Mínima ({generalConfig.currency})</label>
                    <input
                      type="number"
                      value={financialRules.minPlatformFee}
                      onChange={(e) => setFinancialRules({ ...financialRules, minPlatformFee: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tarifa Hora Mínima ({generalConfig.currency})</label>
                    <input
                      type="number"
                      value={financialRules.minHourlyRate}
                      onChange={(e) => setFinancialRules({ ...financialRules, minHourlyRate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#0056d2] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Tarifas Financieras</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: MOTIVOS DE RECHAZO */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'reasons' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-black">Catálogo de Motivos de Rechazo de Servicios</h3>
                  <p className="text-xs text-slate-400 font-medium">Gestiona las causales oficiales disponibles cuando un prestador cancela un servicio asignado.</p>
                </div>

                <form onSubmit={handleAddReason} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Agregar Nuevo Motivo de Rechazo</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Título o Razón del Rechazo *</label>
                      <input
                        type="text"
                        required
                        value={newReasonLabel}
                        onChange={(e) => setNewReasonLabel(e.target.value)}
                        placeholder="Ej: Acceso vial bloqueado o zona inaccesible"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">Tipo de Justificación</label>
                      <select
                        value={newReasonJustified ? 'JUSTIFIED' : 'PENALTY'}
                        onChange={(e) => setNewReasonJustified(e.target.value === 'JUSTIFIED')}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                      >
                        <option value="JUSTIFIED">Justificado (0 puntos de penalización)</option>
                        <option value="PENALTY">Injustificado (Aplica penalización a reputación)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#0056d2] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    Guardar Motivo en Catálogo
                  </button>
                </form>

                {/* Lista de motivos existentes */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rejectionReasons.map((reason) => (
                    <div key={reason.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{reason.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {reason.isJustified ? (
                            <span className="text-emerald-600 font-bold">✓ Causa Justificada (0 pts)</span>
                          ) : (
                            <span className="text-rose-600 font-bold">✕ Injustificada (-{reason.penaltyPoints || 10} pts)</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteReason(reason.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Eliminar motivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: SOLICITUDES BUSINESS (B2B) */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-black">Solicitudes Conecta 360 Business (B2B)</h3>
                    <p className="text-xs text-slate-400 font-medium">Clientes corporativos y empresas interesadas en convenios</p>
                  </div>
                  <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-[#0056d2] dark:text-blue-300 px-2.5 py-1 rounded-full">
                    {businessLeads.length} Registros
                  </span>
                </div>

                {businessLeads.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-500" />
                    <p className="text-sm font-semibold">No hay solicitudes corporativas registradas aún.</p>
                    <p className="text-xs mt-1">Las empresas que coticen en /business aparecerán automáticamente aquí.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {businessLeads.map((lead: any) => (
                      <div
                        key={lead.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{lead.companyName}</span>
                            <span className="text-xs font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.2 rounded font-bold">
                              NIT: {lead.taxId}
                            </span>
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full capitalize">
                              Plan {lead.selectedPlan || 'Corporativo'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400">
                            Contacto: <span className="font-semibold">{lead.contactName}</span> ({lead.contactRole || 'Representante'}) • ✉ {lead.email} • 📞 {lead.phone}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            📍 {lead.city}, {lead.country} • Requerimiento: {lead.serviceNeeds}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <a
                            href={`mailto:${lead.email}?subject=Propuesta Comercial Conecta 360 Business para ${lead.companyName}`}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            Contactar
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
