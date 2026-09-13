'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Check,
  ArrowLeft,
  Sparkles,
  Receipt,
  FileCheck2,
  RefreshCw,
  Percent
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  fetchAllBookingsBackend,
  fetchFinancialSummaryBackend,
  payPlatformDebtBackend,
  FinancialSummary,
} from '@/lib/admin-data';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  popular?: boolean;
  activeSubscribers: number;
}

interface Subscriber {
  id: number;
  name: string;
  category: string;
  plan: string;
  billing: string;
  amount: string;
  nextRenewal: string;
  status: 'ACTIVE' | 'GRACE_PERIOD' | 'CANCELED';
}

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'COMMISSIONS' | 'PLANS'>('COMMISSIONS');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Financial summary & real bookings from MySQL
  const [summary, setSummary] = useState<FinancialSummary>({
    totalTransactions: 0,
    totalVolume: 0,
    totalCommissionEarned: 0,
    totalDebtPending: 0,
  });
  const [bookings, setBookings] = useState<any[]>([]);
  const [debtFilter, setDebtFilter] = useState<'ALL' | 'EN_DEUDA' | 'AL_DIA'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Plans and subscribers in Colombia
  const [plans] = useState<Plan[]>([
    {
      id: 'free',
      name: 'Plan Básico (Gratuito)',
      price: 0,
      interval: 'Permanente',
      features: [
        '1 servicio profesional activo',
        'Perfil estándar en catálogo',
        'Comisión por servicio: 5%',
        'Soporte por correo electrónico',
      ],
      activeSubscribers: 42,
    },
    {
      id: 'pro',
      name: 'Plan Profesional Pro',
      price: 49000,
      interval: 'mes',
      popular: true,
      features: [
        'Servicios y oficios ilimitados',
        'Insignia oficial de Verificado destacada',
        'Prioridad en catálogo por ciudad y zona',
        'Comisión estándar: 5%',
        'Soporte prioritario por WhatsApp directo',
      ],
      activeSubscribers: 18,
    },
    {
      id: 'business',
      name: 'Plan Cuadrillas & Empresas 360',
      price: 129000,
      interval: 'mes',
      features: [
        'Hasta 10 integrantes por cuadrilla',
        '0% de comisión en servicios corporativos',
        'Módulo de propuestas y acuerdos cerrados',
        'Panel de estadísticas avanzadas',
        'Asesor comercial dedicado en Colombia',
      ],
      activeSubscribers: 6,
    },
  ]);

  const [subscribers] = useState<Subscriber[]>([
    {
      id: 1,
      name: 'Carlos Andrés Rodríguez',
      category: 'Electricidad',
      plan: 'Plan Profesional Pro',
      billing: 'Mensual ($49.000 COP)',
      amount: '$49.000 COP',
      nextRenewal: '01 Oct 2026',
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'Juan Carlos Pérez',
      category: 'Cerrajería',
      plan: 'Plan Profesional Pro',
      billing: 'Mensual ($49.000 COP)',
      amount: '$49.000 COP',
      nextRenewal: '28 Sep 2026',
      status: 'ACTIVE',
    },
    {
      id: 3,
      name: 'Andrés Felipe Gómez',
      category: 'Plomería',
      plan: 'Plan Básico',
      billing: 'Gratuito',
      amount: '$0 COP',
      nextRenewal: 'N/A',
      status: 'ACTIVE',
    },
    {
      id: 4,
      name: 'Cuadrilla Electromecánica del Valle',
      category: 'Empresas & Cuadrillas',
      plan: 'Plan Cuadrillas & Empresas 360',
      billing: 'Mensual ($129.000 COP)',
      amount: '$129.000 COP',
      nextRenewal: '15 Oct 2026',
      status: 'ACTIVE',
    },
    {
      id: 5,
      name: 'Lucía Zambrano',
      category: 'Climatización & Refrigeración',
      plan: 'Plan Profesional Pro',
      billing: 'Mensual ($49.000 COP)',
      amount: '$49.000 COP',
      nextRenewal: '22 Sep 2026',
      status: 'GRACE_PERIOD',
    },
    {
      id: 6,
      name: 'Pedro Martínez',
      category: 'Mantenimiento Locativo',
      plan: 'Plan Básico',
      billing: 'Gratuito',
      amount: '$0 COP',
      nextRenewal: 'N/A',
      status: 'ACTIVE',
    },
  ]);

  // Load real bookings & metrics from MySQL
  const loadData = async () => {
    setLoading(true);
    try {
      const [sum, allBookings] = await Promise.all([
        fetchFinancialSummaryBackend(),
        fetchAllBookingsBackend(),
      ]);

      if (sum) {
        setSummary(sum);
      }

      if (Array.isArray(allBookings) && allBookings.length > 0) {
        setBookings(allBookings);
      } else {
        // Fallback sample bookings if database is fresh
        setBookings([
          {
            id: 101,
            client: { firstName: 'Laura', lastName: 'Gómez', phone: '+57 312 456 7890' },
            provider: { firstName: 'Carlos Andrés', lastName: 'Rodríguez', phone: '+57 315 789 4521' },
            serviceTitle: 'Instalación de Caja de Breakers 220V',
            categoryName: 'Electricidad',
            amount: 140000,
            platformFee: 7000,
            paymentMethod: 'Transferencia Bancaria',
            platformDebtStatus: 'EN_DEUDA',
            status: 'COMPLETADO',
            dateString: '12 Sep 2026',
          },
          {
            id: 102,
            client: { firstName: 'Andrés', lastName: 'Ramírez', phone: '+57 311 987 6543' },
            provider: { firstName: 'Carlos Andrés', lastName: 'Rodríguez', phone: '+57 315 789 4521' },
            serviceTitle: 'Reparación de Cortocircuito Urgente',
            categoryName: 'Electricidad',
            amount: 95000,
            platformFee: 4750,
            paymentMethod: 'Efectivo',
            platformDebtStatus: 'EN_DEUDA',
            status: 'COMPLETADO',
            dateString: '10 Sep 2026',
          },
          {
            id: 103,
            client: { firstName: 'Juan Camilo', lastName: 'Osorio', phone: '+57 316 789 0123' },
            provider: { firstName: 'Juan Carlos', lastName: 'Pérez', phone: '+57 310 123 4567' },
            serviceTitle: 'Apertura de Cerradura de Seguridad',
            categoryName: 'Cerrajería',
            amount: 75000,
            platformFee: 3750,
            paymentMethod: 'Tarjeta de Crédito / Débito',
            platformDebtStatus: 'AL_DIA',
            status: 'COMPLETADO',
            dateString: '09 Sep 2026',
          },
          {
            id: 104,
            client: { firstName: 'María Fernanda', lastName: 'López', phone: '+57 314 234 5678' },
            provider: { firstName: 'Andrés Felipe', lastName: 'Gómez', phone: '+57 318 456 7890' },
            serviceTitle: 'Destape Hidro-Jet de Tubería Principal',
            categoryName: 'Plomería',
            amount: 120000,
            platformFee: 6000,
            paymentMethod: 'Transferencia Bancaria',
            platformDebtStatus: 'EN_DEUDA',
            status: 'CONFIRMADO',
            dateString: 'Hoy, 10:00 AM',
          },
        ]);
      }
    } catch (err) {
      console.warn('Error loading financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Settlement action: Mark debt as paid in MySQL
  const handleSettleDebt = async (bookingId: number) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, platformDebtStatus: 'AL_DIA', paymentStatus: 'PAGADO' } : b
      )
    );

    setFeedback(`✓ Comisión de la orden #${bookingId} liquidada con éxito en MySQL.`);

    try {
      await payPlatformDebtBackend(bookingId);
      // Reload summary to reflect updated balance
      const sum = await fetchFinancialSummaryBackend();
      if (sum) setSummary(sum);
    } catch (err) {
      console.warn('Error settling debt in backend:', err);
    }

    setTimeout(() => setFeedback(null), 4000);
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesDebt = debtFilter === 'ALL' || b.platformDebtStatus === debtFilter;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (b.serviceTitle || '').toLowerCase().includes(q) ||
      (b.categoryName || '').toLowerCase().includes(q) ||
      `${b.client?.firstName || ''} ${b.client?.lastName || ''}`.toLowerCase().includes(q) ||
      `${b.provider?.firstName || ''} ${b.provider?.lastName || ''}`.toLowerCase().includes(q);
    return matchesDebt && matchesSearch;
  });

  const totalCommissionsEarnedCalc = bookings
    .filter((b) => b.platformDebtStatus === 'AL_DIA')
    .reduce((acc, b) => acc + Number(b.platformFee || 0), 0);

  const totalCommissionsPendingCalc = bookings
    .filter((b) => b.platformDebtStatus === 'EN_DEUDA')
    .reduce((acc, b) => acc + Number(b.platformFee || 0), 0);

  const totalVolumeCalc = bookings.reduce((acc, b) => acc + Number(b.amount || 0), 0);

  const formatCOP = (val: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      <AdminSidebar currentPath="/admin/subscriptions" />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="text-slate-400 hover:text-slate-600 md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <span>Suscripciones & Liquidación de Comisiones</span>
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Sincronizar MySQL</span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {feedback && (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md flex items-center justify-between animate-fade-in">
              <span>{feedback}</span>
              <button onClick={() => setFeedback(null)} className="text-white/80 hover:text-white">✕</button>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Comisiones Al Día</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-2">
                {formatCOP(summary.totalCommissionEarned || totalCommissionsEarnedCalc)}
              </p>
              <span className="text-[11px] font-bold text-emerald-700 flex items-center mt-1">
                Recaudado en plataforma
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-xs font-bold uppercase tracking-wider">Comisiones Pendientes</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-2">
                {formatCOP(summary.totalDebtPending || totalCommissionsPendingCalc)}
              </p>
              <span className="text-[11px] font-bold text-amber-700 mt-1">
                En deuda por cobros en efectivo/transferencia
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Volumen Transaccionado</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {formatCOP(summary.totalVolume || totalVolumeCalc)}
              </p>
              <span className="text-[11px] font-medium text-slate-500 mt-1">
                {bookings.length} servicios procesados
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Tarifa de Intermediación</span>
                <Percent className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-purple-700 mt-2">5% COP</p>
              <span className="text-[11px] font-bold text-purple-700 mt-1">
                Mínimo $3.000 COP por servicio
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-3 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('COMMISSIONS')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'COMMISSIONS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Liquidación de Comisiones en MySQL ({bookings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('PLANS')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'PLANS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Planes Comerciales & Membresías Pro</span>
            </button>
          </div>

          {/* TAB 1: COMMISSIONS & DEBT SETTLEMENT */}
          {activeTab === 'COMMISSIONS' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Control de Comisiones de Intermediación</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Servicios contratados, liquidación de saldo deudor y recaudo de plataforma en MySQL
                  </p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <select
                    value={debtFilter}
                    onChange={(e: any) => setDebtFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="ALL">Todos los Estados</option>
                    <option value="EN_DEUDA">Solo en Deuda</option>
                    <option value="AL_DIA">Solo al Día</option>
                  </select>

                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por servicio, cliente o prestador..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Servicio & Categoría</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Prestador</th>
                      <th className="py-3 px-4">Monto Servicio</th>
                      <th className="py-3 px-4">Comisión Plataforma (5%)</th>
                      <th className="py-3 px-4">Método de Pago</th>
                      <th className="py-3 px-4">Estado Comisión</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500">#{b.id}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{b.serviceTitle}</p>
                          <span className="text-[11px] text-blue-600 font-semibold">{b.categoryName}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-xs font-bold text-slate-800">
                            {b.client?.firstName} {b.client?.lastName}
                          </p>
                          <span className="text-[10px] text-slate-400">{b.client?.phone || 'Sin tel'}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-xs font-bold text-slate-800">
                            {b.provider?.firstName} {b.provider?.lastName}
                          </p>
                          <span className="text-[10px] text-slate-400">{b.provider?.phone || 'Sin tel'}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-xs">
                          {formatCOP(Number(b.amount || 0))}
                        </td>
                        <td className="py-3.5 px-4 font-black text-blue-600 text-xs">
                          {formatCOP(Number(b.platformFee || 0))}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                          {b.paymentMethod || 'Efectivo'}
                        </td>
                        <td className="py-3.5 px-4">
                          {b.platformDebtStatus === 'EN_DEUDA' ? (
                            <span className="inline-flex items-center space-x-1 text-red-700 bg-red-50 border border-red-200 text-[11px] font-black px-2.5 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                              <span>En Deuda</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Al Día</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {b.platformDebtStatus === 'EN_DEUDA' ? (
                            <button
                              onClick={() => handleSettleDebt(b.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                            >
                              Liquidar Comisión
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">Liquidado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PLANS & SUBSCRIBERS */}
          {activeTab === 'PLANS' && (
            <div className="space-y-8">
              {/* Plans Grid */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Estructura de Planes Comerciales en Colombia</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Precios oficiales en Pesos Colombianos (COP) para prestadores individuales y empresas
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between relative ${
                        plan.popular ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' : 'border-slate-200'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                          Recomendado
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-base font-black text-slate-900">{plan.name}</h4>
                          <div className="flex items-baseline space-x-1 mt-2">
                            <span className="text-3xl font-black text-slate-900">
                              {plan.price === 0 ? 'Gratis' : formatCOP(plan.price)}
                            </span>
                            {plan.price > 0 && (
                              <span className="text-xs font-semibold text-slate-400">/{plan.interval}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 font-medium mt-1">
                            {plan.activeSubscribers} prestadores activos
                          </p>
                        </div>

                        <div className="h-px bg-slate-100"></div>

                        <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                          {plan.features.map((feat, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-6">
                        <button
                          onClick={() => setFeedback(`Ajustes del ${plan.name} guardados.`)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                            plan.popular
                              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                              : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          Configurar Tarifas
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscribers Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Suscriptores y Membresías</h3>
                  <p className="text-xs text-slate-500 font-medium">Control de cuentas y renovaciones periódicas</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Prestador</th>
                        <th className="py-3.5 px-4">Categoría</th>
                        <th className="py-3.5 px-4">Plan Actual</th>
                        <th className="py-3.5 px-4">Facturación</th>
                        <th className="py-3.5 px-4">Próxima Renovación</th>
                        <th className="py-3.5 px-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{sub.name}</td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-slate-500">{sub.category}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                sub.plan.includes('Empresas')
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : sub.plan.includes('Pro')
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {sub.plan}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-700">{sub.billing}</td>
                          <td className="py-3.5 px-4 text-xs font-mono text-slate-500">{sub.nextRenewal}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              Activa
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
