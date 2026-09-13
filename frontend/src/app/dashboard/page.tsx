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
  ShieldCheck,
  Award,
  LogOut,
  Check,
  Zap,
  Phone,
  Mail,
  Edit3,
  X,
  Star,
  RefreshCw,
  Calendar,
  CreditCard,
  ThumbsUp,
  MessageSquare,
  Briefcase,
  Users,
  Bell,
  MessageCircle,
  CheckSquare,
  Square,
  ShieldAlert,
  AlertCircle,
  LayoutDashboard
} from 'lucide-react';
import {
  getCurrentUser,
  setCurrentUser,
  getInitialProviderSession,
  getInitialClientSession,
  addServiceToUser,
  removeServiceFromUser,
  updateServiceHistoryStatus,
  updateUserProfile,
  toggleUserRole,
  payUserPlatformDebt,
  calculateUserPlatformDebt,
  confirmServiceBooking,
  rejectServiceBooking,
  setFeaturedActivitiesForService,
  updateWhatsAppSettings,
  getUserNotifications,
  markNotificationAsRead,
  AppNotification,
  UserSession,
  ProviderServiceItem,
  ServiceHistoryItem
} from '@/lib/auth';
import { getGlobalSettings, getRejectionReasons, RejectionReasonItem } from '@/lib/system-settings';
import { COLOMBIA_DEPARTMENTS, getCitiesForDepartment, DEFAULT_CITY, DEFAULT_DEPARTMENT } from '@/lib/colombia-data';
import { fetchBookingsByClient, fetchBookingsByProvider, fetchNotificationsByUser } from '@/lib/admin-data';
import { showSuccess, showError, showWarning, showConfirm } from '@/lib/alerts';

function UserDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openNewServiceParam = searchParams.get('action') === 'new-service';

  const [user, setUser] = useState<UserSession | null>(null);
  const [globalSettings, setGlobalSettings] = useState(getGlobalSettings());
  const [activeTab, setActiveTab] = useState<'servicios' | 'historial' | 'cliente' | 'perfil'>('servicios');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal para pagar deuda con la plataforma (Modo Prestador)
  const [showDebtPaymentModal, setShowDebtPaymentModal] = useState(false);
  const [debtPaymentMethod, setDebtPaymentMethod] = useState<'PSE' | 'BANCOLOMBIA' | 'NEQUI' | 'TARJETA'>('PSE');
  const [debtPaymentProcessing, setDebtPaymentProcessing] = useState(false);

  // Modal para calificar servicio (Modo Cliente)
  const [ratingModalItem, setRatingModalItem] = useState<ServiceHistoryItem | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Sistema de Notificaciones
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Switch de WhatsApp en el Perfil Público (ON / OFF)
  const [whatsAppToggle, setWhatsAppToggle] = useState(true);
  const [whatsAppInput, setWhatsAppInput] = useState('');

  // Modal de Rechazo de Solicitud con justificación y cálculo de puntos (Modo Prestador)
  const [rejectModalItem, setRejectModalItem] = useState<ServiceHistoryItem | null>(null);
  const [rejectionOptions, setRejectionOptions] = useState<RejectionReasonItem[]>([]);
  const [rejectReason, setRejectReason] = useState('El lugar está muy lejos de mi zona de cobertura (Fuera de perímetro)');
  const [rejectExplanation, setRejectExplanation] = useState('');
  const [penaltyWarning, setPenaltyWarning] = useState<number>(0);

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
  const [pricingModel, setPricingModel] = useState<'POR_HORA' | 'POR_DIA' | 'POR_CUMPLIMIENTO'>('POR_HORA');
  const [hourlyRate, setHourlyRate] = useState<number>(globalSettings.defaultHourlyRate);
  const [dailyRate, setDailyRate] = useState<number>(220000);
  const [fulfillmentRate, setFulfillmentRate] = useState<number>(350000);
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

  // Estado del formulario de edición de perfil
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editProfession, setEditProfession] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editCity, setEditCity] = useState(DEFAULT_CITY);
  const [editDepartment, setEditDepartment] = useState(DEFAULT_DEPARTMENT);
  const [editAddress, setEditAddress] = useState('');

  useEffect(() => {
    let session = getCurrentUser();
    if (!session) {
      session = getInitialProviderSession();
      setCurrentUser(session);
    }
    setUser(session);
    setGlobalSettings(getGlobalSettings());
    setHourlyRate(getGlobalSettings().defaultHourlyRate);

    const reasons = getRejectionReasons();
    setRejectionOptions(reasons);
    if (reasons.length > 0) {
      setRejectReason(reasons[0].label);
    }

    const handleReasonsEvent = () => {
      const updated = getRejectionReasons();
      setRejectionOptions(updated);
    };
    window.addEventListener('rejection-reasons-updated', handleReasonsEvent);

    // Llenar formulario de edición de perfil
    if (session) {
      setEditFirstName(session.firstName);
      setEditLastName(session.lastName);
      setEditPhone(session.phone);
      setEditProfession(session.profile.profession || '');
      setEditBio(session.profile.bio || '');
      setEditCity(session.profile.city || DEFAULT_CITY);
      setEditDepartment(session.profile.department || DEFAULT_DEPARTMENT);
      setEditAddress(session.profile.address || '');
      setWhatsAppToggle(session.profile.showWhatsApp ?? true);
      setWhatsAppInput(session.profile.whatsappNumber || session.phone);
      setNotifications(getUserNotifications(session.id));

      // Sincronizar historial de reservas reales desde la base de datos MySQL
      const numUserId = Number(session.id);
      if (!isNaN(numUserId) && numUserId > 0) {
        const fetcher = session.role === 'PROVIDER'
          ? fetchBookingsByProvider(numUserId)
          : fetchBookingsByClient(numUserId);

        fetcher.then((dbBookings) => {
          if (Array.isArray(dbBookings) && dbBookings.length > 0) {
            const mappedItems: ServiceHistoryItem[] = dbBookings.map((b: any) => ({
              id: String(b.id),
              serviceTitle: b.serviceTitle,
              categoryName: b.categoryName,
              clientName: b.client ? `${b.client.firstName} ${b.client.lastName}` : 'Cliente',
              clientPhone: b.client?.phone || undefined,
              providerName: b.provider ? `${b.provider.firstName} ${b.provider.lastName}` : 'Prestador',
              providerPhone: b.provider?.phone || undefined,
              date: b.dateString || new Date(b.createdAt).toLocaleDateString('es-CO'),
              status: b.status,
              amount: Number(b.amount),
              paymentStatus: b.paymentStatus,
              paymentMethod: b.paymentMethod,
              platformFee: Number(b.platformFee),
              platformDebtStatus: b.platformDebtStatus,
              estimatedTimeRange: b.estimatedTimeRange,
              locationZone: b.locationZone,
              reviewComment: b.notes,
              rejectionReason: b.rejectionReason,
              rejectionExplanation: b.rejectionExplanation,
              teamBookingId: b.teamBookingId,
              teamProjectName: b.teamProjectName,
              teamMembersCount: b.teamMembersCount,
            }));

            setUser((prev) => {
              if (!prev) return prev;
              const currentIds = new Set((prev.history || []).map((h) => h.id));
              const newItems = mappedItems.filter((m) => !currentIds.has(m.id));
              if (newItems.length === 0) return prev;
              return {
                ...prev,
                history: [...newItems, ...(prev.history || [])],
              };
            });
          }
        }).catch(() => {});

        // Sincronizar notificaciones reales desde MySQL
        fetchNotificationsByUser(numUserId).then((dbNotifs) => {
          if (Array.isArray(dbNotifs) && dbNotifs.length > 0) {
            const mappedNotifs: AppNotification[] = dbNotifs.map((n: any) => ({
              id: String(n.id),
              userId: n.userId,
              title: n.title,
              message: n.message,
              type: n.type,
              date: new Date(n.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
              read: n.isRead,
              link: n.link,
              actionRequired: n.actionRequired,
              serviceId: n.serviceId,
            }));

            setNotifications((prev) => {
              const currentNotifIds = new Set(prev.map((p) => p.id));
              const toAppend = mappedNotifs.filter((m) => !currentNotifIds.has(m.id));
              return [...toAppend, ...prev];
            });
          }
        }).catch(() => {});
      }
    }

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
      showWarning('Límite de Actividades', `El límite máximo es de ${globalSettings.maxActivitiesPerService} actividades por servicio.`);
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

    setServiceTitle('');
    setSelectedCategoryId(1);
    setPricingModel('POR_HORA');
    setHourlyRate(globalSettings.defaultHourlyRate);
    setDailyRate(220000);
    setFulfillmentRate(350000);
    setActivities(['Instalación y mantenimiento', 'Servicio a domicilio']);
    setTitleCertification('');
    setCertificateFileName('');
    setIsModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceTitle.trim()) {
      showWarning('Nombre Requerido', 'Por favor ingresa el nombre de tu servicio profesional.');
      return;
    }

    if (activeCategory.requiresTitle && !titleCertification.trim() && !certificateFileName.trim()) {
      showWarning('Título Requerido', `La categoría ${activeCategory.name} requiere ingresar tu título o matrícula profesional.`);
      return;
    }

    const result = addServiceToUser({
      title: serviceTitle.trim(),
      categoryId: activeCategory.id,
      categoryName: activeCategory.name,
      hourlyRate: Number(hourlyRate) || globalSettings.defaultHourlyRate,
      dailyRate: Number(dailyRate) || 220000,
      fulfillmentRate: Number(fulfillmentRate) || 350000,
      pricingModel,
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
      showSuccess('¡Servicio Publicado!', 'Tu nuevo servicio ha sido agregado exitosamente a tu catálogo.');
    } else {
      showError('No se pudo agregar', result.message || 'Verifica los datos ingresados.');
    }
  };

  const handleDeleteService = async (id: string) => {
    const confirmed = await showConfirm({
      title: '¿Eliminar Servicio?',
      text: '¿Estás seguro de que deseas eliminar este servicio de tu catálogo?',
      confirmText: 'Sí, Eliminar',
      cancelText: 'Cancelar',
      icon: 'warning',
    });
    if (confirmed) {
      removeServiceFromUser(id);
      setUser(getCurrentUser());
      showSuccess('Servicio Eliminado', 'El servicio fue eliminado de tu perfil.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    router.push('/');
  };

  // Alternar entre modo Prestador y modo Cliente para testing inmediato
  const handleToggleRole = () => {
    const updated = toggleUserRole();
    setUser(updated);
    setEditFirstName(updated.firstName);
    setEditLastName(updated.lastName);
    setEditPhone(updated.phone);
    setEditProfession(updated.profile.profession || '');
    setEditBio(updated.profile.bio || '');
    setEditCity(updated.profile.city || DEFAULT_CITY);
    setEditDepartment(updated.profile.department || DEFAULT_DEPARTMENT);
    setEditAddress(updated.profile.address || '');

    if (updated.role === 'USER') {
      setActiveTab('cliente');
      setToastMessage('Has cambiado a Modo Cliente (Solicitante)');
    } else {
      setActiveTab('servicios');
      setToastMessage('Has cambiado a Modo Prestador de Servicios');
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Simular cambio de estado de verificación
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

  // Marcar estado de un trabajo del historial (Prestador)
  const handleUpdateJobStatus = (historyId: string, newStatus: ServiceHistoryItem['status']) => {
    updateServiceHistoryStatus(historyId, newStatus);
    const refreshed = getCurrentUser();
    setUser(refreshed);
    setToastMessage(`Estado de servicio actualizado a: ${newStatus}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Guardar calificación de servicio (Cliente)
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalItem) return;

    updateServiceHistoryStatus(ratingModalItem.id, 'COMPLETADO', selectedRating, reviewComment);
    setUser(getCurrentUser());
    setRatingModalItem(null);
    setToastMessage('¡Gracias por calificar el servicio!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Confirmar solicitud de servicio en rango estimado (Modo Prestador)
  const handleConfirmService = (serviceId: string, estimatedTimeRange?: string) => {
    const success = confirmServiceBooking(serviceId, estimatedTimeRange);
    if (success) {
      const refreshed = getCurrentUser();
      setUser(refreshed);
      if (refreshed) setNotifications(getUserNotifications(refreshed.id));
      setToastMessage('✓ ¡Solicitud de servicio confirmada con éxito! El cliente ha recibido la notificación en el sistema.');
      setTimeout(() => setToastMessage(null), 4500);
    }
  };

  // Manejar selección de motivo de rechazo y cálculo de advertencia de puntos
  const handleSelectRejectReason = (reason: string) => {
    setRejectReason(reason);
    if (reason.includes('lejos') || reason.includes('cobertura')) {
      setPenaltyWarning(0);
    } else if (reason.includes('Sin justificación')) {
      setPenaltyWarning(10);
    } else {
      setPenaltyWarning(rejectExplanation.trim().length < 15 ? 10 : 0);
    }
  };

  // Confirmar rechazo de solicitud con justificación obligatoria y advertencia de puntos
  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalItem) return;

    if (!rejectExplanation.trim()) {
      showWarning('Explicación Requerida', 'Por favor explica detalladamente el por qué rechazas este servicio para que el cliente y el administrador lo revisen.');
      return;
    }

    const matchedReason = rejectionOptions.find((r) => r.label === rejectReason);
    const penaltyToApply = matchedReason
      ? (matchedReason.isJustified ? 0 : (matchedReason.penaltyPoints ?? 10))
      : (rejectReason.toLowerCase().includes('lejos') || rejectExplanation.trim().length >= 15) && !rejectReason.includes('Sin justificación')
      ? 0
      : 10;

    const success = rejectServiceBooking(rejectModalItem.id, {
      reason: rejectReason,
      explanation: rejectExplanation.trim(),
      penaltyPoints: penaltyToApply,
    });

    if (success) {
      const refreshed = getCurrentUser();
      setUser(refreshed);
      if (refreshed) setNotifications(getUserNotifications(refreshed.id));
      setRejectModalItem(null);
      setRejectExplanation('');
      if (penaltyToApply > 0) {
        showWarning('Solicitud Rechazada', `Incurriste en -${penaltyToApply} puntos negativos de reputación debido a causa no justificada.`);
      } else {
        showSuccess('Solicitud Rechazada', 'El servicio fue declinado con causa justificada (0 puntos negativos).');
      }
    }
  };

  // Escoger cuáles de las actividades mostrar afuera en la tarjeta pública (máx 4)
  const handleToggleFeaturedActivity = (serviceId: string, activityName: string) => {
    if (!user) return;
    const service = user.services.find((s) => s.id === serviceId);
    if (!service) return;

    const currentFeatured = service.featuredActivities && service.featuredActivities.length > 0
      ? service.featuredActivities
      : service.activities.slice(0, 4);

    let nextFeatured: string[];
    if (currentFeatured.includes(activityName)) {
      if (currentFeatured.length <= 1) {
        showWarning('Mínimo Requerido', 'Debes mantener al menos 1 actividad seleccionada para tu tarjeta pública exterior.');
        return;
      }
      nextFeatured = currentFeatured.filter((a) => a !== activityName);
    } else {
      if (currentFeatured.length >= 4) {
        showWarning('Límite de Exhibición', 'Puedes seleccionar un máximo de 4 actividades principales para exhibir en tu tarjeta exterior.');
        return;
      }
      nextFeatured = [...currentFeatured, activityName];
    }

    const success = setFeaturedActivitiesForService(serviceId, nextFeatured);
    if (success) {
      const refreshed = getCurrentUser();
      setUser(refreshed);
      showSuccess('Tarjeta Actualizada', 'Las actividades principales de la tarjeta pública fueron actualizadas.');
    }
  };

  // Guardar perfil de usuario con configuración de WhatsApp
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      firstName: editFirstName,
      lastName: editLastName,
      phone: editPhone,
      city: editCity,
      department: editDepartment,
      profession: editProfession,
      bio: editBio,
      address: editAddress,
    });
    updateWhatsAppSettings(whatsAppToggle, whatsAppInput);
    const refreshed = getCurrentUser();
    setUser(refreshed);
    setToastMessage('✓ Perfil y configuración de WhatsApp actualizados exitosamente.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Pagar deuda con la plataforma
  const handlePayDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setDebtPaymentProcessing(true);
    setTimeout(() => {
      const updated = payUserPlatformDebt(user.id);
      if (updated) {
        setUser({ ...updated });
      } else {
        setUser({ ...user, platformDebt: 0 });
      }
      setDebtPaymentProcessing(false);
      setShowDebtPaymentModal(false);
      setToastMessage('✓ ¡Pago registrado con éxito! Tu saldo deudor con Conecta 360 ha quedado en $0 COP (Al día).');
      setTimeout(() => setToastMessage(null), 4000);
    }, 700);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-[#0056d2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Cálculos de Métricas
  const historyItems = user.history || [];
  const completedJobs = historyItems.filter((h) => h.status === 'COMPLETADO');
  const inProgressJobs = historyItems.filter((h) => h.status === 'EN_PROGRESO');
  const pendingJobs = historyItems.filter((h) => h.status === 'PENDIENTE');

  // Calificación promedio con estrellas
  const ratingsWithStars = completedJobs.filter((h) => h.rating && h.rating > 0);
  const avgRating =
    ratingsWithStars.length > 0
      ? (ratingsWithStars.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratingsWithStars.length).toFixed(1)
      : '5.0';

  // Total de pagos en COP
  const totalPaidCop = completedJobs.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 h-16 sm:h-20 flex items-center shadow-xs">
        <div className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/images/logo-conecta-nav.png"
              alt="CONECTA 360"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center space-x-3">
            {/* Toggle de Modo Prestador / Cliente */}
            <button
              onClick={handleToggleRole}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center space-x-1.5 ${
                user.role === 'PROVIDER'
                  ? 'bg-blue-50 text-[#0056d2] border-blue-200 hover:bg-blue-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Cambiar entre vista de prestador y cliente"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span>{user.role === 'PROVIDER' ? 'Modo Prestador' : 'Modo Cliente'}</span>
            </button>

            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0056d2] px-2 py-1 hidden sm:block"
            >
              Inicio
            </Link>

            <Link
              href="/services"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0056d2] px-2 py-1 hidden sm:block"
            >
              Servicios
            </Link>

            <Link
              href="/cuadrillas"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#0056d2] px-2 py-1 hidden sm:flex items-center space-x-1"
            >
              <span>Cuadrillas</span>
            </Link>

            {/* Acceso directo al Panel de Administración (Categorías, Servicios, Usuarios) */}
            <Link
              href="/admin"
              className="text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl hidden sm:flex items-center space-x-1.5 transition-all shadow-sm"
              title="Panel Administrativo de Categorías, Servicios y Usuarios"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
              <span>Panel Admin</span>
            </Link>

            {/* Campana de Notificaciones del Sistema */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 relative rounded-xl text-slate-500 hover:text-[#0056d2] hover:bg-slate-100 transition-colors"
                title="Notificaciones de servicios"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-4 space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <Bell className="w-4 h-4 text-[#0056d2]" />
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Notificaciones en el Sistema</h4>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      {notifications.filter((n) => !n.read).length} sin leer
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No tienes notificaciones por el momento</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (user) setNotifications(getUserNotifications(user.id));
                          }}
                          className={`p-3 rounded-xl text-xs transition-colors cursor-pointer border ${
                            n.read ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-blue-50/70 border-blue-200 text-slate-900 font-semibold'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs">{n.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.date || n.createdAt}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 font-normal leading-relaxed">{n.message}</p>
                          {(n.timeRange || n.estimatedTimeRange) && (
                            <div className="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-blue-200 text-[10px] font-bold text-[#0056d2]">
                              <Clock className="w-3 h-3" />
                              <span>Rango: {n.timeRange || n.estimatedTimeRange}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400">
                      * Próximamente integración directa por WhatsApp y Correo Electrónico
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0056d2] font-black text-xs flex items-center justify-center border border-blue-200">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <span className="text-xs font-bold text-slate-800 hidden md:block">
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
      <main className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 py-8 space-y-8">
        {/* Banner de Solicitudes Entrantes para Confirmar (Prestador) */}
        {user.role === 'PROVIDER' && historyItems.filter((h) => h.status === 'SOLICITADO').length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-[#0056d2] text-white rounded-3xl p-6 sm:p-7 shadow-lg shadow-blue-500/20 space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shrink-0">
                  <Bell className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                    {historyItems.filter((h) => h.status === 'SOLICITADO').length} Solicitud(es) de Servicio Recibida(s)
                  </span>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white mt-0.5">
                    Tienes solicitudes de clientes en Cali esperando tu confirmación
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {historyItems.filter((h) => h.status === 'SOLICITADO').map((req) => (
                <div key={req.id} className="bg-white text-slate-800 rounded-2xl p-5 shadow-sm space-y-3 border border-white/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black text-[#0056d2] uppercase">{req.categoryName}</span>
                      <h4 className="text-sm sm:text-base font-black text-slate-900">{req.serviceTitle}</h4>
                      <p className="text-xs text-slate-600">
                        Cliente: <strong className="text-slate-800">{req.clientName}</strong> {req.clientPhone ? `(${req.clientPhone})` : ''}
                      </p>
                    </div>
                    <span className="text-base font-black text-[#0056d2] shrink-0">
                      ${req.amount.toLocaleString('es-CO')} COP
                    </span>
                  </div>

                  {req.estimatedTimeRange && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-[#0056d2] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[#0056d2]">Rango de tiempo estimado solicitado:</span>
                        <span className="font-semibold text-slate-800">{req.estimatedTimeRange}</span>
                      </div>
                    </div>
                  )}

                  {req.messageNotes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      "{req.messageNotes}"
                    </p>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                    <span className="text-[11px] text-amber-600 font-bold flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Esperando tu confirmación</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRejectModalItem(req);
                          setRejectReason('El lugar está muy lejos de mi zona de cobertura (Fuera de perímetro)');
                          setRejectExplanation('');
                          setPenaltyWarning(0);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all flex items-center space-x-1 cursor-pointer"
                        title="Rechazar solicitud explicando el motivo"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Rechazar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleConfirmService(req.id, req.estimatedTimeRange)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprobar / Confirmar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {user.role === 'PROVIDER' ? 'Prestador de Servicios' : 'Cliente / Solicitante'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {user.profile.profession || 'Especialista en Conecta 360'} &bull;{' '}
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

              {user.role === 'PROVIDER' && (
                <button
                  onClick={handleOpenAddService}
                  className="px-5 py-2.5 rounded-xl bg-[#0056d2] hover:bg-[#0046a8] active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Servicio</span>
                </button>
              )}
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

        {/* 1.5. Módulo de Tarifa de Descuento y Deuda con la Plataforma (Modo Prestador) */}
        {user.role === 'PROVIDER' && (
          <div
            className={`rounded-3xl p-6 sm:p-7 border transition-all ${
              (user.platformDebt || 0) > 0
                ? 'bg-gradient-to-br from-rose-50/90 via-amber-50/50 to-white border-rose-200 shadow-sm'
                : 'bg-emerald-50/60 border-emerald-200 shadow-xs'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                    Tarifa de Descuento Conecta 360
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Comisión mínima: {globalSettings.platformCommission || 5}% &bull; Mínimo ${Number(globalSettings.minPlatformFee || 2500).toLocaleString('es-CO')} COP
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
                    <span>Estado de Deuda con la Plataforma:</span>
                    <span className={(user.platformDebt || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      ${(user.platformDebt || 0).toLocaleString('es-CO')} COP
                    </span>
                    {(user.platformDebt || 0) > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                        Saldo en Deuda
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Al Día (Sin saldo pendiente)
                      </span>
                    )}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mt-1.5 max-w-3xl">
                    {(user.platformDebt || 0) > 0 ? (
                      <>
                        ⚠️ <strong>¿Por qué quedaste en deuda con la plataforma?</strong> Cuando el cliente te paga directamente mediante <strong>Transferencia Bancaria</strong> o en <strong>Efectivo</strong>, recibes el 100% del dinero en tus manos sin intermediación bancaria de la pasarela. Por esta razón, la tarifa mínima de intermediación (5% o mín. $2.500 COP) se liquida como <strong>saldo pendiente por pagar a Conecta 360</strong> para mantener activo tu perfil en Cali.
                      </>
                    ) : (
                      <>
                        ✓ ¡Excelente! No tienes comisiones pendientes por transferencias bancarias o cobros en efectivo. Tu cuenta está 100% al día y tus servicios se muestran activos en Cali.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                {(user.platformDebt || 0) > 0 ? (
                  <button
                    onClick={() => setShowDebtPaymentModal(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pagar Deuda (${(user.platformDebt || 0).toLocaleString('es-CO')} COP)</span>
                  </button>
                ) : (
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-700 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200 inline-flex items-center space-x-1.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Cuenta al Día</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Ribbon de Métricas Clave (Cantidad de Servicios, Calificación y Estrellas, Servicios Realizados, Pagos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Métrica 1: Cantidad de Servicios */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {user.role === 'PROVIDER' ? 'Servicios Ofrecidos' : 'Servicios Contratados'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0056d2] flex items-center justify-center font-bold">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {user.role === 'PROVIDER' ? user.services.length : historyItems.length}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {user.role === 'PROVIDER'
                  ? `Plan ${user.plan === 'FREE' ? 'Gratuito (máx 1)' : 'Pro (ilimitado)'}`
                  : 'Total de servicios solicitados'}
              </p>
            </div>
          </div>

          {/* Métrica 2: Calificación y Estrellas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Calificación Media
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{avgRating}</span>
                <div className="flex text-amber-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Basado en {ratingsWithStars.length} reseñas verificadas en Cali
              </p>
            </div>
          </div>

          {/* Métrica 3: Estado de Servicios Realizados */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Servicios Realizados
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                {completedJobs.length}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {inProgressJobs.length} en progreso &bull; {pendingJobs.length} pendientes
              </p>
            </div>
          </div>

          {/* Métrica 4: Pagos del Servicio (COP) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {user.role === 'PROVIDER' ? 'Recaudado en Servicios' : 'Total Pagado'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0056d2] flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0056d2]">
                ${totalPaidCop.toLocaleString('es-CO')}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                COP &bull; {completedJobs.length} pagos liquidados
              </p>
            </div>
          </div>
        </div>

        {/* 3. Navegación por Pestañas */}
        <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4 overflow-x-auto pb-px">
          {user.role === 'PROVIDER' && (
            <button
              onClick={() => setActiveTab('servicios')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'servicios'
                  ? 'border-[#0056d2] text-[#0056d2]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Servicios que Ofrece ({user.services.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('historial')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'historial'
                ? 'border-[#0056d2] text-[#0056d2]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Historial de Servicios ({historyItems.length})</span>
          </button>

          {user.role === 'USER' && (
            <button
              onClick={() => setActiveTab('cliente')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'cliente'
                  ? 'border-[#0056d2] text-[#0056d2]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Mis Solicitudes ({historyItems.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('perfil')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'perfil'
                ? 'border-[#0056d2] text-[#0056d2]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Mi Perfil</span>
          </button>
        </div>

        {/* TAB 1: Servicios que Ofrece (Prestador) */}
        {activeTab === 'servicios' && user.role === 'PROVIDER' && (
          <div className="space-y-6">
            {/* Reglas del Sistema & Tarifa Admin */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Plan y Límite de Servicios
                </span>
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 text-base">Plan Gratuito</h4>
                  <span className="text-xs font-bold text-[#0056d2]">
                    {user.services.length} / {globalSettings.freePlanMaxServices} Servicio
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  El plan gratis permite 1 servicio publicado. Para publicar más servicios, puedes solicitar Plan Pro.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tarifa Sugerida por Administrador
                </span>
                <div className="text-xl font-black text-[#0056d2]">
                  ${globalSettings.defaultHourlyRate.toLocaleString('es-CO')} COP/h
                </div>
                <p className="text-xs text-slate-500">
                  Configurada globalmente por el superadmin para servicios estándar en Cali.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Ubicación & Cobertura
                </span>
                <div className="font-black text-slate-900 text-base flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{user.profile.city}, {user.profile.department}</span>
                </div>
                <p className="text-xs text-slate-500">
                  Cobertura con acceso a transporte metropolitano e intermunicipal.
                </p>
              </div>
            </div>

            {/* Listado de Servicios */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Servicios Publicados
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gestiona los servicios que los clientes pueden contratar desde el catálogo
                  </p>
                </div>

                <button
                  onClick={handleOpenAddService}
                  className="px-4 py-2 bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Servicio</span>
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
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-block bg-blue-50 text-[#0056d2] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              {service.categoryName}
                            </span>
                            <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                              service.pricingModel === 'POR_DIA'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : service.pricingModel === 'POR_CUMPLIMIENTO'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {service.pricingModel === 'POR_DIA'
                                ? '📅 Por Día'
                                : service.pricingModel === 'POR_CUMPLIMIENTO'
                                ? '🏆 Por Cumplimiento'
                                : '⏱️ Por Horas'}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-slate-900 leading-tight">
                            {service.title}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {service.city}, {service.department} &bull; {service.coverageZones}
                            </span>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs text-slate-400 block font-semibold">
                            {service.pricingModel === 'POR_DIA'
                              ? 'Tarifa / Día'
                              : service.pricingModel === 'POR_CUMPLIMIENTO'
                              ? 'Tarifa / Entrega'
                              : 'Tarifa / Hora'}
                          </span>
                          <span className="text-lg font-black text-[#0056d2]">
                            {service.pricingModel === 'POR_DIA'
                              ? `$${Number(service.dailyRate || Number(service.hourlyRate) * 6).toLocaleString('es-CO')} COP`
                              : service.pricingModel === 'POR_CUMPLIMIENTO'
                              ? `$${Number(service.fulfillmentRate || Number(service.hourlyRate) * 12).toLocaleString('es-CO')} COP`
                              : `$${Number(service.hourlyRate).toLocaleString('es-CO')} COP`}
                          </span>
                        </div>
                      </div>

                      {/* Actividades relacionadas & Selección para Tarjeta Pública Exterior (Hasta 4) */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                          <span className="font-bold text-slate-800">
                            Actividades y Especialidades ({service.activities.length}/10):
                          </span>
                          <span className="text-[11px] font-bold text-[#0056d2] bg-blue-50 px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1">
                            <span>{(service.featuredActivities || service.activities.slice(0, 4)).length}/4 visibles en tarjeta pública</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Selecciona hasta 4 actividades principales para que se muestren afuera en tu tarjeta pública:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {service.activities.map((act, i) => {
                            const currentFeatured = service.featuredActivities && service.featuredActivities.length > 0
                              ? service.featuredActivities
                              : service.activities.slice(0, 4);
                            const isFeatured = currentFeatured.includes(act);
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleToggleFeaturedActivity(service.id, act)}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center space-x-1.5 transition-all border ${
                                  isFeatured
                                    ? 'bg-[#0056d2] text-white border-[#0046a8] shadow-xs'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                }`}
                                title={isFeatured ? 'Visible afuera en tarjeta pública (Clic para quitar)' : 'Clic para mostrar en tarjeta pública'}
                              >
                                {isFeatured ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-white" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span>{act}</span>
                                {isFeatured && (
                                  <span className="text-[9px] bg-blue-800 text-white font-bold px-1 rounded">
                                    Pública
                                  </span>
                                )}
                              </button>
                            );
                          })}
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

            {/* Previsualización en Vivo de la tarjeta en Cali */}
            {user.services.length > 0 && (
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-black text-blue-400 uppercase tracking-wider">
                      Previsualización en Vivo
                    </span>
                    <h4 className="text-xl font-black tracking-tight">
                      Así se ve tu tarjeta en los resultados de búsqueda de Cali
                    </h4>
                  </div>
                  <Link
                    href="/"
                    className="text-xs font-bold text-blue-300 hover:text-white flex items-center space-x-1"
                  >
                    <span>Ver en la página principal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="max-w-sm bg-white text-slate-800 border border-slate-200 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                    <img
                      src={user.profile.profilePhoto || '/images/service-electricista.jpg'}
                      alt={user.firstName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />

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

                  <div className="p-3 sm:p-3.5 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-[#0056d2]">
                      <Wrench className="w-3 h-3 text-[#0056d2]" />
                      <span>{user.services[0].categoryName}</span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 leading-tight truncate">
                      {user.services[0].title}
                    </h4>

                    <p className="text-xs text-slate-600 font-semibold truncate">
                      {user.firstName} {user.lastName} &bull;{' '}
                      <span className="text-slate-500 font-normal">
                        {user.profile.profession || 'Especialista'}
                      </span>
                    </p>

                    {/* Calificación, estrellas y Ubicación en UNA MISMA FILA */}
                    <div className="flex items-center justify-between text-xs text-slate-500 gap-1.5 pt-0.5">
                      <div className="flex items-center space-x-1 shrink-0">
                        <div className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                          <span>5.0</span>
                        </div>
                        <span className="text-slate-400 text-[10.5px]">(Nuevo)</span>
                      </div>
                      <div className="flex items-center text-slate-500 text-[10.5px] font-medium truncate shrink min-w-0">
                        <MapPin className="w-3 h-3 text-rose-500 mr-0.5 shrink-0" />
                        <span className="truncate">
                          {user.services[0].city}, {user.services[0].department}
                        </span>
                      </div>
                    </div>

                    {/* Actividades principales mostradas afuera en la tarjeta pública (máx 4) */}
                    <div className="pt-1.5 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                        Actividades Principales ({((user.services[0].featuredActivities && user.services[0].featuredActivities.length > 0) ? user.services[0].featuredActivities : user.services[0].activities.slice(0, 4)).length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {((user.services[0].featuredActivities && user.services[0].featuredActivities.length > 0)
                          ? user.services[0].featuredActivities
                          : user.services[0].activities.slice(0, 4)
                        ).map((act, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0056d2] text-[10px] font-bold border border-blue-100 flex items-center space-x-1"
                          >
                            <Tag className="w-2.5 h-2.5 shrink-0" />
                            <span>{act}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-[#0056d2]">
                        Desde ${Number(user.services[0].hourlyRate).toLocaleString('es-CO')}/h
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Tarifa sugerida admin
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Historial de Servicios (Estado de servicios realizados, Pagos en COP, Calificación y Estrellas) */}
        {activeTab === 'historial' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Historial de Servicios y Trabajos Realizados
                </h3>
                <p className="text-xs text-slate-500">
                  Monitorea el estado, pagos recibidos en COP y calificaciones con estrellas de cada servicio
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {completedJobs.length} Completados
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                  {inProgressJobs.length} En progreso
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                  {pendingJobs.length} Pendientes
                </span>
              </div>
            </div>

            {historyItems.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-2">
                <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No hay registros en el historial</p>
                <p className="text-xs text-slate-400">Los trabajos contratados aparecerán aquí con sus estados y pagos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-blue-200 transition-all space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {item.categoryName}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {item.date}
                          </span>
                        </div>

                        <h4 className="text-base font-extrabold text-slate-900">
                          {item.serviceTitle}
                        </h4>

                        <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>
                            <strong className="text-slate-700">Cliente:</strong> {item.clientName} {item.clientPhone ? `(${item.clientPhone})` : ''}
                          </span>
                          <span>&bull;</span>
                          <span>
                            <strong className="text-slate-700">Prestador:</strong> {item.providerName}
                          </span>
                        </div>
                      </div>

                      {/* Estado y Pago */}
                      <div className="flex flex-row md:flex-col items-start md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                        {/* Badge de Estado del Servicio */}
                        <div>
                          {item.status === 'SOLICITADO' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300 flex items-center space-x-1 animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Solicitado (Esperando Confirmación)</span>
                            </span>
                          )}
                          {item.status === 'CONFIRMADO' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Confirmado</span>
                            </span>
                          )}
                          {item.status === 'COMPLETADO' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completado</span>
                            </span>
                          )}
                          {item.status === 'EN_PROGRESO' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-[#0056d2] border border-blue-200 flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>En Progreso</span>
                            </span>
                          )}
                          {item.status === 'PENDIENTE' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-300 flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pendiente</span>
                            </span>
                          )}
                          {item.status === 'CANCELADO' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1">
                              <X className="w-3.5 h-3.5" />
                              <span>Cancelado</span>
                            </span>
                          )}
                          {item.status === 'RECHAZADO' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-300 flex items-center space-x-1">
                              <X className="w-3.5 h-3.5" />
                              <span>Rechazado por el Servidor</span>
                            </span>
                          )}
                        </div>

                        {/* Pago del Servicio */}
                        <div className="text-right space-y-1">
                          <div className={`text-base font-black ${item.status === 'RECHAZADO' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            ${item.amount.toLocaleString('es-CO')} COP
                          </div>
                          <div className="text-[11px] font-bold flex items-center justify-end space-x-1">
                            {item.status === 'RECHAZADO' ? (
                              <span className="text-slate-400 font-bold">
                                ● Sin cobro (Servicio no realizado)
                              </span>
                            ) : (
                              <span
                                className={item.paymentStatus === 'PAGADO' ? 'text-emerald-600' : 'text-amber-600'}
                              >
                                ● {item.paymentStatus === 'PAGADO' ? 'Pagado' : 'Pago Pendiente'}
                              </span>
                            )}
                            <span className="text-slate-400 font-normal">({item.paymentMethod})</span>
                          </div>

                          {/* Comisión Conecta 360 y Deuda del Servicio (únicamente si el servicio no fue rechazado) */}
                          {item.status !== 'RECHAZADO' && item.platformFee && (
                            <div className="flex flex-col items-end pt-1 space-y-1">
                              <span className="text-[11px] text-slate-500 font-medium">
                                Comisión Conecta 360: <strong className="text-slate-800">${item.platformFee.toLocaleString('es-CO')} COP</strong> (5%)
                              </span>
                              {item.platformDebtStatus === 'EN_DEUDA' ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                                  ⚠️ En deuda (Cobro directo {item.paymentMethod})
                                </span>
                              ) : item.platformDebtStatus === 'AL_DIA' ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ✓ Al día (Retenido por pasarela)
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reseña y Estrellas (si tiene) */}
                    {item.rating && (
                      <div className="p-3.5 bg-amber-50/50 border border-amber-200/60 rounded-2xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <span className="font-extrabold text-slate-800">Calificación del cliente:</span>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < (item.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-amber-700">({item.rating}.0 / 5)</span>
                          </div>
                        </div>

                        {item.reviewComment && (
                          <p className="text-slate-600 italic">
                            "{item.reviewComment}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Detalle si fue Rechazado por el Servidor */}
                    {item.status === 'RECHAZADO' && item.rejectionReason && (
                      <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-1.5 text-xs text-rose-900">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold flex items-center space-x-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Motivo de rechazo: {item.rejectionReason}</span>
                          </span>
                          {item.penaltyPointsApplied !== undefined && item.penaltyPointsApplied > 0 ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px] font-black">
                              ⚠️ -{item.penaltyPointsApplied} Pts Negativos
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                              ✓ Justificado (0 Pts Negativos)
                            </span>
                          )}
                        </div>
                        {item.rejectionExplanation && (
                          <p className="text-slate-700 italic text-[11px] bg-white/70 p-2.5 rounded-xl border border-rose-100 leading-relaxed">
                            "{item.rejectionExplanation}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Botones de acción rápida para cambiar estado */}
                    {user.role === 'PROVIDER' && item.status !== 'COMPLETADO' && item.status !== 'RECHAZADO' && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                        {item.status === 'SOLICITADO' && (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setRejectModalItem(item);
                                setRejectReason('El lugar está muy lejos de mi zona de cobertura (Fuera de perímetro)');
                                setRejectExplanation('');
                                setPenaltyWarning(0);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center space-x-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Rechazar con Justificación</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleConfirmService(item.id, item.estimatedTimeRange)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center space-x-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aprobar y Confirmar Rango</span>
                            </button>
                          </div>
                        )}
                        {item.status === 'CONFIRMADO' && (
                          <button
                            onClick={() => handleUpdateJobStatus(item.id, 'EN_PROGRESO')}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center space-x-1"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Iniciar Servicio (En Progreso)</span>
                          </button>
                        )}
                        {item.status === 'PENDIENTE' && (
                          <button
                            onClick={() => handleUpdateJobStatus(item.id, 'EN_PROGRESO')}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0056d2] hover:bg-blue-100 font-bold text-xs transition-colors"
                          >
                            Iniciar Servicio
                          </button>
                        )}
                        {item.status === 'EN_PROGRESO' && (
                          <button
                            onClick={() => handleUpdateJobStatus(item.id, 'COMPLETADO')}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-sm transition-colors flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Marcar como Completado</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Modo Cliente (Solicitudes de Servicio contratadas y Calificación con Estrellas) */}
        {activeTab === 'cliente' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Servicios que has Contratado como Cliente
                </h3>
                <p className="text-xs text-slate-500">
                  Revisa el estado en tiempo real, detalles de pago y califica con estrellas el trabajo recibido
                </p>
              </div>

              <Link
                href="/"
                className="px-4 py-2 rounded-xl bg-[#0056d2] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Explorar Nuevos Servicios en Cali</span>
              </Link>
            </div>

            <div className="space-y-4">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {item.categoryName}
                      </span>
                      <h4 className="text-base font-black text-slate-900">
                        {item.serviceTitle}
                      </h4>
                      <p className="text-xs text-slate-600">
                        Prestador asignado: <strong className="text-slate-800">{item.providerName}</strong> &bull; {item.date}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-base font-black block ${item.status === 'RECHAZADO' ? 'text-slate-400 line-through' : 'text-[#0056d2]'}`}>
                        ${item.amount.toLocaleString('es-CO')} COP
                      </span>
                      {item.status === 'RECHAZADO' ? (
                        <span className="text-xs font-bold text-slate-400">
                          ● Sin cobro (Servicio no realizado)
                        </span>
                      ) : (
                        <span className={`text-xs font-bold ${item.paymentStatus === 'PAGADO' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          ● {item.paymentStatus === 'PAGADO' ? 'Pagado' : 'Pago Pendiente'} via {item.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Estado y Acción de Calificación */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-500">Estado del servicio:</span>
                      {item.status === 'COMPLETADO' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completado</span>
                        </span>
                      ) : item.status === 'RECHAZADO' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1">
                          <X className="w-3 h-3" />
                          <span>Rechazado por el Servidor</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 text-[#0056d2] border border-blue-200 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>En Atención</span>
                        </span>
                      )}
                    </div>

                    {/* Botón de Calificar con Estrellas */}
                    <div>
                      {item.status === 'COMPLETADO' ? (
                        item.rating ? (
                          <div className="flex items-center space-x-1.5 text-xs">
                            <span className="font-bold text-slate-700">Tu Calificación:</span>
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < (item.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <button
                              onClick={() => {
                                setRatingModalItem(item);
                                setSelectedRating(item.rating || 5);
                                setReviewComment(item.reviewComment || '');
                              }}
                              className="text-xs text-blue-600 hover:underline font-semibold ml-2"
                            >
                              Editar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setRatingModalItem(item);
                              setSelectedRating(5);
                              setReviewComment('');
                            }}
                            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" />
                            <span>Calificar y Dejar Reseña</span>
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Disponible para calificar al completarse el trabajo
                        </span>
                      )}
                    </div>

                    {/* Detalle si fue Rechazado por el Servidor para conocimiento del Cliente */}
                    {item.status === 'RECHAZADO' && item.rejectionReason && (
                      <div className="mt-3 p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold flex items-center space-x-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Motivo indicado por el servidor: {item.rejectionReason}</span>
                          </span>
                          <Link
                            href="/services"
                            className="px-3 py-1 rounded-lg bg-[#0056d2] text-white font-bold text-xs hover:bg-[#0046a8] transition-colors"
                          >
                            Solicitar a otro profesional
                          </Link>
                        </div>
                        {item.rejectionExplanation && (
                          <p className="text-slate-600 italic text-[11px] bg-white/70 p-2.5 rounded-xl border border-rose-100 leading-relaxed">
                            "{item.rejectionExplanation}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Mi Perfil (Editar Perfil, Datos de Contacto y Ubicación en Colombia) */}
        {activeTab === 'perfil' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs max-w-3xl space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0056d2] flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Información de tu Perfil
                </h3>
                <p className="text-xs text-slate-500">
                  Actualiza tus datos personales y profesionales visibles en Conecta 360
                </p>
              </div>
            </div>

            {/* Tarjeta de Reputación y Puntos del Servidor (Solo para prestadores) */}
            {user.role === 'PROVIDER' && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <h4 className="text-sm font-black tracking-tight">Reputación y Puntos de Servidor</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black border border-emerald-400/30">
                    Servidor Activo
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                    <span className="text-[10px] text-slate-300 block uppercase font-bold">Puntaje Global</span>
                    <span className="text-xl font-black text-white">
                      {user.reputationPoints !== undefined ? user.reputationPoints : 100}
                      <span className="text-xs text-slate-400 font-normal">/100</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                    <span className="text-[10px] text-slate-300 block uppercase font-bold">Puntos Negativos</span>
                    <span className={`text-xl font-black ${(user.negativePoints || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {user.negativePoints || 0} pts
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                    <span className="text-[10px] text-slate-300 block uppercase font-bold">Aprobados</span>
                    <span className="text-xl font-black text-emerald-400">
                      {user.acceptedServicesCount || completedJobs.length}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                    <span className="text-[10px] text-slate-300 block uppercase font-bold">Rechazados</span>
                    <span className="text-xl font-black text-amber-400">
                      {user.rejectedServicesCount || historyItems.filter((h) => h.status === 'RECHAZADO').length}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  💡 <strong>Regla de calidad:</strong> Rechazos justificados (como lugares muy lejanos o fuera del perímetro de Cali) no generan puntos negativos. Rechazar sin justificación incurre en <strong>-10 puntos</strong>.
                </p>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                    Teléfono Celular *
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                    Profesión u Oficio *
                  </label>
                  <input
                    type="text"
                    value={editProfession}
                    onChange={(e) => setEditProfession(e.target.value)}
                    placeholder="Ej: Técnico Electricista e Instalador"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                    Departamento (Colombia) *
                  </label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none"
                  >
                    {COLOMBIA_DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="Cali"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Dirección o Barrio en Cali
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Ej: Calle 5 # 38-20, San Fernando"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">
                  Biografía / Presentación Profesional
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Describe tu experiencia, certificaciones y compromiso de atención en Cali..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none resize-none"
                />
              </div>

              {/* Configuración de WhatsApp en el Perfil Público (Interruptor ON / OFF) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-5 h-5 text-emerald-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                        Botón de Contacto por WhatsApp
                      </h4>
                    </div>
                    <p className="text-xs text-emerald-800">
                      Permite a los clientes contactarte directamente por WhatsApp desde tu perfil público
                    </p>
                  </div>

                  {/* Interruptor ON / OFF */}
                  <div className="flex items-center space-x-2.5 shrink-0">
                    <span className={`text-xs font-bold ${whatsAppToggle ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {whatsAppToggle ? 'HABILITADO (ON)' : 'DESHABILITADO (OFF)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWhatsAppToggle(!whatsAppToggle)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        whatsAppToggle ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          whatsAppToggle ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {whatsAppToggle && (
                  <div className="pt-2 border-t border-emerald-200/60 space-y-1.5">
                    <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wide">
                      Número de WhatsApp de Contacto *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={whatsAppInput}
                        onChange={(e) => setWhatsAppInput(e.target.value)}
                        placeholder="Ej: +57 315 123 4567"
                        className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-emerald-300 rounded-xl focus:border-emerald-600 outline-none text-slate-800 font-medium"
                      />
                    </div>
                    <span className="text-[11px] text-emerald-700 block">
                      ✓ El botón de WhatsApp solo se mostrará en tu perfil público si este interruptor está en ON.
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0056d2] hover:bg-[#0046a8] text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Guardar Cambios de Perfil
                </button>
              </div>
            </form>
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

              {/* Modalidad de Cobro y Tarifa */}
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#0056d2] uppercase tracking-wide mb-1.5">
                    Modalidad de Cobro del Servicio *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'POR_HORA', label: 'Por Horas', icon: '⏱️', desc: 'Cobro por hora' },
                      { id: 'POR_DIA', label: 'Por Día', icon: '📅', desc: 'Jornada laboral' },
                      { id: 'POR_CUMPLIMIENTO', label: 'Cumplimiento', icon: '🏆', desc: 'Meta / Obra' },
                    ].map((mod) => (
                      <button
                        type="button"
                        key={mod.id}
                        onClick={() => setPricingModel(mod.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          pricingModel === mod.id
                            ? 'bg-[#0056d2] text-white border-[#0056d2] shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-1 font-bold text-xs">
                          <span>{mod.icon}</span>
                          <span>{mod.label}</span>
                        </div>
                        <span className={`text-[10px] block mt-0.5 ${pricingModel === mod.id ? 'text-blue-100' : 'text-slate-400'}`}>
                          {mod.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input condicional según modalidad elegida */}
                {pricingModel === 'POR_HORA' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Tarifa por Hora (COP) *
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
                      Tarifa base recomendada por Conecta 360: ${globalSettings.defaultHourlyRate.toLocaleString('es-CO')} COP/h.
                    </p>
                  </div>
                )}

                {pricingModel === 'POR_DIA' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Tarifa por Día / Jornada (COP) *
                      </label>
                      <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Jornada Estándar (8h)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-black text-slate-500">$</span>
                      <input
                        type="number"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(Number(e.target.value))}
                        min={50000}
                        step={5000}
                        required
                        className="w-full px-3.5 py-2 text-base font-black bg-white border border-slate-200 rounded-xl focus:border-[#0056d2] outline-none text-slate-900"
                      />
                      <span className="text-xs font-bold text-slate-600 shrink-0">COP / día</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Equivalente a una jornada diurna de 8 horas con transporte y herramientas básicas.
                    </p>
                  </div>
                )}

                {pricingModel === 'POR_CUMPLIMIENTO' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Tarifa por Meta / Obra Terminada (COP) *
                      </label>
                      <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">
                        Precio Cerrado
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-black text-slate-500">$</span>
                      <input
                        type="number"
                        value={fulfillmentRate}
                        onChange={(e) => setFulfillmentRate(Number(e.target.value))}
                        min={50000}
                        step={10000}
                        required
                        className="w-full px-3.5 py-2 text-base font-black bg-white border border-slate-200 rounded-xl focus:border-[#0056d2] outline-none text-slate-900"
                      />
                      <span className="text-xs font-bold text-slate-600 shrink-0">COP / entrega</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Precio pactado contra entrega de la obra o cumplimiento total de la meta acordada con el cliente.
                    </p>
                  </div>
                )}
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

      {/* MODAL: Calificar Servicio (Modo Cliente) */}
      {ratingModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-[#0056d2] uppercase tracking-wider">
                  Calificación de Servicio
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  ¿Cómo fue tu experiencia?
                </h3>
              </div>
              <button
                onClick={() => setRatingModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">{ratingModalItem.serviceTitle}</p>
              <p className="text-xs text-slate-500">Prestador: {ratingModalItem.providerName}</p>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              {/* Estrellas Interactivas */}
              <div className="text-center space-y-2 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-600">Selecciona tu calificación:</span>
                <div className="flex justify-center items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= selectedRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-amber-700">
                  {selectedRating === 5 && '★★★★★ ¡Excelente servicio!'}
                  {selectedRating === 4 && '★★★★☆ Muy buen servicio'}
                  {selectedRating === 3 && '★★★☆☆ Servicio aceptable'}
                  {selectedRating === 2 && '★★☆☆☆ Regular'}
                  {selectedRating === 1 && '★☆☆☆☆ Insatisfecho'}
                </p>
              </div>

              {/* Comentario de reseña */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tu Opinión / Comentario:
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Escribe detalles del trabajo realizado, puntualidad, calidad..."
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none resize-none"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingModalItem(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0056d2] hover:bg-[#0046a8] text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Enviar Calificación
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
                  setShowUpgradeModal(false);
                  showSuccess('¡Solicitud Recibida!', 'Un asesor de Conecta 360 se comunicará contigo para activar las funciones de tu Plan Pro.');
                }}
                className="flex-1 py-2.5 bg-[#0056d2] hover:bg-[#0046a8] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Subir a Plan Pro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pagar Deuda con la Plataforma (Modo Prestador) */}
      {showDebtPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Pagar Saldo con Conecta 360
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Comisiones por cobros directos en Cali
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDebtPaymentModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Resumen del Saldo */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800">
                Total a Pagar / Ponerse al Día
              </span>
              <div className="text-3xl font-black text-rose-600">
                ${(user.platformDebt || 0).toLocaleString('es-CO')} COP
              </div>
              <p className="text-[11px] text-slate-600">
                Comisión mínima ({globalSettings.platformCommission || 5}%) sobre servicios completados por Efectivo o Transferencia
              </p>
            </div>

            <form onSubmit={handlePayDebt} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                  Selecciona Método de Pago en Colombia
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDebtPaymentMethod('PSE')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      debtPaymentMethod === 'PSE'
                        ? 'border-[#0056d2] bg-blue-50/70 text-[#0056d2] font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-black">PSE en Línea</div>
                    <div className="text-[10px] text-slate-500">Cuentas de Ahorros / Corriente</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDebtPaymentMethod('NEQUI')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      debtPaymentMethod === 'NEQUI'
                        ? 'border-purple-600 bg-purple-50/70 text-purple-700 font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-black">Nequi / Daviplata</div>
                    <div className="text-[10px] text-slate-500">Pago rápido desde el móvil</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDebtPaymentMethod('BANCOLOMBIA')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      debtPaymentMethod === 'BANCOLOMBIA'
                        ? 'border-amber-600 bg-amber-50/70 text-amber-800 font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-black">Bancolombia QR</div>
                    <div className="text-[10px] text-slate-500">Botón Bancolombia / App</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDebtPaymentMethod('TARJETA')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      debtPaymentMethod === 'TARJETA'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 font-bold shadow-2xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-black">Tarjeta Débito / Crédito</div>
                    <div className="text-[10px] text-slate-500">Visa, Mastercard, Diners</div>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Al completar este abono, tu saldo deudor quedará en <strong>$0 COP</strong>, tu certificado de paz y salvo se actualizará automáticamente y mantendrás tu perfil con máxima visibilidad en Cali.
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDebtPaymentModal(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={debtPaymentProcessing}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all"
                >
                  {debtPaymentProcessing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirmar Pago (${(user.platformDebt || 0).toLocaleString('es-CO')} COP)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Rechazo de Solicitud de Servicio (con justificación obligatoria y advertencia de puntos negativos) */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-black">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Rechazar Solicitud de Servicio
                  </h3>
                  <p className="text-xs text-slate-500">
                    {rejectModalItem.serviceTitle} • Cliente: {rejectModalItem.clientName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Advertencia del sistema sobre puntos negativos */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-black flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Política de Calidad y Puntos de Servidor:</span>
              </span>
              <p className="text-[11px] leading-relaxed text-slate-700">
                Como servidor debes explicar el por qué rechazas la solicitud. Si la causa es justificada (ej. <strong>el lugar es muy lejos</strong>, cruce de horarios o falta de repuestos específicos), <strong>no incurres en puntos negativos</strong>. Si rechazas sin justificación válida, se aplicarán <strong>-10 puntos negativos</strong> a tu reputación en la plataforma.
              </p>
            </div>

            <form onSubmit={handleConfirmRejection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo Principal de Rechazo *
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => handleSelectRejectReason(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#0056d2]"
                >
                  {rejectionOptions.map((opt) => (
                    <option key={opt.id} value={opt.label}>
                      {opt.isJustified ? '📍 ' : '⚠️ '}
                      {opt.label} {opt.isJustified ? '[Válido - 0 pts negativos]' : `[Incurre en -${opt.penaltyPoints ?? 10} pts]`}
                    </option>
                  ))}
                  <option value="Otro motivo (Especificar detalladamente)">
                    📝 Otro motivo (Especificar detalladamente)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Explicación Detallada del Rechazo *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej: La dirección indicada en Jamundí o periferia queda a más de 25 km de mi base en Cali Norte y no alcanzo a desplazarme en el horario pactado..."
                  value={rejectExplanation}
                  onChange={(e) => {
                    setRejectExplanation(e.target.value);
                    if (!rejectReason.includes('lejos') && !rejectReason.includes('cobertura')) {
                      setPenaltyWarning(e.target.value.trim().length < 15 || rejectReason.includes('Sin justificación') ? 10 : 0);
                    }
                  }}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#0056d2] resize-none"
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-1">
                  Mínimo 15 caracteres para validar la justificación ante el administrador y cliente.
                </p>
              </div>

              {/* Indicador en tiempo real de penalización */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-600">Impacto en Reputación:</span>
                {penaltyWarning > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black text-[11px]">
                    ⚠️ Se aplicarán -10 puntos negativos
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px]">
                    ✓ Justificado (0 puntos negativos)
                  </span>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRejectModalItem(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 mt-auto">
        &copy; {new Date().getFullYear()} CONECTA 360 &bull; Panel de Control de Usuarios y Prestadores en Colombia (Sede Principal Cali).
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
