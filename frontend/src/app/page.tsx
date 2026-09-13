'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  Wrench,
  Zap,
  Monitor,
  Hammer,
  GraduationCap,
  Palette,
  HeartPulse,
  Grid,
  Shield,
  Star,
  Zap as FastIcon,
  MapPin,
  User,
  ArrowRight,
  CheckCircle2,
  Check,
  Award,
  Heart,
  Clock,
  Calendar,
  LogOut,
  X,
  Menu,
  Filter,
  Tag,
  Users,
  Briefcase,
  MessageSquare,
  Send,
  CheckSquare,
  Square
} from 'lucide-react';
import { getCurrentUser, setCurrentUser, createTeamBooking, UserSession } from '@/lib/auth';
import { COLOMBIA_DEPARTMENTS, ALL_COLOMBIAN_CITIES, DEFAULT_CITY } from '@/lib/colombia-data';

interface Requirement {
  id: number;
  title: string;
  type: string;
  isRequired: boolean;
}

interface ServiceItem {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  services: ServiceItem[];
  requirements: Requirement[];
}

interface ProviderData {
  id: number | string;
  userId: number | string;
  title: string | null;
  hourlyRate: string | number | null;
  dailyRate?: number;
  fulfillmentRate?: number;
  pricingModel?: 'POR_HORA' | 'POR_DIA' | 'POR_CUMPLIMIENTO';
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  featuredActivities?: string[];
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    profile?: {
      city: string | null;
      department: string | null;
      country: string | null;
      profilePhoto: string | null;
    };
  };
  providerServices?: {
    service: {
      id: number;
      name: string;
      category?: {
        name: string;
      };
    };
  }[];
}

