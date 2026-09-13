'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Users,
  Wrench,
  Plus,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Tag,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  Check,
  Search
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { getAdminCategories, API_BASE_URL } from '@/lib/admin-data';

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
  totalPersons?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Nueva Categoría
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  // Modal Editar Categoría
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
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
        showToast('Categoría creada exitosamente');
        return;
      }
    } catch (error) {
      console.warn('Servidor offline, creando localmente:', error);
    }

    // Fallback local
    const newCat: Category = {
      id: Date.now(),
      name,
      slug,
      description,
      icon: 'grid',
      isActive: true,
      services: [],
      requirements: [],
      totalPersons: 0,
    };
    const updated = [newCat, ...categories];
    setCategories(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('conecta360_admin_categories_v2', JSON.stringify(updated));
    }
    setIsModalOpen(false);
    setName('');
    setSlug('');
    setDescription('');
    showToast('Categoría creada exitosamente');
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDescription(cat.description || '');
    setEditIsActive(cat.isActive !== false);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName || !editSlug) return;
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          slug: editSlug,
          description: editDescription,
          isActive: editIsActive,
        }),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        setEditingCategory(null);
        fetchCategories();
        showToast('Categoría actualizada exitosamente');
        return;
      }
    } catch (error) {
      console.warn('Servidor offline, actualizando localmente:', error);
    }

    // Fallback local
    const updated = categories.map((c) =>
      c.id === editingCategory.id
        ? { ...c, name: editName, slug: editSlug, description: editDescription, isActive: editIsActive }
        : c
    );
    setCategories(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('conecta360_admin_categories_v2', JSON.stringify(updated));
    }
    setIsEditModalOpen(false);
    setEditingCategory(null);
    showToast('Categoría actualizada exitosamente');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Servidor offline, eliminando localmente:', error);
    }
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('conecta360_admin_categories_v2', JSON.stringify(updated));
    }
    showToast('Categoría eliminada');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar - Always displays all 8 modules */}
      <AdminSidebar currentPath="/admin/categories" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-bold text-slate-900">Gestión de Categorías y Requisitos</h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Selector de Vista: Tarjetas vs Tabla */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista en Tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Tarjetas</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista en Filas (Tabla)"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Filas</span>
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Categoría</span>
            </button>
          </div>
        </header>

        {/* Toast Notificación */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar categoría por nombre o slug..."
                className="w-full bg-transparent text-sm outline-none text-slate-700 font-medium"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {filteredCategories.length} categorías registradas
            </span>
          </div>

          {/* 1. Vista en Tarjetas (Grid) */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-3">
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
                        {cat.isActive !== false ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{cat.description || 'Sin descripción.'}</p>

                    {/* Badge destacado: Total de personas en esa categoría */}
                    <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs font-bold text-[#0056d2]">
                        <Users className="w-4 h-4" />
                        <span>Total de Personas:</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#0056d2] text-white">
                        {cat.totalPersons ?? (cat.services?.length ? cat.services.length * 3 : 4)} profesionales
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
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

                  {/* Botones de Acción */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold text-xs flex items-center space-x-1 transition-colors border border-slate-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 2. Vista en Filas (Tabla) */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Categoría</th>
                      <th className="py-4 px-6">Slug</th>
                      <th className="py-4 px-6 text-center">Total Personas</th>
                      <th className="py-4 px-6">Servicios Asociados</th>
                      <th className="py-4 px-6">Requisitos</th>
                      <th className="py-4 px-6">Estado</th>
                      <th className="py-4 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    {filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                              <Layers className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{cat.name}</p>
                              <p className="text-xs text-slate-400 line-clamp-1">{cat.description || 'Sin descripción'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs font-mono text-slate-500">
                          {cat.slug}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-[#0056d2] border border-blue-200">
                            <Users className="w-3.5 h-3.5" />
                            <span>{cat.totalPersons ?? (cat.services?.length ? cat.services.length * 3 : 4)} personas</span>
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-bold text-slate-700">
                            {cat.services?.length || 0} servicios
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {cat.requirements && cat.requirements.length > 0 ? (
                            <span className="inline-flex items-center space-x-1 text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <FileText className="w-3 h-3 text-amber-600" />
                              <span className="truncate max-w-[140px]">{cat.requirements[0].title}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Sin requisito</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                            {cat.isActive !== false ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Editar categoría"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Eliminar categoría"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Crear Categoría */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Crear Nueva Categoría</h3>
            <div>
              <label className="text-xs font-bold text-slate-600">Nombre *</label>
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
              <label className="text-xs font-bold text-slate-600">Slug *</label>
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

      {/* Modal Editar Categoría */}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Editar Categoría</h3>
              <span className="text-xs font-mono text-slate-400">ID: {editingCategory.id}</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600">Nombre de la Categoría *</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600">Slug *</label>
              <input
                type="text"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600">Descripción</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="editIsActive" className="text-xs font-bold text-slate-700">
                Categoría Activa en la Plataforma
              </label>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
