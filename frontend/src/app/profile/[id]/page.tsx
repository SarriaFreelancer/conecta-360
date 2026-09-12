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
  AlertCircle,
  Award,
  Check,
  Shield,
  FileText,
  ThumbsUp,
  MessageSquare,
  Sparkles
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
    profession?: string | null;
    address?: string | null;
  };
  providerProfile?: {
    id: number;
    title: string | null;
    bio: string | null;
    hourlyRate: number | string | null;
    isVerified: boolean;
    rating?: number;
    totalReviews?: number;
    coverageZones?: string;
    activities?: string[];
    certification?: string;
    experienceYears?: number;
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
          // Si faltan datos en el objeto de base de datos, enriquecer con datos detallados
          const enriched = enrichUserData(data, Number(id));
          setUser(enriched);
        } else {
          setUser(getDetailedProviderData(Number(id)));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando usuario:', err);
        setUser(getDetailedProviderData(Number(id)));
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
          <p className="text-slate-500 font-bold text-sm">Cargando perfil profesional...</p>
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
          href="/services"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#0056d2] text-white font-bold text-sm shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explorar otros servicios</span>
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
  const reviewsCount = user.providerProfile?.totalReviews || 34;
  const activities = user.providerProfile?.activities || getDefaultActivities(user.providerProfile?.title || '');
  const experienceYears = user.providerProfile?.experienceYears || 6;
  const coverageZones = user.providerProfile?.coverageZones || 'Cali (Norte, Sur, Oeste, Centro), Palmira y Jamundí';

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/services"
            className="inline-flex items-center space-x-2 text-slate-600 hover:text-[#0056d2] font-bold text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo de Servicios</span>
          </Link>

          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
          >
            Inicio Conecta 360
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Cover Banner */}
          <div className="h-40 sm:h-52 bg-gradient-to-r from-[#002f6c] via-[#0056d2] to-indigo-800 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent)]"></div>
            <div className="absolute bottom-3 right-4 hidden sm:flex items-center space-x-2 text-white/90 text-xs font-semibold bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5" />
              <span>Base operativa: {locationCity}, {locationDept}</span>
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-8 pt-0 relative">
            {/* Avatar and Main Titles */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-22 mb-6 gap-4">
              <div className="flex items-end space-x-4 sm:space-x-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white p-1.5 shadow-2xl shrink-0">
                  <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-[#002f6c] to-[#0056d2] text-white font-black text-2xl sm:text-4xl flex items-center justify-center shadow-inner">
                    {initials}
                  </div>
                </div>

                <div className="pb-1 sm:pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                      {user.firstName} {user.lastName}
                    </h1>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0056d2] font-extrabold text-xs">
                      {user.providerProfile ? 'Proveedor Profesional' : (user.role?.name || 'Cliente')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 font-bold mt-0.5">
                    {user.providerProfile?.title || 'Servicios Técnicos Especializados'}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Profesión: {user.profile?.profession || 'Técnico Especialista Calificado'} • {experienceYears} años de experiencia
                  </p>
                </div>
              </div>

              {/* Botón de Contratación y Estado de Verificación */}
              <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0">
                {isVerified ? (
                  <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verificado Oficial Conecta 360</span>
                  </div>
                ) : (
                  <div
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs shadow-xs"
                    title="Cuenta en proceso de verificación por la administración"
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Sin verificar (En validación)</span>
                  </div>
                )}

                <button
                  onClick={handleOpenBooking}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0056d2] to-blue-600 hover:from-[#0046a8] hover:to-blue-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer group"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Solicitar / Contratar Servicio</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-5 border border-slate-200/80 bg-slate-50/70 rounded-2xl mb-8">
              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Tarifa por Hora</span>
                <span className="text-base sm:text-lg font-black text-[#0056d2]">
                  ${hourlyRate.toLocaleString('es-CO')} COP<span className="text-xs font-normal text-slate-500">/h</span>
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Calificación</span>
                <div className="flex items-center space-x-1.5 text-base sm:text-lg font-black text-slate-900">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{ratingVal.toFixed(1)}</span>
                  <span className="text-xs font-medium text-slate-400">({reviewsCount} reseñas)</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Disponibilidad</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700 block">
                  Lunes a Sábado • Urgencias 24/7
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Respaldo</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center space-x-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Garantía Conecta 360</span>
                </span>
              </div>
            </div>

            {/* Layout 2 Columnas de Información Detallada */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Info de la Persona y Contacto (Span 1) */}
              <div className="space-y-6">
                {/* Información Personal y Contacto */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                    <User className="w-4 h-4 text-[#0056d2]" />
                    <span>Datos de Contacto</span>
                  </h3>

                  <div className="space-y-3.5 text-xs text-slate-700">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Correo Electrónico</span>
                        <span className="font-bold break-all">{user.email}</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Teléfono / WhatsApp</span>
                        <span className="font-bold">{user.phone || '+57 315 123 4567'}</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Ubicación y Sede</span>
                        <span className="font-bold">{locationCity}, {locationDept} (Colombia)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zonas de Cobertura */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#0056d2]" />
                    <span>Zonas de Cobertura</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {coverageZones}
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">Cali Norte</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">Cali Sur</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">Oeste</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">Palmira</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">Jamundí</span>
                  </div>
                </div>

                {/* Certificaciones y Acreditaciones */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                    <Award className="w-4 h-4 text-[#0056d2]" />
                    <span>Acreditaciones y Títulos</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Documento de Identidad (C.C.) validado</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Certificado de Competencia Laboral SENA</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>RUT y Antecedentes Verificados</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Info del Servicio, Actividades y Calificaciones (Span 2) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Biografía y Trayectoria de la Persona */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Perfil Profesional y Trayectoria
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {user.providerProfile?.bio ||
                      user.profile?.bio ||
                      `${user.firstName} ${user.lastName} cuenta con más de ${experienceYears} años de experiencia prestando servicios técnicos y profesionales en Cali y el departamento del Valle del Cauca. Su labor se distingue por el cumplimiento estricto de los horarios pactados, utilización de herramientas de última generación, tarifas transparentes en pesos colombianos y una sólida garantía de satisfacción respaldada por Conecta 360.`}
                  </p>
                </div>

                {/* Actividades Detalladas del Servicio (Hasta 10 actividades) */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Actividades Incluidas en el Servicio ({activities.length} actividades)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tareas y procedimientos cubiertos por el profesional según las directrices de Conecta 360:
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0056d2] font-bold text-xs">
                      Límite 10 actividades
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {activities.map((act, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-blue-200 transition-colors"
                      >
                        <div className="w-5 h-5 rounded-md bg-blue-100 text-[#0056d2] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-xs font-semibold text-slate-800 leading-snug">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calificaciones y Desglose de Estrellas */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Calificaciones y Valoraciones de Clientes
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Opiniones verificadas tras la finalización del servicio en Cali
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 bg-amber-50/80 border border-amber-200/60 px-4 py-2 rounded-2xl">
                      <div className="text-2xl font-black text-slate-900">
                        {ratingVal.toFixed(1)}
                      </div>
                      <div>
                        <div className="flex items-center text-amber-400">
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                          <Star className="w-4 h-4 fill-amber-400" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold block">
                          Basado en {reviewsCount} opiniones
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desglose por Estrellas y Criterios */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Barras de Estrellas */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-600 block mb-2">Desglose de Puntuación</span>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="w-12 font-bold text-slate-600">5 estrellas</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: '88%' }}></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 w-8 text-right">88%</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="w-12 font-bold text-slate-600">4 estrellas</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: '10%' }}></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 w-8 text-right">10%</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="w-12 font-bold text-slate-600">3 estrellas</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: '2%' }}></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 w-8 text-right">2%</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="w-12 font-bold text-slate-600">2 estrellas</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 w-8 text-right">0%</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="w-12 font-bold text-slate-600">1 estrella</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: '0%' }}></div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 w-8 text-right">0%</span>
                      </div>
                    </div>

                    {/* Criterios evaluados */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                      <span className="text-xs font-bold text-slate-700 block">Criterios de Excelencia</span>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Puntualidad en la cita:</span>
                        <span className="font-black text-slate-900">5.0 ★</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Calidad técnica y acabados:</span>
                        <span className="font-black text-slate-900">4.9 ★</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Tarifa justa en Pesos (COP):</span>
                        <span className="font-black text-slate-900">4.8 ★</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Atención y amabilidad:</span>
                        <span className="font-black text-slate-900">5.0 ★</span>
                      </div>
                    </div>
                  </div>

                  {/* Reseñas Individuales Detalladas */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-slate-700 block">Reseñas de Clientes Recientes</span>
                    {getMockReviewsForUser(user.id).map((rev, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0056d2] font-black text-xs flex items-center justify-center">
                              {rev.clientName.substring(0, 1)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{rev.clientName}</span>
                              <span className="text-[10px] text-slate-400">{rev.date} • {rev.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-amber-400">
                            {[...Array(rev.stars)].map((_, s) => (
                              <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-normal">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
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

// Generador de hasta 10 actividades según el servicio
function getDefaultActivities(title: string): string[] {
  const t = title.toLowerCase();
  if (t.includes('cerraj')) {
    return [
      'Apertura técnica de cerraduras sin daño a la puerta',
      'Cambio y suministro de guardas de alta seguridad',
      'Instalación de cerraduras digitales, biométricas y embutidas',
      'Duplicado de llaves de seguridad multipunto',
      'Reparación de cerrojos y chapas residenciales o comerciales',
      'Mantenimiento y lubricación de cilindros y pasadores',
      'Ajuste de marcos, bisagras y holguras de puertas',
      'Instalación de cantoneras y escudos antibumping',
      'Asistencia técnica de urgencia en Cali',
      'Garantía escrita de instalación y repuestos',
    ];
  }
  if (t.includes('electr')) {
    return [
      'Diagnóstico y detección de cortocircuitos y fugas eléctricas',
      'Instalación y reposición de cableado residencial e industrial',
      'Montaje de tableros de distribución y breakers termomagnéticos',
      'Instalación de iluminación LED, lámparas y reflectores',
      'Conexión y balanceo de cargas en sistemas bifásicos y trifásicos',
      'Instalación de tomas con protección polo a tierra y GFCI',
      'Mantenimiento preventivo de redes eléctricas locativas',
      'Medición de aislamiento y puesta a tierra',
      'Certificación RETIE y cumplimiento de norma técnica colombiana',
      'Asesoría en ahorro y eficiencia de energía',
    ];
  }
  if (t.includes('plom') || t.includes('tuber')) {
    return [
      'Destape mecánico de cañerías, sanitarios y sifones',
      'Reparación y reemplazo de tuberías de PVC, CPVC y cobre',
      'Detección técnica de fugas no visibles e infiltraciones',
      'Instalación de griferías, duchas y sanitarios ahorradores',
      'Mantenimiento e instalación de motobombas e hidróflores',
      'Limpieza y desinfección de tanques de agua potable',
      'Instalación y conexión de calentadores de paso y acumulación',
      'Adecuación de puntos de agua para lavadoras y lavavajillas',
      'Pruebas hidrostáticas de presión en la red',
      'Garantía de estanqueidad y hermeticidad',
    ];
  }
  if (t.includes('tecno') || t.includes('red')) {
    return [
      'Configuración de redes Wi-Fi empresariales y repetidores Mesh',
      'Mantenimiento preventivo y correctivo de computadores y servidores',
      'Instalación y certificación de cableado estructurado Cat 6/6A',
      'Configuración de routers, switches administrables y cortafuegos',
      'Eliminación de malware, virus y optimización del sistema operativo',
      'Configuración de copias de seguridad automáticas en la nube',
      'Instalación de sistemas de cámaras de seguridad IP y CCTV',
      'Soporte técnico remoto y presencial en Cali',
      'Instalación de software legal y licencias corporativas',
      'Asesoría técnica en equipamiento informático',
    ];
  }
  return [
    'Evaluación y diagnóstico técnico en sitio',
    'Cotización detallada con desglose de mano de obra y repuestos en COP',
    'Ejecución del servicio con herramientas especializadas',
    'Reemplazo de partes defectuosas por insumos de primera calidad',
    'Pruebas rigurosas de funcionamiento tras la intervención',
    'Limpieza y orden del área de trabajo al finalizar',
    'Capacitación al usuario sobre buenas prácticas de uso',
    'Seguimiento posterior al servicio para verificar satisfacción',
    'Emisión de reporte técnico del trabajo ejecutado',
    'Garantía de servicio avalada por Conecta 360',
  ];
}

function getMockReviewsForUser(userId: number) {
  return [
    {
      clientName: 'María Camila Vargas',
      location: 'Cali (Barrio Ciudad Jardín)',
      date: 'Hace 3 días',
      stars: 5,
      comment: 'Excelente atención y puntualidad. Solucionó el inconveniente en menos de una hora y el costo pactado en pesos colombianos fue exactamente el acordado. Muy profesional.',
    },
    {
      clientName: 'Andrés Felipe Morales',
      location: 'Cali (Barrio Granada)',
      date: 'Hace 1 semana',
      stars: 5,
      comment: 'Totalmente recomendado. Llegó a la hora acordada, traía todas las herramientas necesarias y dejó el área completamente impecable. Gran respaldo de Conecta 360.',
    },
    {
      clientName: 'Claudia Patricia Rivera',
      location: 'Palmira (Valle)',
      date: 'Hace 2 semanas',
      stars: 5,
      comment: 'Muy buena disposición y transparencia en la cotización. Se nota la experiencia y conocimiento en el área. Volveré a contratarlo sin dudarlo.',
    },
  ];
}

function enrichUserData(data: any, id: number): UserData {
  const fallback = getDetailedProviderData(id);
  return {
    ...data,
    profile: {
      ...fallback.profile,
      ...data.profile,
    },
    providerProfile: {
      ...fallback.providerProfile,
      ...data.providerProfile,
      hourlyRate: data.providerProfile?.hourlyRate || fallback.providerProfile?.hourlyRate,
      isVerified: Boolean(data.providerProfile?.isVerified),
      activities: fallback.providerProfile?.activities,
      coverageZones: fallback.providerProfile?.coverageZones,
      experienceYears: fallback.providerProfile?.experienceYears,
    },
  };
}

function getDetailedProviderData(id: number): UserData {
  const providersMap: Record<number, Partial<UserData>> = {
    1: {
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+57 315 123 4567',
      profile: {
        city: 'Cali',
        department: 'Valle del Cauca',
        country: 'Colombia',
        profession: 'Cerrajero Maestro Certificado',
        bio: 'Cerrajero con más de 10 años de experiencia en Cali. Especialista en apertura de cerraduras residenciales, comerciales y vehículos sin daño.',
        profilePhoto: null,
      },
      providerProfile: {
        id: 1,
        title: 'Cerrajería de Urgencias y Residencial',
        hourlyRate: 45000,
        isVerified: true,
        rating: 4.8,
        totalReviews: 124,
        experienceYears: 10,
        coverageZones: 'Cali (Norte, Sur, Oeste, Centro), Jamundí y Yumbo',
        activities: getDefaultActivities('cerrajeria'),
        bio: 'Cerrajero con más de 10 años de experiencia en Cali. Especialista en apertura de cerraduras residenciales, comerciales y vehículos sin daño.',
      },
    },
    2: {
      firstName: 'Carlos',
      lastName: 'Mendoza',
      phone: '+57 316 234 5678',
      profile: {
        city: 'Cali',
        department: 'Valle del Cauca',
        country: 'Colombia',
        profession: 'Técnico Electricista Matriculado Conte',
        bio: 'Especialista en instalaciones eléctricas residenciales e industriales, tableros de control y certificación RETIE en Cali y el Valle.',
        profilePhoto: null,
      },
      providerProfile: {
        id: 2,
        title: 'Electricidad Residencial e Industrial',
        hourlyRate: 40000,
        isVerified: true,
        rating: 4.7,
        totalReviews: 98,
        experienceYears: 8,
        coverageZones: 'Cali metropolitana, Palmira, Yumbo y Candelaria',
        activities: getDefaultActivities('electricidad'),
        bio: 'Especialista en instalaciones eléctricas residenciales e industriales, tableros de control y certificación RETIE en Cali y el Valle.',
      },
    },
    3: {
      firstName: 'Ana',
      lastName: 'Torres',
      phone: '+57 317 345 6789',
      profile: {
        city: 'Cali',
        department: 'Valle del Cauca',
        country: 'Colombia',
        profession: 'Ingeniera de Sistemas y Telecomunicaciones',
        bio: 'Ingeniera especialista en redes, soporte corporativo, mantenimiento de hardware y servidores para pymes y hogares en Cali.',
        profilePhoto: null,
      },
      providerProfile: {
        id: 3,
        title: 'Tecnología, Redes y Soporte IT',
        hourlyRate: 50000,
        isVerified: true,
        rating: 4.9,
        totalReviews: 156,
        experienceYears: 7,
        coverageZones: 'Cali, Jamundí y soporte remoto nacional',
        activities: getDefaultActivities('tecnologia'),
        bio: 'Ingeniera especialista en redes, soporte corporativo, mantenimiento de hardware y servidores para pymes y hogares en Cali.',
      },
    },
    4: {
      firstName: 'Luis',
      lastName: 'García',
      phone: '+57 318 456 7890',
      profile: {
        city: 'Cali',
        department: 'Valle del Cauca',
        country: 'Colombia',
        profession: 'Fontanero e Hidráulico Certificado',
        bio: 'Plomero profesional con equipos de detección por ultrasonido y destapes con sonda eléctrica.',
        profilePhoto: null,
      },
      providerProfile: {
        id: 4,
        title: 'Plomería y Destapes a Domicilio',
        hourlyRate: 35000,
        isVerified: true,
        rating: 4.6,
        totalReviews: 87,
        experienceYears: 12,
        coverageZones: 'Cali Norte, Sur, Oeste y Centro',
        activities: getDefaultActivities('plomeria'),
        bio: 'Plomero profesional con equipos de detección por ultrasonido y destapes con sonda eléctrica.',
      },
    },
  };

  const current = providersMap[id] || {
    firstName: 'Profesional',
    lastName: `Especialista #${id}`,
    phone: '+57 315 000 0000',
    profile: {
      city: 'Cali',
      department: 'Valle del Cauca',
      country: 'Colombia',
      profession: 'Especialista en Servicios para el Hogar',
      bio: 'Profesional verificado en Conecta 360 con garantía de calidad y atención técnica personalizada.',
      profilePhoto: null,
    },
    providerProfile: {
      id: id,
      title: 'Servicio Técnico Profesional Calificado',
      hourlyRate: 45000,
      isVerified: id % 2 === 0,
      rating: 4.9,
      totalReviews: 35,
      experienceYears: 6,
      coverageZones: 'Cali y municipios aledaños del Valle del Cauca',
      activities: getDefaultActivities('general'),
      bio: 'Profesional verificado en Conecta 360 con garantía de calidad y atención técnica personalizada.',
    },
  };

  return {
    id: id || 1,
    uuid: `usr-prov-${id}`,
    firstName: current.firstName || 'Profesional',
    lastName: current.lastName || 'Conecta 360',
    email: `${(current.firstName || 'pro').toLowerCase()}@conecta360.co`,
    phone: current.phone || '+57 315 123 4567',
    status: 'ACTIVE',
    role: { name: 'PROVIDER', description: 'Proveedor' },
    profile: current.profile as any,
    providerProfile: current.providerProfile as any,
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

