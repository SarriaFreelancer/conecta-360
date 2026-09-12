'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Layers,
  Wrench,
  ShieldAlert,
  Award,
  CreditCard,
  Settings
} from 'lucide-react';

interface AdminSidebarProps {
  currentPath?: string;
}

export const ADMIN_MENU_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/admin/users', icon: Users },
  { name: 'Categorías', href: '/admin/categories', icon: Layers },
  { name: 'Servicios', href: '/admin/services', icon: Wrench },
  { name: 'Roles', href: '/admin/roles', icon: ShieldAlert },
  { name: 'Verificaciones', href: '/admin/verifications', icon: Award },
  { name: 'Suscripciones', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Configuración', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ currentPath }: AdminSidebarProps) {
  const pathname = usePathname();
  const activeRoute = currentPath || pathname || '/admin';

  const isItemActive = (href: string) => {
    if (href === '/admin') {
      return activeRoute === '/admin';
    }
    return activeRoute.startsWith(href);
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 hidden md:flex min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/30">
          360
        </div>
        <div>
          <h1 className="font-bold text-white tracking-tight">CONECTA 360</h1>
          <p className="text-xs text-slate-400 font-medium">Panel Administrativo</p>
        </div>
      </div>

      {/* Navigation - Always shows all 8 modules */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
          Módulos del Sistema
        </div>
        {ADMIN_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/dashboard"
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors flex items-center justify-center space-x-2 border border-slate-700/60"
        >
          <span>Ir a Portal Usuario</span>
        </Link>
        <Link
          href="/"
          className="w-full py-2.5 px-4 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
        >
          <span>Volver al Sitio Web</span>
        </Link>
      </div>
    </aside>
  );
}
