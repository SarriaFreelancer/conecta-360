'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Users,
  Layers,
  Wrench,
  ShieldAlert,
  CreditCard,
  Settings,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Eye,
  Search,
  ArrowLeft,
  Download,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

interface VerificationRequest {
  id: number;
  providerName: string;
  category: string;
  email: string;
  phone: string;
  city: string;
  documentType: string;
  documentNumber: string;
  requestDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documentFile: string;
  notes?: string;
}

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([
    {
      id: 1,
      providerName: 'Juan Pérez',
      category: 'Cerrajería',
      email: 'juan.perez@conecta360.com',
      phone: '+593 98 123 4567',
      city: 'Quito, Pichincha',
      documentType: 'Cédula de Identidad & Certificación Cerrajero',
      documentNumber: '1723456789',
      requestDate: '12 Sep 2026',
      status: 'APPROVED',
      documentFile: 'cedula_certificado_juan_perez.pdf',
      notes: 'Documento de identidad legible y certificado gremial validado con la asociación.',
    },
    {
      id: 2,
      providerName: 'Carlos Mendoza',
      category: 'Electricidad',
      email: 'carlos.mendoza@conecta360.com',
      phone: '+593 98 234 5678',
      city: 'Quito, Pichincha',
      documentType: 'Matrícula Profesional Eléctrica & Antecedentes',
      documentNumber: '1718902345',
      requestDate: '11 Sep 2026',
      status: 'PENDING',
      documentFile: 'matricula_electrica_carlos_mendoza.pdf',
      notes: 'Revisión pendiente en el registro nacional de técnicos eléctricos.',
    },
    {
      id: 3,
      providerName: 'Ana Torres',
      category: 'Tecnología',
      email: 'ana.torres@conecta360.com',
      phone: '+593 98 345 6789',
      city: 'Quito, Pichincha',
      documentType: 'Título Universitario en Sistemas (Senescyt)',
      documentNumber: '1790123456',
      requestDate: '10 Sep 2026',
      status: 'APPROVED',
      documentFile: 'titulo_senescyt_ana_torres.pdf',
      notes: 'Registro verificado en portal público de educación superior.',
    },
    {
      id: 4,
      providerName: 'Luis García',
      category: 'Plomería',
      email: 'luis.garcia@conecta360.com',
      phone: '+593 98 456 7890',
      city: 'Quito, Pichincha',
      documentType: 'Certificado de Antecedentes & Cédula',
      documentNumber: '1756789012',
      requestDate: '09 Sep 2026',
      status: 'PENDING',
      documentFile: 'record_policial_luis_garcia.pdf',
      notes: 'Documento en proceso de cotejo con la base judicial.',
    },
    {
      id: 5,
      providerName: 'Roberto Vaca',
      category: 'Reparaciones',
      email: 'roberto.vaca@conecta360.com',
      phone: '+593 98 567 8901',
      city: 'Guayaquil, Guayas',
      documentType: 'Certificación Técnica en Refrigeración',
      documentNumber: '0912345678',
      requestDate: '08 Sep 2026',
      status: 'PENDING',
      documentFile: 'cert_refrigeracion_roberto.pdf',
    },
    {
      id: 6,
      providerName: 'Sofía Cárdenas',
      category: 'Educación',
      email: 'sofia.cardenas@conecta360.com',
      phone: '+593 98 890 1234',
      city: 'Ambato, Tungurahua',
      documentType: 'Título de Licenciatura en Pedagogía y Matemáticas',
      documentNumber: '1809876543',
      requestDate: '07 Sep 2026',
      status: 'PENDING',
      documentFile: 'titulo_pedagogia_sofia.pdf',
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Categorías', href: '/admin/categories', icon: Layers },
    { name: 'Servicios', href: '/admin/services', icon: Wrench },
    { name: 'Roles', href: '/admin/roles', icon: ShieldAlert },
    { name: 'Verificaciones', href: '/admin/verifications', icon: Award, active: true },
    { name: 'Suscripciones', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Configuración', href: '/admin/settings', icon: Settings },
  ];

  const handleUpdateStatus = (id: number, newStatus: 'APPROVED' | 'REJECTED') => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setFeedbackMessage(
      newStatus === 'APPROVED'
        ? '✓ Solicitud aprobada con éxito. El prestador ahora cuenta con la insignia de Verificado oficial.'
        : '✕ Solicitud rechazada. Se ha emitido requerimiento de subsanación de documentos.'
    );
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const filteredRequests = requests.filter((req) => {
    const matchesFilter = filterStatus === 'ALL' || req.status === filterStatus;
    const matchesSearch =
      req.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;

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

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  item.active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.name === 'Verificaciones' && pendingCount > 0 && (
                  <span className="bg-amber-500 text-slate-900 text-xs font-black px-2 py-0.5 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            href="/"
            className="w-full py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Web</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="text-slate-400 hover:text-slate-600 md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Award className="w-6 h-6 text-blue-600" />
              <span>Verificación de Prestadores</span>
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{pendingCount} Pendientes de revisión</span>
            </span>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {feedbackMessage && (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md flex items-center justify-between animate-fade-in">
              <span>{feedbackMessage}</span>
              <button onClick={() => setFeedbackMessage(null)} className="text-white/80 hover:text-white">✕</button>
            </div>
          )}

          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Solicitudes</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{requests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">En Revisión</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verificados Activos</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === st
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' && 'Todas'}
                  {st === 'PENDING' && `Pendientes (${pendingCount})`}
                  {st === 'APPROVED' && 'Aprobadas'}
                  {st === 'REJECTED' && 'Rechazadas'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Verification Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Prestador</th>
                    <th className="py-4 px-6">Categoría</th>
                    <th className="py-4 px-6">Documentación Presentada</th>
                    <th className="py-4 px-6">Fecha</th>
                    <th className="py-4 px-6">Estado</th>
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => {
                    const initials = req.providerName.substring(0, 2).toUpperCase();
                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 leading-tight">{req.providerName}</p>
                              <p className="text-xs text-slate-400">{req.city}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                            {req.category}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">{req.documentType}</p>
                            <p className="text-[11px] text-slate-400 font-mono">ID: {req.documentNumber}</p>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                          {req.requestDate}
                        </td>

                        <td className="py-4 px-6">
                          {req.status === 'PENDING' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center space-x-1 w-max">
                              <Clock className="w-3 h-3" />
                              <span>En revisión</span>
                            </span>
                          )}
                          {req.status === 'APPROVED' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center space-x-1 w-max">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Verificado</span>
                            </span>
                          )}
                          {req.status === 'REJECTED' && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center space-x-1 w-max">
                              <XCircle className="w-3 h-3" />
                              <span>Rechazado</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold inline-flex items-center space-x-1 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Revisar</span>
                          </button>

                          {req.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center space-x-1 shadow-xs transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aprobar</span>
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center space-x-1 shadow-xs transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Rechazar</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Detalle y Aprobación de Documento */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Expediente de Verificación</h3>
                  <p className="text-xs text-slate-400 font-medium">CONECTA 360 Security</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500 font-bold">Prestador:</span>
                  <span className="font-extrabold text-slate-900">{selectedRequest.providerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500 font-bold">Categoría:</span>
                  <span className="font-bold text-blue-600">{selectedRequest.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500 font-bold">Contacto:</span>
                  <span className="text-slate-700">{selectedRequest.email} | {selectedRequest.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500 font-bold">Ubicación:</span>
                  <span className="text-slate-700">{selectedRequest.city}</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Documentación Adjunta</p>
                <p className="text-xs font-semibold text-slate-800">{selectedRequest.documentType}</p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-mono text-slate-600 truncate">{selectedRequest.documentFile}</span>
                  </div>
                  <button className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Notas de auditoría interna:</p>
                    <p className="mt-0.5">{selectedRequest.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRequest.id, 'REJECTED')}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Rechazar</span>
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRequest.id, 'APPROVED')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aprobar Verificación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
