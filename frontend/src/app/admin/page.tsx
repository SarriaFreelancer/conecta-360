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
  ThumbsUp
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { getAllBookings, reassignBookingByAdmin, ServiceHistoryItem } from '@/lib/auth';

const AVAILABLE_PROVIDERS = [
  { id: 'prov-1', name: 'Carlos Ruiz', role: 'Electricidad y Redes', city: 'Cali', phone: '+57 312 456 7890' },
  { id: 'prov-2', name: 'Andrés Gómez', role: 'Plomería y Redes Hidráulicas', city: 'Cali', phone: '+57 315 987 6543' },
  { id: 'prov-3', name: 'Diana Martínez', role: 'Pintura y Acabados', city: 'Cali', phone: '+57 301 234 5678' },
  { id: 'prov-4', name: 'Roberto Morales', role: 'Cerrajería de Emergencia', city: 'Cali', phone: '+57 320 876 5432' },
  { id: 'prov-5', name: 'Sofía Castro', role: 'Climatización y Refrigeración', city: 'Cali', phone: '+57 318 555 4321' },
  { id: 'prov-6', name: 'Mateo Silva', role: 'Carpintería y Muebles', city: 'Cali', phone: '+57 310 333 2211' },
];

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<ServiceHistoryItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reassignModalItem, setReassignModalItem] = useState<ServiceHistoryItem | null>(null);
  const [selectedNewProviderId, setSelectedNewProviderId] = useState<string>(AVAILABLE_PROVIDERS[0].id);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadBookings = () => {
    const list = getAllBookings();
    setBookings(list);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const totalRequests = bookings.length;
  const approvedCount = bookings.filter((b) => b.status === 'CONFIRMADO').length;
  const rejectedCount = bookings.filter((b) => b.status === 'RECHAZADO').length;
  const pendingCount = bookings.filter((b) => b.status === 'SOLICITADO').length;
  const totalPenaltyPoints = bookings.reduce((acc, b) => acc + (b.penaltyPointsApplied || 0), 0);

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter =
      filterStatus === 'TODOS' ||
      b.status === filterStatus;

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
      loadBookings();
      setActionSuccessMsg(`Solicitud #${reassignModalItem.id} reasignada con éxito a ${providerName}.`);
      setReassignModalItem(null);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      {/* Sidebar - Always displays all 8 modules */}
      <AdminSidebar currentPath="/admin" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-900">Panel General de Administración</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                SA
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800">SuperAdmin</p>
                <p className="text-[10px] text-slate-500 font-medium">superadmin@conecta360.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Welcome Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                Supervisión de Servicios en Vivo
              </span>
              <h3 className="text-2xl sm:text-3xl font-black mt-3">¡Bienvenido a CONECTA 360 Admin!</h3>
              <p className="mt-2 text-slate-300 text-sm max-w-xl font-medium">
                Monitoreo en tiempo real de servicios solicitados por clientes, control de aprobaciones y rechazos de servidores, penalización por rechazos injustificados y reasignación inmediata.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadBookings}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-600/50 font-bold rounded-xl shadow transition-all text-xs flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar Solicitudes</span>
              </button>
              <Link
                href="/admin/users"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all text-xs whitespace-nowrap"
              >
                Gestionar Usuarios →
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

          {/* Live Stats Cards for Service Requests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Requests */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Solicitudes de Clientes</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{totalRequests}</p>
                <p className="text-[11px] text-amber-600 font-bold mt-1">{pendingCount} en espera de servidor</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Approved by Providers */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aprobados por Servidor</p>
                <p className="text-3xl font-black text-emerald-600 mt-2">{approvedCount}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Con rango de tiempo acordado</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ThumbsUp className="w-6 h-6" />
              </div>
            </div>

            {/* Rejected by Providers */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rechazados por Servidor</p>
                <p className="text-3xl font-black text-rose-600 mt-2">{rejectedCount}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Con justificación obligatoria</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                <ThumbsDown className="w-6 h-6" />
              </div>
            </div>

            {/* Negative Points Incurred */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Puntos Negativos Aplicados</p>
                <p className="text-3xl font-black text-purple-600 mt-2">-{totalPenaltyPoints} pts</p>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Sanción por rechazos sin causa</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <BadgeAlert className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Real-time Service Requests Feed & Provider Decision Monitor */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <span>Bandeja de Solicitudes de Clientes & Control de Servidores</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    {filteredBookings.length}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Los servidores deben aprobar o rechazar cada solicitud explicando el motivo (ej. lugar muy lejos / fuera de zona). Si el rechazo es injustificado incurren en puntos negativos.
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
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por cliente, servidor, servicio, categoría o barrio..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Requests Feed List */}
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">No se encontraron solicitudes con los filtros aplicados</p>
                <p className="text-xs text-slate-400">Las solicitudes generadas por clientes aparecerán automáticamente aquí.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      b.status === 'RECHAZADO'
                        ? 'bg-rose-50/40 border-rose-200'
                        : b.status === 'CONFIRMADO'
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Service & Client info */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            #{b.id}
                          </span>
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                            {b.categoryName}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {b.date}
                          </span>
                          {b.locationZone && (
                            <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-rose-500" />
                              {b.locationZone}
                            </span>
                          )}
                        </div>

                        <h5 className="font-extrabold text-slate-900 text-base">{b.serviceTitle}</h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
                          <div>
                            <span className="font-semibold text-slate-700">Cliente:</span> {b.clientName}{' '}
                            {b.clientPhone && <span className="text-slate-400">({b.clientPhone})</span>}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Servidor asignado:</span>{' '}
                            <span className="font-bold text-slate-900">{b.providerName}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Tarifa convenida:</span>{' '}
                            <span className="font-bold text-slate-900">${b.amount?.toLocaleString('es-CO')} COP</span>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Método de pago:</span> {b.paymentMethod}
                          </div>
                        </div>
                      </div>

                      {/* Right: Provider Decision & Status Badges */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3">
                        {/* Status Badge */}
                        {b.status === 'CONFIRMADO' && (
                          <div className="flex flex-col items-start lg:items-end">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Aprobado por Servidor
                            </span>
                            {b.estimatedTimeRange && (
                              <span className="text-[11px] font-semibold text-emerald-700 mt-1">
                                Rango: {b.estimatedTimeRange}
                              </span>
                            )}
                          </div>
                        )}

                        {b.status === 'SOLICITADO' && (
                          <div className="flex flex-col items-start lg:items-end">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Pendiente de Aprobación
                            </span>
                            <span className="text-[11px] text-amber-700 mt-1">Esperando respuesta del servidor</span>
                          </div>
                        )}

                        {b.status === 'RECHAZADO' && (
                          <div className="flex flex-col items-start lg:items-end">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Rechazado por Servidor
                            </span>
                            <button
                              onClick={() => handleOpenReassignModal(b)}
                              className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Reasignar a Otro Servidor</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rejection Audit Box if Rejected */}
                    {b.status === 'RECHAZADO' && (
                      <div className="mt-4 pt-3 border-t border-rose-200/80 bg-white/70 p-3.5 rounded-xl text-xs space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span className="font-bold text-slate-800">Motivo indicado:</span>
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold">
                              {b.rejectionReason || 'No especificado'}
                            </span>
                          </div>

                          {/* Negative points indicator */}
                          {b.penaltyPointsApplied === 0 ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              0 pts negativos (Rechazo Justificado por distancia / causa válida)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold flex items-center gap-1 shadow-sm">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              -{b.penaltyPointsApplied} pts negativos aplicados al servidor (Injustificado)
                            </span>
                          )}
                        </div>

                        {b.rejectionExplanation && (
                          <div className="text-slate-600 pl-6 italic">
                            &ldquo;{b.rejectionExplanation}&rdquo;
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal de Reasignación de Solicitud por el Administrador */}
          {reassignModalItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-scale-up">
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

          {/* Active Admin Modules Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-lg font-bold text-slate-900">Módulos Administrativos Activos</h4>
                <p className="text-xs text-slate-500 font-medium">Acceso rápido a la gestión de datos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/users" className="p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-blue-600">Usuarios</h5>
                  <p className="text-xs text-slate-500">Gestión de cuentas registradas y estados</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/categories" className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
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
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm group-hover:text-rose-600">Servicios</h5>
                  <p className="text-xs text-slate-500">Catálogo de 24 servicios por oficio</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
                  <span>Acceder</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link href="/admin/roles" className="p-5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-5 h-5" />
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
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
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
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
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
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Settings className="w-5 h-5" />
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
