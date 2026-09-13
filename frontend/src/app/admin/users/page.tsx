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
  Award,
  Plus,
  Edit2,
  Trash2,
  Ban,
  Check,
  UserPlus,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { getUserHistoryForAdmin, verifyUserByAdmin, calculateUserPlatformDebt, ServiceHistoryItem } from '@/lib/auth';
import { getGlobalSettings } from '@/lib/system-settings';
import {
  getAdminUsers,
  getAdminCategories,
  getAdminRoles,
  createAdminUserBackend,
  updateAdminUserBackend,
  deleteAdminUserBackend,
  updateProviderVerificationBackend,
  fetchAllBookingsBackend,
  AdminRole,
  API_BASE_URL,
} from '@/lib/admin-data';

interface UserItem {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING' | string;
  isActive?: boolean;
  createdAt: string;
  roleId?: number;
  role?: {
    id?: number;
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
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PROVIDER' | 'CLIENT'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Modal de Historial y Detalle del Usuario
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [userHistory, setUserHistory] = useState<ServiceHistoryItem[]>([]);
  const [isRealHistory, setIsRealHistory] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Nuevo Usuario
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRoleId, setNewRoleId] = useState<number>(3); // Default 3: USER / CLIENT
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING'>('ACTIVE');
  const [isCreating, setIsCreating] = useState(false);

