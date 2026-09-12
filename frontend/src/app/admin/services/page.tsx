'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Users,
  Layers,
  ShieldAlert,
  LayoutDashboard,
  Plus,
  ArrowLeft,
  Search,
  Tag,
  CheckCircle2
} from 'lucide-react';

interface ServiceItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  category: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<number>(1);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const fetchServices = () => {
    setLoading(true);
    fetch('http://localhost:3001/services')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
    fetch('http://localhost:3001/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) setCategoryId(data[0].id);
        }
      });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    try {
      const res = await fetch('http://localhost:3001/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: Number(categoryId), name, slug, description, isActive: true }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setSlug('');
        setDescription('');
        fetchServices();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Link href="/admin/services" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <Wrench className="w-5 h-5" />
            <span>Servicios</span>
          </Link>
          <Link href="/admin/roles" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white">
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
            <h2 className="text-xl font-bold text-slate-900">Catálogo de Servicios</h2>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Servicio</span>
          </button>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center">
            <Search className="w-4 h-4 text-slate-400 mr-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar servicio o categoría..."
              className="w-full bg-transparent text-sm outline-none text-slate-700 font-medium"
            />
          </div>

          {/* Services Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Servicio</th>
                    <th className="py-4 px-6">Categoría</th>
                    <th className="py-4 px-6">Slug</th>
                    <th className="py-4 px-6">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {filtered.map((srv) => (
                    <tr key={srv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900">{srv.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {srv.category?.name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-mono text-slate-400">{srv.slug}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Activo</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Nuevo Servicio */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Crear Nuevo Servicio</h3>
            <div>
              <label className="text-xs font-bold text-slate-600">Categoría Perteneciente</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Nombre del Servicio</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
                }}
                placeholder="Ej. Cambio de bombillos LED"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="cambio-de-bombillos-led"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono text-xs"
                required
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md"
              >
                Guardar Servicio
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
