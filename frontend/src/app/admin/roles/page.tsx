'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  Layers,
  Wrench,
  LayoutDashboard,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface RoleItem {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/roles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRoles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/users" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white">
            <Users className="w-5 h-5" />
            <span>Usuarios</span>
          </Link>
          <Link href="/admin/categories" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white">
            <Layers className="w-5 h-5" />
            <span>Categorías</span>
          </Link>
          <Link href="/admin/services" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white">
            <Wrench className="w-5 h-5" />
            <span>Servicios</span>
          </Link>
          <Link href="/admin/roles" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <ShieldAlert className="w-5 h-5" />
            <span>Roles</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="w-full py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold text-xs transition-colors flex items-center justify-center">
            Volver a la Web
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-bold text-slate-900">Roles y Permisos del Sistema</h2>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">ID #{role.id}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{role.name}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{role.description}</p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Estado: Activo</span>
                  <span className="text-emerald-600 font-bold">✓ Sistema</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
