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
  ShieldCheck
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

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
      {/* Sidebar - Always displays all 8 modules */}
      <AdminSidebar currentPath="/admin/roles" />

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
