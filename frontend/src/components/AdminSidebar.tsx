'use client';

import React, { useState, useEffect } from 'react';
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
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Home,
  LogOut
} from 'lucide-react';
import { destroySession } from '@/lib/auth';
import { showConfirm } from '@/lib/alerts';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('conecta360_admin_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch (e) {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const nextVal = !prev;
      try {
        localStorage.setItem('conecta360_admin_sidebar_collapsed', String(nextVal));
      } catch (e) {}
      return nextVal;
    });
  };

  const isItemActive = (href: string) => {
    if (href === '/admin') {
      return activeRoute === '/admin';
    }
    return activeRoute.startsWith(href);
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      title: '¿Cerrar Sesión?',
      text: '¿Estás seguro de que deseas salir del panel de administración?',
      confirmText: 'Sí, Salir',
      cancelText: 'Cancelar',
      icon: 'question',
    });
    if (confirmed) {
      destroySession();
      window.location.href = '/';
    }
  };

  return (
    <aside
      className={`sticky top-0 h-screen bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 hidden md:flex transition-all duration-300 z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header con botón para contraer / expandir */}
      <div className={`p-4 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed ? (
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/30 shrink-0">
              360
            </div>
            <div className="truncate">
              <h1 className="font-bold text-white tracking-tight text-sm">CONECTA 360</h1>
              <p className="text-[10px] text-slate-400 font-medium">Panel Administrativo</p>
            </div>
          </div>
        ) : (
          <div
            className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-500/30 shrink-0"
            title="CONECTA 360 Admin"
          >
            360
          </div>
        )}

        {/* Botón para contraer / expandir menú */}
        <button
          onClick={toggleCollapse}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            isCollapsed ? 'mt-2' : ''
          }`}
          title={isCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
          aria-label={isCollapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation - Fija con Scroll Interno Independiente */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {!isCollapsed && (
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
            Módulos del Sistema
          </div>
        )}
        {ADMIN_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center ${
                isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-3.5 py-2.5'
              } rounded-xl text-sm font-semibold transition-all group relative ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              {!isCollapsed && <span className="truncate text-xs">{item.name}</span>}

              {/* Tooltip flotante al estar colapsado */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-800 space-y-1.5">
        <Link
          href="/dashboard"
          title="Ir a Portal Usuario"
          className={`w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors flex items-center ${
            isCollapsed ? 'justify-center px-2' : 'justify-center space-x-2 px-3'
          } border border-slate-700/60`}
        >
          <User className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Portal Usuario</span>}
        </Link>
        <Link
          href="/"
          title="Volver al Sitio Web"
          className={`w-full py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 font-semibold text-xs transition-colors flex items-center ${
            isCollapsed ? 'justify-center px-2' : 'justify-center space-x-2 px-3'
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Sitio Web</span>}
        </Link>

        {/* Botón Cerrar Sesión */}
        <button
          onClick={handleLogout}
          type="button"
          title="Cerrar Sesión de Administrador"
          className={`w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-600 text-rose-400 hover:text-white font-bold text-xs transition-all flex items-center cursor-pointer shadow-xs ${
            isCollapsed ? 'justify-center px-2' : 'justify-center space-x-2 px-3'
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
