'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Wrench,
  ShieldAlert,
  LayoutDashboard,
  Settings,
  Layers,
  Award,
  CreditCard,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  UserPlus,
  Send,
  X,
  BadgeAlert,
  ThumbsDown,
  ThumbsUp,
  Hammer,
  Zap,
  GraduationCap,
  Palette,
  HeartPulse,
  Droplet,
  Monitor,
  Briefcase,
  Eye,
  Star,
  FileText,
  LogOut
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { getAllBookings, reassignBookingByAdmin, ServiceHistoryItem, destroySession, getCurrentUser, UserSession } from '@/lib/auth';
import {
  getAdminCategories,
  getAdminServices,
  getAdminUsers,
  getAdminRoles,
  AdminCategory,
  AdminService,
  AdminUser,
  AdminRole
} from '@/lib/admin-data';
import { getStoredCuadrillas, CuadrillaTeam } from '@/lib/cuadrillas-data';

const AVAILABLE_PROVIDERS = [
  { id: 'prov-1', name: 'Carlos Ruiz', role: 'Electricidad y Redes', city: 'Cali', phone: '+57 312 456 7890' },
  { id: 'prov-2', name: 'Andrés Gómez', role: 'Plomería y Redes Hidráulicas', city: 'Cali', phone: '+57 315 987 6543' },
  { id: 'prov-3', name: 'Diana Martínez', role: 'Pintura y Acabados', city: 'Cali', phone: '+57 301 234 5678' },
  { id: 'prov-4', name: 'Roberto Morales', role: 'Cerrajería de Emergencia', city: 'Cali', phone: '+57 320 876 5432' },
  { id: 'prov-5', name: 'Sofía Castro', role: 'Climatización y Refrigeración', city: 'Cali', phone: '+57 318 555 4321' },
  { id: 'prov-6', name: 'Mateo Silva', role: 'Carpintería y Muebles', city: 'Cali', phone: '+57 310 333 2211' },
];

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  // Main data states
  const [bookings, setBookings] = useState<ServiceHistoryItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [cuadrillas, setCuadrillas] = useState<CuadrillaTeam[]>([]);
  const [loading, setLoading] = useState(true);

  // Active dashboard tab
  const [activeTab, setActiveTab] = useState<'solicitudes' | 'usuarios' | 'categorias' | 'servicios' | 'cuadrillas'>('solicitudes');

  // Bookings filtering & reassigning
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reassignModalItem, setReassignModalItem] = useState<ServiceHistoryItem | null>(null);
  const [selectedNewProviderId, setSelectedNewProviderId] = useState<string>(AVAILABLE_PROVIDERS[0].id);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Users tab search & filter
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userSearch, setUserSearch] = useState<string>('');

  // Services tab search & filter
  const [serviceCatFilter, setServiceCatFilter] = useState<string>('ALL');
  const [serviceSearch, setServiceSearch] = useState<string>('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const bookingsList = getAllBookings();
      setBookings(bookingsList);

      const [usersData, catsData, srvsData] = await Promise.all([
        getAdminUsers(),
        getAdminCategories(),
        getAdminServices()
      ]);

      setUsers(usersData);
      setCategories(catsData);
      setServices(srvsData);
      setCuadrillas(getStoredCuadrillas());
    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    loadAllData();
  }, []);

  // Metrics
  const totalRequests = bookings.length;
  const approvedCount = bookings.filter((b) => b.status === 'CONFIRMADO').length;
  const rejectedCount = bookings.filter((b) => b.status === 'RECHAZADO').length;
  const pendingCount = bookings.filter((b) => b.status === 'SOLICITADO').length;
  const totalPenaltyPoints = bookings.reduce((acc, b) => acc + (b.penaltyPointsApplied || 0), 0);

  const totalProviders = users.filter((u) => u.role?.name === 'PROVIDER' || u.providerProfile).length;
  const totalClients = users.filter((u) => u.role?.name === 'USER' && !u.providerProfile).length;

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filterStatus === 'TODOS' || b.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      b.serviceTitle.toLowerCase().includes(q) ||
      b.clientName.toLowerCase().includes(q) ||
      b.providerName.toLowerCase().includes(q) ||
      (b.locationZone && b.locationZone.toLowerCase().includes(q)) ||
      (b.categoryName && b.categoryName.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  // Filtered users for users tab
  const filteredUsers = users.filter((u) => {
    const matchesRole =
      userRoleFilter === 'ALL' ||
      u.role?.name === userRoleFilter ||
      (userRoleFilter === 'PROVIDER' && u.providerProfile) ||
      (userRoleFilter === 'USER' && !u.providerProfile);

    const q = userSearch.toLowerCase();
    const matchesSearch =
      !q ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      (u.profile?.city && u.profile.city.toLowerCase().includes(q));

    return matchesRole && matchesSearch;
  });

  // Filtered services for services tab
  const filteredServices = services.filter((s) => {
    const matchesCat = serviceCatFilter === 'ALL' || s.category.name.toLowerCase() === serviceCatFilter.toLowerCase();
    const q = serviceSearch.toLowerCase();
    const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleOpenReassignModal = (item: ServiceHistoryItem) => {
    setReassignModalItem(item);
    const firstOther = AVAILABLE_PROVIDERS.find((p) => p.name !== item.providerName) || AVAILABLE_PROVIDERS[0];
    setSelectedNewProviderId(firstOther.id);
  };

  const handleExecuteReassign = () => {
    if (!reassignModalItem) return;
    const providerObj = AVAILABLE_PROVIDERS.find((p) => p.id === selectedNewProviderId);
    const providerName = providerObj ? providerObj.name : 'Servidor Alternativo';

    const success = reassignBookingByAdmin(reassignModalItem.id, selectedNewProviderId, providerName);
    if (success) {
      const list = getAllBookings();
      setBookings(list);
      setActionSuccessMsg(`Solicitud #${reassignModalItem.id} reasignada con éxito a ${providerName}.`);
      setReassignModalItem(null);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'wrench': return <Wrench className="w-5 h-5 text-blue-600" />;
      case 'zap': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'monitor': return <Monitor className="w-5 h-5 text-indigo-600" />;
      case 'hammer': return <Hammer className="w-5 h-5 text-orange-600" />;
      case 'graduation-cap': return <GraduationCap className="w-5 h-5 text-purple-600" />;
      case 'palette': return <Palette className="w-5 h-5 text-pink-600" />;
      case 'heart-pulse': return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case 'droplet': return <Droplet className="w-5 h-5 text-cyan-600" />;
      default: return <Layers className="w-5 h-5 text-blue-600" />;
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window.confirm('¿Deseas cerrar la sesión y salir del Panel Administrativo?')) {
      destroySession();
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar - Displays all 8 modules */}
      <AdminSidebar currentPath="/admin" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Panel General de Administración</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                SA
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{currentUser?.firstName || 'Admin'} {currentUser?.lastName || ''}</p>
                <p className="text-[10px] text-slate-500 font-medium">{currentUser?.email || 'superadmin@conecta360.com.co'}</p>
              </div>
            </div>

            {/* Botón Cerrar Sesión */}
            <button
              onClick={handleLogout}
              type="button"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 font-bold text-xs transition-all active:scale-95 shadow-xs cursor-pointer"
              title="Cerrar Sesión de Administración"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                Centro de Operaciones & Catálogo 360
              </span>
              <h3 className="text-2xl sm:text-3xl font-black mt-3">¡Bienvenido a CONECTA 360 Admin!</h3>
              <p className="mt-2 text-slate-300 text-sm max-w-xl font-medium">
                Supervisión central de <strong>Usuarios</strong>, <strong>Categorías</strong>, <strong>Servicios</strong>, <strong>Cuadrillas</strong> y flujo de solicitudes de clientes en tiempo real.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadAllData}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600/50 font-bold rounded-xl shadow transition-all text-xs flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar Datos</span>
              </button>
              <Link
                href="/admin/categories"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-xs"
              >
                Categorías →
              </Link>
              <Link
                href="/admin/services"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all text-xs"
              >
                Servicios →
              </Link>
            </div>
          </div>

          {/* Action Success Toast */}
          {actionSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
              <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 5 Executive KPI Stats Cards: Categories, Services, Users, Cuadrillas, Requests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Card 1: Usuarios */}
            <div
              onClick={() => setActiveTab('usuarios')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Usuarios</p>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-black text-slate-900">{users.length}</p>
                <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-500 font-medium">
                  <span className="text-blue-600 font-bold">{totalProviders} Prestadores</span>
                  <span>•</span>
                  <span>{totalClients} Clientes</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Ver lista</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Categorías */}
            <div
              onClick={() => setActiveTab('categorias')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categorías</p>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-black text-indigo-600">{categories.length}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Con requisitos documentales</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>Explorar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 3: Servicios */}
            <div
              onClick={() => setActiveTab('servicios')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-500 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Servicios</p>
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
                  <Wrench className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-black text-rose-600">{services.length}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Catálogo de oficios activos</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
                <span>Catálogo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 4: Cuadrillas */}
            <div
              onClick={() => setActiveTab('cuadrillas')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-500 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cuadrillas</p>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-black text-amber-600">{cuadrillas.length}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Equipos en Cali & Valle</p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                <span>Ver equipos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 5: Solicitudes */}
            <div
              onClick={() => setActiveTab('solicitudes')}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-500 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Solicitudes</p>
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-black text-purple-600">{totalRequests}</p>
                <div className="flex items-center space-x-1.5 mt-1 text-[11px] font-bold">
                  <span className="text-emerald-600">{approvedCount} conf.</span>
                  <span>•</span>
                  <span className="text-rose-600">{rejectedCount} rech.</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                <span>Supervisar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 flex flex-wrap gap-2">
            {[
              { key: 'solicitudes', label: 'Supervisión de Solicitudes', count: totalRequests, icon: Clock },
              { key: 'usuarios', label: 'Usuarios Registrados', count: users.length, icon: Users },
              { key: 'categorias', label: 'Categorías Oficiales', count: categories.length, icon: Layers },
              { key: 'servicios', label: 'Servicios del Catálogo', count: services.length, icon: Wrench },
              { key: 'cuadrillas', label: 'Cuadrillas Técnicas', count: cuadrillas.length, icon: Briefcase },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: SUPERVISION DE SOLICITUDES & SERVIDORES */}
          {activeTab === 'solicitudes' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <span>Bandeja de Solicitudes de Clientes & Control de Servidores</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                      {filteredBookings.length}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Los servidores deben aprobar o rechazar cada servicio explicando el por qué (ej. lugar muy lejos / fuera de zona). Si el rechazo es injustificado incurren en puntos negativos.
                  </p>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'TODOS', label: 'Todos' },
                    { key: 'SOLICITADO', label: 'Pendientes Servidor' },
                    { key: 'CONFIRMADO', label: 'Aprobados' },
                    { key: 'RECHAZADO', label: 'Rechazados' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilterStatus(tab.key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        filterStatus === tab.key
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <Link
                  href="/admin/settings"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center space-x-1.5 ml-auto"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configurar Motivos de Rechazo</span>
                </Link>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, servidor, servicio, categoría o zona de Cali..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
                />
              </div>

              {/* Requests List */}
              <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 font-bold text-sm">No se encontraron solicitudes registradas</p>
                    <p className="text-slate-400 text-xs mt-1">Las solicitudes de clientes desde los perfiles públicos se reflejan aquí en vivo.</p>
                  </div>
                ) : (
                  filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        b.status === 'RECHAZADO'
                          ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                          : b.status === 'CONFIRMADO'
                          ? 'bg-emerald-50/20 border-emerald-200 hover:border-emerald-300'
                          : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-400">#{b.id}</span>
                            <span className="font-bold text-slate-900 text-sm">{b.serviceTitle}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                              {b.categoryName}
                            </span>
                            {b.status === 'SOLICITADO' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>Esperando Aprobación de Servidor</span>
                              </span>
                            )}
                            {b.status === 'CONFIRMADO' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Aprobado por Servidor</span>
                              </span>
                            )}
                            {b.status === 'RECHAZADO' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center space-x-1">
                                <XCircle className="w-3 h-3" />
                                <span>Rechazado por Servidor</span>
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                            <div>
                              <span className="font-bold text-slate-700">Cliente:</span> {b.clientName}
                              {b.clientPhone && <span className="text-slate-400 ml-1">({b.clientPhone})</span>}
                            </div>
                            <div>
                              <span className="font-bold text-slate-700">Servidor asignado:</span> {b.providerName}
                            </div>
                            <div className="flex items-center space-x-1 text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{b.locationZone || 'Cali, Valle del Cauca'}</span>
                            </div>
                          </div>

                          {/* Rejection Justification / Explanation */}
                          {b.status === 'RECHAZADO' && (
                            <div className="mt-3 p-3 bg-rose-100/60 border border-rose-200 rounded-xl space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-rose-800 flex items-center space-x-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Explicación del Servidor: {b.rejectionReason}</span>
                                </span>
                                {(b.penaltyPointsApplied || 0) > 0 ? (
                                  <span className="px-2 py-0.5 bg-rose-200 text-rose-900 font-bold text-[10px] rounded-lg">
                                    Penalización: -{b.penaltyPointsApplied} pts aplicados
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-bold text-[10px] rounded-lg">
                                    Sin sanción (Causa justificada de distancia/fuerza mayor)
                                  </span>
                                )}
                              </div>
                              {b.rejectionExplanation && (
                                <p className="text-xs text-rose-700 italic">
                                  "{b.rejectionExplanation}"
                                </p>
                              )}
                            </div>
                          )}

                          {/* Approval agreed range */}
                          {b.status === 'CONFIRMADO' && (
                            <div className="mt-2 p-2.5 bg-emerald-100/50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Fecha: <strong>{b.date}</strong> ({b.estimatedTimeRange || b.durationAgreed || 'Horario pactado'})</span>
                            </div>
                          )}
                        </div>

                        {/* Reassign action */}
                        {b.status === 'RECHAZADO' && (
                          <button
                            onClick={() => handleOpenReassignModal(b)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1.5 shrink-0"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reasignar Servidor</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: USUARIOS REGISTRADOS */}
          {activeTab === 'usuarios' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <span>Directorio General de Usuarios</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                      {filteredUsers.length} de {users.length}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Cuentas activas, roles administrativos, prestadores de servicios y clientes del sistema.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href="/admin/users"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1.5"
                  >
                    <span>Módulo de Usuarios Completo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, correo, teléfono o ciudad..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  {['ALL', 'PROVIDER', 'USER', 'ADMIN', 'SUPERADMIN'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setUserRoleFilter(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        userRoleFilter === r
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {r === 'ALL' ? 'Todos' : r === 'PROVIDER' ? 'Prestadores' : r === 'USER' ? 'Clientes' : r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">Usuario</th>
                      <th className="px-5 py-3.5">Rol</th>
                      <th className="px-5 py-3.5">Contacto</th>
                      <th className="px-5 py-3.5">Ubicación</th>
                      <th className="px-5 py-3.5">Calificación / Tarifa</th>
                      <th className="px-5 py-3.5">Estado</th>
                      <th className="px-5 py-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {u.firstName?.[0] || 'U'}{u.lastName?.[0] || ''}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.role?.name === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' :
                            u.role?.name === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                            u.providerProfile ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {u.providerProfile ? 'PRESTADOR VERIFICADO' : (u.role?.name || 'CLIENTE')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-mono text-slate-700">{u.phone || 'No registrado'}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-1 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.profile?.city || 'Cali'}, {u.profile?.department || 'Valle'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {u.providerProfile ? (
                            <div>
                              <div className="flex items-center space-x-1 font-bold text-amber-600">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{u.providerProfile.rating?.toFixed(1) || '5.0'}</span>
                                <span className="text-slate-400 text-[10px]">({u.providerProfile.totalReviews || 0})</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium">
                                ${(u.providerProfile.hourlyRate || 35000).toLocaleString('es-CO')}/hora
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Cliente</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            ACTIVO
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            href={u.providerProfile ? `/profile/${u.id}` : `/admin/users`}
                            className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                          >
                            Ver detalle →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIAS OFICIALES */}
          {activeTab === 'categorias' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <span>Catálogo de Categorías y Requisitos</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                      {categories.length} Categorías
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Estructura oficial de oficios y documentos obligatorios para validar prestadores y cuadrillas.
                  </p>
                </div>
                <Link
                  href="/admin/categories"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1.5"
                >
                  <span>Administrar Categorías</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-white transition-all space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          {getCategoryIcon(cat.icon)}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                          {cat.isActive ? 'ACTIVA' : 'INACTIVA'}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-900 text-sm">{cat.name}</h5>
                      <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200/70">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="font-medium">Servicios incluidos:</span>
                        <span className="font-bold text-indigo-600">{cat.services?.length || 3}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        <span className="font-bold text-slate-700">Requisito:</span>{' '}
                        {cat.requirements && cat.requirements.length > 0
                          ? cat.requirements[0].title
                          : 'Validación de cédula'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SERVICIOS DEL CATALOGO */}
          {activeTab === 'servicios' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <span>Catálogo de Servicios Profesionales</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                      {filteredServices.length} de {services.length} Servicios
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Lista oficial de los 24 servicios ofrecidos por categorías en Cali y Colombia.
                  </p>
                </div>
                <Link
                  href="/admin/services"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1.5"
                >
                  <span>Gestionar Servicios</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Filter */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar servicio por nombre o descripción..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <select
                  value={serviceCatFilter}
                  onChange={(e) => setServiceCatFilter(e.target.value)}
                  className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="ALL">Todas las Categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Services Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-5 py-3.5">ID</th>
                      <th className="px-5 py-3.5">Servicio</th>
                      <th className="px-5 py-3.5">Categoría</th>
                      <th className="px-5 py-3.5">Descripción</th>
                      <th className="px-5 py-3.5">Estado</th>
                      <th className="px-5 py-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredServices.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-slate-400 font-bold">#{s.id}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-900">{s.name}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                            {s.category?.name || 'General'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 max-w-xs truncate text-slate-500">{s.description}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            ACTIVO
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link href="/admin/services" className="text-rose-600 hover:text-rose-800 font-bold text-xs">
                            Editar →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CUADRILLAS TECNICAS */}
          {activeTab === 'cuadrillas' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <span>Equipos y Cuadrillas Técnicas Registradas</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                      {cuadrillas.length} Cuadrillas
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Equipos multidisciplinarios con cotización por horas, días o cumplimiento de obra.
                  </p>
                </div>
                <Link
                  href="/cuadrillas"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1.5"
                >
                  <span>Ver Portal de Cuadrillas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Cuadrillas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {cuadrillas.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-amber-400 hover:bg-white transition-all space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {c.category}
                        </span>
                        <h5 className="font-bold text-slate-900 text-sm mt-1.5">{c.title}</h5>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                        {c.membersCount || c.members?.length || 3} integrantes
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>

                    <div className="pt-2 border-t border-slate-200/70 space-y-1 text-xs text-slate-600">
                      <p><span className="font-bold text-slate-700">Líder:</span> {c.leaderName} ({c.leaderPhone})</p>
                      <p><span className="font-bold text-slate-700">Ubicación:</span> {c.city}, {c.department}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-bold text-emerald-700">
                          ${(c.dailyRate || 220000).toLocaleString('es-CO')}/día
                        </span>
                        <Link href="/cuadrillas" className="text-amber-700 hover:text-amber-900 font-bold text-xs">
                          Ver acuerdos →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reassign Service Request Modal */}
          {reassignModalItem && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">Reasignar Solicitud de Servicio</h4>
                      <p className="text-xs text-slate-500">Solicitud #{reassignModalItem.id} de {reassignModalItem.clientName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReassignModalItem(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Details Summary */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                  <p><span className="font-bold text-slate-700">Servicio:</span> {reassignModalItem.serviceTitle}</p>
                  <p><span className="font-bold text-slate-700">Categoría:</span> {reassignModalItem.categoryName}</p>
                  <p><span className="font-bold text-slate-700">Ubicación Cliente:</span> {reassignModalItem.locationZone || 'Cali, Valle del Cauca'}</p>
                  <p className="text-rose-600 font-medium">
                    Rechazado previamente por: <span className="font-bold">{reassignModalItem.providerName}</span> (Motivo: {reassignModalItem.rejectionReason})
                  </p>
                </div>

                {/* Provider Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Selecciona el nuevo servidor para reasignar:
                  </label>
                  <select
                    value={selectedNewProviderId}
                    onChange={(e) => setSelectedNewProviderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {AVAILABLE_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.name === reassignModalItem.providerName}>
                        {p.name} — {p.role} ({p.city}) {p.name === reassignModalItem.providerName ? '(Rechazó anteriormente)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Al reasignar, la solicitud volverá al estado <span className="font-bold text-amber-600">PENDIENTE</span> y se le notificará al nuevo servidor para su confirmación inmediata.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setReassignModalItem(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleExecuteReassign}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirmar Reasignación</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Admin Modules Grid with Live Counts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Módulos de Gestión Administrativa
                </h4>
                <p className="text-xs text-slate-500">Acceso directo a todos los subsistemas de CONECTA 360</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/users" className="p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                      {users.length}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-blue-600">Usuarios</h5>
                  <p className="text-xs text-slate-500">Gestión de cuentas registradas, prestadores y clientes</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/categories" className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                      {categories.length}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600">Categorías</h5>
                  <p className="text-xs text-slate-500">8 categorías y requisitos documentales</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/services" className="p-5 rounded-2xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                      {services.length}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-rose-600">Servicios</h5>
                  <p className="text-xs text-slate-500">Catálogo de 24 servicios por oficio</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/cuadrillas" className="p-5 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                      {cuadrillas.length}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-amber-600">Cuadrillas</h5>
                  <p className="text-xs text-slate-500">Servicios por equipos y acuerdos</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/roles" className="p-5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                      7
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-purple-600">Roles</h5>
                  <p className="text-xs text-slate-500">7 niveles de permisos y acceso</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/verifications" className="p-5 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                      Verificadas
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-amber-600">Verificaciones</h5>
                  <p className="text-xs text-slate-500">Aprobación de antecedentes y títulos</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/subscriptions" className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      Planes
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600">Suscripciones</h5>
                  <p className="text-xs text-slate-500">Planes Básico, Pro y Empresa 360</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/settings" className="p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      <Settings className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                      Ajustes
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-blue-600">Configuración</h5>
                  <p className="text-xs text-slate-500">Comisiones, coberturas y seguridad</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
