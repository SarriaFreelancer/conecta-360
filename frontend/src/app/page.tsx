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
  LogOut,
  X,
  Filter
} from 'lucide-react';
import { getCurrentUser, setCurrentUser, UserSession } from '@/lib/auth';
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
  userId: number;
  title: string | null;
  hourlyRate: string | number | null;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
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

  useEffect(() => {
    // 1. Obtener usuario de la sesión actual
    setUser(getCurrentUser());

    // 2. Cargar categorías de MySQL
    fetch('http://localhost:3001/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error(err));

    // 3. Cargar proveedores de MySQL
    fetch('http://localhost:3001/providers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProviders(data);
      })
      .catch((err) => console.error(err));
  }, []);

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

  // Filtrado por Ciudad (Cali por defecto) y búsqueda
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

  // Formatear precio a Pesos Colombianos (COP)
  const formatRate = (rate: string | number | null) => {
    const num = Number(rate) || 45000;
    if (num < 1000) {
      // Si venía en USD pequeño, convertir a COP base
      return `$${(num * 2000).toLocaleString('es-CO')} COP`;
    }
    return `$${num.toLocaleString('es-CO')} COP`;
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

            {/* Estado de verificación: Verificado vs Pendiente */}
            {prov.isVerified ? (
              <div className="absolute top-2 right-2 bg-[#0056d2] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>Verificado</span>
              </div>
            ) : (
              <div className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 shadow-sm">
                <Clock className="w-2.5 h-2.5 stroke-[3]" />
                <span>Pendiente</span>
              </div>
            )}
          </div>

          {/* Contenido con datos reales del usuario */}
          <div className="p-3.5 space-y-2">
            {/* Categoría con icono circular */}
            <div className="flex items-center space-x-1.5 text-[10px] font-bold text-[#0056d2]">
              <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <CatIcon className="w-2.5 h-2.5 text-[#0056d2]" />
              </div>
              <span className="truncate">{categoryTitle}</span>
            </div>

            {/* Nombre del Proveedor */}
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0056d2] transition-colors leading-snug">
                {fullName}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {categoryTitle}
              </p>
            </div>

            {/* Calificación y reseñas */}
            <div className="flex items-center space-x-1.5 text-xs">
              <div className="flex items-center text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                <span>{prov.rating > 0 ? prov.rating.toFixed(1) : '5.0'}</span>
              </div>
              <span className="text-slate-400 text-[11px]">
                ({prov.totalReviews || 12} reseñas)
              </span>
            </div>

            {/* Ubicación en Colombia */}
            <div className="flex items-center text-slate-500 text-[11px] font-medium pt-0.5">
              <MapPin className="w-3 h-3 text-slate-400 mr-1 shrink-0" />
              <span className="truncate">{locationStr}</span>
            </div>
          </div>
        </div>

        {/* Footer de la tarjeta: Precio y botón */}
        <div className="p-3.5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Tarifa hora</span>
            <span className="text-xs font-black text-[#0056d2]">
              {formatRate(prov.hourlyRate)}/h
            </span>
          </div>
          <Link
            href={`/profile/${prov.userId}`}
            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-[#0056d2] hover:text-white text-[#0056d2] text-xs font-bold transition-all shadow-2xs"
          >
            Ver perfil
          </Link>
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
        <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between">
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
            <Link href="#servicios" className="hover:text-[#0056d2] transition-colors">
              Servicios
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
          <div className="flex items-center space-x-3">
            {user ? (
              // Usuario autenticado
              <div className="flex items-center space-x-2">
                <Link
                  href="/dashboard"
                  className="px-3.5 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-[#0056d2] text-xs sm:text-sm font-bold flex items-center space-x-2 border border-blue-200 transition-all shadow-xs"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      user.isVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                    }`}
                  />
                  <span>Mi Panel ({user.firstName})</span>
                </Link>

                <Link
                  href="/dashboard?action=new-service"
                  className="px-4 py-2 rounded-full bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-sm transition-all hidden sm:flex"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Ofrecer Servicios</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              // Usuario no autenticado
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  href="/login"
                  className="px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#0056d2] transition-colors"
                >
                  Iniciar Sesión
                </Link>

                <Link
                  href="/register?role=provider"
                  className="px-4 py-2 rounded-full border border-[#0056d2] text-[#0056d2] hover:bg-blue-50 text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-all hidden sm:flex"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Quiero ofrecer</span>
                </Link>

                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Registrarse</span>
                </Link>
              </div>
            )}
          </div>
        </div>
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

        <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-12 lg:py-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
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
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
                CONECTA <span className="text-[#ef4444]">360</span>
              </h1>
            </div>

            {/* Slogans */}
            <div className="space-y-1 pt-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-sm">
                Conecta lo que necesitas <br />
                con quien puede hacerlo.
              </p>
              <p className="text-base sm:text-lg font-medium text-slate-200 drop-shadow-xs">
                Necesitas. Encuentras. Contratas en Cali y toda Colombia.
              </p>
            </div>

            {/* Search Pill Bar con Selector de Ciudades de Colombia (Inicialmente Cali) */}
            <div className="pt-3 relative">
              <div className="bg-white rounded-full p-1.5 shadow-2xl flex flex-col sm:flex-row items-center border border-white max-w-lg">
                <div className="flex items-center px-4 py-2 flex-1 w-full text-slate-700">
                  <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="¿Qué servicio necesitas?"
                    className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-semibold"
                  />
                </div>

                <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                {/* Dropdown de Ciudades de Colombia */}
                <div
                  onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  className="flex items-center px-4 py-2 text-slate-700 text-xs sm:text-sm font-semibold cursor-pointer shrink-0 hover:bg-slate-50 rounded-full transition-colors relative"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#0056d2] mr-1.5" />
                  <span className="font-bold">{selectedCity}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                </div>

                <button className="w-full sm:w-auto px-7 py-3 bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs sm:text-sm font-extrabold rounded-full transition-all shadow-md shrink-0">
                  Buscar
                </button>
              </div>

              {/* Menú desplegable de Ciudades de Colombia conectadas por transporte */}
              {isCityDropdownOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-28 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 text-slate-800 space-y-2">
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
      <section className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Card: Necesito algo */}
          <Link
            href="#servicios"
            className="md:col-span-3.5 lg:col-span-4 bg-[#eff6ff] border border-blue-100 rounded-2xl p-5 shadow-lg flex items-center space-x-4 hover:shadow-xl transition-all group"
          >
            <div className="w-13 h-13 rounded-full bg-[#0056d2] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <User className="w-7 h-7 fill-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black text-slate-900 leading-tight">Necesito algo</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                Busca personas en Cali por categoría, experiencia, precio en COP y verificación.
              </p>
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-100 text-[#0056d2] flex items-center justify-center shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Card: Quiero ofrecer */}
          <Link
            href={user ? '/dashboard' : '/register?role=provider'}
            className="md:col-span-3.5 lg:col-span-4 bg-[#fef2f2] border border-red-100 rounded-2xl p-5 shadow-lg flex items-center space-x-4 hover:shadow-xl transition-all group"
          >
            <div className="w-13 h-13 rounded-full bg-[#ef4444] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-black text-slate-900 leading-tight">Quiero ofrecer</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                Registra tus servicios en Cali y consigue clientes. Plan gratis con 1 servicio.
              </p>
            </div>
            <div className="w-7 h-7 rounded-full bg-red-100 text-[#ef4444] flex items-center justify-center shrink-0">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Trust 4 Pillars Block */}
          <div className="md:col-span-5 lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-lg grid grid-cols-4 gap-2 text-center items-center">
            <div className="flex flex-col items-center">
              <Shield className="w-5 h-5 text-[#0056d2] mb-1.5" />
              <p className="text-xs font-bold text-slate-900 leading-tight">Seguridad</p>
              <p className="text-[10px] text-slate-400 font-medium">Perfiles verificados</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-5 h-5 text-[#0056d2] mb-1.5" />
              <p className="text-xs font-bold text-slate-900 leading-tight">Calidad</p>
              <p className="text-[10px] text-slate-400 font-medium">Calificaciones reales</p>
            </div>
            <div className="flex flex-col items-center">
              <FastIcon className="w-5 h-5 text-[#0056d2] mb-1.5" />
              <p className="text-xs font-bold text-slate-900 leading-tight">Rapidez</p>
              <p className="text-[10px] text-slate-400 font-medium">En minutos</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-5 h-5 text-[#0056d2] mb-1.5" />
              <p className="text-xs font-bold text-slate-900 leading-tight">Cercanía</p>
              <p className="text-[10px] text-slate-400 font-medium">Sede Cali y Valle</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CATEGORÍAS MÁS POPULARES */}
      <section id="categorias" className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 pt-16 pb-8">
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
      <section id="servicios" className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8">
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
              className="px-5 py-2.5 bg-[#0056d2] text-white font-bold text-xs rounded-xl shadow-md"
            >
              Restablecer a Cali
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProviders.map((prov, idx) => renderProviderCard(prov, idx))}
          </div>
        )}
      </section>

      {/* 6. BANNER CÓMO FUNCIONA */}
      <section id="como-funciona" className="bg-white border-y border-slate-200 py-16 mt-12">
        <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-black text-[#0056d2] uppercase tracking-wider">
              Paso a Paso
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              ¿Cómo funciona CONECTA 360?
            </h2>
            <p className="text-sm text-slate-500">
              Una plataforma transparente para conectar necesidades con soluciones reales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0056d2] font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                1
              </div>
              <h3 className="font-black text-slate-900 text-base">Encuentra o Publica</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filtra por ciudad (Cali y principales transportes) o regístrate para ofrecer tus servicios profesionales con tarifa base.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#ef4444] font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                2
              </div>
              <h3 className="font-black text-slate-900 text-base">Verificación y Seguridad</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Los prestadores inician con verificación pendiente y acreditan sus títulos para recibir la insignia de verificación oficial.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-lg flex items-center justify-center mx-auto shadow-sm">
                3
              </div>
              <h3 className="font-black text-slate-900 text-base">Contrata con Confianza</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Contacta directamente por WhatsApp o llamada, califica el trabajo y haz crecer la comunidad de servicios en Colombia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8 mb-8">
          <div className="flex items-center space-x-3">
            <img
              src="/images/logo-conecta-nav.png"
              alt="CONECTA 360"
              className="h-8 w-auto brightness-200 contrast-200"
            />
          </div>
          <p className="text-xs text-slate-400 text-center md:text-right">
            Conectando profesionales y clientes en Cali, Valle del Cauca y toda Colombia.
          </p>
        </div>
        <p className="text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} CONECTA 360 Colombia &bull; Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
