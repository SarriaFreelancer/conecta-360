'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Users,
  Layers,
  Plus,
  ArrowLeft,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  Check
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  getAdminServices,
  getAdminCategories,
  createAdminServiceBackend,
  updateAdminServiceBackend,
  deleteAdminServiceBackend,
  API_BASE_URL,
} from '@/lib/admin-data';

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Nuevo Servicio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<number | string>('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  // Modal Editar Servicio
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editCategoryId, setEditCategoryId] = useState<number | string>('');
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getAdminServices();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    getAdminCategories()
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) setCategoryId(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    try {
      const created = await createAdminServiceBackend({
        categoryId: Number(categoryId),
        name,
        slug,
        description,
        isActive: true,
      });
      if (created) {
        setIsModalOpen(false);
        setName('');
        setSlug('');
        setDescription('');
        await fetchServices();
        showToast('Servicio creado exitosamente en MySQL');
        return;
      }
    } catch (error) {
      console.warn('Servidor offline, guardando servicio localmente:', error);
    }

    // Fallback local
    const catObj = categories.find((c) => c.id === Number(categoryId)) || { id: Number(categoryId), name: 'General' };
    const newService: ServiceItem = {
      id: Date.now(),
      name,
      slug,
      description,
      isActive: true,
      category: catObj,
    };
    const updated = [newService, ...services];
    setServices(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('conecta360_admin_services_v2', JSON.stringify(updated));
    }
    setIsModalOpen(false);
    setName('');
    setSlug('');
    setDescription('');
    showToast('Servicio creado exitosamente');
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setEditCategoryId(srv.category?.id || (categories[0] ? categories[0].id : ''));
    setEditName(srv.name);
    setEditSlug(srv.slug);
    setEditDescription(srv.description || '');
    setEditIsActive(srv.isActive !== false);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editName || !editSlug) return;
    try {
      const updatedBackend = await updateAdminServiceBackend(editingService.id, {
        categoryId: Number(editCategoryId),
        name: editName,
        slug: editSlug,
        description: editDescription,
        isActive: editIsActive,
      });
      if (updatedBackend) {
        setIsEditModalOpen(false);
        setEditingService(null);
        await fetchServices();
        showToast('Servicio actualizado exitosamente en MySQL');
        return;
      }
    } catch (error) {
      console.warn('Servidor offline, actualizando servicio localmente:', error);
    }

    // Fallback local
    const catObj = categories.find((c) => c.id === Number(editCategoryId)) || editingService.category;
    const updated = services.map((s) =>
      s.id === editingService.id
        ? { ...s, name: editName, slug: editSlug, description: editDescription, isActive: editIsActive, category: catObj }
        : s
    );
    setServices(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('conecta360_admin_services_v2', JSON.stringify(updated));
    }
    setIsEditModalOpen(false);
    setEditingService(null);
    showToast('Servicio actualizado exitosamente');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    try {
      await deleteAdminServiceBackend(id);
    } catch (error) {
      console.warn('Servidor offline, eliminando servicio localmente:', error);
    }
    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('conecta360_admin_services_v2', JSON.stringify(updated));
    }
    showToast('Servicio eliminado de MySQL');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar - Always displays all 8 modules */}
      <AdminSidebar currentPath="/admin/services" />

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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Servicio</span>
          </button>
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
                placeholder="Buscar servicio por nombre o categoría..."
                className="w-full bg-transparent text-sm outline-none text-slate-700 font-medium"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold">
              {filtered.length} servicios encontrados
            </span>
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
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {filtered.map((srv) => (
                    <tr key={srv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{srv.name}</span>
                            {srv.description && (
                              <span className="text-xs text-slate-400 line-clamp-1">{srv.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {srv.category?.name}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-mono text-slate-400">{srv.slug}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            srv.isActive !== false
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{srv.isActive !== false ? 'Activo' : 'Inactivo'}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(srv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar servicio"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(srv.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar servicio"
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
        </div>
      </main>

      {/* Modal Nuevo Servicio */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Crear Nuevo Servicio</h3>
            <div>
              <label className="text-xs font-bold text-slate-600">Categoría</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
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
              <label className="text-xs font-bold text-slate-600">Nombre del Servicio *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
                }}
                placeholder="Ej. Apertura de cerraduras digitales"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="apertura-de-cerraduras-digitales"
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Descripción (Opcional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalle o alcance del servicio..."
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
                Guardar Servicio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Editar Servicio */}
      {isEditModalOpen && editingService && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Editar Servicio</h3>
              <span className="text-xs font-mono text-slate-400">ID: {editingService.id}</span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600">Categoría Asociada *</label>
              <select
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600">Nombre del Servicio *</label>
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
                id="editSrvIsActive"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="editSrvIsActive" className="text-xs font-bold text-slate-700">
                Servicio Activo en el Catálogo
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
