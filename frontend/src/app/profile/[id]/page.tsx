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
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { getCurrentUser, createServiceBooking, UserSession } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/admin-data';
import MainNavbar from '@/components/MainNavbar';
import MainFooter from '@/components/MainFooter';

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
    showWhatsApp?: boolean;
    whatsappNumber?: string;
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
  const [estimatedTimeRange, setEstimatedTimeRange] = useState('2 a 4 horas (Media jornada)');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Modal de Autenticación Requerida para Contratar Servicio
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');

  useEffect(() => {
    const session = getCurrentUser();
    setCurrentUserState(session);

    if (!id) return;

    fetch(`${API_BASE_URL}/users/${id}`, { signal: AbortSignal.timeout(2000) })
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
      .catch(() => {
        setUser(getDetailedProviderData(Number(id)));
        setLoading(false);
      });
  }, [id]);

  // Si viene con ?action=hire, abrir modal si está autenticado o mostrar modal de inicio de sesión
  useEffect(() => {
    if (initialAction === 'hire' && !loading && user) {
      handleOpenBooking();
    }
  }, [initialAction, loading, user]);

  const handleOpenBooking = () => {
    const session = getCurrentUser();
    if (!session) {
      setAuthModalMessage(`Para solicitar y contratar los servicios de ${user?.firstName || 'este profesional'}, debes iniciar sesión o crear una cuenta.`);
      setAuthModalOpen(true);
      return;
    }
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const session = getCurrentUser();
    if (!session) {
      setIsBookingOpen(false);
      setAuthModalMessage('Debes iniciar sesión para confirmar y registrar esta solicitud de servicio.');
      setAuthModalOpen(true);
      return;
    }

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
      estimatedTimeRange: estimatedTimeRange,
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

  // Garantizar que el cliente siempre pueda ver las 10 actividades del profesional
  const serviceName = user.providerProfile?.providerServices?.[0]?.service?.name || '';
  const categoryName = user.providerProfile?.providerServices?.[0]?.service?.category?.name || '';
  const titleForActivities =
    user.providerProfile?.title ||
    user.profile?.profession ||
    serviceName ||
    categoryName ||
    '';

  const defaultTen = getDefaultActivities(titleForActivities, Number(user.id || id));
  const userActivities = user.providerProfile?.activities || [];
  const combinedActivities = Array.from(new Set([...userActivities, ...defaultTen]));
  const activities = (combinedActivities.length >= 10 ? combinedActivities : defaultTen).slice(0, 10);
  const featuredActivities = (user.providerProfile as any)?.featuredActivities || activities.slice(0, 4);

  // Configuración y formateo seguro de WhatsApp
  const rawPhone = user.profile?.whatsappNumber || user.phone || '3157894521';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const finalPhone = cleanPhone.startsWith('57') ? cleanPhone : (cleanPhone.length === 10 ? `57${cleanPhone}` : cleanPhone);
  const whatsappMessage = encodeURIComponent(
    `Hola ${user.firstName}, vi tu perfil profesional en Conecta 360 y me gustaría cotizar tus servicios de ${titleForActivities || 'Servicios Técnicos'} en Cali.`
  );
  const whatsappUrl = `https://wa.me/${finalPhone}?text=${whatsappMessage}`;
  const isWhatsAppEnabled = user.profile?.showWhatsApp !== false;

  const experienceYears = user.providerProfile?.experienceYears || 6;
  const coverageZones = user.providerProfile?.coverageZones || 'Cali (Norte, Sur, Oeste, Centro), Palmira y Jamundí';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      <MainNavbar />
      <div className="flex-1 w-full max-w-6xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 space-y-6">
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

              {/* Botón de Contratación y Estado de Verificación Reorganizados */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 sm:pt-0">
                {isVerified ? (
                  <div className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs shadow-xs shrink-0 self-start sm:self-auto">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verificado Oficial Conecta 360</span>
                  </div>
                ) : (
                  <div
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-amber-100 text-amber-900 font-bold text-xs shadow-xs shrink-0 self-start sm:self-auto"
                    title="Cuenta en proceso de verificación por la administración"
                  >
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Sin verificar (En validación)</span>
                  </div>
                )}

                {/* Botón de WhatsApp Reorganizado y Destacado */}
                {isWhatsAppEnabled && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-[0.98] text-white font-black text-sm shadow-md hover:shadow-emerald-600/30 transition-all cursor-pointer group"
                    title={`Chatear por WhatsApp con ${user.firstName}`}
                  >
                    <div className="relative">
                      <MessageCircle className="w-4 h-4" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                    </div>
                    <span>WhatsApp Directo</span>
                  </a>
                )}

                <button
                  onClick={handleOpenBooking}
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0056d2] to-blue-600 hover:from-[#0046a8] hover:to-blue-700 active:scale-[0.98] text-white font-black text-sm shadow-md hover:shadow-blue-600/30 transition-all cursor-pointer group"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Solicitar / Contratar</span>
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
                {/* Información Personal y Contacto Reorganizada */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                    <User className="w-4 h-4 text-[#0056d2]" />
                    <span>Contacto Directo</span>
                  </h3>

                  <div className="space-y-3.5 text-xs text-slate-700">
                    {/* Caja destacada de WhatsApp y Teléfono */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50/50 border border-emerald-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <Phone className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10.5px] font-extrabold text-emerald-900 uppercase tracking-wider">
                            Teléfono / WhatsApp
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 text-[9.5px] font-black uppercase tracking-tight">
                          Disponible
                        </span>
                      </div>
                      
                      <div className="flex items-baseline space-x-2">
                        <span className="text-base font-black text-slate-900 tracking-tight">
                          {user.phone || user.profile?.whatsappNumber || '+57 315 789 4521'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">Colombia</span>
                      </div>

                      {isWhatsAppEnabled ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Chatear por WhatsApp</span>
                        </a>
                      ) : (
                        <p className="text-[10.5px] text-slate-500 italic text-center">
                          El profesional prefiere recibir solicitudes a través de la plataforma.
                        </p>
                      )}
                    </div>

                    <div className="flex items-start space-x-3 pt-1">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Correo Electrónico</span>
                        <span className="font-bold break-all">{user.email}</span>
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

                {/* Actividades Detalladas del Servicio (Las 10 actividades completas) */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-[#0056d2]" />
                        <span>Las 10 Actividades y Especialidades del Profesional</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tareas completas y procedimientos técnicos que el cliente puede contratar con este profesional en Cali:
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0056d2] font-bold text-xs border border-blue-100 shrink-0 self-start sm:self-auto">
                      10 actividades disponibles
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {activities.slice(0, 10).map((act, index) => {
                      const isMainFeatured = featuredActivities.includes(act) || index < 4;
                      return (
                        <div
                          key={index}
                          className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all ${
                            isMainFeatured
                              ? 'bg-blue-50/40 border-blue-200/80 shadow-xs'
                              : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                              isMainFeatured
                                ? 'bg-[#0056d2] text-white shadow-xs'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-800 leading-snug block">
                              {act}
                            </span>
                            {isMainFeatured && (
                              <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-[#0056d2] bg-blue-100/70 px-2 py-0.5 rounded-md">
                                <Check className="w-3 h-3 stroke-[2.5]" />
                                <span>Actividad Principal (Visible en Tarjeta)</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                    Rango de tiempo estimado para la atención *
                  </label>
                  <select
                    value={estimatedTimeRange}
                    onChange={(e) => setEstimatedTimeRange(e.target.value)}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#0056d2] font-semibold text-slate-800"
                  >
                    <option value="1 a 2 horas (Atención puntual)">1 a 2 horas (Atención puntual)</option>
                    <option value="2 a 4 horas (Media jornada)">2 a 4 horas (Media jornada)</option>
                    <option value="4 a 8 horas (1 día completo)">4 a 8 horas (1 día completo)</option>
                    <option value="2 a 3 días hábiles">2 a 3 días hábiles</option>
                    <option value="A convenir según diagnóstico">A convenir según diagnóstico</option>
                  </select>
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

      {/* MODAL DE AUTENTICACIÓN REQUERIDA */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-7 space-y-5 animate-scale-up text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-[#0056d2] flex items-center justify-center mx-auto shadow-sm">
              <Shield className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Inicio de Sesión Requerido</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {authModalMessage || `Para solicitar y contratar los servicios de ${user?.firstName || 'este profesional'}, debes iniciar sesión o registrarte en Conecta 360.`}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-left text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Seguimiento de orden y confirmación en tiempo real</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Respaldo oficial y garantía del servicio en Cali</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href={`/login?redirect=${encodeURIComponent(`/profile/${id}?action=hire`)}&action_type=hire`}
                className="w-full py-3 rounded-xl bg-[#0056d2] hover:bg-[#0046a8] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Iniciar Sesión Ahora</span>
              </Link>
              <Link
                href={`/register?redirect=${encodeURIComponent(`/profile/${id}?action=hire`)}`}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all flex items-center justify-center space-x-2"
              >
                <span>¿No tienes cuenta? Regístrate gratis</span>
              </Link>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Volver al perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Principal Conecta 360 */}
      <MainFooter />
    </div>
  );
}

// Generador de las 10 actividades según el servicio o especialidad
function getDefaultActivities(title: string, id?: number): string[] {
  const t = (title || '').toLowerCase();

  // 1. Cerrajería
  if (t.includes('cerraj') || t.includes('llav') || t.includes('chapa') || t.includes('cerradur') || id === 1) {
    return [
      'Apertura técnica de cerraduras residenciales y comerciales sin daño a la puerta',
      'Cambio, suministro e igualamiento de guardas y bombines de seguridad',
      'Instalación de cerraduras digitales, biométricas e invisibles con clave',
      'Duplicado de llaves de alta seguridad, computarizadas y multipunto',
      'Reparación y mantenimiento de cerrojos, candados y chapas embutidas',
      'Mantenimiento y lubricación profunda de cilindros y pasadores de seguridad',
      'Ajuste de marcos descolgados, bisagras pesadas y holguras de puertas',
      'Instalación de cantoneras blindadas y escudos protectores antibumping',
      'Atención y asistencia técnica de urgencia 24/7 en Cali y área metropolitana',
      'Diagnóstico y garantía certificada sobre instalación, ajustes y materiales'
    ];
  }

  // 2. Electricidad
  if (t.includes('electr') || t.includes('cable') || t.includes('iluminac') || t.includes('breaker') || id === 2 || id === 999) {
    return [
      'Diagnóstico y detección de cortocircuitos y fugas de corriente con instrumentos',
      'Instalación y recableado general residencial, comercial e industrial',
      'Montaje y balanceo de tableros eléctricos y breakers termomagnéticos',
      'Instalación de iluminación LED, paneles decorativos, reflectores y dimmers',
      'Conexión y balanceo de acometidas para líneas monofásicas, bifásicas y trifásicas',
      'Instalación de tomas con polo a tierra y circuitos protegidos GFCI para zonas húmedas',
      'Mantenimiento preventivo de redes eléctricas y tableros locativos',
      'Instalación y medición de varillas de puesta a tierra con telurómetro',
      'Asesoría técnica en eficiencia energética y adecuación a norma RETIE en Colombia',
      'Adecuación de puntos de fuerza independientes para aires acondicionados y hornos'
    ];
  }

  // 3. Tecnología y Redes
  if (t.includes('tecno') || t.includes('red') || t.includes('comput') || t.includes('sistema') || t.includes('wifi') || t.includes('cctv') || id === 3) {
    return [
      'Configuración de redes Wi-Fi empresariales y repetidores Mesh de alta cobertura',
      'Mantenimiento preventivo, formateo y repotenciación de computadores y servidores',
      'Instalación y certificación de cableado estructurado Cat 6 y 6A',
      'Configuración y seguridad de routers, switches administrables y cortafuegos',
      'Eliminación de virus, malware y optimización de rendimiento en Windows y Mac',
      'Implementación de copias de seguridad automáticas y sincronización en la nube',
      'Instalación y configuración de cámaras de seguridad IP y circuitos CCTV',
      'Soporte técnico integral a impresoras de red y periféricos corporativos',
      'Asistencia remota de urgencia y solución de incidentes en sitio en Cali',
      'Asesoría en compras de hardware, licenciamiento de software y ciberseguridad'
    ];
  }

  // 4. Plomería y Fontanería
  if (t.includes('plom') || t.includes('tuber') || t.includes('fontan') || t.includes('sifon') || t.includes('grif') || t.includes('destape') || id === 4) {
    return [
      'Detección técnica de fugas no visibles e infiltraciones de agua en muros y pisos',
      'Destape mecánico y con sonda eléctrica de cañerías, sanitarios y sifones',
      'Reparación y reemplazo de tuberías de presión y sanitarias en PVC, CPVC y cobre',
      'Instalación y cambio de griferías monomando, duchas y sanitarios ahorradores',
      'Mantenimiento e instalación de motobombas, presurizadores e hidróflores',
      'Lavado, desinfección y mantenimiento sanitario de tanques de agua potable',
      'Instalación y mantenimiento de calentadores de paso a gas y eléctricos',
      'Adecuación de puntos de suministro de agua potable y desagüe para lavadoras',
      'Pruebas hidrostáticas de presión y hermeticidad de la red hidráulica',
      'Garantía de estanqueidad y asesoría técnica para prevención de humedades'
    ];
  }

  // 5. Mantenimiento y Reparaciones Locativas
  if (t.includes('manten') || t.includes('locativ') || t.includes('reparac') || t.includes('drywall') || t.includes('obra') || id === 5) {
    return [
      'Reparación de grietas, fisuras y desprendimientos en muros y techos',
      'Resane, estuco profesional y nivelación de superficies de mampostería',
      'Instalación y reparación de cielo raso en drywall, PVC y panel yeso',
      'Mantenimiento, desmonte y ajuste de puertas, marcos y ventanas corredizas',
      'Instalación y reparación de enchapes cerámicos, porcelanatos y guardescobas',
      'Sellado e impermeabilización de filtraciones en cubiertas, tejas y terrazas',
      'Armado, anclaje y montaje de muebles modulares, repisas y estanterías',
      'Mantenimiento correctivo de herrajes, bisagras y cerraduras en carpintería',
      'Inspección locativa detallada para entrega o recepción de inmuebles en arriendo',
      'Remodelaciones y adecuaciones funcionales en viviendas y locales comerciales'
    ];
  }

  // 6. Diseño Gráfico y Publicidad Digital
  if (t.includes('diseñ') || t.includes('grafic') || t.includes('publicid') || t.includes('logo') || t.includes('marca') || id === 6) {
    return [
      'Diseño de identidad corporativa, logotipos y manual de estilo de marca',
      'Creación de piezas publicitarias de alto impacto para Instagram, Facebook y TikTok',
      'Diseño de material impreso: volantes, afiches, brochures, carpetas y tarjetas',
      'Edición y retoque fotográfico profesional de productos y retratos comerciales',
      'Diseño de banners y creatividades para campañas de pauta digital en Google y Meta',
      'Diseño de etiquetas, empaques (packaging) y material publicitario POP',
      'Creación de infografías visuales, catálogos en PDF y presentaciones corporativas',
      'Preparación de artes finales y archivos vectoriales aptos para imprenta gran formato',
      'Asesoría estratégica en coherencia visual y comunicación de marca',
      'Entrega de recursos en formatos editables (AI, PSD) y versiones web optimizadas'
    ];
  }

  // 7. Pintura y Acabados
  if (t.includes('pintur') || t.includes('acabad') || t.includes('estuco') || t.includes('muro') || t.includes('fachada') || id === 7) {
    return [
      'Aplicación de pintura vinilo lavable tipo 1 en muros interiores y cielos',
      'Pintura de exteriores y fachadas con recubrimientos impermeabilizantes elastoméricos',
      'Estuco veneciano, texturas rústicas y acabados arquitectónicos de alta gama',
      'Pintura en esmalte sintético y anticorrosivo para rejas, portones y ventanas metálicas',
      'Lijado, barnizado y restauración de puertas y elementos de carpintería en madera',
      'Preparación integral de superficies: raspado de pintura soplada, masillado y lijado',
      'Impermeabilización preventiva de muros con humedad y sellado de microfisuras',
      'Protección rigurosa de pisos, zócalos, muebles y marcos con plástico y cinta',
      'Asesoría en combinación de color y cartas cromáticas para iluminar espacios',
      'Limpieza completa y entrega de áreas impecables listas para habitar'
    ];
  }

  // 8. Tutorías Escolares e Idiomas
  if (t.includes('tutor') || t.includes('clase') || t.includes('idioma') || t.includes('ingles') || t.includes('profesor') || t.includes('educac') || id === 8) {
    return [
      'Nivelación y refuerzo académico en Matemáticas, Álgebra, Trigonometría y Cálculo',
      'Clases particulares de Inglés conversacional, comprensión auditiva y gramática',
      'Preparación intensiva para pruebas de estado Saber 11 (Icfes) y admisión universitaria',
      'Refuerzo escolar guiado en Física, Química y Ciencias Naturales',
      'Tutoría en lectoescritura, comprensión de textos y redacción de ensayos académicos',
      'Técnicas de estudio personalizadas, manejo del tiempo y preparación para exámenes',
      'Acompañamiento en tareas dirigidas y proyectos escolares para primaria y secundaria',
      'Entrenamiento para certificaciones internacionales de idioma (TOEFL, IELTS, Cambridge)',
      'Metodología lúdica e interactiva orientada a la motivación y confianza del estudiante',
      'Reportes periódicos de avance y retroalimentación pedagógica para acudientes'
    ];
  }

  // 9. Enfermería y Cuidado de Adulto Mayor
  if (t.includes('enferm') || t.includes('cuidado') || t.includes('adulto') || t.includes('salud') || t.includes('terapia') || id === 9) {
    return [
      'Acompañamiento asistencial diario y cuidado compasivo en el domicilio del paciente',
      'Administración puntual de medicamentos según estricta formulación médica',
      'Control diario de signos vitales: presión arterial, frecuencia cardíaca y glucometría',
      'Curación técnica de heridas quirúrgicas, úlceras por presión y retiro de puntos',
      'Asistencia integral en higiene personal: baño en cama o ducha y cambio de pañal',
      'Movilización segura, prevención de caídas y cambios posturales programados',
      'Acompañamiento a citas médicas, terapias de rehabilitación y trámites de salud',
      'Apoyo en la alimentación balanceada según dietas especiales y requerimientos nutricionales',
      'Estimulación cognitiva, ejercicios de memoria y actividades recreativas en casa',
      'Registro diario de evolución y comunicación constante con familiares y médicos'
    ];
  }

  // 10. Limpieza Profunda y Aseo Locativo
  if (t.includes('limpieza') || t.includes('aseo') || t.includes('desinfec') || t.includes('hogar') || t.includes('lavado') || id === 10) {
    return [
      'Desinfección profunda y desmanchado de baños, sanitarios, azulejos y griferías',
      'Lavado intensivo y desengrase de cocinas integrales, estufas, hornos y campanas',
      'Aspirado, desmanchado y desinfección de alfombras, colchones y sofás tapizados',
      'Limpieza técnica de ventanales, espejos y cancelería de vidrio sin rayas ni marcas',
      'Barrido, trapeado, desmanchado y abrillantado de pisos según su material',
      'Limpieza exhaustiva post-obra y remoción de restos de pintura y polvo de construcción',
      'Aseo integral para entregas o mudanzas de apartamentos y casas en arriendo',
      'Desinfección ambiental con productos de alta eficiencia y fragancias agradables',
      'Lavado y planchado ordenado de prendas delicadas, lencería y mantelería',
      'Organización integral de clósets, vestidores, alacenas y áreas de despensa'
    ];
  }

  // Fallback por defecto con 10 actividades técnicas completas
  return [
    'Evaluación técnica inicial y diagnóstico detallado en el sitio del servicio',
    'Elaboración de cotización clara y transparente con desglose de materiales y mano de obra',
    'Ejecución del servicio con herramientas profesionales y normas de bioseguridad',
    'Reemplazo de componentes defectuosos con repuestos certificados y de primera línea',
    'Pruebas operativas rigurosas de funcionamiento tras la intervención técnica',
    'Limpieza, orden y recolección de residuos en el área de trabajo intervenida',
    'Capacitación al cliente sobre uso adecuado y cuidados preventivos del servicio',
    'Emisión de reporte técnico con recomendaciones de mantenimiento futuro',
    'Seguimiento posterior al servicio para asegurar la total satisfacción del usuario',
    'Garantía por escrito de cumplimiento y respaldo oficial a través de Conecta 360'
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
  let providerActivities = fallback.providerProfile?.activities;
  let featuredActivities: string[] | undefined = undefined;

  try {
    const session = getCurrentUser();
    if (session && String(session.id) === String(id) && session.services?.[0]) {
      const s = session.services[0];
      if (s.activities && s.activities.length > 0) {
        providerActivities = s.activities;
      }
      if (s.featuredActivities && s.featuredActivities.length > 0) {
        featuredActivities = s.featuredActivities;
      }
    }
  } catch (e) {}

  const srvName = data.providerProfile?.providerServices?.[0]?.service?.name || '';
  const resolvedTitle = data.providerProfile?.title || fallback.providerProfile?.title || srvName || 'Servicio Profesional';

  return {
    ...data,
    profile: {
      ...fallback.profile,
      ...data.profile,
      showWhatsApp: data.profile?.showWhatsApp ?? fallback.profile?.showWhatsApp ?? true,
      whatsappNumber: data.profile?.whatsappNumber || data.phone || fallback.profile?.whatsappNumber || fallback.phone,
    },
    providerProfile: {
      ...fallback.providerProfile,
      ...data.providerProfile,
      title: resolvedTitle,
      hourlyRate: data.providerProfile?.hourlyRate || fallback.providerProfile?.hourlyRate || 45000,
      isVerified: data.providerProfile?.isVerified !== undefined ? Boolean(data.providerProfile.isVerified) : Boolean(fallback.providerProfile?.isVerified),
      activities: providerActivities || fallback.providerProfile?.activities || getDefaultActivities(resolvedTitle, id),
      featuredActivities: featuredActivities,
      coverageZones: fallback.providerProfile?.coverageZones || 'Cali (Norte, Sur, Oeste, Centro), Palmira y Jamundí',
      experienceYears: fallback.providerProfile?.experienceYears || 6,
    } as any,
  };
}

function getDetailedProviderData(id: number): UserData {
  const providersMap: Record<number, Partial<UserData>> = {
    999: {
      firstName: 'Carlos Andrés',
      lastName: 'Rodríguez',
      phone: '+57 315 789 4521',
      profile: {
        city: 'Cali',
        department: 'Valle del Cauca',
        country: 'Colombia',
        profession: 'Técnico Electricista e Instalaciones',
        bio: 'Especialista en instalaciones eléctricas residenciales, cuadros de mando y mantenimiento 24/7 en Cali y área metropolitana.',
        profilePhoto: '/images/service-electricista.jpg',
        showWhatsApp: true,
        whatsappNumber: '+57 315 789 4521',
      },
      providerProfile: {
        id: 999,
        title: 'Instalaciones Eléctricas y Reparaciones Residenciales',
        hourlyRate: 45000,
        isVerified: true,
        rating: 4.9,
        totalReviews: 48,
        experienceYears: 8,
        coverageZones: 'Cali (Norte, Sur, Oeste), Jamundí, Yumbo',
        activities: getDefaultActivities('electricidad', 999),
        bio: 'Especialista en instalaciones eléctricas residenciales, cuadros de mando y mantenimiento 24/7 en Cali y área metropolitana.',
      },
    },
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
        showWhatsApp: true,
        whatsappNumber: '+57 315 123 4567',
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
        activities: getDefaultActivities('cerrajeria', 1),
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
        showWhatsApp: true,
        whatsappNumber: '+57 316 234 5678',
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
        activities: getDefaultActivities('electricidad', 2),
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
        showWhatsApp: true,
        whatsappNumber: '+57 317 345 6789',
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
        activities: getDefaultActivities('tecnologia', 3),
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
        showWhatsApp: true,
        whatsappNumber: '+57 318 456 7890',
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
        activities: getDefaultActivities('plomeria', 4),
        bio: 'Plomero profesional con equipos de detección por ultrasonido y destapes con sonda eléctrica.',
      },
    },
    5: {
      firstName: 'Roberto',
      lastName: 'Vaca',
      phone: '+57 319 567 8901',
      profile: {
        city: 'Cali',
        department: 'Valle del Cauca',
        country: 'Colombia',
        profession: 'Maestro de Mantenimiento Locativo',
        bio: 'Especialista en mantenimiento integral locativo, drywall, resanes, carpintería y reparaciones residenciales en Cali.',
        profilePhoto: null,
        showWhatsApp: true,
        whatsappNumber: '+57 319 567 8901',
      },
      providerProfile: {
        id: 5,
        title: 'Reparaciones y Mantenimiento Locativo',
        hourlyRate: 38000,
        isVerified: true,
        rating: 4.8,
        totalReviews: 110,
        experienceYears: 9,
        coverageZones: 'Cali (Norte, Sur, Oriente, Oeste), Yumbo',
        activities: getDefaultActivities('mantenimiento', 5),
        bio: 'Especialista en mantenimiento integral locativo, drywall, resanes, carpintería y reparaciones residenciales en Cali.',
      },
    },
    6: {
      firstName: 'Diana',
      lastName: 'Castillo',
      phone: '+57 310 678 9012',
      profile: {
        city: 'Cali',
        department: 'Valle del Cauca',
        country: 'Colombia',
        profession: 'Diseñadora Visual y Publicista Digital',
        bio: 'Diseñadora profesional enfocada en marcas, branding corporativo, publicidad para redes sociales y piezas de alto impacto.',
        profilePhoto: null,
        showWhatsApp: true,
        whatsappNumber: '+57 310 678 9012',
      },
      providerProfile: {
        id: 6,
        title: 'Diseño Gráfico y Publicidad Digital',
        hourlyRate: 42000,
        isVerified: true,
        rating: 4.9,
        totalReviews: 64,
        experienceYears: 6,
        coverageZones: 'Cali, Palmira y modalidad 100% remota',
        activities: getDefaultActivities('diseno', 6),
        bio: 'Diseñadora profesional enfocada en marcas, branding corporativo, publicidad para redes sociales y piezas de alto impacto.',
      },
    },
    7: {
      firstName: 'Esteban',
      lastName: 'Ríos',
      phone: '+57 311 789 0123',
      profile: {
        city: 'Cali',
        department: 'Valle del Cauca',
        country: 'Colombia',
        profession: 'Pintor Profesional y Especialista en Acabados',
        bio: 'Pintura interior y exterior de alta durabilidad, estucos venecianos, preparación de superficies y acabados arquitectónicos en Cali.',
        profilePhoto: null,
        showWhatsApp: true,
        whatsappNumber: '+57 311 789 0123',
      },
      providerProfile: {
        id: 7,
        title: 'Pintura Interior y Acabados de Muros',
        hourlyRate: 32000,
        isVerified: true,
        rating: 4.7,
        totalReviews: 92,
        experienceYears: 11,
        coverageZones: 'Cali, Jamundí, Candelaria y Palmira',
        activities: getDefaultActivities('pintura', 7),
        bio: 'Pintura interior y exterior de alta durabilidad, estucos venecianos, preparación de superficies y acabados arquitectónicos en Cali.',
      },
    },
    8: {
      firstName: 'Camila',
      lastName: 'Gómez',
      phone: '+57 312 890 1234',
      profile: {
        city: 'Cali',
        department: 'Valle del Cauca',
        country: 'Colombia',
        profession: 'Licenciada en Pedagogía e Idiomas',
        bio: 'Tutorías personalizadas en matemáticas, inglés y preparación para exámenes Saber 11 con metodologías pedagógicas adaptadas.',
        profilePhoto: null,
        showWhatsApp: true,
        whatsappNumber: '+57 312 890 1234',
      },
      providerProfile: {
        id: 8,
        title: 'Tutorías Escolares e Idiomas',
        hourlyRate: 30000,
        isVerified: true,
        rating: 4.9,
        totalReviews: 76,
        experienceYears: 5,
        coverageZones: 'Cali (Presencial) y clases virtuales a todo Colombia',
        activities: getDefaultActivities('tutorias', 8),
        bio: 'Tutorías personalizadas en matemáticas, inglés y preparación para exámenes Saber 11 con metodologías pedagógicas adaptadas.',
      },
    },
    9: {
      firstName: 'Patricia',
      lastName: 'Méndez',
      phone: '+57 313 901 2345',
      profile: {
        city: 'Cali',
        department: 'Valle del Cauca',
        country: 'Colombia',
        profession: 'Enfermera Profesional y Cuidadora Certificada',
        bio: 'Atención domiciliaria a pacientes y adultos mayores con calidez humana, administración de medicamentos y cuidados posoperatorios.',
        profilePhoto: null,
        showWhatsApp: true,
        whatsappNumber: '+57 313 901 2345',
      },
      providerProfile: {
        id: 9,
        title: 'Enfermería y Cuidado de Adulto Mayor',
        hourlyRate: 40000,
        isVerified: true,
        rating: 5.0,
        totalReviews: 89,
        experienceYears: 13,
        coverageZones: 'Cali metropolitana y Jamundí',
        activities: getDefaultActivities('enfermeria', 9),
        bio: 'Atención domiciliaria a pacientes y adultos mayores con calidez humana, administración de medicamentos y cuidados posoperatorios.',
      },
    },
    10: {
      firstName: 'Sandra',
      lastName: 'Botero',
      phone: '+57 314 012 3456',
      profile: {
        city: 'Cali',
        department: 'Valle del Cauca',
        country: 'Colombia',
        profession: 'Especialista en Aseo y Desinfección Locativa',
        bio: 'Limpieza profunda residencial, comercial y post-obra con productos biodegradables de alta eficiencia y personal de total confianza.',
        profilePhoto: null,
        showWhatsApp: true,
        whatsappNumber: '+57 314 012 3456',
      },
      providerProfile: {
        id: 10,
        title: 'Limpieza Profunda y Aseo Locativo',
        hourlyRate: 28000,
        isVerified: true,
        rating: 4.8,
        totalReviews: 142,
        experienceYears: 8,
        coverageZones: 'Cali Norte, Sur, Oeste y Jamundí',
        activities: getDefaultActivities('limpieza', 10),
        bio: 'Limpieza profunda residencial, comercial y post-obra con productos biodegradables de alta eficiencia y personal de total confianza.',
      },
    },
  };

  const current = providersMap[id] || {
    firstName: 'Profesional',
    lastName: `Especialista #${id}`,
    phone: '+57 315 789 4521',
    profile: {
      city: 'Cali',
      department: 'Valle del Cauca',
      country: 'Colombia',
      profession: 'Especialista en Servicios para el Hogar',
      bio: 'Profesional verificado en Conecta 360 con garantía de calidad y atención técnica personalizada.',
      profilePhoto: null,
      showWhatsApp: true,
      whatsappNumber: '+57 315 789 4521',
    },
    providerProfile: {
      id: id,
      title: 'Servicio Técnico Profesional Calificado',
      hourlyRate: 45000,
      isVerified: true,
      rating: 4.9,
      totalReviews: 35,
      experienceYears: 6,
      coverageZones: 'Cali y municipios aledaños del Valle del Cauca',
      activities: getDefaultActivities('general', id),
      bio: 'Profesional verificado en Conecta 360 con garantía de calidad y atención técnica personalizada.',
    },
  };

  let showWhatsApp = true;
  let whatsappNumber = current.phone || '+57 315 789 4521';
  try {
    const session = getCurrentUser();
    if (session && String(session.id) === String(id)) {
      showWhatsApp = session.profile.showWhatsApp ?? true;
      whatsappNumber = session.profile.whatsappNumber || session.phone;
    }
  } catch (e) {}

  return {
    id: id || 1,
    uuid: `usr-prov-${id}`,
    firstName: current.firstName || 'Profesional',
    lastName: current.lastName || 'Conecta 360',
    email: `${(current.firstName || 'pro').toLowerCase()}@conecta360.co`,
    phone: current.phone || '+57 315 789 4521',
    status: 'ACTIVE',
    role: { name: 'PROVIDER', description: 'Proveedor' },
    profile: {
      ...current.profile,
      showWhatsApp,
      whatsappNumber,
    } as any,
    providerProfile: {
      ...current.providerProfile,
      activities: current.providerProfile?.activities || getDefaultActivities(current.providerProfile?.title || '', id),
    } as any,
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