export default function Home() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Inicialmente va a funcionar en Cali
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPricingModel, setSelectedPricingModel] = useState<string>('TODOS');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal para Solicitar Equipo de Trabajo / Cuadrilla Multi-Profesional
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamProjectName, setTeamProjectName] = useState('');
  const [teamEstimatedTime, setTeamEstimatedTime] = useState('4 a 8 horas (1 día completo)');
  const [teamMessage, setTeamMessage] = useState('');
  const [selectedTeamProviderIds, setSelectedTeamProviderIds] = useState<(number | string)[]>([]);
  const [teamBookingSuccess, setTeamBookingSuccess] = useState<string | null>(null);

  const handleToggleTeamProvider = (provId: number | string) => {
    if (selectedTeamProviderIds.includes(provId)) {
      setSelectedTeamProviderIds(selectedTeamProviderIds.filter((id) => id !== provId));
    } else {
      setSelectedTeamProviderIds([...selectedTeamProviderIds, provId]);
    }
  };

  const handleOpenTeamModal = () => {
    if (!user) {
      alert('Debes iniciar sesión para solicitar un equipo de trabajo.');
      window.location.href = '/login?redirect=/?action=team';
      return;
    }
    if (selectedTeamProviderIds.length === 0 && providers.length > 0) {
      setSelectedTeamProviderIds(providers.slice(0, 2).map((p) => p.userId || p.id));
    }
    setTeamProjectName('Proyecto Cuadrilla Especializada Cali');
    setTeamMessage('Requerimos cuadrilla para trabajo coordinado en Cali. Por favor confirmar disponibilidad en el rango estimado.');
    setIsTeamModalOpen(true);
  };

  const handleSubmitTeamBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedTeamProviderIds.length === 0) {
      alert('Por favor selecciona al menos 1 o más profesionales para el equipo de trabajo.');
      return;
    }
    if (!teamProjectName.trim()) {
      alert('Por favor ingresa el nombre o propósito de la cuadrilla.');
      return;
    }

    const chosenProviders = (providers.length > 0 ? providers : fallbackProviders)
      .filter((p) => selectedTeamProviderIds.includes(p.userId) || selectedTeamProviderIds.includes(p.id))
      .map((p) => ({
        id: p.userId || p.id,
        name: `${p.user.firstName} ${p.user.lastName}`,
        title: p.title || 'Especialista',
        categoryName: p.providerServices?.[0]?.service?.category?.name || 'Servicios Profesionales',
        hourlyRate: Number(p.hourlyRate) || 45000,
      }));

    const result = createTeamBooking({
      projectName: teamProjectName.trim(),
      clientName: `${user.firstName} ${user.lastName}`,
      clientPhone: user.phone,
      estimatedTimeRange: teamEstimatedTime,
      message: teamMessage.trim(),
      providers: chosenProviders,
    });

    if (result.success) {
      setTeamBookingSuccess(`¡Equipo de ${chosenProviders.length} profesionales solicitado con éxito! Cada especialista ha recibido la notificación en su portal para confirmar.`);
      setTimeout(() => {
        setTeamBookingSuccess(null);
        setIsTeamModalOpen(false);
      }, 3500);
    }
  };

  useEffect(() => {
    // 1. Obtener usuario de la sesión actual
    setUser(getCurrentUser());

    // 2. Cargar categorías de MySQL
    fetch('http://localhost:3003/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error('Error fetching categories from backend:', err));
  }, []);

  // 3. Cargar proveedores filtrados desde el backend MySQL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCity && selectedCity !== 'Todas' && selectedCity !== 'Tu ciudad') {
      params.append('city', selectedCity);
    }
    if (selectedCategory) {
      params.append('category', selectedCategory);
    }
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }

    const url = `http://localhost:3003/providers${params.toString() ? `?${params.toString()}` : ''}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProviders(data);
        }
      })
      .catch((err) => console.error('Error fetching filtered providers from backend:', err));
  }, [selectedCity, selectedCategory, searchQuery]);

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
  };

  const popularPills = [
    { name: 'Cerrajero', icon: Wrench },
    { name: 'Electricista', icon: Zap },
    { name: 'Tecnología', icon: Monitor },
    { name: 'Reparaciones', icon: Hammer },
    { name: 'Educación', icon: GraduationCap },
    { name: 'Diseño', icon: Palette },
  ];

  const categoryCards = [
    { name: 'Cerrajería', icon: Wrench, bg: 'bg-[#ef4444]' },
    { name: 'Electricidad', icon: Zap, bg: 'bg-[#2563eb]' },
    { name: 'Tecnología', icon: Monitor, bg: 'bg-[#8b5cf6]' },
    { name: 'Reparaciones', icon: Hammer, bg: 'bg-[#10b981]' },
    { name: 'Educación', icon: GraduationCap, bg: 'bg-[#f97316]' },
    { name: 'Diseño', icon: Palette, bg: 'bg-[#ec4899]' },
    { name: 'Salud', icon: HeartPulse, bg: 'bg-[#14b8a6]' },
    { name: 'Otros', icon: Grid, bg: 'bg-[#334155]' },
  ];

  // 16 prestadores con base en Colombia (Cali como núcleo principal y ciudades conectadas)
  const fallbackProviders: ProviderData[] = [
    {
      id: 1,
      userId: 3,
      title: 'Cerrajería de Urgencias',
      hourlyRate: 45000,
      isVerified: true,
      rating: 4.8,
      totalReviews: 124,
      user: {
        id: 3,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@conecta360.co',
        phone: '+57 315 123 4567',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 2,
      userId: 4,
      title: 'Electricidad Residencial',
      hourlyRate: 40000,
      isVerified: true,
      rating: 4.7,
      totalReviews: 98,
      user: {
        id: 4,
        firstName: 'Carlos',
        lastName: 'Mendoza',
        email: 'carlos.mendoza@conecta360.co',
        phone: '+57 316 234 5678',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 3,
      userId: 5,
      title: 'Tecnología y Redes',
      hourlyRate: 50000,
      isVerified: true,
      rating: 4.9,
      totalReviews: 156,
      user: {
        id: 5,
        firstName: 'Ana',
        lastName: 'Torres',
        email: 'ana.torres@conecta360.co',
        phone: '+57 317 345 6789',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 4,
      userId: 6,
      title: 'Plomería y Destapes',
      hourlyRate: 35000,
      isVerified: true,
      rating: 4.6,
      totalReviews: 87,
      user: {
        id: 6,
        firstName: 'Luis',
        lastName: 'García',
        email: 'luis.garcia@conecta360.co',
        phone: '+57 318 456 7890',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 5,
      userId: 7,
      title: 'Reparaciones y Mantenimiento',
      hourlyRate: 38000,
      isVerified: true,
      rating: 4.8,
      totalReviews: 110,
      user: {
        id: 7,
        firstName: 'Roberto',
        lastName: 'Vaca',
        email: 'roberto.vaca@conecta360.co',
        phone: '+57 319 567 8901',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 6,
      userId: 8,
      title: 'Diseño Gráfico y Branding',
      hourlyRate: 48000,
      isVerified: true,
      rating: 4.9,
      totalReviews: 142,
      user: {
        id: 8,
        firstName: 'Diana',
        lastName: 'Salazar',
        email: 'diana.salazar@conecta360.co',
        phone: '+57 320 678 9012',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 7,
      userId: 9,
      title: 'Pintura y Acabados',
      hourlyRate: 32000,
      isVerified: true,
      rating: 4.7,
      totalReviews: 79,
      user: {
        id: 9,
        firstName: 'Esteban',
        lastName: 'Morales',
        email: 'esteban.morales@conecta360.co',
        phone: '+57 321 789 0123',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 8,
      userId: 10,
      title: 'Tutorías y Educación',
      hourlyRate: 35000,
      isVerified: true,
      rating: 5.0,
      totalReviews: 215,
      user: {
        id: 10,
        firstName: 'Sofía',
        lastName: 'Castro',
        email: 'sofia.castro@conecta360.co',
        phone: '+57 322 890 1234',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 9,
      userId: 11,
      title: 'Carpintería Fina',
      hourlyRate: 42000,
      isVerified: true,
      rating: 4.8,
      totalReviews: 93,
      user: {
        id: 11,
        firstName: 'Fernando',
        lastName: 'Rios',
        email: 'fernando.rios@conecta360.co',
        phone: '+57 311 901 2345',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 10,
      userId: 12,
      title: 'Fisioterapia y Bienestar',
      hourlyRate: 55000,
      isVerified: true,
      rating: 4.9,
      totalReviews: 168,
      user: {
        id: 12,
        firstName: 'Valeria',
        lastName: 'Ortiz',
        email: 'valeria.ortiz@conecta360.co',
        phone: '+57 312 012 3456',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 11,
      userId: 13,
      title: 'Cerrajería Automotriz',
      hourlyRate: 45000,
      isVerified: true,
      rating: 4.7,
      totalReviews: 61,
      user: {
        id: 13,
        firstName: 'Gabriel',
        lastName: 'Navarro',
        email: 'gabriel.navarro@conecta360.co',
        phone: '+57 313 123 7890',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 12,
      userId: 14,
      title: 'Marketing Digital y Redes',
      hourlyRate: 52000,
      isVerified: true,
      rating: 4.9,
      totalReviews: 134,
      user: {
        id: 14,
        firstName: 'Camila',
        lastName: 'Díaz',
        email: 'camila.diaz@conecta360.co',
        phone: '+57 314 234 8901',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 13,
      userId: 15,
      title: 'Construcción y Remodelaciones',
      hourlyRate: 36000,
      isVerified: true,
      rating: 4.6,
      totalReviews: 88,
      user: {
        id: 15,
        firstName: 'Diego',
        lastName: 'Herrera',
        email: 'diego.herrera@conecta360.co',
        phone: '+57 315 345 9012',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 14,
      userId: 16,
      title: 'Limpieza Integral y Desinfección',
      hourlyRate: 28000,
      isVerified: true,
      rating: 4.8,
      totalReviews: 195,
      user: {
        id: 16,
        firstName: 'Patricia',
        lastName: 'López',
        email: 'patricia.lopez@conecta360.co',
        phone: '+57 316 456 0123',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 15,
      userId: 17,
      title: 'Mecánica Automotriz a Domicilio',
      hourlyRate: 46000,
      isVerified: true,
      rating: 4.7,
      totalReviews: 74,
      user: {
        id: 17,
        firstName: 'Javier',
        lastName: 'Paredes',
        email: 'javier.paredes@conecta360.co',
        phone: '+57 317 567 1234',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
    {
      id: 16,
      userId: 18,
      title: 'Climatización y Aires Acondicionados',
      hourlyRate: 48000,
      isVerified: true,
      rating: 4.9,
      totalReviews: 105,
      user: {
        id: 18,
        firstName: 'Lucía',
        lastName: 'Zambrano',
        email: 'lucia.zambrano@conecta360.co',
        phone: '+57 318 678 2345',
        profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
      },
    },
  ];

  // Si el usuario actual tiene servicios agregados, prependerlos para que se vean inmediatamente
  const userPublishedCards: ProviderData[] =
    user && user.services && user.services.length > 0
      ? user.services.map((srv) => ({
          id: srv.id,
          userId: user.id,
          title: srv.title,
          hourlyRate: srv.hourlyRate,
          isVerified: user.isVerified, // Tarjeta muestra si está verificado o aún no
          rating: 5.0,
          totalReviews: 0,
          featuredActivities: srv.featuredActivities || srv.activities.slice(0, 4),
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            profile: {
              city: srv.city || user.profile.city,
              department: srv.department || user.profile.department,
              country: 'Colombia',
              profilePhoto: user.profile.profilePhoto || null,
            },
          },
        }))
      : [];

  const baseProviders = providers.length >= 16 ? providers : fallbackProviders;
  const allProviders = [...userPublishedCards, ...baseProviders];

  const getProviderPricingModel = (prov: ProviderData): 'POR_HORA' | 'POR_DIA' | 'POR_CUMPLIMIENTO' => {
    if (prov.pricingModel) return prov.pricingModel;
    if (user && user.role === 'PROVIDER' && String(prov.userId) === String(user.id)) {
      const s = user.services.find((srv) => srv.id === prov.id) || user.services[0];
      if (s && s.pricingModel) return s.pricingModel;
    }
    const titleLower = (prov.title || '').toLowerCase();
    if (titleLower.includes('pint') || titleLower.includes('constr') || titleLower.includes('repar') || titleLower.includes('carp')) {
      return 'POR_DIA';
    }
    if (titleLower.includes('destape') || titleLower.includes('diseñ') || titleLower.includes('web') || titleLower.includes('market') || titleLower.includes('instalac')) {
      return 'POR_CUMPLIMIENTO';
    }
    return 'POR_HORA';
  };

  // Filtrado por Ciudad (Cali por defecto), categoría, cobro y búsqueda
  const filteredProviders = allProviders.filter((prov) => {
    const city = prov.user.profile?.city?.toLowerCase() || '';
    const dept = prov.user.profile?.department?.toLowerCase() || '';
    const title = (prov.title || '').toLowerCase();
    const name = `${prov.user.firstName} ${prov.user.lastName}`.toLowerCase();

    // Filtro de ciudad si no es 'Todas las ciudades'
    if (selectedCity && selectedCity !== 'Todas' && selectedCity !== 'Tu ciudad') {
      const matchCity = city.includes(selectedCity.toLowerCase());
      if (!matchCity) return false;
    }

    // Filtro de categoría
    if (selectedCategory) {
      const matchCat = title.includes(selectedCategory.toLowerCase());
      if (!matchCat) return false;
    }

    // Filtro de modalidad de cobro (Por Horas, Por Día, Por Cumplimiento)
    if (selectedPricingModel !== 'TODOS') {
      const model = getProviderPricingModel(prov);
      if (model !== selectedPricingModel) return false;
    }

    // Filtro de búsqueda por texto
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = title.includes(q) || name.includes(q) || city.includes(q) || dept.includes(q);
      if (!matchQuery) return false;
    }

    return true;
  });

  const getDefaultPhoto = (prov: ProviderData, index: number) => {
    if (prov.user.profile?.profilePhoto) return prov.user.profile.profilePhoto;

    const nameLower = `${prov.user.firstName} ${prov.user.lastName}`.toLowerCase();
    const titleLower = (prov.title || '').toLowerCase();

    if (nameLower.includes('juan') || (titleLower.includes('cerraj') && !titleLower.includes('auto'))) {
      return '/images/service-cerrajero.jpg';
    }
    if (nameLower.includes('carlos') || titleLower.includes('electr')) {
      return '/images/service-electricista.jpg';
    }
    if (nameLower.includes('ana') || titleLower.includes('tecno') || titleLower.includes('web')) {
      return '/images/service-tecnologia.jpg';
    }
    if (nameLower.includes('luis') || titleLower.includes('plom')) {
      return '/images/service-plomero.jpg';
    }
    if (nameLower.includes('roberto') || titleLower.includes('repar')) {
      return '/images/service-reparaciones.jpg';
    }
    if (nameLower.includes('diana') || titleLower.includes('diseñ')) {
      return '/images/service-diseno.jpg';
    }
    if (nameLower.includes('esteban') || titleLower.includes('pint')) {
      return '/images/service-pintura.jpg';
    }
    if (nameLower.includes('sofia') || titleLower.includes('educ') || titleLower.includes('tutor')) {
      return '/images/service-educacion.jpg';
    }
    if (nameLower.includes('fernando') || titleLower.includes('carp')) {
      return '/images/service-carpinteria.jpg';
    }
    if (nameLower.includes('valeria') || titleLower.includes('salud') || titleLower.includes('bienestar')) {
      return '/images/service-salud.jpg';
    }
    if (nameLower.includes('gabriel') || (titleLower.includes('cerraj') && titleLower.includes('auto'))) {
      return '/images/service-cerrajeria-auto.jpg';
    }
    if (nameLower.includes('camila') || titleLower.includes('market') || titleLower.includes('publicidad')) {
      return '/images/service-marketing.jpg';
    }
    if (nameLower.includes('diego') || titleLower.includes('constr') || titleLower.includes('albañ')) {
      return '/images/service-construccion.jpg';
    }
    if (nameLower.includes('patricia') || titleLower.includes('limp')) {
      return '/images/service-limpieza.jpg';
    }
    if (nameLower.includes('javier') || titleLower.includes('mecan')) {
      return '/images/service-mecanica.jpg';
    }
    if (nameLower.includes('lucia') || titleLower.includes('clim') || titleLower.includes('aire')) {
      return '/images/service-climatizacion.jpg';
    }

    const fallbackImages = [
      '/images/service-cerrajero.jpg',
      '/images/service-electricista.jpg',
      '/images/service-tecnologia.jpg',
      '/images/service-plomero.jpg',
      '/images/service-reparaciones.jpg',
      '/images/service-diseno.jpg',
      '/images/service-pintura.jpg',
      '/images/service-educacion.jpg',
      '/images/service-carpinteria.jpg',
      '/images/service-salud.jpg',
      '/images/service-cerrajeria-auto.jpg',
      '/images/service-marketing.jpg',
      '/images/service-construccion.jpg',
      '/images/service-limpieza.jpg',
      '/images/service-mecanica.jpg',
      '/images/service-climatizacion.jpg',
    ];
    return fallbackImages[index % fallbackImages.length];
  };

  const getCategoryIcon = (categoryName: string) => {
    const cat = categoryName.toLowerCase();
    if (cat.includes('cerraj')) return Wrench;
    if (cat.includes('electr')) return Zap;
    if (cat.includes('tecno') || cat.includes('web')) return Monitor;
    if (cat.includes('plom')) return Hammer;
    if (cat.includes('repar')) return Hammer;
    if (cat.includes('diseñ')) return Palette;
    if (cat.includes('pint')) return Palette;
    if (cat.includes('educ')) return GraduationCap;
    if (cat.includes('carp')) return Hammer;
    if (cat.includes('salud') || cat.includes('bienestar')) return HeartPulse;
    if (cat.includes('market')) return Monitor;
    if (cat.includes('constr')) return Hammer;
    if (cat.includes('limp')) return Shield;
    if (cat.includes('mecan')) return Wrench;
    if (cat.includes('clim')) return Zap;
    return User;
  };

  // Formatear precio y modalidad de cobro (Por Horas, Por Día, Por Cumplimiento)
  const getModelBadge = (model: 'POR_HORA' | 'POR_DIA' | 'POR_CUMPLIMIENTO') => {
    if (model === 'POR_DIA') return { label: 'Por Día', suffix: '/día', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (model === 'POR_CUMPLIMIENTO') return { label: 'Por Cumplimiento', suffix: '/meta', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    return { label: 'Por Horas', suffix: '/h', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  };

  const formatRate = (rate: string | number | null) => {
    const num = Number(rate) || 45000;
    if (num < 1000) {
      return `$${(num * 2000).toLocaleString('es-CO')} COP`;
    }
    return `$${num.toLocaleString('es-CO')} COP`;
  };

  const formatRateWithModel = (rate: string | number | null, model: 'POR_HORA' | 'POR_DIA' | 'POR_CUMPLIMIENTO') => {
    let num = Number(rate) || 45000;
    if (model === 'POR_DIA') {
      if (num < 100000) num = num * 6; // jornada de 8h
      return `$${num.toLocaleString('es-CO')} COP/día`;
    }
    if (model === 'POR_CUMPLIMIENTO') {
      if (num < 150000) num = num * 12; // precio meta cerrada
      return `$${num.toLocaleString('es-CO')} COP/obra`;
    }
    return `$${num.toLocaleString('es-CO')} COP/h`;
  };

  // Obtener las actividades principales (hasta 4) de la persona para mostrar en la tarjeta exterior
  const getProviderFeaturedActivities = (prov: ProviderData): string[] => {
    if (prov.featuredActivities && prov.featuredActivities.length > 0) {
      return prov.featuredActivities.slice(0, 4);
    }

    if (user && user.role === 'PROVIDER' && String(prov.userId) === String(user.id)) {
      const s = user.services.find((srv) => srv.id === prov.id) || user.services[0];
      if (s) {
        return (s.featuredActivities && s.featuredActivities.length > 0)
          ? s.featuredActivities.slice(0, 4)
          : s.activities.slice(0, 4);
      }
    }

    const titleLower = (prov.title || '').toLowerCase();
    const nameLower = `${prov.user?.firstName || ''} ${prov.user?.lastName || ''}`.toLowerCase();

    if (titleLower.includes('cerraj') || nameLower.includes('juan')) {
      return ['Apertura de cerraduras', 'Duplicado de llaves chip', 'Cerraduras digitales', 'Apertura de autos'];
    }
    if (titleLower.includes('electr') || nameLower.includes('carlos')) {
      return ['Cableado estructurado', 'Paneles solares', 'Reparación cortocircuitos', 'Certificación RETIE'];
    }
    if (titleLower.includes('tecno') || titleLower.includes('web') || nameLower.includes('ana')) {
      return ['Mantenimiento PC', 'Desarrollo web y apps', 'Redes WiFi', 'Seguridad informática'];
    }
    if (titleLower.includes('plom') || nameLower.includes('luis')) {
      return ['Reparación de fugas', 'Destape de cañerías', 'Instalación de grifería', 'Motobombas'];
    }
    if (titleLower.includes('repar') || nameLower.includes('roberto')) {
      return ['Reparación electrodomésticos', 'Drywall y techos', 'Pintura residencial', 'Enchapes y pisos'];
    }
    if (titleLower.includes('diseñ') || nameLower.includes('diana')) {
      return ['Diseño de logos', 'Diseño UI/UX móvil', 'Branding corporativo', 'Publicidad digital'];
    }
    if (titleLower.includes('educ') || nameLower.includes('sofia')) {
      return ['Matemáticas y física', 'Inglés interactivo', 'Pruebas Saber 11', 'Refuerzo escolar'];
    }
    if (titleLower.includes('salud') || nameLower.includes('valeria')) {
      return ['Fisioterapia a domicilio', 'Rehabilitación física', 'Masaje terapéutico', 'Ergonomía postural'];
    }
    return ['Diagnóstico técnico', 'Servicio a domicilio en Cali', 'Mantenimiento preventivo', 'Garantía de servicio'];
  };

  // Renderizar tarjeta de servicio
  const renderProviderCard = (prov: ProviderData, idx: number) => {
    const fullName = `${prov.user.firstName} ${prov.user.lastName}`;
    const categoryTitle = prov.title || 'Servicio Profesional';
    const locationStr = prov.user.profile?.city
      ? `${prov.user.profile.city}, ${prov.user.profile.department || 'Valle del Cauca'}`
      : 'Cali, Valle del Cauca';
    const photoUrl = getDefaultPhoto(prov, idx);
    const CatIcon = getCategoryIcon(categoryTitle);
    const activitiesToShow = getProviderFeaturedActivities(prov);
    const pricingModel = getProviderPricingModel(prov);
    const modelBadge = getModelBadge(pricingModel);

    return (
      <div
        key={`${prov.id}-${idx}`}
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
      >
        <div>
          {/* Imagen por defecto del servicio con badge de verificación y favorito */}
          <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-100">
            <img
              src={photoUrl}
              alt={`${categoryTitle} - ${fullName}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>

            {/* Botón de favorito */}
            <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-slate-600 shadow-xs">
              <Heart className="w-3.5 h-3.5 hover:text-red-500 transition-colors" />
            </div>

            {/* Modalidad de cobro (Por hora, por día, por cumplimiento) */}
            <div className="absolute bottom-2 left-2">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-xs ${modelBadge.color}`}>
                {modelBadge.label}
              </span>
            </div>

            {/* Estado de verificación: Verificado vs Sin verificar */}
            {prov.isVerified ? (
              <div className="absolute top-2 right-2 bg-[#0056d2] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>Verificado</span>
              </div>
            ) : (
              <div className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                <Clock className="w-2.5 h-2.5 stroke-[3]" />
                <span>Sin verificar</span>
              </div>
            )}
          </div>

          {/* Contenido con datos reales del usuario */}
          <div className="p-3 sm:p-3.5 space-y-1.5">
            {/* Categoría con icono circular */}
            <div className="flex items-center space-x-1.5 text-[10px] font-bold text-[#0056d2]">
              <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <CatIcon className="w-2.5 h-2.5 text-[#0056d2]" />
              </div>
              <span className="truncate">{categoryTitle}</span>
            </div>

            {/* Nombre del Proveedor */}
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0056d2] transition-colors leading-tight truncate">
                {fullName}
              </h3>
            </div>

            {/* Calificación, estrellas y Ubicación en UNA MISMA FILA */}
            <div className="flex items-center justify-between text-xs text-slate-500 gap-1.5 pt-0.5">
              <div className="flex items-center space-x-1 shrink-0">
                <div className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                  <span>{prov.rating > 0 ? prov.rating.toFixed(1) : '5.0'}</span>
                </div>
                <span className="text-slate-400 text-[10.5px]">
                  ({prov.totalReviews || 12})
                </span>
              </div>
              <div className="flex items-center text-slate-500 text-[10.5px] font-medium truncate shrink min-w-0">
                <MapPin className="w-3 h-3 text-rose-500 mr-0.5 shrink-0" />
                <span className="truncate">{locationStr}</span>
              </div>
            </div>

            {/* 4 Actividades Principales de la Persona en la Tarjeta Exterior */}
            <div className="pt-1.5 border-t border-slate-100 space-y-1">
              <span className="text-[9.5px] font-bold text-slate-400 block uppercase tracking-wider">
                Actividades Principales ({activitiesToShow.length}):
              </span>
              <div className="flex flex-wrap gap-1">
                {activitiesToShow.map((act, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[9.5px] font-semibold border border-slate-200/70 flex items-center space-x-1"
                  >
                    <Tag className="w-2.5 h-2.5 text-[#0056d2] shrink-0" />
                    <span className="truncate max-w-[130px]">{act}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer de la tarjeta: Precio y botones con autenticación previa */}
        <div className="p-3 sm:p-3.5 pt-0 border-t border-slate-100 mt-1.5 flex items-center justify-between gap-2">
          <div>
            <span className="text-[9.5px] text-slate-400 block font-semibold">Tarifa {modelBadge.label.toLowerCase()}</span>
            <span className="text-xs font-black text-[#0056d2]">
              {formatRateWithModel(prov.hourlyRate, pricingModel)}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Link
              href={`/profile/${prov.userId}`}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all"
            >
              Perfil
            </Link>
            <Link
              href={
                user
                  ? `/profile/${prov.userId}?action=hire`
                  : `/login?redirect=/profile/${prov.userId}&action_type=hire`
              }
              className="px-3 py-1.5 rounded-lg bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs font-bold transition-all shadow-xs"
            >
              Contratar
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // Filtrado para la lista de ciudades del modal/dropdown
  const filteredCityList = ALL_COLOMBIAN_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(citySearchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. TOP NAVBAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 sm:h-20 flex items-center shadow-xs">
        <div className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 flex items-center justify-between">
          {/* Logo Oficial CONECTA 360 con la imagen subida en tamaño justo para la barra */}
          <Link href="/" className="flex items-center">
            <img
              src="/images/logo-conecta-nav.png"
              alt="CONECTA 360"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-600">
            <Link href="/" className="text-[#0056d2] font-bold border-b-2 border-[#0056d2] pb-1">
              Inicio
            </Link>
            <Link href="/services" className="hover:text-[#0056d2] transition-colors">
              Servicios
            </Link>
            <Link href="/cuadrillas" className="hover:text-[#0056d2] transition-colors flex items-center space-x-1.5">
              <span>Cuadrillas</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                Nuevo
              </span>
            </Link>
            <Link href="#categorias" className="hover:text-[#0056d2] transition-colors">
              Categorías
            </Link>
            <Link href="#como-funciona" className="hover:text-[#0056d2] transition-colors">
              Cómo funciona
            </Link>
            <Link href="/admin" className="hover:text-[#0056d2] transition-colors">
              Admin
            </Link>
          </nav>

          {/* Controles de la Barra Superior: Dinámicos según estado de inicio de sesión */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              // Usuario autenticado
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-[#0056d2] text-xs sm:text-sm font-bold flex items-center space-x-1.5 sm:space-x-2 border border-blue-200 transition-all shadow-xs"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      user.isVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                    }`}
                  />
                  <span className="max-w-[100px] sm:max-w-none truncate">{user.firstName}</span>
                </Link>

                <Link
                  href="/dashboard?action=new-service"
                  className="px-4 py-2 rounded-full bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs sm:text-sm font-bold items-center space-x-1.5 shadow-sm transition-all hidden sm:flex"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Ofrecer Servicios</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              // Usuario no autenticado: botón único de acceso "Ingresar" y "Quiero ofrecer"
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  href="/login?redirect=/dashboard?action=new-service&action_type=offer"
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#0056d2] text-[#0056d2] hover:bg-blue-50 text-xs sm:text-sm font-bold items-center space-x-1.5 transition-all hidden sm:flex"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Quiero ofrecer</span>
                </Link>

                <Link
                  href="/login"
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Ingresar</span>
                </Link>
              </div>
            )}

            {/* Botón de Menú Móvil */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Abrir menú"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-800" />
              ) : (
                <Menu className="w-5 h-5 text-slate-800" />
              )}
            </button>
          </div>
        </div>

        {/* Desplegable de Navegación Móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-xl px-5 py-4 space-y-3 z-50">
            <nav className="flex flex-col space-y-1.5 text-sm font-semibold text-slate-700">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg bg-blue-50 text-[#0056d2] font-bold"
              >
                Inicio
              </Link>
              <Link
                href="/services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Servicios
              </Link>
              <Link
                href="/cuadrillas"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <span>Cuadrillas & Equipos</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                  Nuevo
                </span>
              </Link>
              <Link
                href="#categorias"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Categorías
              </Link>
              <Link
                href="#como-funciona"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cómo funciona
              </Link>
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Panel Admin
              </Link>
            </nav>

            <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
              {!user && (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-[#0056d2] text-slate-700 hover:text-[#0056d2] text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Ingresar a mi cuenta</span>
                </Link>
              )}
              <Link
                href={user ? '/dashboard?action=new-service' : '/login?redirect=/dashboard?action=new-service&action_type=offer'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0056d2] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-sm"
              >
                <Wrench className="w-4 h-4" />
                <span>Quiero ofrecer servicios</span>
              </Link>
              <div className="text-[11px] text-center text-slate-400 font-medium pt-0.5">
                📍 Operando en Cali y principales ciudades de Colombia
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO BANNER INTEGRADO COMPLETAMENTE EN EL FONDO */}
      <section className="relative overflow-hidden bg-[#002f6c] text-white min-h-[440px] lg:min-h-[480px]">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-people-clean.jpg"
            alt="Conecta 360"
            className="w-full h-full object-cover object-right lg:object-[82%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#002f6c] via-[#002f6c]/90 to-transparent w-full lg:w-[65%]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#002f6c]/50 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 py-12 lg:py-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text and Search (Span 7) */}
          <div className="lg:col-span-7 space-y-4 max-w-xl">
            {/* Red pill badge */}
            <div className="inline-block bg-[#ef4444] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              PLATAFORMA DE SERVICIOS COLOMBIA
            </div>

            {/* Title with Conecta 360 con el icono oficial exacto */}
            <div className="flex items-center space-x-3 sm:space-x-4 pt-1">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 drop-shadow-md">
                <img
                  src="/images/logo-conecta-hero-icon.png"
                  alt="Icono CONECTA 360"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
                CONECTA <span className="text-[#ef4444]">360</span>
              </h1>
            </div>

            {/* Slogans */}
            <div className="space-y-1 pt-1">
              <p className="text-xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-sm">
                Conecta lo que necesitas <br />
                con quien puede hacerlo.
              </p>
              <p className="text-sm sm:text-lg font-medium text-slate-200 drop-shadow-xs">
                Necesitas. Encuentras. Contratas en Cali y toda Colombia.
              </p>
            </div>

            {/* Search Pill Bar con Selector de Ciudades de Colombia (Inicialmente Cali) */}
            <div className="pt-3 relative">
              <div className="bg-white rounded-2xl sm:rounded-full p-2 sm:p-1.5 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center border border-white max-w-lg gap-2 sm:gap-0">
                <div className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 flex-1 w-full text-slate-700">
                  <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="¿Qué servicio necesitas?"
                    className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-semibold"
                  />
                </div>

                <div className="h-px w-full bg-slate-100 sm:hidden"></div>
                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                {/* Dropdown de Ciudades de Colombia */}
                <div
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="flex items-center justify-between sm:justify-start px-3 sm:px-4 py-1.5 sm:py-2 text-slate-700 text-xs sm:text-sm font-semibold cursor-pointer shrink-0 hover:bg-slate-50 rounded-xl sm:rounded-full transition-colors relative"
                >
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-[#0056d2] mr-1.5 shrink-0" />
                    <span className="font-bold truncate max-w-[120px] sm:max-w-none">{selectedCity}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1.5 shrink-0" />
                </div>

                <button className="w-full sm:w-auto px-6 sm:px-7 py-2.5 sm:py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs sm:text-sm font-extrabold rounded-xl sm:rounded-full transition-all shadow-md shrink-0">
                  Buscar
                </button>
              </div>

              {/* Menú desplegable de Ciudades de Colombia conectadas por transporte */}
              {isCityDropdownOpen && (
                <div className="absolute left-0 right-0 sm:right-auto sm:left-auto sm:right-28 top-full mt-2 max-w-[calc(100vw-2.5rem)] sm:w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 text-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-600">
                      Ciudades y Transportes
                    </span>
                    <button
                      onClick={() => setIsCityDropdownOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={citySearchTerm}
                    onChange={(e) => setCitySearchTerm(e.target.value)}
                    placeholder="Buscar ciudad o departamento..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0056d2]"
                  />

                  <div className="max-h-56 overflow-y-auto space-y-1">
                    <button
                      onClick={() => {
                        setSelectedCity('Todas');
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg font-semibold flex items-center justify-between ${
                        selectedCity === 'Todas' ? 'bg-blue-50 text-[#0056d2]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span>Todas las ciudades (Colombia)</span>
                      {selectedCity === 'Todas' && <Check className="w-3.5 h-3.5 text-[#0056d2]" />}
                    </button>

                    {filteredCityList.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCity(item.city);
                          setIsCityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                          selectedCity === item.city
                            ? 'bg-blue-50 text-[#0056d2] font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="block font-medium">
                            {item.city} {item.city === 'Cali' ? '⭐ (Principal)' : ''}
                          </span>
                          <span className="text-[10px] text-slate-400">{item.department}</span>
                        </div>
                        {selectedCity === item.city && <Check className="w-3.5 h-3.5 text-[#0056d2]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Popular Searches Pills */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-200">
              <span className="mr-1">Búsquedas populares:</span>
              {popularPills.map((pill, idx) => {
                const Icon = pill.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(pill.name);
                      setSelectedCategory(null);
                    }}
                    className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/20 transition-all flex items-center space-x-1 backdrop-blur-xs"
                  >
                    <Icon className="w-3 h-3" />
                    <span>{pill.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block h-[340px]"></div>
        </div>
      </section>

      {/* 3. DUAL ACTION CARDS & 4 TRUST PILLARS */}
      <section className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
          {/* Card: Necesito algo */}
          <Link
            href="#servicios"
            className="md:col-span-3.5 lg:col-span-4 bg-[#eff6ff] border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center space-x-3.5 sm:space-x-4 hover:shadow-xl transition-all group"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#0056d2] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <User className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">Necesito algo</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                Busca personas en Cali por categoría, experiencia, precio en COP y verificación.
              </p>
            </div>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 text-[#0056d2] flex items-center justify-center shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card: Quiero ofrecer */}
          <Link
            href={user ? '/dashboard' : '/register?role=provider'}
            className="md:col-span-3.5 lg:col-span-4 bg-[#fef2f2] border border-red-100 rounded-2xl p-4 sm:p-5 shadow-lg flex items-center space-x-3.5 sm:space-x-4 hover:shadow-xl transition-all group"
          >
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#ef4444] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">Quiero ofrecer</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                Registra tus servicios en Cali y consigue clientes. Plan gratis con 1 servicio.
              </p>
            </div>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-100 text-[#ef4444] flex items-center justify-center shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Trust 4 Pillars Block */}
          <div className="md:col-span-5 lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-lg grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2 text-center items-center">
            <div className="flex flex-col items-center">
              <Shield className="w-5 h-5 text-[#0056d2] mb-1" />
              <p className="text-xs font-bold text-slate-900 leading-tight">Seguridad</p>
              <p className="text-[10px] text-slate-400 font-medium">Perfiles verificados</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-5 h-5 text-[#0056d2] mb-1" />
              <p className="text-xs font-bold text-slate-900 leading-tight">Calidad</p>
              <p className="text-[10px] text-slate-400 font-medium">Calificaciones reales</p>
            </div>
            <div className="flex flex-col items-center">
              <FastIcon className="w-5 h-5 text-[#0056d2] mb-1" />
              <p className="text-xs font-bold text-slate-900 leading-tight">Rapidez</p>
              <p className="text-[10px] text-slate-400 font-medium">En minutos</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-5 h-5 text-[#0056d2] mb-1" />
              <p className="text-xs font-bold text-slate-900 leading-tight">Cercanía</p>
              <p className="text-[10px] text-slate-400 font-medium">Sede Cali y Valle</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CATEGORÍAS MÁS POPULARES */}
      <section id="categorias" className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 pt-16 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Categorías más populares
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Encuentra a los profesionales más solicitados en Cali y alrededores
            </p>
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs font-bold text-[#0056d2] hover:underline flex items-center space-x-1"
            >
              <span>Mostrar todas</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
          {categoryCards.map((cat, idx) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-[#0056d2] shadow-md scale-105'
                    : 'bg-white border-slate-200 hover:border-[#0056d2] hover:shadow-md'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${cat.bg} text-white flex items-center justify-center shadow-md mb-2.5`}
                >
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-xs font-extrabold text-slate-800 text-center leading-tight">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. SERVICIOS DESTACADOS FILTRADOS POR COLOMBIA & CALI */}
      <section id="servicios" className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#0056d2] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full">
                {selectedCity === 'Todas' ? 'Colombia' : `Ciudad: ${selectedCity}`}
              </span>
              {selectedCategory && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                  {selectedCategory}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Profesionales y Servicios Disponibles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tarifas en pesos colombianos, perfiles verificados y atención garantizada
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedCity('Cali')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCity === 'Cali'
                  ? 'bg-[#0056d2] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              ⭐ Solo Cali
            </button>
            <button
              onClick={() => setSelectedCity('Todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCity === 'Todas'
                  ? 'bg-[#0056d2] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Toda Colombia
            </button>
          </div>
        </div>

        {/* Filtros por Modalidad de Cobro: Por Horas, Por Día, Por Cumplimiento */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Modalidad:
          </span>
          {[
            { id: 'TODOS', label: 'Todas las Modalidades', icon: '✨' },
            { id: 'POR_HORA', label: 'Por Horas', icon: '⏱️', desc: 'Cobro por hora de servicio' },
            { id: 'POR_DIA', label: 'Por Día (Jornada)', icon: '📅', desc: 'Tarifa diaria o jornada de trabajo' },
            { id: 'POR_CUMPLIMIENTO', label: 'Por Cumplimiento', icon: '🏆', desc: 'Precio cerrado por meta o trabajo entregado' },
          ].map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelectedPricingModel(mod.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs ${
                selectedPricingModel === mod.id
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
              title={mod.desc}
            >
              <span>{mod.icon}</span>
              <span>{mod.label}</span>
            </button>
          ))}
          {selectedPricingModel !== 'TODOS' && (
            <button
              onClick={() => setSelectedPricingModel('TODOS')}
              className="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1 ml-1 transition-colors"
            >
              Limpiar filtro
            </button>
          )}
        </div>

        {/* Banner Especial: Solicitar Equipo de Trabajo / Cuadrilla Multi-Profesional */}
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-[#0056d2] to-indigo-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="space-y-1.5 z-10 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                Nuevo &bull; Equipos y Cuadrillas
              </span>
              <span className="text-xs font-semibold text-blue-200">
                Contrata múltiples profesionales a la vez en Cali
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
              ¿Necesitas un Equipo de Trabajo (Cuadrilla)?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Solicita varias personas de la misma categoría o combina diferentes especialidades (ej: electricista + cerrajero + técnico TI), acuerda un rango de tiempo estimado conjunto y envíales instrucciones en un solo clic.
            </p>
          </div>

          <div className="shrink-0 z-10">
            <button
              onClick={handleOpenTeamModal}
              className="w-full md:w-auto px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Solicitar Equipo de Trabajo</span>
            </button>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/5 skew-x-12 pointer-events-none" />
        </div>

        {/* Grid de Tarjetas de Servicios */}
        {filteredProviders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-black text-slate-800">
              No se encontraron servicios en {selectedCity}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Intenta buscar en Cali o seleccionar "Toda Colombia" para ver todos los prestadores disponibles.
            </p>
            <button
              onClick={() => {
                setSelectedCity('Cali');
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-[#0056d2] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Restablecer a Cali
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredProviders.map((prov, idx) => renderProviderCard(prov, idx))}
            </div>

            {/* Botón Ver más servicios */}
            <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/services"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#002f6c] via-[#0056d2] to-indigo-700 hover:from-[#002353] hover:to-[#0046a8] text-white text-sm font-extrabold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2.5 group"
              >
                <span>Ver más servicios y profesionales</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 6. ¿CÓMO FUNCIONA? */}
      <section id="como-funciona" className="py-14 sm:py-18 bg-[#f8fafc] border-t border-slate-200/80">
        <div className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
          <div className="text-left mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ¿Cómo funciona?
            </h2>
            <p className="text-xs sm:text-sm text-[#0056d2] font-semibold mt-1">
              Es muy fácil, solo sigue estos pasos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Paso 1 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#0056d2] text-white font-black text-xs flex items-center justify-center shadow-xs">
                  1
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-[#0056d2] flex items-center justify-center text-[#0056d2]">
                  <Search className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>
              <h3 className="text-base font-black text-slate-900 pt-1">
                Busca el servicio
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Explora las categorías o usa el buscador para encontrar lo que necesitas.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#ef4444] text-white font-black text-xs flex items-center justify-center shadow-xs">
                  2
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-[#ef4444] flex items-center justify-center text-[#ef4444]">
                  <User className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>
              <h3 className="text-base font-black text-slate-900 pt-1">
                Elige un proveedor
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Revisa perfiles, calificaciones, experiencia y precios.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#10b981] text-white font-black text-xs flex items-center justify-center shadow-xs">
                  3
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-[#10b981] flex items-center justify-center text-[#10b981]">
                  <Calendar className="w-6 h-6 stroke-[2.2]" />
                </div>
              </div>
              <h3 className="text-base font-black text-slate-900 pt-1">
                Agenda y contrata
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Comunícate con el proveedor, acuerda los detalles y confirma el servicio.
              </p>
            </div>

            {/* Paso 4 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#8b5cf6] text-white font-black text-xs flex items-center justify-center shadow-xs">
                  4
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-[#8b5cf6] flex items-center justify-center text-[#8b5cf6]">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
              </div>
              <h3 className="text-base font-black text-slate-900 pt-1">
                ¡Listo!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Disfruta de tu servicio con la tranquilidad de estar en una plataforma segura.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ¿POR QUÉ ELEGIR CONECTA360? & APP MÓVIL */}
      <section className="py-14 sm:py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 8 Cols: ¿Por qué elegir Conecta360? */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ¿Por qué elegir Conecta360?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Más que una plataforma, es una comunidad de confianza.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-2">
                {/* 1. Profesionales verificados */}
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#0056d2] text-white flex items-center justify-center shadow-xs">
                    <Shield className="w-5 h-5 fill-white" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    Profesionales verificados
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Todos nuestros proveedores son revisados y cuentan con respaldo.
                  </p>
                </div>

                {/* 2. Valoraciones reales */}
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center shadow-xs">
                    <Star className="w-5 h-5 fill-white" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    Valoraciones reales
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Consulta opiniones de otros usuarios antes de contratar.
                  </p>
                </div>

                {/* 3. Ahorra tiempo */}
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#10b981] text-white flex items-center justify-center shadow-xs">
                    <Clock className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    Ahorra tiempo
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Encuentra el servicio ideal en minutos, sin complicaciones.
                  </p>
                </div>

                {/* 4. Apoyo local */}
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#ef4444] text-white flex items-center justify-center shadow-xs">
                    <Heart className="w-5 h-5 fill-white" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                    Apoyo local
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Impulsamos el talento y los servicios de tu ciudad.
                  </p>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: App Móvil Card */}
            <div className="lg:col-span-4">
              <div className="bg-[#002f6c] text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="w-36 sm:w-[45%] shrink-0 mx-auto">
                  <img
                    src="/images/app-banner-mobile.png"
                    alt="Lleva Conecta360 siempre contigo"
                    className="w-full h-auto object-contain drop-shadow-lg max-h-48 sm:max-h-none mx-auto"
                  />
                </div>
                <div className="w-full sm:w-[55%] space-y-2">
                  <h3 className="text-base sm:text-lg font-black leading-tight text-white">
                    Lleva Conecta360 siempre contigo
                  </h3>
                  <p className="text-[11px] text-blue-100 leading-snug">
                    Descarga nuestra app y accede a todos los servicios desde tu celular.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 pt-1">
                    <a
                      href="#"
                      className="inline-flex items-center justify-center sm:justify-start space-x-1.5 sm:space-x-2 bg-black/90 hover:bg-black text-white px-2.5 py-2 rounded-lg border border-white/20 transition-all text-[10px] w-full"
                    >
                      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M3.609 1.814L13.793 12 3.61 22.186a2.37 2.37 0 0 1-.22-.324 2.128 2.128 0 0 1-.2-.93V3.068c0-.342.069-.66.2-.93a2.37 2.37 0 0 1 .219-.324zm11.23 11.23l2.096-2.096-12.06-6.963 9.964 9.059zm1.042-1.042l3.242 1.872a1.764 1.764 0 0 1 0 3.052l-3.242 1.872-2.146-2.146 2.146-2.65zm-1.042 3.136l-9.964 9.059 12.06-6.963-2.096-2.096z"/>
                      </svg>
                      <div className="text-left">
                        <div className="text-[7px] uppercase tracking-wider text-slate-300 leading-none">Disponible en</div>
                        <div className="text-[10px] font-bold leading-tight">Google Play</div>
                      </div>
                    </a>
                    <a
                      href="#"
                      className="inline-flex items-center justify-center sm:justify-start space-x-1.5 sm:space-x-2 bg-black/90 hover:bg-black text-white px-2.5 py-2 rounded-lg border border-white/20 transition-all text-[10px] w-full"
                    >
                      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.61-.75 1.04-1.8 0.92-2.87-.92.04-2.01.62-2.65 1.37-.56.65-1.06 1.71-.93 2.74 1.03.08 2.06-.52 2.66-1.24z"/>
                      </svg>
                      <div className="text-left">
                        <div className="text-[7px] uppercase tracking-wider text-slate-300 leading-none">Consíguelo en el</div>
                        <div className="text-[10px] font-bold leading-tight">App Store</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. LO QUE DICEN NUESTROS USUARIOS */}
      <section className="py-14 sm:py-16 bg-[#f8fafc] border-t border-slate-200/80">
        <div className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Lo que dicen nuestros usuarios
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                La confianza de nuestra comunidad nos impulsa a seguir.
              </p>
            </div>
            <a
              href="#"
              className="text-xs font-bold text-[#0056d2] hover:underline flex items-center space-x-1"
            >
              <span>Ver más reseñas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Reseña 1: Laura Gómez */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3">
                <img
                  src="/images/avatar-laura.png"
                  alt="Laura Gómez"
                  className="w-11 h-11 rounded-full object-cover shrink-0 shadow-xs border border-slate-100"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-[#0056d2]">
                    Laura Gómez
                  </h4>
                  <div className="flex items-center text-amber-400 text-xs">
                    {'★★★★★'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                &ldquo;Usé <span className="font-bold text-slate-800">Conecta360</span> para encontrar un electricista y fue excelente. Llegó puntual, hizo un gran trabajo y el precio fue justo. ¡Muy recomendado!&rdquo;
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center text-slate-500 text-[11px] font-medium">
                <MapPin className="w-3 h-3 text-[#0056d2] mr-1 shrink-0" />
                <span>Cali</span>
              </div>
            </div>

            {/* Reseña 2: Andrés Ramírez */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3">
                <img
                  src="/images/avatar-andres.png"
                  alt="Andrés Ramírez"
                  className="w-11 h-11 rounded-full object-cover shrink-0 shadow-xs border border-slate-100"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-[#0056d2]">
                    Andrés Ramírez
                  </h4>
                  <div className="flex items-center text-amber-400 text-xs">
                    {'★★★★★'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                &ldquo;La plataforma es muy fácil de usar y los proveedores son de confianza. Encontré un servicio de limpieza rápido y profesional.&rdquo;
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center text-slate-500 text-[11px] font-medium">
                <MapPin className="w-3 h-3 text-[#0056d2] mr-1 shrink-0" />
                <span>Palmira</span>
              </div>
            </div>

            {/* Reseña 3: Sofía Martínez */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center space-x-3">
                <img
                  src="/images/avatar-sofia.png"
                  alt="Sofía Martínez"
                  className="w-11 h-11 rounded-full object-cover shrink-0 shadow-xs border border-slate-100"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-[#0056d2]">
                    Sofía Martínez
                  </h4>
                  <div className="flex items-center text-amber-400 text-xs">
                    {'★★★★★'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                &ldquo;Me ayudaron a encontrar un tutor de matemáticas para mi hijo. Todo fue muy organizado y la atención fue excelente.&rdquo;
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center text-slate-500 text-[11px] font-medium">
                <MapPin className="w-3 h-3 text-[#0056d2] mr-1 shrink-0" />
                <span>Cali</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION BANNER */}
      <section className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 my-10 sm:my-16">
        <div className="bg-[#002f6c] text-white rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden text-center sm:text-left">
          {/* Logo Circular con Slogan */}
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 relative drop-shadow-md">
              <img
                src="/images/logo-conecta-hero-icon.png"
                alt="Icono CONECTA 360"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                ¿Listo para encontrar u ofrecer servicios?
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1">
                Únete a Conecta360 y sé parte de una comunidad que hace la vida más fácil.
              </p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
            <Link
              href="#servicios"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Necesito algo</span>
            </Link>

            <Link
              href={user ? '/dashboard' : '/register?role=provider'}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-white/70 hover:bg-white/10 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center space-x-2 transition-all"
            >
              <Wrench className="w-4 h-4" />
              <span>Quiero ofrecer</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FOOTER COMPLETO EXACTO */}
      <footer className="bg-[#050b14] text-slate-300 pt-12 sm:pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 sm:pb-12">
            {/* Col 1: Brand (Span 3) */}
            <div className="sm:col-span-2 lg:col-span-3 space-y-3">
              <Link href="/" className="inline-block">
                <img
                  src="/images/logo-conecta-nav.png"
                  alt="CONECTA 360"
                  className="h-7 sm:h-8 w-auto brightness-200 contrast-200 object-contain"
                />
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Conecta lo que necesitas con quien puede hacerlo.
              </p>
            </div>

            {/* Col 2: Enlaces rápidos (Span 2) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Enlaces rápidos
              </h4>
              <ul className="space-y-2 text-xs text-slate-400 font-medium">
                <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
                <li><Link href="#servicios" className="hover:text-white transition-colors">Servicios</Link></li>
                <li><Link href="#categorias" className="hover:text-white transition-colors">Categorías</Link></li>
                <li><Link href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Planes</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Contacto</Link></li>
              </ul>
            </div>

            {/* Col 3: Categorías (Span 3) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Categorías
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-400 font-medium">
                <div><Link href="#servicios" className="hover:text-white transition-colors">Cerrajería</Link></div>
                <div><Link href="#servicios" className="hover:text-white transition-colors">Salud</Link></div>
                <div><Link href="#servicios" className="hover:text-white transition-colors">Electricidad</Link></div>
                <div><Link href="#servicios" className="hover:text-white transition-colors">Otros</Link></div>
                <div><Link href="#servicios" className="hover:text-white transition-colors">Tecnología</Link></div>
                <div className="hidden sm:block"></div>
                <div><Link href="#servicios" className="hover:text-white transition-colors">Reparaciones</Link></div>
                <div className="hidden sm:block"></div>
                <div><Link href="#servicios" className="hover:text-white transition-colors">Educación</Link></div>
                <div className="hidden sm:block"></div>
                <div><Link href="#servicios" className="hover:text-white transition-colors">Diseño</Link></div>
              </div>
            </div>

            {/* Col 4: Síguenos (Span 2) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Síguenos
              </h4>
              <div className="flex items-center space-x-2">
                {/* Facebook */}
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#0056d2] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#e1306c] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="TikTok"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
                {/* YouTube */}
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#ff0000] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#0077b5] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Col 5: Descarga nuestra app (Span 2) */}
            <div className="sm:col-span-2 lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Descarga nuestra app
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                <a
                  href="#"
                  className="flex items-center space-x-2 bg-black text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors w-full"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.793 12 3.61 22.186a2.37 2.37 0 0 1-.22-.324 2.128 2.128 0 0 1-.2-.93V3.068c0-.342.069-.66.2-.93a2.37 2.37 0 0 1 .219-.324zm11.23 11.23l2.096-2.096-12.06-6.963 9.964 9.059zm1.042-1.042l3.242 1.872a1.764 1.764 0 0 1 0 3.052l-3.242 1.872-2.146-2.146 2.146-2.65zm-1.042 3.136l-9.964 9.059 12.06-6.963-2.096-2.096z"/>
                  </svg>
                  <div>
                    <div className="text-[7px] uppercase tracking-wider text-slate-400 leading-none">Disponible en</div>
                    <div className="text-[10px] font-bold leading-tight">Google Play</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-2 bg-black text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors w-full"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.61-.75 1.04-1.8 0.92-2.87-.92.04-2.01.62-2.65 1.37-.56.65-1.06 1.71-.93 2.74 1.03.08 2.06-.52 2.66-1.24z"/>
                  </svg>
                  <div>
                    <div className="text-[7px] uppercase tracking-wider text-slate-400 leading-none">Consíguelo en el</div>
                    <div className="text-[10px] font-bold leading-tight">App Store</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar con Desarrollado por SarriaTech Solutions S.A.S */}
          <div className="border-t border-slate-800/80 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 text-center sm:text-left">
            <p>© 2025 Conecta360. Todos los derechos reservados.</p>
            <p className="text-slate-300 font-semibold">
              Desarrollado por SarriaTech Solutions S.A.S
            </p>
          </div>
        </div>
      </footer>

      {/* MODAL: Solicitar Equipo de Trabajo / Cuadrilla Multi-Profesional */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0056d2] flex items-center justify-center font-black">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Solicitar Equipo de Trabajo / Cuadrilla
                  </h3>
                  <p className="text-xs text-slate-500">
                    Contrata y coordina a varios profesionales de una o varias categorías en Cali
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTeamModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {teamBookingSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-black">¡Solicitud de Equipo Enviada!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">{teamBookingSuccess}</p>
                <p className="text-[11px] text-emerald-600 font-semibold">
                  * Cada especialista recibirá la notificación en su portal para confirmar en el rango de tiempo solicitado.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitTeamBooking} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Nombre o Motivo del Proyecto *
                    </label>
                    <input
                      type="text"
                      value={teamProjectName}
                      onChange={(e) => setTeamProjectName(e.target.value)}
                      placeholder="Ej: Remodelación Integral Oficina Norte Cali"
                      required
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                      Rango de Tiempo Estimado *
                    </label>
                    <select
                      value={teamEstimatedTime}
                      onChange={(e) => setTeamEstimatedTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none font-semibold text-slate-800"
                    >
                      <option value="2 a 4 horas (Media jornada)">2 a 4 horas (Media jornada)</option>
                      <option value="4 a 8 horas (1 día completo)">4 a 8 horas (1 día completo)</option>
                      <option value="2 a 3 días hábiles">2 a 3 días hábiles</option>
                      <option value="1 semana (Proyecto mediano)">1 semana (Proyecto mediano)</option>
                      <option value="Más de 1 semana (Obra / Remodelación)">Más de 1 semana (Obra / Remodelación)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Mensaje e Instrucciones para el Equipo *
                  </label>
                  <textarea
                    rows={3}
                    value={teamMessage}
                    onChange={(e) => setTeamMessage(e.target.value)}
                    placeholder="Describe las tareas específicas, dirección exacta en Cali, herramientas necesarias y requerimientos para el equipo..."
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0056d2] outline-none resize-none font-medium text-slate-800"
                  />
                </div>

                {/* Selección de Profesionales para la cuadrilla */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Selecciona a los Integrantes del Equipo ({selectedTeamProviderIds.length} seleccionados):
                    </label>
                    <span className="text-[11px] text-[#0056d2] font-bold">
                      Puedes seleccionar de varias categorías
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                    {(providers.length > 0 ? providers : fallbackProviders).map((p, idx) => {
                      const pId = p.userId || p.id;
                      const isSelected = selectedTeamProviderIds.includes(pId);
                      return (
                        <div
                          key={`${pId}-${idx}`}
                          onClick={() => handleToggleTeamProvider(pId)}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-50 border-[#0056d2] shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${isSelected ? 'text-[#0056d2]' : 'text-slate-300'}`}>
                              {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                            </div>
                            <img
                              src={getDefaultPhoto(p, idx)}
                              alt={p.user.firstName}
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="text-xs font-black text-slate-900 truncate">
                                {p.user.firstName} {p.user.lastName}
                              </h5>
                              <p className="text-[11px] text-slate-500 truncate">
                                {p.title || 'Especialista'} &bull; <span className="font-semibold text-[#0056d2]">{p.user.profile?.city || 'Cali'}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-slate-900 block">
                              {formatRate(p.hourlyRate)}
                            </span>
                            <span className="text-[10px] text-slate-400">Tarifa hora</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    Total integrantes: <strong className="text-slate-900">{selectedTeamProviderIds.length}</strong> &bull; Rango: <strong className="text-[#0056d2]">{teamEstimatedTime}</strong>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIsTeamModalOpen(false)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={selectedTeamProviderIds.length === 0}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0056d2] hover:bg-[#0046a8] disabled:bg-slate-300 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Solicitar Equipo ({selectedTeamProviderIds.length})</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
