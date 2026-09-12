'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  User,
  Star,
  Clock,
  CheckCircle2,
  Briefcase,
  Send,
  X,
  AlertCircle
} from 'lucide-react';
import { getCurrentUser, createServiceBooking, UserSession } from '@/lib/auth';

interface ServiceDetail {
  id: number;
  name: string;
  category?: {
    name: string;
  };
}

interface ProviderServiceItem {
  id: number;
  service: ServiceDetail;
}

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
    description?: string;
  };
  profile?: {
    bio: string | null;
    city: string | null;
    department: string | null;
    country: string | null;
    profilePhoto: string | null;
  };
  providerProfile?: {
    id: number;
    title: string | null;
    bio: string | null;
    hourlyRate: number | string | null;
    isVerified: boolean;
    rating?: number;
    totalReviews?: number;
    providerServices?: ProviderServiceItem[];
  } | null;
}

function ProfileContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id;
  const initialAction = searchParams?.get('action');

  const [user, setUser] = useState<UserData | null>(null);
  const [currentUser, setCurrentUserState] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const session = getCurrentUser();
    setCurrentUserState(session);

    if (!id) return;

    fetch(`http://localhost:3001/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setUser(data);
        } else {
          setUser(getMockProviderData(Number(id)));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando usuario de API:', err);
        setUser(getMockProviderData(Number(id)));
        setLoading(false);
      });
  }, [id]);

  // Si viene con ?action=hire, abrir modal o redirigir al login
  useEffect(() => {
    if (initialAction === 'hire' && !loading && user) {
      handleOpenBooking();
    }
  }, [initialAction, loading, user]);

  const handleOpenBooking = () => {
    const session = getCurrentUser();
    if (!session) {
      // Regla: antes de ingresar a cualquier acción de solicitar servicio o brindar servicios, pedir autenticación en el login
      router.push(`/login?redirect=/profile/${id}?action=hire&action_type=hire`);
      return;
    }
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const rateNum = Number(user.providerProfile?.hourlyRate) || 45000;
    const servTitle = selectedService || user.providerProfile?.title || 'Servicio Profesional';
    const catName = user.providerProfile?.providerServices?.[0]?.service?.category?.name || 'Servicios Generales';

    createServiceBooking({
      providerId: user.id,
      providerName: `${user.firstName} ${user.lastName}`,
      serviceTitle: servTitle,
      categoryName: catName,
      amount: rateNum,
      date: bookingDate || new Date().toISOString().split('T')[0],
      notes: bookingNotes,
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setIsBookingOpen(false);
      setBookingNotes('');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#0056d2] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold text-sm">Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans space-y-4 px-4">
        <AlertCircle className="w-12 h-12 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-800">Usuario o Profesional no encontrado</h2>
        <p className="text-sm text-slate-500 text-center max-w-md">
          No pudimos localizar la información de este perfil.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0056d2] text-white font-bold text-sm shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al portal principal</span>
        </Link>
      </div>
    );
  }

  const isVerified = Boolean(user.providerProfile?.isVerified);
  const initials = `${user.firstName.substring(0, 1)}${user.lastName.substring(0, 1)}`.toUpperCase();
  const locationCity = user.profile?.city || 'Cali';
  const locationDept = user.profile?.department || 'Valle del Cauca';
  const hourlyRate = Number(user.providerProfile?.hourlyRate) || 45000;
  const ratingVal = user.providerProfile?.rating || 4.9;
  const reviewsCount = user.providerProfile?.totalReviews || 28;

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-slate-600 hover:text-[#0056d2] font-bold text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Servicios</span>
          </Link>

          <Link
            href="/admin/users"
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
          >
            Ver en Administrador
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="h-36 sm:h-44 bg-gradient-to-r from-[#002f6c] via-[#0056d2] to-indigo-700 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]"></div>
          </div>

          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-6 gap-4">
              <div className="flex items-end space-x-4 sm:space-x-5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1.5 shadow-xl shrink-0">
                  <div className="w-full h-full rounded-xl bg-gradient-to-tr from-[#0056d2] to-indigo-600 text-white font-black text-2xl sm:text-3xl flex items-center justify-center">
                    {initials}
                  </div>
                </div>

                <div className="pb-1 sm:pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                      {user.firstName} {user.lastName}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0056d2] font-bold text-xs">
                      {user.providerProfile ? 'Proveedor Profesional' : (user.role?.name || 'Cliente')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {user.providerProfile?.title || 'Especialista en Servicios para el Hogar y Empresas'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0">
                {isVerified ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Cuenta Verificada</span>
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs shadow-xs"
                    title="Registrado en el sistema. En proceso de validación por el administrador"
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Sin verificar</span>
                  </span>
                )}

                <button
                  onClick={handleOpenBooking}
                  className="px-5 py-2.5 rounded-xl bg-[#0056d2] hover:bg-[#0046a8] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Solicitar Servicio</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-100 bg-slate-50/50 rounded-2xl px-4 mb-6">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">Tarifa Base</span>
                <span className="text-sm sm:text-base font-black text-[#0056d2]">
                  ${hourlyRate.toLocaleString('es-CO')} COP<span className="text-xs font-normal text-slate-500">/h</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">Calificación</span>
                <div className="flex items-center space-x-1 text-sm sm:text-base font-black text-slate-800">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{ratingVal.toFixed(1)}</span>
                  <span className="text-xs font-medium text-slate-400">({reviewsCount})</span>
                </div>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">Ubicación</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700 truncate block">
                  {locationCity}, {locationDept}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">Garantía</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-600">
                  100% Conecta 360
                </span>
              </div>
            </div>

            {/* Profile Grid Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Información de Contacto
                  </h3>
                  <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <div className="flex items-center space-x-3 text-slate-700 text-sm font-medium">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-700 text-sm font-medium">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{user.phone || '+57 315 000 0000'}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-700 text-sm font-medium">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{locationCity}, {locationDept} (Colombia)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Servicios Disponibles
                  </h3>
                  <div className="space-y-2.5">
                    {user.providerProfile?.providerServices && user.providerProfile.providerServices.length > 0 ? (
                      user.providerProfile.providerServices.map((ps, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0056d2] flex items-center justify-center font-bold text-xs">
                              <Briefcase className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{ps.service?.name}</p>
                              <p className="text-[11px] text-slate-400">
                                {ps.service?.category?.name || 'Servicio Especializado'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-[#0056d2]">
                            ${hourlyRate.toLocaleString('es-CO')} COP
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0056d2] flex items-center justify-center font-bold text-xs">
                            <Briefcase className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {user.providerProfile?.title || 'Servicio Técnico Profesional'}
                            </p>
                            <p className="text-[11px] text-slate-400">Atención domiciliaria en Cali</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#0056d2]">
                          ${hourlyRate.toLocaleString('es-CO')} COP
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Acerca del Profesional
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-normal bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    {user.providerProfile?.bio ||
                      user.profile?.bio ||
                      'Profesional con amplia experiencia en la prestación de servicios en Cali y el Valle del Cauca. Comprometido con la puntualidad, calidad técnica y satisfacción del cliente.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Reseñas Recientes
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">María Camila Vargas</span>
                        <div className="flex items-center text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <Star className="w-3 h-3 fill-amber-400" />
                          <Star className="w-3 h-3 fill-amber-400" />
                          <Star className="w-3 h-3 fill-amber-400" />
                          <Star className="w-3 h-3 fill-amber-400" />
                        </div>
                      </div>
                      <p className="text-slate-600">
                        Excelente atención y puntualidad. Solucionó el problema en menos de una hora y el costo fue muy justo.
                      </p>
                      <span className="text-[10px] text-slate-400 block">Hace 3 días • Servicio en Cali</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Andrés Felipe Morales</span>
                        <div className="flex items-center text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <Star className="w-3 h-3 fill-amber-400" />
                          <Star className="w-3 h-3 fill-amber-400" />
                          <Star className="w-3 h-3 fill-amber-400" />
                          <Star className="w-3 h-3 fill-amber-400" />
                        </div>
                      </div>
                      <p className="text-slate-600">
                        Totalmente recomendado. Muy profesional y con herramientas de primera calidad.
                      </p>
                      <span className="text-[10px] text-slate-400 block">Hace 1 semana • Servicio en Palmira</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#002f6c] to-[#0056d2] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <h3 className="font-bold text-base">Solicitar Contratación de Servicio</h3>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900">¡Solicitud Enviada con Éxito!</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Hemos registrado tu solicitud para el servicio con{' '}
                  <span className="font-bold">{user.firstName} {user.lastName}</span>.
                  Podrás hacer seguimiento del estado y pago desde tu panel de usuario.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 space-y-1">
                  <p className="font-bold">
                    Profesional: {user.firstName} {user.lastName}
                  </p>
                  <p className="text-slate-600">
                    Tarifa estimada: <span className="font-bold text-[#0056d2]">${hourlyRate.toLocaleString('es-CO')} COP</span> / hora
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Servicio a Contratar
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#0056d2]"
                  >
                    <option value={user.providerProfile?.title || 'Servicio Técnico Principal'}>
                      {user.providerProfile?.title || 'Servicio Técnico Principal'}
                    </option>
                    {user.providerProfile?.providerServices?.map((ps, i) => (
                      <option key={i} value={ps.service.name}>
                        {ps.service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Fecha deseada del servicio
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#0056d2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Detalles o requerimientos de la labor
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe la necesidad o problema a resolver (ej. cambio de cerradura en Cali norte)..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#0056d2] resize-none"
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2.5">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Confirmar y Solicitar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getMockProviderData(id: number): UserData {
  const fallbackList: Record<number, Partial<UserData>> = {
    1: { firstName: 'Juan', lastName: 'Pérez', phone: '+57 315 123 4567' },
    2: { firstName: 'Carlos', lastName: 'Mendoza', phone: '+57 316 234 5678' },
    3: { firstName: 'Ana', lastName: 'Torres', phone: '+57 317 345 6789' },
    4: { firstName: 'Luis', lastName: 'García', phone: '+57 318 456 7890' },
    5: { firstName: 'Roberto', lastName: 'Vaca', phone: '+57 319 567 8901' },
    6: { firstName: 'Diana', lastName: 'Castillo', phone: '+57 310 678 9012' },
    7: { firstName: 'Esteban', lastName: 'Ríos', phone: '+57 311 789 0123' },
    8: { firstName: 'Sofía', lastName: 'Guzmán', phone: '+57 312 890 1234' },
    9: { firstName: 'Fernando', lastName: 'Mejía', phone: '+57 313 901 2345' },
    10: { firstName: 'Valeria', lastName: 'Duque', phone: '+57 314 012 3456' },
  };

  const current = fallbackList[id] || { firstName: 'Profesional', lastName: `Conecta #${id}`, phone: '+57 315 555 0199' };

  return {
    id: id || 1,
    uuid: `usr-mock-${id}`,
    firstName: current.firstName || 'Profesional',
    lastName: current.lastName || 'Conecta',
    email: `${(current.firstName || 'pro').toLowerCase()}@conecta360.co`,
    phone: current.phone || '+57 315 123 4567',
    status: 'ACTIVE',
    role: { name: 'PROVIDER', description: 'Proveedor' },
    profile: {
      bio: 'Especialista profesional calificado en Cali con garantía de servicio Conecta 360.',
      city: 'Cali',
      department: 'Valle del Cauca',
      country: 'Colombia',
      profilePhoto: null,
    },
    providerProfile: {
      id: id,
      title: 'Servicio Profesional Residencial y Comercial',
      bio: 'Especialista profesional calificado en Cali con garantía de servicio Conecta 360.',
      hourlyRate: 45000,
      isVerified: true,
      rating: 4.9,
      totalReviews: 32,
      providerServices: [
        {
          id: 1,
          service: {
            id: 1,
            name: 'Servicio Técnico Profesional',
            category: { name: 'Mantenimiento' },
          },
        },
      ],
    },
  };
}

export default function UserProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
          <div className="w-10 h-10 border-4 border-[#0056d2] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

