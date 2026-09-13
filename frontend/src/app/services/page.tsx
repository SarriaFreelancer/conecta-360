'use client';

import React, { Suspense, useEffect, useState } from 'react';
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
  MapPin,
  User,
  ArrowRight,
  Check,
  Clock,
  Heart,
  Filter,
  X,
  SlidersHorizontal,
  ArrowLeft,
  Tag,
  Users
} from 'lucide-react';
import { getCurrentUser, UserSession } from '@/lib/auth';
import { ALL_COLOMBIAN_CITIES, DEFAULT_CITY } from '@/lib/colombia-data';
import { getAdminCategories, API_BASE_URL } from '@/lib/admin-data';

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
  userId: number;
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
      bio?: string | null;
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

const fallbackProviders: ProviderData[] = [
  {
    id: 1,
    userId: 1,
    title: 'Cerrajería de Urgencias y Residencial',
    hourlyRate: 45000,
    isVerified: true,
    rating: 4.8,
    totalReviews: 124,
    user: {
      id: 1,
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@conecta360.co',
      phone: '+57 315 123 4567',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 2,
    userId: 2,
    title: 'Electricidad Residencial e Industrial',
    hourlyRate: 40000,
    isVerified: true,
    rating: 4.7,
    totalReviews: 98,
    user: {
      id: 2,
      firstName: 'Carlos',
      lastName: 'Mendoza',
      email: 'carlos.mendoza@conecta360.co',
      phone: '+57 316 234 5678',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 3,
    userId: 3,
    title: 'Tecnología, Redes y Soporte IT',
    hourlyRate: 50000,
    isVerified: true,
    rating: 4.9,
    totalReviews: 156,
    user: {
      id: 3,
      firstName: 'Ana',
      lastName: 'Torres',
      email: 'ana.torres@conecta360.co',
      phone: '+57 317 345 6789',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 4,
    userId: 4,
    title: 'Plomería y Destapes a Domicilio',
    hourlyRate: 35000,
    isVerified: true,
    rating: 4.6,
    totalReviews: 87,
    user: {
      id: 4,
      firstName: 'Luis',
      lastName: 'García',
      email: 'luis.garcia@conecta360.co',
      phone: '+57 318 456 7890',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 5,
    userId: 5,
    title: 'Reparaciones y Mantenimiento Locativo',
    hourlyRate: 38000,
    isVerified: true,
    rating: 4.8,
    totalReviews: 110,
    user: {
      id: 5,
      firstName: 'Roberto',
      lastName: 'Vaca',
      email: 'roberto.vaca@conecta360.co',
      phone: '+57 319 567 8901',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 6,
    userId: 6,
    title: 'Diseño Gráfico y Publicidad Digital',
    hourlyRate: 42000,
    isVerified: false,
    rating: 4.9,
    totalReviews: 64,
    user: {
      id: 6,
      firstName: 'Diana',
      lastName: 'Castillo',
      email: 'diana.castillo@conecta360.co',
      phone: '+57 310 678 9012',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 7,
    userId: 7,
    title: 'Pintura Interior y Acabados de Muros',
    hourlyRate: 32000,
    isVerified: true,
    rating: 4.7,
    totalReviews: 92,
    user: {
      id: 7,
      firstName: 'Esteban',
      lastName: 'Ríos',
      email: 'esteban.rios@conecta360.co',
      phone: '+57 311 789 0123',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 8,
    userId: 8,
    title: 'Tutorías Escolares e Idiomas',
    hourlyRate: 30000,
    isVerified: true,
    rating: 5.0,
    totalReviews: 140,
    user: {
      id: 8,
      firstName: 'Sofía',
      lastName: 'Guzmán',
      email: 'sofia.guzman@conecta360.co',
      phone: '+57 312 890 1234',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 9,
    userId: 9,
    title: 'Carpintería y Muebles Modulares',
    hourlyRate: 40000,
    isVerified: false,
    rating: 4.5,
    totalReviews: 53,
    user: {
      id: 9,
      firstName: 'Fernando',
      lastName: 'Mejía',
      email: 'fernando.mejia@conecta360.co',
      phone: '+57 313 901 2345',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 10,
    userId: 10,
    title: 'Fisioterapia y Bienestar a Domicilio',
    hourlyRate: 55000,
    isVerified: true,
    rating: 4.9,
    totalReviews: 88,
    user: {
      id: 10,
      firstName: 'Valeria',
      lastName: 'Duque',
      email: 'valeria.duque@conecta360.co',
      phone: '+57 314 012 3456',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 11,
    userId: 11,
    title: 'Cerrajería Automotriz y Apertura de Puertas',
    hourlyRate: 48000,
    isVerified: true,
    rating: 4.8,
    totalReviews: 115,
    user: {
      id: 11,
      firstName: 'Gabriel',
      lastName: 'Ortiz',
      email: 'gabriel.ortiz@conecta360.co',
      phone: '+57 315 123 7890',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 12,
    userId: 12,
    title: 'Marketing Digital y Redes Sociales',
    hourlyRate: 45000,
    isVerified: false,
    rating: 4.8,
    totalReviews: 76,
    user: {
      id: 12,
      firstName: 'Camila',
      lastName: 'Silva',
      email: 'camila.silva@conecta360.co',
      phone: '+57 313 234 8901',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 13,
    userId: 13,
    title: 'Construcción y Reformas Integrales',
    hourlyRate: 52000,
    isVerified: true,
    rating: 4.9,
    totalReviews: 130,
    user: {
      id: 13,
      firstName: 'Diego',
      lastName: 'Herrera',
      email: 'diego.herrera@conecta360.co',
      phone: '+57 314 345 9012',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 14,
    userId: 14,
    title: 'Limpieza Profunda y Desinfección',
    hourlyRate: 28000,
    isVerified: true,
    rating: 4.8,
    totalReviews: 142,
    user: {
      id: 14,
      firstName: 'Patricia',
      lastName: 'López',
      email: 'patricia.lopez@conecta360.co',
      phone: '+57 316 456 0123',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 15,
    userId: 15,
    title: 'Mecánica Automotriz a Domicilio',
    hourlyRate: 46000,
    isVerified: true,
    rating: 4.7,
    totalReviews: 74,
    user: {
      id: 15,
      firstName: 'Javier',
      lastName: 'Paredes',
      email: 'javier.paredes@conecta360.co',
      phone: '+57 317 567 1234',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
  {
    id: 16,
    userId: 16,
    title: 'Climatización y Aires Acondicionados',
    hourlyRate: 48000,
    isVerified: false,
    rating: 4.9,
    totalReviews: 105,
    user: {
      id: 16,
      firstName: 'Lucía',
      lastName: 'Zambrano',
      email: 'lucia.zambrano@conecta360.co',
      phone: '+57 318 678 2345',
      profile: { city: 'Cali', department: 'Valle del Cauca', country: 'Colombia', profilePhoto: null },
    },
  },
];

function ServicesDirectoryContent() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED'>('ALL');
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc'>('rating');
  const [selectedPricingModel, setSelectedPricingModel] = useState<string>('TODOS');

  useEffect(() => {
    setUser(getCurrentUser());

    // Cargar categorías del backend con fallback seguro
    getAdminCategories()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data as any);
        }
      })
      .catch(() => {});

    // Cargar proveedores del backend de forma segura
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    fetch(`${API_BASE_URL}/users?role=PROVIDER`, { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeoutId);
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: ProviderData[] = data.map((u: any) => ({
            id: u.providerProfile?.id || u.id,
            userId: u.id,
            title: u.providerProfile?.title || 'Servicio Profesional',
            hourlyRate: u.providerProfile?.hourlyRate || 45000,
            isVerified: Boolean(u.providerProfile?.isVerified),
            rating: 4.9,
            totalReviews: 24,
            user: {
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
              phone: u.phone,
              profile: u.profile,
            },
            providerServices: u.providerProfile?.providerServices,
          }));
          setProviders(mapped);
        }
      })
      .catch(() => {
        // Modo offline / backend apagado: mantiene fallbackProviders sin error modal
      });

    return () => clearTimeout(timeoutId);
  }, []);

  // Combinar proveedores
  const allProvidersList = providers.length >= 16 ? providers : fallbackProviders;

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

  const getModelBadge = (model: 'POR_HORA' | 'POR_DIA' | 'POR_CUMPLIMIENTO') => {
    if (model === 'POR_DIA') return { label: 'Por Día', suffix: '/día', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (model === 'POR_CUMPLIMIENTO') return { label: 'Por Cumplimiento', suffix: '/meta', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    return { label: 'Por Horas', suffix: '/h', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  };

  const formatRateWithModel = (rate: string | number | null, model: 'POR_HORA' | 'POR_DIA' | 'POR_CUMPLIMIENTO') => {
    let num = Number(rate) || 45000;
    if (model === 'POR_DIA') {
      if (num < 100000) num = num * 6;
      return `$${num.toLocaleString('es-CO')} COP/día`;
    }
    if (model === 'POR_CUMPLIMIENTO') {
      if (num < 150000) num = num * 12;
      return `$${num.toLocaleString('es-CO')} COP/obra`;
    }
    return `$${num.toLocaleString('es-CO')} COP/h`;
  };

  // Filtrado
  const filtered = allProvidersList.filter((prov) => {
    const city = (prov.user.profile?.city || '').toLowerCase();
    const dept = (prov.user.profile?.department || '').toLowerCase();
    const title = (prov.title || '').toLowerCase();
    const name = `${prov.user.firstName} ${prov.user.lastName}`.toLowerCase();

    // Filtro por ciudad
    if (selectedCity !== 'Todas' && selectedCity !== 'Tu ciudad') {
      if (!city.includes(selectedCity.toLowerCase())) return false;
    }

    // Filtro por categoría
    if (selectedCategory !== 'ALL') {
      const matchCat =
        title.includes(selectedCategory.toLowerCase()) ||
        prov.providerServices?.some((ps) =>
          ps.service?.category?.name?.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      if (!matchCat) return false;
    }

    // Filtro por modalidad de cobro (Por Horas, Por Día, Por Cumplimiento)
    if (selectedPricingModel !== 'TODOS') {
      const model = getProviderPricingModel(prov);
      if (model !== selectedPricingModel) return false;
    }

    // Filtro por verificación
    if (verificationFilter === 'VERIFIED' && !prov.isVerified) return false;
    if (verificationFilter === 'UNVERIFIED' && prov.isVerified) return false;

    // Filtro por búsqueda de texto
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchText = title.includes(q) || name.includes(q) || city.includes(q) || dept.includes(q);
      if (!matchText) return false;
    }

    return true;
  });

  // Ordenamiento
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
    const rateA = Number(a.hourlyRate) || 45000;
    const rateB = Number(b.hourlyRate) || 45000;
    if (sortBy === 'price_asc') return rateA - rateB;
    if (sortBy === 'price_desc') return rateB - rateA;
    return 0;
  });

  const getDefaultPhoto = (prov: ProviderData, index: number) => {
    if (prov.user.profile?.profilePhoto) return prov.user.profile.profilePhoto;
    const titleLower = (prov.title || '').toLowerCase();
    if (titleLower.includes('cerraj')) return '/images/service-cerrajero.jpg';
    if (titleLower.includes('electr')) return '/images/service-electricista.jpg';
    if (titleLower.includes('tecno') || titleLower.includes('redes')) return '/images/service-tecnologia.jpg';
    if (titleLower.includes('plom')) return '/images/service-plomero.jpg';
    if (titleLower.includes('repar')) return '/images/service-reparaciones.jpg';
    if (titleLower.includes('diseñ')) return '/images/service-diseno.jpg';
    if (titleLower.includes('pint')) return '/images/service-pintura.jpg';
    if (titleLower.includes('educ') || titleLower.includes('tutor')) return '/images/service-educacion.jpg';
    if (titleLower.includes('carp')) return '/images/service-carpinteria.jpg';
    if (titleLower.includes('salud') || titleLower.includes('fisio')) return '/images/service-salud.jpg';
    if (titleLower.includes('auto') || titleLower.includes('mecan')) return '/images/service-mecanica.jpg';
    if (titleLower.includes('clim') || titleLower.includes('aire')) return '/images/service-climatizacion.jpg';
    if (titleLower.includes('limp')) return '/images/service-limpieza.jpg';

    const fallbackPhotos = [
      '/images/service-cerrajero.jpg',
      '/images/service-electricista.jpg',
      '/images/service-tecnologia.jpg',
      '/images/service-plomero.jpg',
      '/images/service-reparaciones.jpg',
    ];
    return fallbackPhotos[index % fallbackPhotos.length];
  };

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
    if (titleLower.includes('tecno') || titleLower.includes('redes') || nameLower.includes('ana')) {
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 sm:h-20 flex items-center shadow-xs">
        <div className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <img
              src="/images/logo-conecta-nav.png"
              alt="CONECTA 360"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-[#0056d2] transition-colors">
              Inicio
            </Link>
            <Link href="/services" className="text-[#0056d2] font-bold border-b-2 border-[#0056d2] pb-1">
              Servicios
            </Link>
            <Link href="/cuadrillas" className="hover:text-[#0056d2] transition-colors">
              Cuadrillas
            </Link>
            <Link href="/#categorias" className="hover:text-[#0056d2] transition-colors">
              Categorías
            </Link>
            <Link href="/#como-funciona" className="hover:text-[#0056d2] transition-colors">
              Cómo funciona
            </Link>
            <Link href="/admin" className="hover:text-[#0056d2] transition-colors">
              Admin
            </Link>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-[#0056d2] text-xs sm:text-sm font-bold flex items-center space-x-1.5 sm:space-x-2 border border-blue-200 transition-all shadow-xs"
                >
                  <span className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="max-w-[100px] sm:max-w-none truncate">{user.firstName}</span>
                </Link>

                <Link
                  href="/dashboard?action=new-service"
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Ofrecer Servicios</span>
                  <span className="xs:hidden sm:hidden">Ofrecer</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  href="/login?redirect=/dashboard?action=new-service&action_type=offer"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#0056d2] text-[#0056d2] hover:bg-blue-50 text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-all"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Quiero ofrecer</span>
                </Link>

                <Link
                  href="/login?redirect=/services"
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Ingresar</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner del Catálogo */}
      <div className="bg-gradient-to-r from-[#002f6c] via-[#0056d2] to-slate-900 text-white py-12 px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
        <div className="max-w-[1620px] w-full mx-auto space-y-3">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs text-blue-200 hover:text-white font-bold mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la página principal</span>
          </Link>
          <div className="inline-block bg-[#ef4444] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Directorio Oficial Colombia
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Catálogo Completo de Servicios y Profesionales
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl font-normal">
            Encuentra especialistas verificados para tu hogar o empresa en Cali y las principales ciudades de Colombia. Cotiza, revisa calificaciones y contrata con total seguridad.
          </p>
        </div>
      </div>

      {/* Barra de Filtros Avanzada */}
      <div className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Buscador */}
            <div className="flex items-center px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar servicio o nombre..."
                className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Categoría */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#0056d2]"
              >
                <option value="ALL">Todas las Categorías</option>
                <option value="Cerrajería">Cerrajería</option>
                <option value="Electricidad">Electricidad</option>
                <option value="Tecnología">Tecnología y Redes</option>
                <option value="Plomería">Plomería</option>
                <option value="Reparaciones">Reparaciones</option>
                <option value="Diseño">Diseño y Gráfica</option>
                <option value="Pintura">Pintura y Acabados</option>
                <option value="Educación">Educación y Tutorías</option>
                <option value="Carpintería">Carpintería</option>
                <option value="Salud">Salud y Fisioterapia</option>
                <option value="Mecánica">Mecánica Automotriz</option>
                <option value="Climatización">Climatización / Aires</option>
                <option value="Limpieza">Limpieza Profunda</option>
              </select>
            </div>

            {/* Ciudad */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#0056d2]"
              >
                <option value="Cali">Cali (Valle del Cauca)</option>
                <option value="Palmira">Palmira (Valle)</option>
                <option value="Jamundí">Jamundí (Valle)</option>
                <option value="Yumbo">Yumbo (Valle)</option>
                <option value="Bogotá D.C.">Bogotá D.C.</option>
                <option value="Medellín">Medellín (Antioquia)</option>
                <option value="Barranquilla">Barranquilla (Atlántico)</option>
                <option value="Todas">Toda Colombia</option>
              </select>
            </div>

            {/* Ordenamiento */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#0056d2]"
              >
                <option value="rating">Mejor Calificados (5★)</option>
                <option value="price_asc">Menor Tarifa por Hora</option>
                <option value="price_desc">Mayor Tarifa por Hora</option>
              </select>
            </div>
          </div>

          {/* Filtro rápido de Verificación */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-500">Estado de Verificación:</span>
              <button
                onClick={() => setVerificationFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                  verificationFilter === 'ALL'
                    ? 'bg-[#0056d2] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({allProvidersList.length})
              </button>
              <button
                onClick={() => setVerificationFilter('VERIFIED')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center space-x-1 ${
                  verificationFilter === 'VERIFIED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
                <span>Solo Verificados</span>
              </button>
              <button
                onClick={() => setVerificationFilter('UNVERIFIED')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center space-x-1 ${
                  verificationFilter === 'UNVERIFIED'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Sin verificar</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Mostrando <span className="font-bold text-slate-800">{sorted.length}</span> servicios disponibles
            </div>
          </div>

          {/* Filtro por Modalidad de Cobro */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Modalidad de Cobro:
              </span>
              {[
                { id: 'TODOS', label: 'Todas', icon: '✨' },
                { id: 'POR_HORA', label: 'Por Horas', icon: '⏱️' },
                { id: 'POR_DIA', label: 'Por Día (Jornada)', icon: '📅' },
                { id: 'POR_CUMPLIMIENTO', label: 'Por Cumplimiento', icon: '🏆' },
              ].map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setSelectedPricingModel(mod.id)}
                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center space-x-1 ${
                    selectedPricingModel === mod.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{mod.icon}</span>
                  <span>{mod.label}</span>
                </button>
              ))}
              {selectedPricingModel !== 'TODOS' && (
                <button
                  onClick={() => setSelectedPricingModel('TODOS')}
                  className="text-xs text-red-600 hover:text-red-700 font-bold px-1.5 py-0.5 ml-1"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Servicios y Profesionales */}
      <div className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 py-10 flex-1">
        {sorted.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <Wrench className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-lg font-black text-slate-800">No se encontraron servicios con estos filtros</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Intenta cambiar la categoría, buscar en otra ciudad o restablecer los filtros para ver todos los prestadores.
            </p>
            <button
              onClick={() => {
                setSelectedCity('Cali');
                setSelectedCategory('ALL');
                setVerificationFilter('ALL');
                setSearchQuery('');
              }}
              className="px-5 py-2 bg-[#0056d2] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {sorted.map((prov, idx) => {
              const fullName = `${prov.user.firstName} ${prov.user.lastName}`;
              const categoryTitle = prov.title || 'Servicio Profesional';
              const locationStr = prov.user.profile?.city
                ? `${prov.user.profile.city}, ${prov.user.profile.department || 'Valle del Cauca'}`
                : 'Cali, Valle del Cauca';
              const photoUrl = getDefaultPhoto(prov, idx);
              const pricingModel = getProviderPricingModel(prov);
              const modelBadge = getModelBadge(pricingModel);

              return (
                <div
                  key={`${prov.id}-${idx}`}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Imagen y badges */}
                    <div className="relative h-36 w-full overflow-hidden bg-slate-100">
                      <img
                        src={photoUrl}
                        alt={`${categoryTitle} - ${fullName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>

                      {/* Modalidad de cobro */}
                      <div className="absolute bottom-2 left-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-xs ${modelBadge.color}`}>
                          {modelBadge.label}
                        </span>
                      </div>

                      {/* Badge de Verificación */}
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

                    {/* Contenido */}
                    <div className="p-3 sm:p-3.5 space-y-1.5">
                      <span className="text-[10px] font-bold text-[#0056d2] uppercase tracking-wider block truncate">
                        {categoryTitle}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0056d2] transition-colors leading-tight truncate">
                        {fullName}
                      </h3>

                      {/* Calificación, estrellas y Ubicación en UNA MISMA FILA */}
                      <div className="flex items-center justify-between text-xs text-slate-500 gap-1.5 pt-0.5">
                        <div className="flex items-center space-x-1 shrink-0">
                          <div className="flex items-center text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                            <span>{prov.rating ? prov.rating.toFixed(1) : '4.9'}</span>
                          </div>
                          <span className="text-slate-400 text-[10.5px]">
                            ({prov.totalReviews || 24})
                          </span>
                        </div>
                        <div className="flex items-center text-slate-500 text-[10.5px] font-medium truncate shrink min-w-0">
                          <MapPin className="w-3 h-3 text-rose-500 mr-0.5 shrink-0" />
                          <span className="truncate">{locationStr}</span>
                        </div>
                      </div>

                      {/* 4 Actividades Principales de la Persona */}
                      <div className="pt-1.5 border-t border-slate-100 space-y-1">
                        <span className="text-[9.5px] font-bold text-slate-400 block uppercase tracking-wider">
                          Actividades Principales ({getProviderFeaturedActivities(prov).length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {getProviderFeaturedActivities(prov).map((act, i) => (
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

                  {/* Footer Tarjeta */}
                  <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Tarifa {modelBadge.label.toLowerCase()}</span>
                      <span className="text-xs font-black text-[#0056d2]">
                        {formatRateWithModel(prov.hourlyRate, pricingModel)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Link
                        href={`/profile/${prov.userId}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-slate-200/80"
                      >
                        Ver Perfil
                      </Link>
                      <Link
                        href={
                          user
                            ? `/profile/${prov.userId}?action=hire`
                            : `/login?redirect=${encodeURIComponent(`/profile/${prov.userId}?action=hire`)}&action_type=hire`
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs font-bold transition-all shadow-xs"
                      >
                        Contratar
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 border-t border-slate-800 text-xs text-center">
        <p className="font-semibold text-slate-300">
          CONECTA 360 © 2026 • Plataforma de Servicios y Profesionales de Colombia
        </p>
        <p className="text-slate-500 mt-1">
          Operando en Cali, Valle del Cauca y principales terminales y ciudades del país.
        </p>
      </footer>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
          <div className="w-10 h-10 border-4 border-[#0056d2] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <ServicesDirectoryContent />
    </Suspense>
  );
}
