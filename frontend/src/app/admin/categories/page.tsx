'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Users,
  Wrench,
  ShieldAlert,
  LayoutDashboard,
  Plus,
  ArrowLeft,
  CheckCircle2,
  FileText,
  AlertCircle,
  Tag
} from 'lucide-react';

interface Requirement {
  id: number;
  title: string;
  type: string;
  isRequired: boolean;
}

interface ServiceItem {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  services: ServiceItem[];
  requirements: Requirement[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = () => {
    setLoading(true);
    fetch('http://localhost:3001/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    try {
      const res = await fetch('http://localhost:3001/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description, icon: 'grid', isActive: true }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName('');
        setSlug('');
        setDescription('');
        fetchCategories();
      }
    } catch (error) {
      console.error(error);
    }
  };

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
          <Link href="/admin/categories" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <Layers className="w-5 h-5" />
            <span>Categorías</span>
          </Link>
          <Link href="/admin/services" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white">
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
            <h2 className="text-xl font-bold text-slate-900">Gestión de Categorías y Requisitos</h2>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Categoría</span>
          </button>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                      <span className="text-xs text-slate-400 font-mono">slug: {cat.slug}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    Activa
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{cat.description}</p>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold flex items-center space-x-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{cat.services?.length || 0} servicios asociados</span>
                    </span>
                    <span className="text-blue-600 font-bold">
                      {cat.requirements?.length || 0} requisitos
                    </span>
                  </div>

                  {cat.requirements && cat.requirements.length > 0 ? (
                    <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                      <p className="font-bold flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>Requisito obligatorio:</span>
                      </p>
                      <p className="text-slate-700">{cat.requirements[0].title}</p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-[11px] text-slate-500 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sin verificación documental obligatoria</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal Nueva Categoria */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Crear Nueva Categoría</h3>
            <div>
              <label className="text-xs font-bold text-slate-600">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
                }}
                placeholder="Ej. Jardinería"
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
                placeholder="jardineria"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción general de la categoría..."
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
                rows={3}
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
                Guardar Categoría
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
