import React from 'react';
import Link from 'next/link';
import { Users, UserCheck, Wrench, ShieldAlert, LayoutDashboard, Settings, Layers, Award, CreditCard, ChevronRight, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { title: 'Usuarios Registrados', value: '2', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { title: 'Categorías Activas', value: '8', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { title: 'Servicios en Catálogo', value: '24', icon: Wrench, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { title: 'Roles del Sistema', value: '7', icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  ];

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, active: true },
    { name: 'Usuarios', href: '/admin/users', icon: Users, active: false },
    { name: 'Categorías', href: '/admin/categories', icon: Layers, active: false },
    { name: 'Servicios', href: '/admin/services', icon: Wrench, active: false },
    { name: 'Roles', href: '/admin/roles', icon: ShieldAlert, active: false },
    { name: 'Verificaciones', href: '/admin/verifications', icon: Award, active: false },
    { name: 'Suscripciones', href: '/admin/subscriptions', icon: CreditCard, active: false },
    { name: 'Configuración', href: '/admin/settings', icon: Settings, active: false },
  ];

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
            <span>Volver a la Web</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-900">Panel General</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                SA
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800">SuperAdmin</p>
                <p className="text-[10px] text-slate-500 font-medium">superadmin@conecta360.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                Plataforma de Servicios
              </span>
              <h3 className="text-2xl sm:text-3xl font-black mt-3">¡Bienvenido a CONECTA 360 Admin!</h3>
              <p className="mt-2 text-slate-300 text-sm max-w-xl font-medium">
                Panel centralizado para administrar usuarios, categorías dinámicas, catálogo de servicios y roles.
              </p>
            </div>
            <Link
              href="/admin/users"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all text-sm whitespace-nowrap"
            >
              Gestionar Usuarios →
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-3xl font-black text-slate-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} border flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Admin Modules Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Módulos Administrativos Activos</h4>
                <p className="text-xs text-slate-500 font-medium">Acceso rápido a la gestión de datos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/users" className="p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-blue-600">Usuarios</h5>
                  <p className="text-xs text-slate-500">Gestión de cuentas registradas y estados</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/categories" className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600">Categorías</h5>
                  <p className="text-xs text-slate-500">8 categorías y requisitos documentales</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/services" className="p-5 rounded-2xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-rose-600">Servicios</h5>
                  <p className="text-xs text-slate-500">Catálogo de 24 servicios por oficio</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/roles" className="p-5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-purple-600">Roles</h5>
                  <p className="text-xs text-slate-500">7 niveles de permisos y acceso</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/verifications" className="p-5 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-amber-600">Verificaciones</h5>
                  <p className="text-xs text-slate-500">Aprobación de antecedentes y títulos</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/subscriptions" className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">Suscripciones</h5>
                  <p className="text-xs text-slate-500">Planes Básico, Pro y Empresa 360</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/settings" className="p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-blue-600">Configuración</h5>
                  <p className="text-xs text-slate-500">Comisiones, coberturas y seguridad</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
