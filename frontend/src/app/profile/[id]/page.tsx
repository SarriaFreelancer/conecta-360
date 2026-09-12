'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Mail, Phone, MapPin, Globe, ShieldCheck, ArrowLeft, Calendar, User } from 'lucide-react';

interface UserData {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  role?: {
    name: string;
    description: string;
  };
  profile?: {
    bio: string | null;
    city: string | null;
    department: string | null;
    country: string | null;
    website: string | null;
  };
}

export default function UserProfilePage() {
  const params = useParams();
  const id = params?.id;
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3001/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
        <p className="text-slate-500 font-bold text-sm">Cargando información del usuario...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center font-sans space-y-4">
        <p className="text-slate-700 font-bold">Usuario no encontrado</p>
        <Link href="/admin/users" className="text-blue-600 font-bold text-sm">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  const initials = `${user.firstName.substring(0, 1)}${user.lastName.substring(0, 1)}`.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <Link href="/admin/users" className="inline-flex items-center space-x-2 text-slate-600 hover:text-blue-600 font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Usuarios</span>
        </Link>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900"></div>
          <div className="px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-6 gap-4">
              <div className="flex items-end space-x-5">
                <div className="w-28 h-28 rounded-2xl bg-white p-1.5 shadow-xl">
                  <div className="w-full h-full rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center">
                    {initials}
                  </div>
                </div>
                <div className="pb-2">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-black text-slate-900">
                      {user.firstName} {user.lastName}
                    </h1>
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                      {user.role?.name || 'USER'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">uuid: {user.uuid}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cuenta Verificada</span>
                </span>
              </div>
            </div>

            {/* Profile Grid Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Información de Contacto</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-slate-700 font-medium">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-700 font-medium">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span>{user.phone || 'Teléfono no registrado'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-700 font-medium">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <span>
                      {user.profile?.city || 'Ciudad no especificada'}, {user.profile?.department || ''} ({user.profile?.country || 'Colombia'})
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Biografía</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  {user.profile?.bio || 'Sin biografía registrada.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