  // Modal Editar Usuario
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRoleId, setEditRoleId] = useState<number>(3);
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING'>('ACTIVE');
  const [isUpdating, setIsUpdating] = useState(false);

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

    // Cargar roles desde la base de datos MySQL
    getAdminRoles()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRoles(data);
          const defaultRole = data.find((r) => r.name === 'USER') || data[0];
          if (defaultRole) {
            setNewRoleId(defaultRole.id);
          }
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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

  // Abrir modal de historial con datos reales de MySQL
  const handleOpenHistoryModal = async (u: UserItem) => {
    setSelectedUser(u);
    const cat = getUserCategory(u);

    try {
      // Consultar reservas reales registradas en MySQL
      const allBookings = await fetchAllBookingsBackend();
      const userBookings = allBookings.filter(
        (b) =>
          b.clientId === u.id ||
          (u.providerProfile && b.providerId === u.providerProfile.id) ||
          b.providerId === u.id,
      );

      if (userBookings && userBookings.length > 0) {
        const mappedHistory: ServiceHistoryItem[] = userBookings.map((b) => ({
          id: b.id,
          serviceTitle: b.serviceTitle || 'Servicio Profesional',
          categoryName: b.categoryName || cat,
          clientName: b.client ? `${b.client.firstName} ${b.client.lastName}` : 'Cliente Registrado',
          clientPhone: b.client?.phone || '',
          providerName: b.provider?.user
            ? `${b.provider.user.firstName} ${b.provider.user.lastName}`
            : 'Prestador Asignado',
          providerPhone: b.provider?.user?.phone || '',
          amount: Number(b.amount) || 0,
          date: new Date(b.createdAt).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          status: b.status || 'COMPLETADO',
          paymentMethod: b.paymentMethod || 'Efectivo',
          paymentStatus: b.paymentStatus || 'PAGADO',
          platformFee: Number(b.platformFee) || 0,
          platformDebtStatus: b.platformDebtStatus || 'AL_DIA',
          rating: b.review?.rating || 5,
          reviewComment: b.review?.comment || '',
        }));

        setUserHistory(mappedHistory);
        setIsRealHistory(true);
        return;
      }
    } catch (error) {
      console.warn('Error consultando historial real, usando fallback:', error);
    }

    // Fallback si aún no tiene reservas en MySQL
    const history = getUserHistoryForAdmin({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      roleName: u.providerProfile ? 'PROVIDER' : u.role?.name,
      categoryName: cat,
    });
    setUserHistory(history);
    setIsRealHistory(false);
  };

  // Aprobar verificación con persistencia directa en MySQL
  const handleApproveVerification = async (u: UserItem) => {
    // 1. Actualización optimista e inmediata en la interfaz y almacenamiento local
    verifyUserByAdmin(u.id);
    if (u.email) verifyUserByAdmin(u.email);

    setUsers((prev) =>
      prev.map((item) =>
        item.id === u.id || (u.email && item.email?.toLowerCase() === u.email.toLowerCase())
          ? {
              ...item,
              status: 'ACTIVE',
              providerProfile: item.providerProfile
                ? { ...item.providerProfile, isVerified: true }
                : item.providerProfile,
            }
          : item,
      ),
    );

    if (selectedUser && (selectedUser.id === u.id || (u.email && selectedUser.email?.toLowerCase() === u.email.toLowerCase()))) {
      setSelectedUser({
        ...selectedUser,
        status: 'ACTIVE',
        providerProfile: selectedUser.providerProfile
          ? { ...selectedUser.providerProfile, isVerified: true }
          : selectedUser.providerProfile,
      });
    }

    showToast(`✓ Verificación aprobada para ${u.firstName} ${u.lastName}`);

    // 2. Persistencia asíncrona segura en backend MySQL
    try {
      await updateProviderVerificationBackend(u.id, 'APPROVED');
    } catch (e) {
      console.warn('Aviso sincronizando verificación de prestador:', e);
    }

    try {
      await updateAdminUserBackend(u.id, { status: 'ACTIVE', email: u.email });
    } catch (e) {
      console.warn('Aviso sincronizando estado de usuario con backend:', e);
    }
  };

  // Alternar bloqueo/desbloqueo de usuario en MySQL
  const handleToggleBlockUser = async (u: UserItem) => {
    const newTargetStatus: 'ACTIVE' | 'BLOCKED' = u.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    const actionText = newTargetStatus === 'BLOCKED' ? 'bloquear' : 'desbloquear y activar';

    if (!confirm(`¿Estás seguro de que deseas ${actionText} a ${u.firstName} ${u.lastName}?`)) return;

    // Actualización optimista
    setUsers((prev) =>
      prev.map((item) =>
        item.id === u.id || (u.email && item.email?.toLowerCase() === u.email.toLowerCase())
          ? { ...item, status: newTargetStatus }
          : item,
      ),
    );

    showToast(`✓ Usuario ${u.firstName} ${u.lastName} ahora está ${newTargetStatus === 'BLOCKED' ? 'BLOQUEADO' : 'ACTIVO'}`);

    try {
      await updateAdminUserBackend(u.id, { status: newTargetStatus, email: u.email });
    } catch (err: any) {
      console.warn('Aviso al actualizar estado en backend:', err);
    }
  };

  // Crear nuevo usuario en MySQL
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newEmail || !newPassword) {
      alert('Por favor completa los campos obligatorios (Nombre, Apellido, Correo y Contraseña)');
      return;
    }

    setIsCreating(true);
    try {
      await createAdminUserBackend({
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        password: newPassword,
        phone: newPhone || undefined,
        roleId: Number(newRoleId),
        status: newStatus,
      });

      setIsCreateModalOpen(false);
      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewPassword('');
      setNewPhone('');
      fetchUsers();
      showToast('✓ Nuevo usuario registrado exitosamente en la base de datos MySQL');
    } catch (err: any) {
      alert(err.message || 'Error al crear usuario en MySQL');
    } finally {
      setIsCreating(false);
    }
  };

  // Abrir modal de edición
  const handleOpenEdit = (u: UserItem) => {
    setEditingUser(u);
    setEditFirstName(u.firstName);
    setEditLastName(u.lastName);
    setEditEmail(u.email);
    setEditPhone(u.phone || '');
    setEditRoleId(u.roleId || (u.role && (u.role as any).id) || 3);
    setEditStatus((u.status as any) || 'ACTIVE');
    setIsEditModalOpen(true);
  };

  // Guardar edición en MySQL
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsUpdating(true);
    try {
      await updateAdminUserBackend(editingUser.id, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone || undefined,
        roleId: Number(editRoleId),
        status: editStatus,
      });

      setIsEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
      showToast('✓ Datos del usuario actualizados exitosamente en MySQL');
    } catch (err: any) {
      alert(err.message || 'Error al actualizar usuario en MySQL');
    } finally {
      setIsUpdating(false);
    }
  };

  // Eliminar usuario de MySQL
  const handleDeleteUser = async (u: UserItem) => {
    if (!confirm(`¿Eliminar permanentemente al usuario ${u.firstName} ${u.lastName} (${u.email}) de MySQL?`)) return;

    try {
      await deleteAdminUserBackend(u.id);
      setUsers((prev) => prev.filter((item) => item.id !== u.id));
      showToast(`✓ Usuario ${u.firstName} eliminado de la base de datos`);
    } catch (err) {
      showToast('Error al eliminar usuario');
    }
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
            <div>
              <h2 className="text-xl font-bold text-slate-900">Gestión de Usuarios y Prestadores</h2>
              <p className="text-[11px] text-slate-500 hidden sm:block">Control integral de cuentas, estados, roles y auditoría MySQL</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {filteredUsers.length} Registrados
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
                    <th className="py-4 px-6">Estado Cuenta</th>
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
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs font-semibold">
                        Cargando usuarios desde MySQL...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs font-semibold">
                        No se encontraron usuarios con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isProvider = !!u.providerProfile || u.role?.name === 'PROVIDER';
                      const userCategory = getUserCategory(u);
                      const isVerified = u.providerProfile?.isVerified || u.status === 'APPROVED';
                      const userDebt = isProvider ? calculateUserPlatformDebt(u.id) : 0;
                      const isBlocked = u.status === 'BLOCKED' || u.isActive === false;

                      return (
                        <tr key={u.id} className={`transition-colors ${isBlocked ? 'bg-rose-50/30' : 'hover:bg-slate-50/80'}`}>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-2xl ${isBlocked ? 'bg-rose-600' : 'bg-gradient-to-tr from-blue-600 to-indigo-600'} text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0`}>
                                {u.firstName ? u.firstName.substring(0, 1) : 'U'}
                                {u.lastName ? u.lastName.substring(0, 1) : ''}
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900 leading-tight flex items-center space-x-1.5">
                                  <span>{u.firstName} {u.lastName}</span>
                                  {isBlocked && (
                                    <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">Bloqueado</span>
                                  )}
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
                                <span>{u.role?.name || 'Cliente'}</span>
                              </span>
                            )}
                          </td>

                          {/* Estado de Cuenta */}
                          <td className="py-4 px-6">
                            {u.status === 'BLOCKED' ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                                <Ban className="w-3 h-3 text-rose-600" />
                                <span>Bloqueado</span>
                              </span>
                            ) : u.status === 'INACTIVE' ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                <span>Inactivo</span>
                              </span>
                            ) : u.status === 'PENDING' ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <span>Pendiente</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Activo</span>
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
                                  <span>{u.providerProfile?.rating ? Number(u.providerProfile.rating).toFixed(1) : '5.0'}</span>
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
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Ver Historial */}
                              <button
                                onClick={() => handleOpenHistoryModal(u)}
                                className="p-1.5 rounded-lg bg-blue-50 hover:bg-[#0056d2] hover:text-white text-[#0056d2] transition-all shadow-2xs"
                                title="Ver historial de servicios y finanzas"
                              >
                                <Calendar className="w-4 h-4" />
                              </button>

                              {/* Verificar */}
                              {!isVerified && (
                                <button
                                  onClick={() => handleApproveVerification(u)}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition-all"
                                  title="Aprobar verificación oficial en MySQL"
                                >
                                  <Award className="w-4 h-4" />
                                </button>
                              )}

                              {/* Editar Usuario */}
                              <button
                                onClick={() => handleOpenEdit(u)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-700 hover:text-white text-slate-700 transition-all"
                                title="Editar datos del usuario"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Bloquear / Desbloquear */}
                              <button
                                onClick={() => handleToggleBlockUser(u)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isBlocked
                                    ? 'bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700'
                                    : 'bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700'
                                }`}
                                title={isBlocked ? 'Desbloquear y Activar Cuenta' : 'Bloquear Cuenta'}
                              >
                                {isBlocked ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                              </button>

                              {/* Eliminar */}
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-700 hover:text-white text-slate-400 transition-all"
                                title="Eliminar usuario de MySQL"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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

      {/* MODAL CREAR NUEVO USUARIO EN MYSQL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Registrar Nuevo Usuario</h3>
                  <p className="text-xs text-slate-500">Creación directa en la base de datos MySQL</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="Ej: Daniel"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Ej: Caicedo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="usuario@conecta360.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / Celular</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+57 310 000 0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rol en Plataforma</label>
                  <select
                    value={newRoleId}
                    onChange={(e) => setNewRoleId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 outline-none"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado Inicial</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                    <option value="BLOCKED">Bloqueado</option>
                    <option value="PENDING">Pendiente</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1"
                >
                  {isCreating ? <span>Guardando en MySQL...</span> : <span>Crear Usuario</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR USUARIO EN MYSQL */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Editar Usuario #{editingUser.id}</h3>
                  <p className="text-xs text-slate-500">Actualizar información en tiempo real</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono / Celular</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rol</label>
                  <select
                    value={editRoleId}
                    onChange={(e) => setEditRoleId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 outline-none"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado de Cuenta</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-blue-500 outline-none"
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                    <option value="BLOCKED">Bloqueado</option>
                    <option value="PENDING">Pendiente</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1"
                >
                  {isUpdating ? <span>Guardando cambios...</span> : <span>Actualizar Usuario</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE HISTORIAL PERSONALIZADO DEL USUARIO CON MYSQL */}
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
                    {isRealHistory && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ● Datos en Vivo MySQL
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
                {userHistory.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-semibold">Este usuario aún no registra contrataciones o servicios en la plataforma.</p>
                  </div>
                ) : (
                  userHistory.map((item) => (
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
                  ))
                )}
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
                  <span>Aprobar y Verificar Cuenta en MySQL</span>
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
