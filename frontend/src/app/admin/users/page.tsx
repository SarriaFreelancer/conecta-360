'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  UserCheck,
  ArrowLeft,
  Eye,
  Layers,
  Wrench,
  ShieldAlert,
  LayoutDashboard
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

interface UserItem {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  role?: {
    name: string;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('http://localhost:3001/users')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar - Always displays all 8 modules */}
      <AdminSidebar currentPath="/admin/users" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-bold text-slate-900">Gestión de Usuarios</h2>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold" suppressHydrationWarning>
              {mounted ? `${filtered.length} usuario(s) encontrado(s)` : 'Cargando usuarios...'}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Usuario</th>
                    <th className="py-4 px-6">Email / Teléfono</th>
                    <th className="py-4 px-6">Rol</th>
                    <th className="py-4 px-6">Estado</th>
                    <th className="py-4 px-6">Registro</th>
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {u.firstName.substring(0, 1)}
                            {u.lastName.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">{u.uuid.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-slate-800">{u.email}</p>
                        <p className="text-xs text-slate-500">{u.phone || 'Sin teléfono'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.role?.name === 'SUPERADMIN'
                              ? 'bg-purple-100 text-purple-700'
                              : u.role?.name === 'ADMIN'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role?.name || 'USER'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{u.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs" suppressHydrationWarning>
                        {mounted && u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CO') : u.createdAt ? u.createdAt.substring(0, 10) : ''}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/profile/${u.id}`}
                          className="p-2 inline-flex text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
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
