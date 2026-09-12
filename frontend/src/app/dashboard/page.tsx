'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Wrench,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  DollarSign,
  Tag,
  FileText,
  UploadCloud,
  ExternalLink,
  Shield,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  LogOut,
  ChevronRight,
  Info,
  Check,
  Zap,
  Phone,
  Mail,
  Edit3,
  X
} from 'lucide-react';
import {
  getCurrentUser,
  setCurrentUser,
  getInitialProviderSession,
  addServiceToUser,
  removeServiceFromUser,
  UserSession,
  ProviderServiceItem
} from '@/lib/auth';
import { getGlobalSettings } from '@/lib/system-settings';
import { COLOMBIA_DEPARTMENTS, getCitiesForDepartment, DEFAULT_CITY, DEFAULT_DEPARTMENT } from '@/lib/colombia-data';

function UserDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openNewServiceParam = searchParams.get('action') === 'new-service';

  const [user, setUser] = useState<UserSession | null>(null);
  const [globalSettings, setGlobalSettings] = useState(getGlobalSettings());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Categorías disponibles con requerimiento de título
  const categoriesList = [
    { id: 1, name: 'Cerrajería', requiresTitle: true, titleLabel: 'Certificación Técnica en Cerrajería' },
    { id: 2, name: 'Electricidad', requiresTitle: true, titleLabel: 'Matrícula Profesional CONTE / COPNIA' },
    { id: 3, name: 'Tecnología', requiresTitle: false, titleLabel: 'Certificación Opcional en TI' },
    { id: 4, name: 'Reparaciones', requiresTitle: false, titleLabel: 'Certificado de Oficio' },
    { id: 5, name: 'Educación', requiresTitle: true, titleLabel: 'Título Profesional / Licenciatura Docente' },
    { id: 6, name: 'Diseño', requiresTitle: false, titleLabel: 'Portafolio o Título Opcional' },
    { id: 7, name: 'Salud y Bienestar', requiresTitle: true, titleLabel: 'Registro RETHUS / Tarjeta Profesional de Salud' },
    { id: 8, name: 'Plomería y Construcción', requiresTitle: true, titleLabel: 'Certificado SENA o Tarjeta Técnica' },
    { id: 9, name: 'Otros Servicios', requiresTitle: false, titleLabel: 'Certificado de Idoneidad' },
  ];

  // Estado del formulario de agregar servicio
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [serviceTitle, setServiceTitle] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(globalSettings.defaultHourlyRate);
  const [department, setDepartment] = useState(DEFAULT_DEPARTMENT);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [coverageZones, setCoverageZones] = useState('Cali (Norte, Sur, Centro), Jamundí y Yumbo');
  
  // Actividades relacionadas (máximo 10)
  const [activityInput, setActivityInput] = useState('');
  const [activities, setActivities] = useState<string[]>([]);
  
  // Título si la categoría lo requiere
  const [titleCertification, setTitleCertification] = useState('');
  const [certificateFileName, setCertificateFileName] = useState('');

  useEffect(() => {
    let session = getCurrentUser();
    if (!session) {
      // Si no hay sesión, inicializar con sesión de demostración de prestador en Cali
      session = getInitialProviderSession();
      setCurrentUser(session);
    }
    setUser(session);
    setGlobalSettings(getGlobalSettings());
    setHourlyRate(getGlobalSettings().defaultHourlyRate);

    if (openNewServiceParam) {
      if (session.plan === 'FREE' && session.services.length >= getGlobalSettings().freePlanMaxServices) {
        setShowUpgradeModal(true);
      } else {
        setIsModalOpen(true);
      }
    }
  }, [openNewServiceParam]);

  useEffect(() => {
    const cities = getCitiesForDepartment(department);
    setAvailableCities(cities);
    if (!cities.includes(city)) {
      setCity(cities[0] || 'Cali');
    }
  }, [department]);

  const activeCategory = categoriesList.find((c) => c.id === selectedCategoryId) || categoriesList[0];

  const handleAddActivity = () => {
    if (!activityInput.trim()) return;
    if (activities.length >= globalSettings.maxActivitiesPerService) {
      alert(`El límite máximo es de ${globalSettings.maxActivitiesPerService} actividades.`);
      return;
    }
    if (activities.includes(activityInput.trim())) return;

    setActivities([...activities, activityInput.trim()]);
    setActivityInput('');
  };

  const handleRemoveActivity = (indexToRemove: number) => {
    setActivities(activities.filter((_, i) => i !== indexToRemove));
  };

  const handleOpenAddService = () => {
    if (!user) return;
    // REGLA: Si es plan gratis, solo 1 servicio
    if (user.plan === 'FREE' && user.services.length >= globalSettings.freePlanMaxServices) {
      setShowUpgradeModal(true);
      return;
    }

    // Reset form y abrir
    setServiceTitle('');
    setSelectedCategoryId(1);
    setHourlyRate(globalSettings.defaultHourlyRate);
    setActivities(['Instalación y mantenimiento', 'Servicio a domicilio']);
    setTitleCertification('');
    setCertificateFileName('');
    setIsModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle.trim()) {
      alert('Por favor ingresa el nombre de tu servicio.');
      return;
    }

    if (activeCategory.requiresTitle && !titleCertification.trim() && !certificateFileName.trim()) {
      alert(`La categoría ${activeCategory.name} requiere ingresar tu título o matrícula profesional.`);
      return;
    }

    const result = addServiceToUser({
      title: serviceTitle.trim(),
      categoryId: activeCategory.id,
      categoryName: activeCategory.name,
      hourlyRate: Number(hourlyRate) || globalSettings.defaultHourlyRate,
      activities: activities.slice(0, 10),
      city,
      department,
      coverageZones,
      titleRequired: activeCategory.requiresTitle,
      titleCertification: titleCertification.trim() || undefined,
      certificateFileName: certificateFileName.trim() || undefined,
    });

    if (result.success) {
      setUser(getCurrentUser());
      setIsModalOpen(false);
      setToastMessage('¡Servicio agregado exitosamente!');
      setTimeout(() => setToastMessage(null), 4000);
    } else {
      alert(result.message);
    }
  };

  const handleDeleteService = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      removeServiceFromUser(id);
      setUser(getCurrentUser());
      setToastMessage('Servicio eliminado.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    router.push('/');
  };

  // Simular cambio de estado de verificación para testing del usuario
  const toggleVerificationStatus = () => {
    if (!user) return;
    const updatedUser: UserSession = {
      ...user,
      status: user.status === 'PENDING' ? 'APPROVED' : 'PENDING',
      isVerified: user.status === 'PENDING',
    };
    setCurrentUser(updatedUser);
    setUser(updatedUser);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-[#0056d2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-16 sm:h-20 flex items-center shadow-xs">
        <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/images/logo-conecta-nav.png"
              alt="CONECTA 360"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0056d2] px-3 py-2"
            >
              Ver Portal Público
            </Link>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0056d2] font-black text-xs flex items-center justify-center border border-blue-200">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <span className="text-xs font-bold text-slate-800 hidden sm:block">
                {user.firstName} {user.lastName}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notificación */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-5">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* 1. Header Profile Banner & Verification Badge */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#0056d2] to-blue-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
                  {user.profile.profilePhoto ? (
                    <img
                      src={user.profile.profilePhoto}
                      alt={user.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </span>
                  )}
                </div>

                {/* Status Indicator Dot */}
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    user.isVerified ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  {user.isVerified ? <Check className="w-3 h-3 stroke-[3]" /> : <Clock className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {user.firstName} {user.lastName}
                  </h1>

                  {/* Badge de Verificación */}
                  {user.isVerified ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-[#0056d2] border border-blue-200 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Profesional Verificado</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300 shadow-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pendiente de Verificación</span>
                    </span>
                  )}

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                    Plan {user.plan === 'FREE' ? 'Gratuito' : 'Pro'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {user.profile.profession || 'Prestador de Servicios'} &bull;{' '}
                  <span className="text-[#0056d2] font-semibold">
                    {user.profile.city}, {user.profile.department} (Colombia)
                  </span>
                </p>

                <p className="text-xs text-slate-400">
                  {user.email} &bull; {user.phone}
                </p>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={toggleVerificationStatus}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
                title="Alternar estado de verificación para probar ambos estados de tarjeta"
              >
                {user.isVerified ? 'Simular Pendiente' : 'Simular Verificado'}
              </button>

              <button
                onClick={handleOpenAddService}
                className="px-5 py-2.5 rounded-xl bg-[#0056d2] hover:bg-[#0046a8] active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Servicio</span>
              </button>
            </div>
          </div>

          {/* Banner de Estado de Verificación al Registrarse */}
          {!user.isVerified && (
            <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">
                  Estado actual: Tu registro fue exitoso y tu verificación está PENDIENTE.
                </p>
                <p className="text-amber-800 leading-relaxed">
                  Puedes iniciar sesión con normalidad, administrar tus servicios y configurar tu perfil. En el portal público tu tarjeta se mostrará con la etiqueta informativa <span className="font-bold">"Pendiente de Verificación"</span> hasta que el equipo administrativo valide tus títulos y documentos.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2. Grid de Reglas del Sistema & Plan Gratuito */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card: Plan Gratuito */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tu Plan Actual
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-200">
                Activo
              </span>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Plan Gratuito</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Límite de <span className="font-bold text-slate-800">1 servicio</span> publicado en la plataforma.
              </p>
            </div>
            {/* Barra de progreso */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Servicios Usados:</span>
                <span>
                  {user.services.length} / {globalSettings.freePlanMaxServices}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    user.services.length >= globalSettings.freePlanMaxServices
                      ? 'bg-amber-500 w-full'
                      : 'bg-[#0056d2] w-0'
                  }`}
                />
              </div>
            </div>
            {user.services.length >= globalSettings.freePlanMaxServices && (
              <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 p-2 rounded-lg">
                Has alcanzado el límite de 1 servicio del plan gratis.
              </p>
            )}
          </div>

          {/* Card: Tarifa Base Global Configurada por Admin */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tarifa Global del Administrador
            </span>
            <div>
              <div className="text-2xl font-black text-[#0056d2]">
                ${globalSettings.defaultHourlyRate.toLocaleString('es-CO')} COP/h
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tarifa de cobro base sugerida por la administración de Conecta 360 en Colombia.
              </p>
            </div>
            <div className="text-xs text-slate-600 flex items-center space-x-1.5 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aplica por defecto a nuevos servicios</span>
            </div>
          </div>

          {/* Card: Cobertura y Transporte */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ubicación de Operación
            </span>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-[#ef4444]" />
                <span>{user.profile.city}, {user.profile.department}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Centro de operaciones con cobertura a terminales y transporte intermunicipal.
              </p>
            </div>
            <div className="text-[11px] font-bold text-[#0056d2] bg-blue-50 px-2.5 py-1.5 rounded-xl inline-block">
              Filtro activo de plataforma: Cali
            </div>
          </div>
        </div>

        {/* 3. Mis Servicios Publicados */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Mis Servicios Publicados
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Gestiona la oferta que ven los usuarios en Cali y en todo el país
              </p>
            </div>

            <button
              onClick={handleOpenAddService}
              className="px-4 py-2 bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Servicio</span>
            </button>
          </div>

          {user.services.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0056d2] mx-auto flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-800">
                Aún no has agregado ningún servicio
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tu cuenta de prestador te permite publicar tu servicio con tarifa sugerida por el administrador, ubicación en Cali y hasta 10 actividades relacionadas.
              </p>
              <button
                onClick={handleOpenAddService}
                className="px-6 py-2.5 bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20"
              >
                Agregar mi primer servicio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {user.services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="inline-block bg-blue-50 text-[#0056d2] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {service.categoryName}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {service.title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {service.city}, {service.department} &bull; {service.coverageZones}
                        </span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-400 block font-semibold">Tarifa/hora</span>
                      <span className="text-lg font-black text-[#0056d2]">
                        ${Number(service.hourlyRate).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>

                  {/* Actividades relacionadas (Límite de 10) */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">
                        Actividades y Especialidades ({service.activities.length}/10):
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {service.activities.map((act, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center space-x-1"
                        >
                          <Tag className="w-2.5 h-2.5 text-[#0056d2]" />
                          <span>{act}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Requerimiento de Título */}
                  {service.titleRequired && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
                        <FileText className="w-3.5 h-3.5 text-[#0056d2]" />
                        <span>Título / Certificación Registrada:</span>
                      </div>
                      <p className="text-slate-600 font-medium pl-5">
                        {service.titleCertification || 'Documento adjunto en revisión'}
                      </p>
                    </div>
                  )}

                  {/* Vista Previa de la Tarjeta Pública */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {user.isVerified ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center space-x-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Tarjeta Pública: Verificado</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Tarjeta Pública: Pendiente de Verificación</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Eliminar servicio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Previsualización en Vivo de cómo verán los clientes tu tarjeta en Cali */}
        {user.services.length > 0 && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-black text-blue-400 uppercase tracking-wider">
                  Previsualización en Vivo
                </span>
                <h3 className="text-xl font-black tracking-tight">
                  Así se ve tu tarjeta en los resultados de búsqueda de Cali
                </h3>
              </div>
              <Link
                href="/"
                className="text-xs font-bold text-blue-300 hover:text-white flex items-center space-x-1"
              >
                <span>Ver en la página principal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Renderizado idéntico de la tarjeta del Home */}
            <div className="max-w-sm bg-white text-slate-800 border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                <img
                  src={user.profile.profilePhoto || '/images/service-electricista.jpg'}
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />

                {/* Badge de Verificación o Pendiente */}
                {user.isVerified ? (
                  <div className="absolute top-2 right-2 bg-[#0056d2] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    <span>Verificado</span>
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Pendiente de Verificación</span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-[#0056d2]">
                  <Wrench className="w-3 h-3 text-[#0056d2]" />
                  <span>{user.services[0].categoryName}</span>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                  {user.services[0].title}
                </h4>

                <p className="text-xs text-slate-600 font-semibold">
                  {user.firstName} {user.lastName} &bull;{' '}
                  <span className="text-slate-500 font-normal">
                    {user.profile.profession || 'Especialista'}
                  </span>
                </p>

                <p className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>
                    {user.services[0].city}, {user.services[0].department}
                  </span>
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-black text-[#0056d2]">
                    Desde ${Number(user.services[0].hourlyRate).toLocaleString('es-CO')}/h
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Tarifa configurada por admin
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Agregar Nuevo Servicio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-[#0056d2] uppercase tracking-wider">
                  Plan Gratuito: 1 Servicio
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Publicar Nuevo Servicio
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              {/* Selector de Categoría */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Categoría del Servicio *
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none text-slate-800 font-semibold"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.requiresTitle ? '(Requiere acreditación de título)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Título del Servicio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Nombre del Servicio que Brindas *
                </label>
                <input
                  type="text"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  placeholder="Ej: Instalaciones Eléctricas Residenciales y Cuadros 24/7"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none text-slate-800"
                />
              </div>

              {/* Tarifa de Cobro con valor configurado por Admin */}
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0056d2] uppercase tracking-wide">
                    Tarifa de Cobro por Hora (COP) *
                  </label>
                  <span className="text-[10px] font-bold bg-[#0056d2] text-white px-2 py-0.5 rounded-full">
                    Sugerida por Admin
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-black text-slate-500">$</span>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    min={globalSettings.minHourlyRate}
                    step={1000}
                    required
                    className="w-full px-3.5 py-2 text-base font-black bg-white border border-slate-200 rounded-xl focus:border-[#0056d2] outline-none text-slate-900"
                  />
                  <span className="text-xs font-bold text-slate-600 shrink-0">COP / hora</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  La tarifa base establecida globalmente por el superadministrador es de{' '}
                  <span className="font-bold text-[#0056d2]">
                    ${globalSettings.defaultHourlyRate.toLocaleString('es-CO')} COP/h
                  </span>
                  . Puedes confirmarla o ajustarla a tu oferta.
                </p>
              </div>

              {/* Ubicación en Colombia con Cali */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Departamento (Colombia) *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none text-slate-800 font-medium"
                  >
                    {COLOMBIA_DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Ciudad (Con acceso a transportes) *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none text-slate-800 font-medium"
                  >
                    {availableCities.map((c) => (
                      <option key={c} value={c}>
                        {c} {c === 'Cali' ? '(Inicialmente Activa)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Zonas de Cobertura / Desplazamiento
                </label>
                <input
                  type="text"
                  value={coverageZones}
                  onChange={(e) => setCoverageZones(e.target.value)}
                  placeholder="Ej: Cali Norte, Sur, Oeste, Jamundí, Yumbo y vía aeropuerto"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none text-slate-800"
                />
              </div>

              {/* Actividades Relacionadas con Límite de 10 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Actividades Relacionadas al Servicio *
                  </label>
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      activities.length >= 10
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-[#0056d2]'
                    }`}
                  >
                    {activities.length} / 10 actividades permitidas
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activityInput}
                    onChange={(e) => setActivityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddActivity();
                      }
                    }}
                    disabled={activities.length >= 10}
                    placeholder={
                      activities.length >= 10
                        ? 'Has alcanzado el límite de 10 actividades'
                        : 'Ej: Cableado estructurado, Tableros, Iluminación...'
                    }
                    className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#0056d2] outline-none text-slate-800 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddActivity}
                    disabled={activities.length >= 10 || !activityInput.trim()}
                    className="px-4 py-2 bg-[#0056d2] hover:bg-[#0046a8] disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    Añadir
                  </button>
                </div>

                {/* Lista de tags activos */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activities.map((act, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium flex items-center space-x-1.5 shadow-2xs"
                    >
                      <span>{act}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveActivity(index)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Título si requiere la Categoría */}
              {activeCategory.requiresTitle && (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Esta categoría requiere acreditación de Título Profesional</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {activeCategory.titleLabel} *
                    </label>
                    <input
                      type="text"
                      value={titleCertification}
                      onChange={(e) => setTitleCertification(e.target.value)}
                      placeholder="Ej: Registro CONTE TE-1 94827 / Copnia / Tarjeta Profesional"
                      required={activeCategory.requiresTitle}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-[#0056d2] outline-none text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Adjuntar Soporte de Título o Certificación (PDF o Imagen)
                    </label>
                    <div className="border-2 border-dashed border-amber-300 bg-white/70 rounded-xl p-4 text-center cursor-pointer hover:bg-white transition-colors">
                      <UploadCloud className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-700">
                        {certificateFileName || 'Haz clic para seleccionar archivo o arrástralo aquí'}
                      </p>
                      <p className="text-[10px] text-slate-400">PDF, JPG o PNG hasta 10MB</p>
                      <input
                        type="file"
                        className="hidden"
                        id="fileUpload"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setCertificateFileName(e.target.files[0].name);
                          }
                        }}
                      />
                      <label
                        htmlFor="fileUpload"
                        className="mt-2 inline-block px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Examinar documento
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón Guardar */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0056d2] hover:bg-[#0046a8] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20"
                >
                  Publicar Servicio en Cali
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Límite del Plan Gratuito Alcanzado */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <Zap className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Límite del Plan Gratuito
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              En el <span className="font-bold text-slate-800">Plan Gratuito</span> solo puedes tener{' '}
              <span className="font-bold text-[#0056d2]">1 servicio publicado</span>. Para ofrecer más especialidades y destacar tus servicios en los primeros resultados de Cali, actualiza a nuestro Plan Profesional.
            </p>

            <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-2xl text-left space-y-1 text-xs">
              <p className="font-bold text-[#0056d2]">Beneficios del Plan Pro:</p>
              <ul className="text-slate-600 space-y-1 list-disc list-inside">
                <li>Publicación ilimitada de servicios</li>
                <li>Insignia dorada de Profesional Destacado</li>
                <li>Prioridad en búsquedas de Cali y el Valle</li>
              </ul>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  alert('¡Solicitud de Plan Pro recibida! Un asesor de Conecta 360 se contactará.');
                  setShowUpgradeModal(false);
                }}
                className="flex-1 py-2.5 bg-[#0056d2] hover:bg-[#0046a8] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Subir a Plan Pro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 mt-auto">
        &copy; {new Date().getFullYear()} CONECTA 360 &bull; Panel de Control del Prestador en Colombia (Sede Principal Cali).
      </footer>
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 border-4 border-[#0056d2] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <UserDashboardContent />
    </React.Suspense>
  );
}

