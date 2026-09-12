'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Users,
  Layers,
  Wrench,
  ShieldAlert,
  Award,
  Settings,
  LayoutDashboard,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  ArrowLeft,
  Search,
  Check,
  Plus
} from 'lucide-react';

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
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 'free',
      name: 'Plan Básico',
      price: 0,
      interval: 'Gratis para siempre',
      features: [
        'Hasta 2 servicios activos',
        'Perfil estándar en catálogo',
        'Comisión por contratación: 10%',
        'Soporte por correo electrónico'
      ],
      activeSubscribers: 42
    },
    {
      id: 'pro',
      name: 'Plan Profesional Pro',
      price: 19.99,
      interval: 'mes',
      popular: true,
      features: [
        'Servicios ilimitados',
        'Insignia de Verificado destacada',
        'Prioridad en búsquedas por ciudad',
        'Comisión reducida: 5%',
        'Soporte prioritario por WhatsApp'
      ],
      activeSubscribers: 18
    },
    {
      id: 'business',
      name: 'Plan Empresa 360',
      price: 49.99,
      interval: 'mes',
      features: [
        'Hasta 10 miembros / técnicos',
        '0% de comisión en plataforma',
        'Módulo de cotizaciones corporativas',
        'Panel de analíticas y métricas',
        'Asesor de cuenta dedicado 24/7'
      ],
      activeSubscribers: 6
    }
  ]);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([
    {
      id: 1,
      name: 'Juan Pérez',
      category: 'Cerrajería',
      plan: 'Plan Profesional Pro',
      billing: 'Mensual ($19.99)',
      amount: '$19.99',
      nextRenewal: '01 Oct 2026',
      status: 'ACTIVE'
    },
    {
      id: 2,
      name: 'Ana Torres',
      category: 'Tecnología',
      plan: 'Plan Profesional Pro',
      billing: 'Mensual ($19.99)',
      amount: '$19.99',
      nextRenewal: '28 Sep 2026',
      status: 'ACTIVE'
    },
    {
      id: 3,
      name: 'Carlos Mendoza',
      category: 'Electricidad',
      plan: 'Plan Básico',
      billing: 'Gratuito',
      amount: '$0.00',
      nextRenewal: 'N/A',
      status: 'ACTIVE'
    },
    {
      id: 4,
      name: 'Valeria Paz',
      category: 'Salud y Bienestar',
      plan: 'Plan Empresa 360',
      billing: 'Mensual ($49.99)',
      amount: '$49.99',
      nextRenewal: '15 Oct 2026',
      status: 'ACTIVE'
    },
    {
      id: 5,
      name: 'Luis García',
      category: 'Plomería',
      plan: 'Plan Profesional Pro',
      billing: 'Mensual ($19.99)',
      amount: '$19.99',
      nextRenewal: '22 Sep 2026',
      status: 'GRACE_PERIOD'
    },
    {
      id: 6,
      name: 'Fernando Ríos',
      category: 'Carpintería',
      plan: 'Plan Básico',
      billing: 'Gratuito',
      amount: '$0.00',
      nextRenewal: 'N/A',
      status: 'ACTIVE'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanModal, setSelectedPlanModal] = useState<Plan | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Categorías', href: '/admin/categories', icon: Layers },
    { name: 'Servicios', href: '/admin/services', icon: Wrench },
    { name: 'Roles', href: '/admin/roles', icon: ShieldAlert },
    { name: 'Verificaciones', href: '/admin/verifications', icon: Award },
    { name: 'Suscripciones', href: '/admin/subscriptions', icon: CreditCard, active: true },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
  ];

  const filteredSubscribers = subscribers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMRR = (18 * 19.99 + 6 * 49.99).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/30">
            360
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">CONECTA 360</h1>
            <p className="text-xs text-slate-400 font-medium">Panel Administrativo</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  item.active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Web</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="text-slate-400 hover:text-slate-600 md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <span>Suscripciones y Planes</span>
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Ciclo Mensual Activo
            </span>
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
                <span className="text-xs font-bold uppercase tracking-wider">Ingreso Mensual (MRR)</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">${totalMRR} USD</p>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" /> +14.8% vs mes anterior
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Suscriptores Pro / Empresa</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-blue-600 mt-2">24</p>
              <span className="text-[11px] font-medium text-slate-400 mt-1">De 66 prestadores registrados</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Tasa de Renovación</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-2">97.2%</p>
              <span className="text-[11px] font-medium text-slate-400 mt-1">Retención alta</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Plan Más Popular</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-lg font-black text-slate-900 mt-2">Profesional Pro</p>
              <span className="text-[11px] font-bold text-amber-600 mt-1">$19.99 USD / mes</span>
            </div>
          </div>

          {/* Section: Planes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">Estructura de Planes Comerciales</h3>
                <p className="text-xs text-slate-500 font-medium">Niveles de membresía para prestadores de servicios en CONECTA 360</p>
              </div>
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
                          {plan.price === 0 ? 'Gratis' : `$${plan.price}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-xs font-semibold text-slate-400">/{plan.interval}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        {plan.activeSubscribers} prestadores suscritos actualmente
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
                      onClick={() => {
                        setSelectedPlanModal(plan);
                        setFeedback(`Editando beneficios del ${plan.name}`);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Ajustar Beneficios
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Suscriptores Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Suscriptores Activos</h3>
                <p className="text-xs text-slate-500 font-medium">Gestión de membresías, cobros y estado de cuentas</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar suscriptor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                    <th className="py-3.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{sub.name}</td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-500">{sub.category}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          sub.plan.includes('Empresa')
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : sub.plan.includes('Pro')
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {sub.plan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">{sub.billing}</td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-500">{sub.nextRenewal}</td>
                      <td className="py-3.5 px-4">
                        {sub.status === 'ACTIVE' && (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            Activa
                          </span>
                        )}
                        {sub.status === 'GRACE_PERIOD' && (
                          <span className="text-amber-700 bg-amber-50 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                            Periodo de Gracia
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setFeedback(`Detalles de suscripción de ${sub.name} cargados.`);
                          }}
                          className="px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
