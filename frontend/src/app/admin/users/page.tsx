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
  Clock,
  Star,
  DollarSign,
  Calendar,
  CheckCircle2,
  X,
  Phone,
  Mail,
  MapPin,
  Tag,
  Award
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { getUserHistoryForAdmin, verifyUserByAdmin, calculateUserPlatformDebt, ServiceHistoryItem } from '@/lib/auth';
import { getGlobalSettings } from '@/lib/system-settings';
import { getAdminUsers, getAdminCategories, API_BASE_URL } from '@/lib/admin-data';

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
  profile?: {
    city?: string | null;
    department?: string | null;
    country?: string | null;
    profession?: string | null;
    bio?: string | null;
  };
  providerProfile?: {
    id: number;
    title?: string | null;
    hourlyRate?: number | string | null;
    isVerified?: boolean;
    rating?: number;
    totalReviews?: number;
    providerServices?: Array<{
      id: number;
      service?: {
        name: string;
        category?: {
          name: string;
        };
      };
    }>;
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PROVIDER' | 'CLIENT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Modal de Historial y Detalle del Usuario
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [userHistory, setUserHistory] = useState<ServiceHistoryItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers(roleFilter, categoryFilter, searchTerm);
      setUsers(data as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    // Cargar categorías disponibles para los filtros
    getAdminCategories()
      .then((data) => {
        if (Array.isArray(data)) {
          const names = data.map((c: any) => c.name);
          setCategories(names);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  // Determinar la categoría principal de un usuario
  const getUserCategory = (u: UserItem): string => {
    if (u.providerProfile?.providerServices && u.providerProfile.providerServices.length > 0) {
      const cat = u.providerProfile.providerServices[0].service?.category?.name;
      if (cat) return cat;
    }
    if (u.providerProfile?.title) return u.providerProfile.title;
    if (u.profile?.profession) return u.profile.profession;
    return 'Servicios Generales';
  };

  // Abrir modal de historial personalizado
  const handleOpenHistoryModal = (u: UserItem) => {
    setSelectedUser(u);
    const cat = getUserCategory(u);
    const history = getUserHistoryForAdmin({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      roleName: u.providerProfile ? 'PROVIDER' : u.role?.name,
      categoryName: cat,
    });
    setUserHistory(history);
  };

  // Aprobar verificación desde el panel de usuarios
  const handleApproveVerification = (u: UserItem) => {
    verifyUserByAdmin(u.id);
    setUsers((prev) =>
      prev.map((item) =>
        item.id === u.id
          ? {
              ...item,
              status: 'APPROVED',
              providerProfile: item.providerProfile
                ? { ...item.providerProfile, isVerified: true }
                : item.providerProfile,
            }
          : item
      )
    );
    if (selectedUser && selectedUser.id === u.id) {
      setSelectedUser({
        ...selectedUser,
        status: 'APPROVED',
        providerProfile: selectedUser.providerProfile
          ? { ...selectedUser.providerProfile, isVerified: true }
          : selectedUser.providerProfile,
      });
    }
    setToastMessage(`✓ Verificación aprobada para ${u.firstName} ${u.lastName}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtro local adicional de búsqueda en cliente para respuesta instantánea
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      fullName.includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));

    return matchesSearch;
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
            <h2 className="text-xl font-bold text-slate-900">Gestión de Usuarios y Prestadores</h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {filteredUsers.length} Usuarios Registrados
            </span>
          </div>
        </header>

        {/* Toast Notificación */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Filters Bar: Role Tabs + Category Dropdown + Search Input */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Filtro por Tipo de Usuario: Todos vs Prestadores vs Clientes */}
              <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center space-x-1 border border-slate-200 shrink-0">
                <button
                  onClick={() => setRoleFilter('ALL')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    roleFilter === 'ALL'
                      ? 'bg-white text-blue-600 shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos los Usuarios
                </button>
                <button
                  onClick={() => setRoleFilter('PROVIDER')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    roleFilter === 'PROVIDER'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Prestadores (Ofrecen Servicio)</span>
                </button>
                <button
                  onClick={() => setRoleFilter('CLIENT')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                    roleFilter === 'CLIENT'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Clientes (Contratantes)</span>
                </button>
              </div>

              {/* Filtro por Categorías */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filtrar Categoría:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none text-slate-800"
                >
                  <option value="ALL">Todas las Categorías</option>
                  {categories.map((c, idx) => (
                    <option key={idx} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Barra de Búsqueda */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, apellido, correo electrónico o teléfono..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Usuario & Ubicación</th>
                    <th className="py-4 px-6">Tipo / Rol</th>
                    <th className="py-4 px-6">Categoría & Servicios</th>
                    <th className="py-4 px-6">Calificación / Estrellas</th>
                    <th className="py-4 px-6">Deuda Plataforma</th>
                    <th className="py-4 px-6">Estado Verificación</th>
                    <th className="py-4 px-6 text-right">Historial & Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-semibold">
                        Cargando usuarios...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-semibold">
                        No se encontraron usuarios con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isProvider = !!u.providerProfile || u.role?.name === 'PROVIDER';
                      const userCategory = getUserCategory(u);
                      const isVerified = u.providerProfile?.isVerified || u.status === 'APPROVED';
                      const userDebt = isProvider ? calculateUserPlatformDebt(u.id) : 0;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                                {u.firstName.substring(0, 1)}
                                {u.lastName.substring(0, 1)}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900 leading-tight">
                                  {u.firstName} {u.lastName}
                                </p>
                                <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{u.profile?.city || 'Cali'}, {u.profile?.department || 'Valle'}</span>
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  {u.email} &bull; {u.phone || 'Sin teléfono'}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Rol */}
                          <td className="py-4 px-6">
                            {isProvider ? (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-[#0056d2] border border-blue-200">
                                <Wrench className="w-3 h-3" />
                                <span>Prestador</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Users className="w-3 h-3" />
                                <span>Cliente</span>
                              </span>
                            )}
                          </td>

                          {/* Categoría & Servicios */}
                          <td className="py-4 px-6">
                            {isProvider ? (
                              <div className="space-y-1">
                                <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                                  {userCategory}
                                </span>
                                {u.providerProfile?.hourlyRate && (
                                  <p className="text-xs font-semibold text-slate-500">
                                    ${Number(u.providerProfile.hourlyRate).toLocaleString('es-CO')} COP/h
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">Solicitante de Servicios</span>
                            )}
                          </td>

                          {/* Calificación & Estrellas */}
                          <td className="py-4 px-6">
                            {isProvider ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-1 text-amber-500 font-extrabold text-xs">
                                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                                  <span>{u.providerProfile?.rating ? u.providerProfile.rating.toFixed(1) : '5.0'}</span>
                                  <span className="text-slate-400 font-normal">
                                    ({u.providerProfile?.totalReviews || 12} reseñas)
                                  </span>
                                </div>
                                <div className="flex text-amber-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-amber-400" />
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-slate-600">★★★★★ (Cliente verificado)</span>
                            )}
                          </td>

                          {/* Deuda con la plataforma */}
                          <td className="py-4 px-6">
                            {isProvider ? (
                              userDebt > 0 ? (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                                    <span>Deuda: ${userDebt.toLocaleString('es-CO')} COP</span>
                                  </span>
                                  <p className="text-[10px] text-slate-400">Cobro directo Efectivo/Transf.</p>
                                </div>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Al Día ($0 COP)</span>
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-slate-400">Sin deudas</span>
                            )}
                          </td>

                          {/* Estado de Verificación */}
                          <td className="py-4 px-6">
                            {isVerified ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-[#0056d2] border border-blue-200">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Verificado</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Sin verificar</span>
                              </span>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => handleOpenHistoryModal(u)}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-[#0056d2] hover:text-white text-[#0056d2] font-bold text-xs transition-all inline-flex items-center space-x-1.5 shadow-2xs"
                              title="Ver historial personalizado de servicios"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Ver Historial</span>
                            </button>

                            {!isVerified && (
                              <button
                                onClick={() => handleApproveVerification(u)}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold text-xs transition-all inline-flex items-center space-x-1"
                                title="Aprobar verificación del usuario"
                              >
                                <Award className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Verificar</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE HISTORIAL PERSONALIZADO DEL USUARIO */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Header del Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0056d2] text-white font-black flex items-center justify-center text-base shadow-md">
                  {selectedUser.firstName[0]}
                  {selectedUser.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-black text-slate-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    {selectedUser.providerProfile?.isVerified || selectedUser.status === 'APPROVED' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-[#0056d2] border border-blue-200">
                        Verificado
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-300">
                        Sin verificar
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedUser.email} &bull; {selectedUser.phone || 'Sin teléfono'} &bull;{' '}
                    <span className="text-[#0056d2] font-semibold">
                      {selectedUser.profile?.city || 'Cali'}, {selectedUser.profile?.department || 'Valle del Cauca'}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cinta de Métricas del Usuario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Servicios Registrados
                </span>
                <div className="text-2xl font-black text-slate-900">
                  {userHistory.length}
                </div>
                <p className="text-[11px] text-slate-500">
                  {selectedUser.providerProfile ? 'Servicios brindados' : 'Servicios contratados'}
                </p>
              </div>

              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Calificación y Estrellas
                </span>
                <div className="text-2xl font-black text-slate-900 flex items-center space-x-1.5">
                  <span>5.0</span>
                  <div className="flex text-amber-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-amber-700">Satisfacción verificada</p>
              </div>

              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200/70 space-y-1">
                <span className="text-[10px] font-bold text-[#0056d2] uppercase tracking-wider">
                  Monto Total en COP
                </span>
                <div className="text-2xl font-black text-[#0056d2]">
                  $
                  {userHistory
                    .reduce((acc, curr) => acc + (curr.amount || 0), 0)
                    .toLocaleString('es-CO')}
                </div>
                <p className="text-[11px] text-slate-500">Total liquidado y en curso</p>
              </div>

              {/* 4ta Métrica: Deuda con Conecta 360 */}
              <div className={`p-4 rounded-2xl border space-y-1 ${
                calculateUserPlatformDebt(selectedUser.id) > 0
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Deuda Plataforma Conecta 360
                </span>
                <div className={`text-2xl font-black ${
                  calculateUserPlatformDebt(selectedUser.id) > 0 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  ${calculateUserPlatformDebt(selectedUser.id).toLocaleString('es-CO')} COP
                </div>
                <p className="text-[11px] text-slate-500">
                  {calculateUserPlatformDebt(selectedUser.id) > 0
                    ? '⚠️ Por cobros en Efectivo / Transf.'
                    : '✓ Cuenta al día sin saldo'}
                </p>
              </div>
            </div>

            {/* Listado del Historial Personalizado */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Detalle de Servicios {selectedUser.providerProfile ? 'Brindados' : 'Contratados'}
                </h4>
                <span className="text-xs font-bold text-slate-500">
                  {userHistory.filter((h) => h.status === 'COMPLETADO').length} Completados &bull;{' '}
                  {userHistory.filter((h) => h.status === 'EN_PROGRESO').length} En progreso
                </span>
              </div>

              <div className="space-y-3">
                {userHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 hover:border-blue-300 transition-all shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.categoryName}
                          </span>
                          <span className="text-xs text-slate-400">{item.date}</span>
                        </div>
                        <h5 className="font-extrabold text-slate-900 text-sm mt-1">
                          {item.serviceTitle}
                        </h5>
                        <p className="text-xs text-slate-600">
                          {selectedUser.providerProfile ? (
                            <>
                              <strong>Cliente:</strong> {item.clientName} {item.clientPhone ? `(${item.clientPhone})` : ''}
                            </>
                          ) : (
                            <>
                              <strong>Prestador Asignado:</strong> {item.providerName}
                            </>
                          )}
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <div className="text-sm font-black text-[#0056d2]">
                          ${item.amount.toLocaleString('es-CO')} COP
                        </div>
                        <div className="flex items-center sm:justify-end space-x-1.5 text-xs mt-0.5">
                          {/* Badge de Estado del Servicio */}
                          {item.status === 'COMPLETADO' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Completado
                            </span>
                          )}
                          {item.status === 'EN_PROGRESO' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-[#0056d2] border border-blue-200">
                              En progreso
                            </span>
                          )}
                          {item.status === 'PENDIENTE' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                              Pendiente
                            </span>
                          )}

                          <span className="text-[10px] font-bold text-slate-400">
                            &bull; {item.paymentStatus} ({item.paymentMethod})
                          </span>
                        </div>

                        {/* Desglose Comisión Conecta 360 y Deuda */}
                        {item.platformFee && (
                          <div className="flex items-center sm:justify-end space-x-1.5 text-[11px] pt-1 text-slate-500 font-medium">
                            <span>Comisión 5%: <strong>${item.platformFee.toLocaleString('es-CO')} COP</strong></span>
                            {item.platformDebtStatus === 'EN_DEUDA' ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                                En Deuda ({item.paymentMethod})
                              </span>
                            ) : item.platformDebtStatus === 'AL_DIA' ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Al Día
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reseña y estrellas si existen */}
                    {item.rating && (
                      <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-800">Calificación:</span>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < (item.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-bold text-amber-800">({item.rating}.0 / 5)</span>
                        </div>
                        {item.reviewComment && (
                          <p className="text-slate-600 italic">"{item.reviewComment}"</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {!(selectedUser.providerProfile?.isVerified || selectedUser.status === 'APPROVED') ? (
                <button
                  onClick={() => handleApproveVerification(selectedUser)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>Aprobar y Verificar Cuenta</span>
                </button>
              ) : (
                <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cuenta con Verificación Oficial Aprobada</span>
                </span>
              )}

              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
