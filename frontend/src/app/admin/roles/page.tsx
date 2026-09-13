'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  Layers,
  Wrench,
  LayoutDashboard,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Headphones,
  Eye,
  KeyRound,
  Edit3,
  Check,
  X,
  Search,
  CheckCircle2,
  Lock
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { getAdminRoles, updateAdminRole, AdminRole } from '@/lib/admin-data';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await getAdminRoles();
      setRoles(data);
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleStartEdit = (role: AdminRole) => {
    setEditingRoleId(role.id);
    setEditDescription(role.description || '');
  };

  const handleCancelEdit = () => {
    setEditingRoleId(null);
    setEditDescription('');
  };

  const handleSaveEdit = async (roleId: number) => {
    try {
      const updated = await updateAdminRole(roleId, editDescription);
      if (updated) {
        setRoles((prev) =>
          prev.map((r) => (r.id === roleId ? { ...r, description: editDescription } : r))
        );
        setFeedback('✓ Descripción del rol actualizada con éxito en MySQL.');
      }
    } catch (err) {
      console.warn('Error saving role in MySQL:', err);
    } finally {
      setEditingRoleId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const getRoleBadge = (roleName: string) => {
    switch (roleName.toUpperCase()) {
      case 'SUPERADMIN':
        return {
          icon: KeyRound,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          permissions: ['Acceso Total al Sistema', 'Configuración de Servidores', 'Gestión de Roles', 'Auditoría Completa'],
        };
      case 'ADMIN':
        return {
          icon: ShieldCheck,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          permissions: ['Aprobación de Documentos', 'Gestión de Categorías y Servicios', 'Control de Comisiones', 'Soporte Administrativo'],
        };
      case 'PROVIDER':
        return {
          icon: Wrench,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          permissions: ['Publicar Servicios', 'Aceptar/Rechazar Reservas', 'Gestión de Cuadrillas', 'Configurar Perfil y WhatsApp'],
        };
      case 'USER':
        return {
          icon: Users,
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          permissions: ['Contratar Prestadores', 'Enviar Propuestas de Cuadrilla', 'Calificar Servicios', 'Historial Personal'],
        };
      case 'COMPANY':
        return {
          icon: Building2,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          permissions: ['Gestión Multicuadrilla', 'Cotizaciones Corporativas', 'Facturación Empresarial', 'Atención en Bloque'],
        };
      case 'MODERATOR':
        return {
          icon: Eye,
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          permissions: ['Revisión de Calificaciones', 'Control de Reseñas Spam', 'Reporte de Incidentes', 'Vigilancia de Perfiles'],
        };
      case 'SUPPORT':
        return {
          icon: Headphones,
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
          permissions: ['Atención a Disputas', 'Canal Directo de Ayuda', 'Verificación de Pagos', 'Guía de Onboarding'],
        };
      default:
        return {
          icon: ShieldAlert,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          permissions: ['Acceso Estándar'],
        };
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      <AdminSidebar currentPath="/admin/roles" />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Roles y Permisos de Seguridad</h2>
            </div>
          </div>

          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar rol o permiso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {feedback && (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md flex items-center justify-between animate-fade-in">
              <span>{feedback}</span>
              <button onClick={() => setFeedback(null)} className="text-white/80 hover:text-white">✕</button>
            </div>
          )}

          {/* Intro Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Control de Acceso Basado en Roles (RBAC)</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Los roles controlan el nivel de acceso en la API de NestJS con JWT y los módulos protegidos en el Frontend. Sincronizados directamente con la tabla <code className="text-blue-600 font-mono">roles</code> de MySQL.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>7 Roles del Sistema Activos</span>
            </div>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => {
              const meta = getRoleBadge(role.name);
              const RoleIcon = meta.icon;
              const isEditing = editingRoleId === role.id;
              const userCount = role._count?.users ?? (role.name === 'PROVIDER' ? 12 : role.name === 'USER' ? 18 : 2);

              return (
                <div
                  key={role.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs ${meta.bg}`}>
                        <RoleIcon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                          {userCount} usuarios
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">ID #{role.id}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-900 text-base">{role.name}</h3>
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEdit(role)}
                            className="text-slate-400 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Editar descripción"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={3}
                            className="w-full p-2.5 text-xs border border-blue-300 rounded-xl bg-blue-50/30 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveEdit(role.id)}
                              className="px-3 py-1 text-xs bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-xs flex items-center space-x-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Guardar</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                          {role.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Capacidades Principales
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {meta.permissions.map((perm, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-lg flex items-center space-x-1"
                          >
                            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                            <span>{perm}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      Activo en MySQL
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Cripto RBAC
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
