'use client';

import React, { useState, useEffect } from 'react';
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
import AdminSidebar from '@/components/AdminSidebar';
import {
  fetchVerificationsBackend,
  updateProviderVerificationBackend,
  AdminVerificationItem,
} from '@/lib/admin-data';

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<AdminVerificationItem[]>([
    {
      id: 1,
      userId: 1,
      providerName: 'Carlos Andrés Rodríguez',
      category: 'Electricidad',
      email: 'carlos.rodriguez@conecta360.co',
      phone: '+57 315 789 4521',
      city: 'Cali, Valle del Cauca',
      documentType: 'Cédula de Ciudadanía & Matrícula CONTE / RETIE',
      documentNumber: 'CC-1144098231',
      requestDate: '12 Sep 2026',
      status: 'APPROVED',
      isVerified: true,
      rating: 5,
      totalReviews: 24,
      documentFile: 'cedula_matricula_conte_carlos_rodriguez.pdf',
      notes: 'Matrícula CONTE TE-1 verificada en portal oficial y antecedentes policiales limpios.',
    },
    {
      id: 2,
      userId: 2,
      providerName: 'Juan Carlos Pérez',
      category: 'Cerrajería',
      email: 'juan.perez@conecta360.co',
      phone: '+57 310 123 4567',
      city: 'Cali, Valle del Cauca',
      documentType: 'Cédula & Certificado Asociación Cerrajeros de Colombia',
      documentNumber: 'CC-1144567890',
      requestDate: '11 Sep 2026',
      status: 'PENDING',
      isVerified: false,
      rating: 4.9,
      totalReviews: 18,
      documentFile: 'cedula_certificado_juan_perez.pdf',
      notes: 'Validación en curso con el registro gremial y certificado de antecedentes.',
    },
    {
      id: 3,
      userId: 3,
      providerName: 'Andrés Felipe Gómez',
      category: 'Plomería',
      email: 'andres.gomez@conecta360.co',
      phone: '+57 318 456 7890',
      city: 'Cali, Valle del Cauca',
      documentType: 'Certificado Técnico Laboral SENA & RUT',
      documentNumber: 'CC-1144890123',
      requestDate: '10 Sep 2026',
      status: 'APPROVED',
      isVerified: true,
      rating: 5,
      totalReviews: 32,
      documentFile: 'tecnico_sena_plomeria_andres.pdf',
      notes: 'Certificado SENA en instalaciones hidrosanitarias validado exitosamente.',
    },
    {
      id: 4,
      userId: 4,
      providerName: 'Ana María Torres',
      category: 'Tecnología & Redes',
      email: 'ana.torres@conecta360.co',
      phone: '+57 312 345 6789',
      city: 'Cali, Valle del Cauca',
      documentType: 'Tarjeta Profesional Copnia / Título de Ingeniería',
      documentNumber: 'CC-1144345678',
      requestDate: '09 Sep 2026',
      status: 'APPROVED',
      isVerified: true,
      rating: 4.95,
      totalReviews: 15,
      documentFile: 'tarjeta_profesional_sistemas_ana.pdf',
      notes: 'Registro verificado en el Consejo Profesional Nacional de Ingeniería.',
    },
    {
      id: 5,
      userId: 5,
      providerName: 'Lucía Zambrano',
      category: 'Climatización & Refrigeración',
      email: 'lucia.zambrano@conecta360.co',
      phone: '+57 317 678 2345',
      city: 'Palmira, Valle del Cauca',
      documentType: 'Carnet de Certificación en Manejo de Gases Refrigerantes',
      documentNumber: 'CC-1144901234',
      requestDate: '08 Sep 2026',
      status: 'PENDING',
      isVerified: false,
      rating: 4.8,
      totalReviews: 12,
      documentFile: 'cert_refrigerantes_lucia.pdf',
      notes: 'Certificación ambiental en trámite de verificación con entidad emisora.',
    },
    {
      id: 6,
      userId: 6,
      providerName: 'Pedro Martínez',
      category: 'Mantenimiento Locativo',
      email: 'pedro.martinez@conecta360.co',
      phone: '+57 314 890 1234',
      city: 'Jamundí, Valle del Cauca',
      documentType: 'Certificado Vigente Trabajo Seguro en Alturas (Avanzado)',
      documentNumber: 'CC-1144234567',
      requestDate: '07 Sep 2026',
      status: 'PENDING',
      isVerified: false,
      rating: 4.85,
      totalReviews: 9,
      documentFile: 'certificado_alturas_pedro.pdf',
      notes: 'Cotejando vigencia de certificación con el Ministerio del Trabajo.',
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AdminVerificationItem | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchVerificationsBackend().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setRequests(data);
      }
    });
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: 'APPROVED' | 'REJECTED') => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus, isVerified: newStatus === 'APPROVED' } : req))
    );
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus, isVerified: newStatus === 'APPROVED' } : null));
    }
    setFeedbackMessage(
      newStatus === 'APPROVED'
        ? '✓ Solicitud aprobada con éxito. El prestador ahora cuenta con la insignia de Verificado oficial en MySQL.'
        : '✕ Solicitud rechazada. Se ha emitido requerimiento de subsanación de documentos en MySQL.'
    );

    try {
      await updateProviderVerificationBackend(id, newStatus);
    } catch (err) {
      console.warn('Error sincronizando verificación con MySQL:', err);
    }

    setTimeout(() => setFeedbackMessage(null), 4500);
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
      {/* Sidebar - Always displays all 8 modules */}
      <AdminSidebar currentPath="/admin/verifications" />

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
