'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import MainNavbar from '@/components/MainNavbar';
import MainFooter from '@/components/MainFooter';
import { useCountry } from '@/context/CountryContext';
import { showSuccess, showError } from '@/lib/alerts';
import {
  Building2,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  PhoneCall,
  Clock,
  FileSpreadsheet,
  Globe2,
  Headphones,
  Award,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Lock
} from 'lucide-react';

export default function BusinessPortalPage() {
  const { currentCountry, currentCities, formatCurrency } = useCountry();

  const [selectedPlan, setSelectedPlan] = useState<'pyme' | 'corporativo' | 'enterprise'>('corporativo');
  const [numBranches, setNumBranches] = useState<number>(3);
  const [industryType, setIndustryType] = useState<string>('Comercio & Retail');

  // Formulario corporativo
  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '', // NIT, CIF, RFC
    contactName: '',
    contactRole: '',
    email: '',
    phone: '',
    city: currentCities[0]?.name || 'Cali',
    estimatedSites: '1 - 3',
    serviceNeeds: 'Mantenimiento Preventivo & Correctivo',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateMonthlyEstimate = () => {
    const base = selectedPlan === 'pyme' ? 89000 : selectedPlan === 'corporativo' ? 249000 : 490000;
    const branchMultiplier = Math.max(1, 1 + (numBranches - 1) * 0.12);
    return Math.round(base * branchMultiplier);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.email || !formData.phone || !formData.taxId) {
      showError('Campos incompletos', 'Por favor diligencia los datos principales de la empresa y contacto.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ticketId = `B2B-${Date.now().toString().slice(-6)}`;
      const requestItem = {
        id: ticketId,
        ...formData,
        country: currentCountry.name,
        countryCode: currentCountry.code,
        selectedPlan,
        createdAt: new Date().toISOString(),
        status: 'PENDIENTE_CONTACTO'
      };

      // Guardar en almacenamiento de solicitudes corporativas
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('conecta360_business_leads') || '[]');
        localStorage.setItem('conecta360_business_leads', JSON.stringify([requestItem, ...existing]));
        window.dispatchEvent(new Event('business-leads-updated'));
      }

      await showSuccess(
        '¡Solicitud Corporativa Radicada!',
        `Radicado #${ticketId}. Un Gerente de Cuentas Corporativas de Conecta 360 se comunicará con ${formData.contactName || formData.companyName} en menos de 2 horas hábiles.`
      );

      setFormData({
        companyName: '',
        taxId: '',
        contactName: '',
        contactRole: '',
        email: '',
        phone: '',
        city: currentCities[0]?.name || 'Cali',
        estimatedSites: '1 - 3',
        serviceNeeds: 'Mantenimiento Preventivo & Correctivo',
        message: ''
      });
    } catch {
      showError('Error al enviar', 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <MainNavbar />

      {/* Hero Section B2B */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#002f6c] to-slate-900 text-white py-16 sm:py-24 px-6 sm:px-12 lg:px-20 border-b border-blue-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        
        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-bold mb-6 backdrop-blur-md">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Soluciones Corporativas & Multi-Sede</span>
                <span className="bg-blue-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  B2B
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6">
                Infraestructura operativa y cuadrillas dedicadas para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300">tu Empresa</span>.
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
                Centraliza el mantenimiento de todas tus sedes, oficinas, locales comerciales e industrias en {currentCountry.name}. Facturación electrónica unificada, SLAs garantizados menores a 2 horas y personal técnico certificado con póliza de cumplimiento.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a
                  href="#cotizar"
                  className="px-6 py-3.5 rounded-2xl bg-[#0056d2] hover:bg-blue-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-500/25 transition-all flex items-center space-x-2"
                >
                  <span>Solicitar Propuesta Comercial</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#planes"
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm sm:text-base border border-white/20 transition-all backdrop-blur-sm"
                >
                  Ver Planes Corporativos
                </a>
              </div>

              {/* Indicadores clave */}
              <div className="grid grid-cols-3 gap-4 pt-10 mt-10 border-t border-white/10 text-center lg:text-left">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-white">+500</div>
                  <div className="text-xs text-slate-400 font-medium">Sedes comerciales activas</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-blue-300">&lt; 2 Horas</div>
                  <div className="text-xs text-slate-400 font-medium">SLA de atención prioritario</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
                  <div className="text-xs text-slate-400 font-medium">Facturación con NIT/RUT</div>
                </div>
              </div>
            </div>

            {/* Tarjeta de Resumen / Cotizador Rápido */}
            <div className="w-full lg:max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-[#0056d2] dark:text-blue-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Simulador Conecta Business</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Cotización estimada para {currentCountry.name}</p>
                  </div>
                </div>
                <span className="text-xl">{currentCountry.flag}</span>
              </div>

              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Plan Seleccionado
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['pyme', 'corporativo', 'enterprise'] as const).map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setSelectedPlan(plan)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl border capitalize transition-all ${
                          selectedPlan === plan
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-[#0056d2] text-[#0056d2] dark:text-blue-300 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Número de Sedes / Locales
                    </label>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{numBranches} sedes</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={numBranches}
                    onChange={(e) => setNumBranches(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0056d2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Sector o Industria
                  </label>
                  <select
                    value={industryType}
                    onChange={(e) => setIndustryType(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Comercio & Retail">Comercio & Tiendas Retail</option>
                    <option value="Restaurantes & Gastronomía">Restaurantes & Franquicias</option>
                    <option value="Oficinas & Coworkings">Oficinas Corporativas & Coworking</option>
                    <option value="Inmobiliarias & PH">Inmobiliarias & Propiedad Horizontal</option>
                    <option value="Salud & Clínicas">Centros de Salud & Consultorios</option>
                    <option value="Industria & Bodegas">Industria, Logística & Bodegas</option>
                  </select>
                </div>

                {/* Resultado Estimado */}
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Inversión mensual estimada:</div>
                  <div className="text-2xl font-black text-[#0056d2] dark:text-blue-400 mt-0.5">
                    {formatCurrency(calculateMonthlyEstimate())} <span className="text-xs font-normal text-slate-500">/ mes</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Incluye cuadrillas preventivas, correctivas y soporte 24/7.</span>
                  </div>
                </div>

                <a
                  href="#cotizar"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs sm:text-sm text-center block transition-all shadow-md"
                >
                  Completar Registro Corporativo
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios Empresariales B2B */}
      <section className="py-16 sm:py-20 px-6 sm:px-12 lg:px-20 max-w-[1440px] mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#0056d2] dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full mb-3">
            Ventajas Conecta 360 Business
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Diseñado para directores de operaciones, administradores e inmuebles
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
            Elimina los dolores de cabeza de buscar técnicos individuales sin garantías. Centraliza todas las órdenes de trabajo con control total.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-[#0056d2] dark:text-blue-400 flex items-center justify-center mb-5">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Facturación Electrónica Centralizada</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Recibe una única factura mensual con NIT/RUT que agrupa todos los servicios prestados en todas tus sedes, simplificando tu gestión contable y tributaria.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Póliza y Seguridad Jurídica</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Todos los técnicos y cuadrillas cuentan con ARL vigente, antecedentes judiciales verificados por el sistema y respaldo de póliza de responsabilidad civil.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">SLA & Atención de Emergencias</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Tiempos de respuesta contractualmente garantizados de menos de 2 horas para emergencias eléctricas, de plomería, climatización o cerrajería.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Cuadrillas Técnicas Dedicadas</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Asignación recurrente de los mismos equipos técnicos que ya conocen la infraestructura de tus sedes y los protocolos internos de tu empresa.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-5">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Cobertura Multi-País y Multi-Ciudad</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Mismo estándar de servicio en Colombia, México, España, Perú y Estados Unidos, con soporte multi-moneda y contratos marco regionales.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Gerente de Cuenta Exclusivo</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Canal directo vía WhatsApp corporativo, llamadas y plataforma para agendamientos ágiles y reportes ejecutivos periódicos de mantenimiento.
            </p>
          </div>
        </div>
      </section>

      {/* Sección de Planes Corporativos */}
      <section id="planes" className="py-16 sm:py-24 px-6 sm:px-12 lg:px-20 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-[1440px] mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Planes Diseñados a la Escala de tu Organización
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-3">
              Tarifas transparentes con todo incluido en la moneda oficial de {currentCountry.name} ({currentCountry.currency}).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1: Negocio / Pyme */}
            <div className="rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Para Comercios y Pymes</div>
                <h3 className="text-2xl font-black mb-2">Plan Pyme Local</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                  Ideal para tiendas, locales comerciales, consultorios y oficinas de hasta 3 sedes.
                </p>

                <div className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-6">
                  {formatCurrency(89000)} <span className="text-xs font-normal text-slate-500">/ mes</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-8">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Hasta 3 sedes o sucursales activas</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Tarifas preferenciales con 15% de ahorro</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Factura electrónica unificada con NIT/RUT</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Técnicos verificados con ARL al día</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>SLA de respuesta &lt; 4 horas</span>
                  </li>
                </ul>
              </div>

              <a
                href="#cotizar"
                onClick={() => setSelectedPlan('pyme')}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm text-center block transition-all"
              >
                Elegir Plan Pyme
              </a>
            </div>

            {/* Plan 2: Corporativo (Destacado) */}
            <div className="rounded-3xl p-8 bg-gradient-to-b from-[#002f6c] to-[#001d44] text-white border-2 border-[#0056d2] flex flex-col justify-between shadow-2xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0056d2] text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                Más Elegido por Empresas
              </div>

              <div>
                <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">Para Medianas y Grandes</div>
                <h3 className="text-2xl font-black mb-2">Plan Corporativo</h3>
                <p className="text-xs text-blue-100/80 mb-6">
                  Para inmobiliarias, constructoras, centros educativos, clínicas y cadenas con múltiples sucursales.
                </p>

                <div className="text-3xl font-black text-white mb-6">
                  {formatCurrency(249000)} <span className="text-xs font-normal text-blue-200">/ mes</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-blue-100 mb-8">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Hasta 10 sedes o sucursales a nivel nacional</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Cuadrillas dedicadas prioritarias</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>SLA garantizado &lt; 2 horas</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Gestor de cuenta B2B dedicado (WhatsApp/Llamadas)</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Póliza de responsabilidad civil y cumplimiento</span>
                  </li>
                </ul>
              </div>

              <a
                href="#cotizar"
                onClick={() => setSelectedPlan('corporativo')}
                className="w-full py-3.5 rounded-2xl bg-[#0056d2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm text-center block transition-all shadow-lg"
              >
                Contratar Plan Corporativo
              </a>
            </div>

            {/* Plan 3: Enterprise */}
            <div className="rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Multinacional & Gran Industria</div>
                <h3 className="text-2xl font-black mb-2">Plan Enterprise</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6">
                  Operaciones masivas multi-ciudad con integración ERP y cuadrillas de guardia permanente.
                </p>

                <div className="text-3xl font-black text-slate-900 dark:text-slate-100 mb-6">
                  {formatCurrency(490000)} <span className="text-xs font-normal text-slate-500">/ mes</span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-8">
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Sedes ilimitadas y cobertura multi-país</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Integración API directa con ERP (SAP, Oracle, Siigo)</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Cuadrillas de guardia 24/7/365</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Auditorías técnicas y preventivas programadas</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Línea telefónica ejecutiva 24/7/365</span>
                  </li>
                </ul>
              </div>

              <a
                href="#cotizar"
                onClick={() => setSelectedPlan('enterprise')}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm text-center block transition-all"
              >
                Solicitar Cotización Enterprise
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario de Cotización y Registro B2B */}
      <section id="cotizar" className="py-16 sm:py-24 px-6 sm:px-12 lg:px-20 max-w-[1100px] mx-auto w-full">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0056d2] dark:text-blue-300 text-xs font-bold mb-3">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Atención Comercial Inmediata</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Abre tu Cuenta Conecta 360 Business
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              Diligencia los datos de tu empresa en {currentCountry.name} para activar tu convenio corporativo y asignar tu cuadrilla de soporte.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Razón Social o Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Ej: Inversiones Los Robles S.A.S."
                  className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  NIT / Identificación Tributaria *
                </label>
                <input
                  type="text"
                  required
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="Ej: 900.123.456-7"
                  className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Nombre del Contacto / Responsable *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Ej: Carolina Morales"
                  className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Cargo o Área
                </label>
                <input
                  type="text"
                  value={formData.contactRole}
                  onChange={(e) => setFormData({ ...formData, contactRole: e.target.value })}
                  placeholder="Ej: Directora de Operaciones / Mantenimiento"
                  className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Correo Electrónico Corporativo *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ejemplo@empresa.com"
                  className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Teléfono / Móvil Corporativo *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                    {currentCountry.phonePrefix}
                  </span>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="315 000 0000"
                    className="w-full text-xs sm:text-sm px-4 py-3 rounded-r-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Ciudad Principal de Operación
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {currentCities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.province})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Tipo de Requerimiento
                </label>
                <select
                  value={formData.serviceNeeds}
                  onChange={(e) => setFormData({ ...formData, serviceNeeds: e.target.value })}
                  className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Mantenimiento Preventivo & Correctivo">Mantenimiento Preventivo & Correctivo Integral</option>
                  <option value="Cuadrillas de Remodelación & Obra">Cuadrillas de Obra, Pintura & Remodelación</option>
                  <option value="Infraestructura Eléctrica & Clima">Electricidad Comercial & Aire Acondicionado</option>
                  <option value="Plomería & Redes Hidrosanitarias">Redes Hidrosanitarias & Plomería</option>
                  <option value="Cerrajería & Seguridad Física">Cerrajería de Alta Seguridad & Accesos</option>
                  <option value="Otro Servicio a Medida">Otro Servicio Especializado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Detalles Adicionales del Requerimiento o Sedes
              </label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Indica direcciones de sedes, horarios preferentes de intervención o requerimientos de seguridad..."
                className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#0056d2] hover:bg-blue-600 text-white font-black text-sm sm:text-base shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Building2 className="w-5 h-5" />
              <span>{isSubmitting ? 'Enviando solicitud...' : 'Enviar Solicitud Corporativa'}</span>
            </button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Al enviar autorizas el tratamiento de datos para fines comerciales de Conecta 360 Business y el contacto prioritario de un asesor.
            </p>
          </form>
        </div>
      </section>

      <MainFooter />
    </div>
  );
}
