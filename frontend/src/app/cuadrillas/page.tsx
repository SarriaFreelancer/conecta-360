'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  ArrowLeft,
  Wrench,
  Shield,
  Check,
  Star,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  Search,
  Filter,
  Briefcase,
  Plus,
  Send,
  CheckCircle2,
  ChevronRight,
  X,
  Heart,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Building2,
  Layers,
  ThumbsUp,
  UserCheck,
  User
} from 'lucide-react';
import {
  getStoredCuadrillas,
  saveStoredCuadrilla,
  getStoredCuadrillaProposals,
  saveCuadrillaProposal,
  updateProposalStatus,
  CuadrillaTeam,
  CuadrillaProposal,
  PricingModel
} from '@/lib/cuadrillas-data';
import { getCurrentUser, UserSession } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/admin-data';

export default function CuadrillasPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [cuadrillas, setCuadrillas] = useState<CuadrillaTeam[]>([]);
  const [proposals, setProposals] = useState<CuadrillaProposal[]>([]);
  const [activeTab, setActiveTab] = useState<'catalogo' | 'acuerdos' | 'ofrecer'>('catalogo');

  // Modal de Autenticación Requerida para Contratos de Cuadrilla
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('Para realizar un contrato de cuadrilla o enviar una propuesta de trabajo, debes iniciar sesión o registrarte.');

  // Filtros
  const [selectedPricingModel, setSelectedPricingModel] = useState<string>('TODOS');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal de Propuesta de Valor
  const [proposalModalCuadrilla, setProposalModalCuadrilla] = useState<CuadrillaTeam | null>(null);
  const [projectName, setProjectName] = useState('');
  const [locationZone, setLocationZone] = useState('Cali (Barrio Granada)');
  const [proposalPricingModel, setProposalPricingModel] = useState<PricingModel>('POR_DIA');
  const [proposedRate, setProposedRate] = useState<number>(480000);
  const [estimatedDuration, setEstimatedDuration] = useState('2 días (16 horas de trabajo)');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalSuccessMsg, setProposalSuccessMsg] = useState<string | null>(null);

  // Modal de Detalle de Integrantes
  const [detailModalCuadrilla, setDetailModalCuadrilla] = useState<CuadrillaTeam | null>(null);

  // Formulario para Ofrecer Cuadrilla
  const [newCuadTitle, setNewCuadTitle] = useState('');
  const [newCuadCategory, setNewCuadCategory] = useState('Remodelaciones');
  const [newCuadDesc, setNewCuadDesc] = useState('');
  const [newCuadModel, setNewCuadModel] = useState<PricingModel>('POR_DIA');
  const [newCuadHourlyRate, setNewCuadHourlyRate] = useState(80000);
  const [newCuadDailyRate, setNewCuadDailyRate] = useState(450000);
  const [newCuadFulfillmentRate, setNewCuadFulfillmentRate] = useState(1500000);
  const [newCuadLeaderName, setNewCuadLeaderName] = useState('');
  const [newCuadLeaderPhone, setNewCuadLeaderPhone] = useState('');
  const [newCuadMembersCount, setNewCuadMembersCount] = useState(3);
  const [newCuadActivities, setNewCuadActivities] = useState('Obra civil básica, Enchapes, Pintura general, Acometidas');
  const [offerSuccessMsg, setOfferSuccessMsg] = useState<string | null>(null);

  const mapBackendCuadrilla = (item: any): CuadrillaTeam => {
    return {
      id: String(item.id),
      title: item.name,
      slug: item.slug,
      description: item.description || '',
      category: item.category,
      leaderName: item.leaderName,
      leaderPhone: item.leaderPhone || '+57 315 000 0000',
      city: item.city || 'Cali',
      department: item.department || 'Valle del Cauca',
      membersCount: item.members?.length || 4,
      members: (item.members || []).map((m: any) => ({
        id: `m-${m.id}`,
        name: m.name,
        role: m.role,
        category: item.category,
        rating: 5.0,
        experience: m.experience,
        specialty: m.specialty,
      })),
      pricingModel: (item.preferredPricingModel || 'POR_DIA') as PricingModel,
      supportedPricingModels: ['POR_DIA', 'POR_HORA', 'POR_CUMPLIMIENTO'],
      hourlyRate: Number(item.hourlyRate) || 90000,
      dailyRate: Number(item.dailyRate) || 580000,
      fulfillmentRate: Number(item.fulfillmentRate) || 2400000,
      estimatedAgreementTime: '1 a 5 días laborables',
      rating: item.rating || 4.9,
      totalReviews: item.reviewsCount || 20,
      isVerified: Boolean(item.isVerified),
      featuredActivities: Array.isArray(item.activities) ? item.activities : [],
      bannerPhoto: item.image || '/images/service-reparaciones.jpg',
      availability: 'INMEDIATA',
      badge: item.badge,
    };
  };

  const mapBackendProposal = (p: any): CuadrillaProposal => {
    return {
      id: String(p.id),
      cuadrillaId: String(p.cuadrillaId),
      cuadrillaTitle: p.cuadrilla?.name || 'Cuadrilla Profesional',
      clientName: p.clientName,
      clientPhone: p.clientPhone,
      projectName: p.projectName,
      locationZone: 'Cali, Valle del Cauca',
      pricingModel: p.pricingModel as PricingModel,
      proposedRate: Number(p.proposedRate),
      estimatedDuration: p.estimatedDuration,
      proposalDescription: p.description,
      status: p.status,
      createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-CO') : 'Reciente',
      agreementNotes: p.agreementNotes,
    };
  };

  const loadBackendData = () => {
    fetch(`${API_BASE_URL}/cuadrillas`, { signal: AbortSignal.timeout(2000) })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapBackendCuadrilla);
          setCuadrillas(mapped);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE_URL}/cuadrillas/proposals/all`, { signal: AbortSignal.timeout(2000) })
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped = data.map(mapBackendProposal);
          if (mapped.length > 0) {
            setProposals(mapped);
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    setUser(getCurrentUser());
    setCuadrillas(getStoredCuadrillas());
    setProposals(getStoredCuadrillaProposals());
    loadBackendData();
  }, []);

  const reloadData = () => {
    setCuadrillas(getStoredCuadrillas());
    setProposals(getStoredCuadrillaProposals());
    loadBackendData();
  };

  // Filtrado de Cuadrillas
  const filteredCuadrillas = cuadrillas.filter((c) => {
    // Filtro de modalidad de cobro
    if (selectedPricingModel !== 'TODOS') {
      const matchModel =
        c.pricingModel === selectedPricingModel ||
        c.supportedPricingModels.includes(selectedPricingModel as PricingModel);
      if (!matchModel) return false;
    }

    // Filtro de categoría
    if (selectedCategory !== 'TODAS') {
      if (c.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }

    // Filtro de búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchText =
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.leaderName.toLowerCase().includes(q) ||
        c.featuredActivities.some((a) => a.toLowerCase().includes(q));
      if (!matchText) return false;
    }

    return true;
  });

  const handleOpenProposalModal = (cuad: CuadrillaTeam) => {
    if (!user) {
      setAuthModalMessage(`Para realizar un contrato de cuadrilla o enviar una propuesta de trabajo a "${cuad.title}", debes iniciar sesión o crear una cuenta.`);
      setAuthModalOpen(true);
      return;
    }
    setProposalModalCuadrilla(cuad);
    setProposalPricingModel(cuad.pricingModel);
    if (cuad.pricingModel === 'POR_DIA') {
      setProposedRate(cuad.dailyRate * 2);
      setEstimatedDuration('2 días (16 horas)');
    } else if (cuad.pricingModel === 'POR_HORA') {
      setProposedRate(cuad.hourlyRate * 8);
      setEstimatedDuration('8 horas distribuidas');
    } else {
      setProposedRate(cuad.fulfillmentRate);
      setEstimatedDuration('Por cumplimiento de metas acordadas');
    }
    setProjectName(`Proyecto Cuadrilla en ${cuad.city}`);
    setProposalDescription(`Requerimos el servicio de ${cuad.title} para coordinar labores especializadas.`);
  };

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalMessage('Debes iniciar sesión para formalizar y enviar este contrato de cuadrilla.');
      setAuthModalOpen(true);
      return;
    }
    if (!proposalModalCuadrilla) return;

    const clientName = `${user.firstName} ${user.lastName}`;
    const clientPhone = user.phone || '+57 312 000 0000';

    // 1. Guardado local inmediato
    saveCuadrillaProposal({
      cuadrillaId: proposalModalCuadrilla.id,
      cuadrillaTitle: proposalModalCuadrilla.title,
      clientName,
      clientPhone,
      projectName: projectName.trim() || 'Proyecto de Cuadrilla',
      locationZone: locationZone.trim() || 'Cali, Valle',
      pricingModel: proposalPricingModel,
      proposedRate: Number(proposedRate) || 500000,
      estimatedDuration: estimatedDuration.trim() || '2 días',
      proposalDescription: proposalDescription.trim(),
    });

    // 2. Persistencia en Base de Datos MySQL (Prisma)
    const numId = Number(proposalModalCuadrilla.id);
    if (!isNaN(numId)) {
      fetch(`${API_BASE_URL}/cuadrillas/${numId}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientPhone,
          projectName: projectName.trim() || 'Proyecto de Cuadrilla',
          description: proposalDescription.trim() || 'Servicio de cuadrilla integral',
          pricingModel: proposalPricingModel,
          proposedRate: Number(proposedRate) || 500000,
          estimatedDuration: estimatedDuration.trim() || '2 días',
        }),
      })
      .then(() => reloadData())
      .catch((err) => console.log('Sincronizado localmente:', err));
    }

    setProposalSuccessMsg(`¡Propuesta de valor enviada a ${proposalModalCuadrilla.title}! El líder revisará y acordará el rango de horas o días.`);
    reloadData();

    setTimeout(() => {
      setProposalSuccessMsg(null);
      setProposalModalCuadrilla(null);
      setActiveTab('acuerdos');
    }, 2500);
  };

  const handleAcceptProposal = (proposalId: string) => {
    if (!user) {
      setAuthModalMessage('Debes iniciar sesión para pactar y cerrar este acuerdo de cuadrilla.');
      setAuthModalOpen(true);
      return;
    }
    updateProposalStatus(proposalId, 'ACEPTAR');
    const numId = Number(proposalId);
    if (!isNaN(numId)) {
      fetch(`${API_BASE_URL}/cuadrillas/proposals/${numId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACUERDO_PACTADO' }),
      })
      .then(() => reloadData())
      .catch((err) => console.log('Estado actualizado localmente:', err));
    } else {
      reloadData();
    }
  };

  const handleSelectOfrecerTab = () => {
    if (!user) {
      setAuthModalMessage('Para ofrecer y publicar una cuadrilla de trabajo en Conecta 360, debes iniciar sesión con tu cuenta de prestador.');
      setAuthModalOpen(true);
      return;
    }
    setActiveTab('ofrecer');
  };

  const handleCreateNewCuadrilla = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalMessage('Debes iniciar sesión para registrar una cuadrilla.');
      setAuthModalOpen(true);
      return;
    }
    if (!newCuadTitle.trim()) return;

    const acts = newCuadActivities.split(',').map((s) => s.trim()).filter(Boolean);

    const newTeam: CuadrillaTeam = {
      id: `cuad-${Date.now()}`,
      title: newCuadTitle.trim(),
      slug: newCuadTitle.toLowerCase().replace(/\\s+/g, '-'),
      description: newCuadDesc.trim() || 'Cuadrilla profesional multidisciplinaria de alto rendimiento.',
      category: newCuadCategory,
      leaderName: newCuadLeaderName.trim() || `${user.firstName} ${user.lastName}`,
      leaderPhone: newCuadLeaderPhone.trim() || (user.phone || '+57 310 000 0000'),
      city: 'Cali',
      department: 'Valle del Cauca',
      membersCount: Number(newCuadMembersCount) || 3,
      members: [
        { id: 'm-new-1', name: newCuadLeaderName || 'Líder Cuadrilla', role: 'Coordinador Principal', category: newCuadCategory, rating: 5.0 },
        { id: 'm-new-2', name: 'Especialista Técnico 1', role: 'Oficial de Cuadrilla', category: newCuadCategory, rating: 5.0 },
        { id: 'm-new-3', name: 'Auxiliar Operativo', role: 'Auxiliar Técnico', category: newCuadCategory, rating: 4.9 },
      ],
      pricingModel: newCuadModel,
      supportedPricingModels: ['POR_DIA', 'POR_HORA', 'POR_CUMPLIMIENTO'],
      hourlyRate: Number(newCuadHourlyRate) || 80000,
      dailyRate: Number(newCuadDailyRate) || 450000,
      fulfillmentRate: Number(newCuadFulfillmentRate) || 1500000,
      estimatedAgreementTime: '1 a 5 días acordados',
      rating: 5.0,
      totalReviews: 1,
      isVerified: user?.isVerified || false,
      featuredActivities: acts.length > 0 ? acts.slice(0, 4) : ['Coordinación de obra', 'Servicios integrales', 'Garantía por escrito', 'Entrega a tiempo'],
      bannerPhoto: '/images/service-reparaciones.jpg',
      availability: 'INMEDIATA',
    };

    saveStoredCuadrilla(newTeam);

    // Enviar a la base de datos MySQL (Prisma)
    fetch(`${API_BASE_URL}/cuadrillas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newCuadTitle.trim(),
        category: newCuadCategory,
        leaderName: newCuadLeaderName.trim() || (user ? `${user.firstName} ${user.lastName}` : 'Líder de Cuadrilla'),
        leaderPhone: newCuadLeaderPhone.trim() || (user?.phone || '+57 310 000 0000'),
        city: 'Cali',
        department: 'Valle del Cauca',
        description: newCuadDesc.trim() || 'Cuadrilla profesional multidisciplinaria.',
        hourlyRate: Number(newCuadHourlyRate) || 80000,
        dailyRate: Number(newCuadDailyRate) || 450000,
        fulfillmentRate: Number(newCuadFulfillmentRate) || 1500000,
        preferredPricingModel: newCuadModel,
        activities: acts,
        members: [
          { name: newCuadLeaderName || 'Líder Cuadrilla', role: 'Coordinador Principal', experience: '8 años', specialty: newCuadCategory },
          { name: 'Oficial Técnico 1', role: 'Especialista de Obra', experience: '5 años', specialty: newCuadCategory },
          { name: 'Auxiliar Operativo', role: 'Auxiliar Técnico', experience: '3 años', specialty: 'Apoyo general' },
        ],
      }),
    })
    .then(() => reloadData())
    .catch((err) => console.log('Guardado localmente:', err));

    setOfferSuccessMsg('¡Cuadrilla publicada con éxito! Ya se encuentra disponible en el catálogo oficial para recibir propuestas.');
    reloadData();

    setTimeout(() => {
      setOfferSuccessMsg(null);
      setActiveTab('catalogo');
    }, 2500);
  };

  const formatModelBadge = (model: PricingModel) => {
    switch (model) {
      case 'POR_HORA':
        return { label: 'Por Horas', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'POR_DIA':
        return { label: 'Por Día (Jornada)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'POR_CUMPLIMIENTO':
        return { label: 'Por Cumplimiento (Meta/Obra)', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Convenio', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* 1. TOP NAVBAR */}
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
            <Link href="/services" className="hover:text-[#0056d2] transition-colors">
              Servicios
            </Link>
            <Link href="/cuadrillas" className="text-[#0056d2] font-bold border-b-2 border-[#0056d2] pb-1 flex items-center space-x-1.5">
              <span>Cuadrillas</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                Nuevo
              </span>
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

          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                href="/dashboard"
                className="px-3.5 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-[#0056d2] text-xs sm:text-sm font-bold flex items-center space-x-2 border border-blue-200 transition-all shadow-xs"
              >
                <span className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span>{user.firstName}</span>
              </Link>
            ) : (
              <Link
                href="/login?redirect=/cuadrillas"
                className="px-4 py-2 rounded-full bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO BANNER DE CUADRILLAS */}
      <div className="bg-gradient-to-r from-slate-950 via-[#002f6c] to-indigo-950 text-white py-12 px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 relative overflow-hidden">
        <div className="max-w-[1620px] w-full mx-auto space-y-4 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs text-blue-200 hover:text-white font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la página principal</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Equipos de Trabajo Multidisciplinarios
            </span>
            <span className="text-xs font-semibold text-blue-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
              Operando en Cali y Valle del Cauca
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Servicios por Cuadrillas & Propuestas de Valor
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-3xl font-normal leading-relaxed">
            Contrata cuadrillas completas para proyectos de remodelación, plomería pesada, montajes eléctricos, climatización y desinfección. Acuerda la modalidad que mejor se adapte: <strong className="text-amber-300">Por Horas</strong>, <strong className="text-amber-300">Por Día</strong> o <strong className="text-amber-300">Por Cumplimiento de Obra</strong> y llega a una propuesta pactada.
          </p>

          {/* Quick Tabs in Hero */}
          <div className="flex flex-wrap gap-3 pt-3">
            <button
              onClick={() => setActiveTab('catalogo')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'catalogo'
                  ? 'bg-amber-400 text-slate-950 shadow-lg scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Explorar Cuadrillas ({filteredCuadrillas.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('acuerdos')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'acuerdos'
                  ? 'bg-amber-400 text-slate-950 shadow-lg scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Propuestas & Acuerdos Activos ({proposals.length})</span>
            </button>

            <button
              onClick={handleSelectOfrecerTab}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
                activeTab === 'ofrecer'
                  ? 'bg-amber-400 text-slate-950 shadow-lg scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Ofrecer mi Cuadrilla</span>
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 skew-x-12 pointer-events-none" />
      </div>

      {/* 3. CONTENIDO PRINCIPAL */}
      <main className="max-w-[1620px] w-full mx-auto px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 py-8 flex-1 space-y-8">
        {/* PESTAÑA 1: EXPLORAR CUADRILLAS */}
        {activeTab === 'catalogo' && (
          <div className="space-y-6">
            {/* Barra de Filtros por Modalidad de Cobro y Búsqueda */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Selector de Modalidad de Cobro */}
                <div className="space-y-1.5 w-full lg:w-auto">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Filtrar por Modalidad de Cobro:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'TODOS', label: 'Todas las modalidades' },
                      { key: 'POR_HORA', label: '⏱️ Por Horas' },
                      { key: 'POR_DIA', label: '📅 Por Día (Jornada)' },
                      { key: 'POR_CUMPLIMIENTO', label: '🏆 Por Cumplimiento (Meta/Obra)' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setSelectedPricingModel(tab.key)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedPricingModel === tab.key
                            ? 'bg-[#0056d2] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buscador */}
                <div className="relative w-full lg:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar cuadrilla, líder o actividad..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Grid de Cuadrillas Disponibles */}
            {filteredCuadrillas.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-black text-slate-800">No hay cuadrillas para este filtro</h3>
                <p className="text-xs text-slate-500">
                  Prueba cambiando la modalidad de cobro a "Todas las modalidades" o limpiando el buscador.
                </p>
                <button
                  onClick={() => {
                    setSelectedPricingModel('TODOS');
                    setSearchQuery('');
                  }}
                  className="px-5 py-2 bg-[#0056d2] text-white text-xs font-bold rounded-xl"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                {filteredCuadrillas.map((cuad) => {
                  const modelInfo = formatModelBadge(cuad.pricingModel);
                  return (
                    <div
                      key={cuad.id}
                      className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Banner de la cuadrilla con badge de modalidad y verificación */}
                        <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                          <img
                            src={cuad.bannerPhoto}
                            alt={cuad.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                          {/* Badge de Modalidad Principal */}
                          <div className="absolute top-3 left-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${modelInfo.color}`}>
                              {modelInfo.label}
                            </span>
                          </div>

                          {/* Badge de Integrantes */}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-sm">
                            <Users className="w-3 h-3 text-[#0056d2]" />
                            <span>{cuad.membersCount} Especialistas</span>
                          </div>

                          {/* Título en Banner */}
                          <div className="absolute bottom-3 left-4 right-4">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                              {cuad.category}
                            </span>
                            <h3 className="text-base font-black text-white leading-tight">
                              {cuad.title}
                            </h3>
                          </div>
                        </div>

                        {/* Contenido */}
                        <div className="p-4 space-y-2.5">
                          {/* Calificación y Ubicación en UNA MISMA FILA */}
                          <div className="flex items-center justify-between text-xs text-slate-500 gap-1.5 pt-0.5">
                            <div className="flex items-center space-x-1 shrink-0">
                              <div className="flex items-center text-amber-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                                <span>{cuad.rating.toFixed(1)}</span>
                              </div>
                              <span className="text-slate-400 text-[10.5px]">
                                ({cuad.totalReviews} proyectos concluidos)
                              </span>
                            </div>
                            <div className="flex items-center text-slate-500 text-[10.5px] font-medium truncate shrink min-w-0">
                              <MapPin className="w-3 h-3 text-rose-500 mr-0.5 shrink-0" />
                              <span className="truncate">{cuad.city}, {cuad.department}</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {cuad.description}
                          </p>

                          {/* Líder de Cuadrilla & Integrantes */}
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 font-semibold block">Líder Coordinador</span>
                              <span className="font-extrabold text-slate-800">{cuad.leaderName}</span>
                            </div>
                            <button
                              onClick={() => setDetailModalCuadrilla(cuad)}
                              className="text-[11px] font-bold text-[#0056d2] hover:underline"
                            >
                              Ver {cuad.membersCount} integrantes &rarr;
                            </button>
                          </div>

                          {/* Tarifas de Referencia según Modalidad */}
                          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                            <div className={`p-2 rounded-xl border ${cuad.pricingModel === 'POR_HORA' ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200/60'}`}>
                              <span className="text-[9px] text-slate-500 font-semibold block">Por Hora</span>
                              <span className="text-xs font-black text-slate-900">${cuad.hourlyRate.toLocaleString('es-CO')}</span>
                            </div>
                            <div className={`p-2 rounded-xl border ${cuad.pricingModel === 'POR_DIA' ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200/60'}`}>
                              <span className="text-[9px] text-slate-500 font-semibold block">Por Día</span>
                              <span className="text-xs font-black text-slate-900">${cuad.dailyRate.toLocaleString('es-CO')}</span>
                            </div>
                            <div className={`p-2 rounded-xl border ${cuad.pricingModel === 'POR_CUMPLIMIENTO' ? 'bg-purple-50 border-purple-300' : 'bg-slate-50 border-slate-200/60'}`}>
                              <span className="text-[9px] text-slate-500 font-semibold block">Por Obra</span>
                              <span className="text-xs font-black text-slate-900">${cuad.fulfillmentRate.toLocaleString('es-CO')}</span>
                            </div>
                          </div>

                          {/* Actividades Principales (4) */}
                          <div className="pt-2 border-t border-slate-100 space-y-1">
                            <span className="text-[9.5px] font-bold text-slate-400 block uppercase tracking-wider">
                              Especialidades del Equipo ({cuad.featuredActivities.length}):
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {cuad.featuredActivities.slice(0, 4).map((act, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[9.5px] font-semibold border border-slate-200/70 flex items-center space-x-1"
                                >
                                  <Tag className="w-2.5 h-2.5 text-[#0056d2] shrink-0" />
                                  <span className="truncate max-w-[150px]">{act}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Tarjeta: Enviar Propuesta de Valor */}
                      <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[9.5px] text-slate-400 block font-semibold">Acuerdo sugerido</span>
                          <span className="text-xs font-black text-emerald-600">
                            {cuad.estimatedAgreementTime}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenProposalModal(cuad)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#002f6c] to-[#0056d2] hover:from-[#002452] hover:to-[#0046a8] text-white text-xs font-extrabold shadow-md transition-all flex items-center space-x-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Propuesta</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: ACUERDOS Y PROPUESTAS DE VALOR ACTIVAS */}
        {activeTab === 'acuerdos' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Bandeja de Acuerdos & Negociación de Cuadrillas</h3>
                  <p className="text-xs text-slate-500">
                    Llega a un acuerdo justo de horas, días o cumplimiento entre clientes y líderes de cuadrilla.
                  </p>
                </div>
                <button
                  onClick={reloadData}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Actualizar Lista
                </button>
              </div>

              {proposals.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2 border-2 border-dashed border-slate-200 rounded-2xl">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">No hay propuestas de cuadrilla activas</p>
                  <p className="text-xs">Selecciona una cuadrilla del catálogo para enviar tu primera propuesta de valor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {proposals.map((prop) => {
                    const modelInfo = formatModelBadge(prop.pricingModel);
                    return (
                      <div
                        key={prop.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          prop.status === 'ACUERDO_PACTADO'
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : prop.status === 'EN_NEGOCIACION'
                            ? 'bg-amber-50/40 border-amber-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                #{prop.id}
                              </span>
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${modelInfo.color}`}>
                                {modelInfo.label}
                              </span>
                              <span className="text-xs text-slate-400">{prop.createdAt}</span>
                              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                                <MapPin className="w-3 h-3 text-rose-500" />
                                {prop.locationZone}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-base text-slate-900">{prop.projectName}</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
                              <div><span className="font-semibold text-slate-700">Cuadrilla:</span> {prop.cuadrillaTitle}</div>
                              <div><span className="font-semibold text-slate-700">Cliente solicitante:</span> {prop.clientName} ({prop.clientPhone})</div>
                              <div><span className="font-semibold text-slate-700">Tarifa propuesta:</span> <strong className="text-slate-900">${prop.proposedRate.toLocaleString('es-CO')} COP</strong></div>
                              <div><span className="font-semibold text-slate-700">Tiempo / Rango propuesto:</span> {prop.estimatedDuration}</div>
                            </div>

                            <p className="text-xs text-slate-500 italic pt-1">&ldquo;{prop.proposalDescription}&rdquo;</p>
                          </div>

                          {/* Status & Actions */}
                          <div className="flex flex-col items-start lg:items-end justify-between gap-3">
                            {prop.status === 'ACUERDO_PACTADO' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Acuerdo Pactado
                              </span>
                            )}

                            {prop.status === 'EN_NEGOCIACION' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                                <Clock className="w-4 h-4 text-amber-600" />
                                Contrapropuesta en Negociación
                              </span>
                            )}

                            {prop.status === 'PROPUESTA_ENVIADA' && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                <Send className="w-3.5 h-3.5 text-blue-600" />
                                Propuesta Enviada
                              </span>
                            )}

                            {prop.status !== 'ACUERDO_PACTADO' && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleAcceptProposal(prop.id)}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Cerrar Acuerdo</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {prop.agreementDate && (
                          <div className="mt-3 pt-2.5 border-t border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{prop.agreementDate}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: OFRECER MI CUADRILLA */}
        {activeTab === 'ofrecer' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-10 max-w-3xl mx-auto space-y-6">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-[#0056d2] text-xs font-bold uppercase tracking-wider">
                Registro Oficial de Cuadrillas
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">Publicar y Ofrecer mi Cuadrilla de Trabajo</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Si lideras un equipo o cuadrilla especializada, regístrala aquí indicando si cobras por horas, por día o por cumplimiento de obra.
              </p>
            </div>

            {offerSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{offerSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateNewCuadrilla} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Cuadrilla / Equipo:</label>
                  <input
                    type="text"
                    required
                    value={newCuadTitle}
                    onChange={(e) => setNewCuadTitle(e.target.value)}
                    placeholder="Ej. Cuadrilla Enchapes & Pintura Cali"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sector / Especialidad Principal:</label>
                  <select
                    value={newCuadCategory}
                    onChange={(e) => setNewCuadCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Remodelaciones">Remodelaciones & Acabados</option>
                    <option value="Electricidad">Electricidad & Redes</option>
                    <option value="Plomería">Plomería & Hidráulicas</option>
                    <option value="Pintura">Pintura Arquitectónica</option>
                    <option value="Cerrajería">Cerrajería & Seguridad</option>
                    <option value="Limpieza">Limpieza & Desinfección</option>
                    <option value="Construcción">Construcción & Obras Civiles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Modalidad de Cobro Preferida:</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'POR_HORA', label: '⏱️ Por Horas' },
                    { key: 'POR_DIA', label: '📅 Por Día (Jornada)' },
                    { key: 'POR_CUMPLIMIENTO', label: '🏆 Por Cumplimiento' },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.key}
                      onClick={() => setNewCuadModel(m.key as PricingModel)}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                        newCuadModel === m.key
                          ? 'bg-blue-50 border-[#0056d2] text-[#0056d2] shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tarifas de Referencia */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tarifa por Hora (COP):</label>
                  <input
                    type="number"
                    value={newCuadHourlyRate}
                    onChange={(e) => setNewCuadHourlyRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tarifa por Día (COP):</label>
                  <input
                    type="number"
                    value={newCuadDailyRate}
                    onChange={(e) => setNewCuadDailyRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Cumplimiento (COP):</label>
                  <input
                    type="number"
                    value={newCuadFulfillmentRate}
                    onChange={(e) => setNewCuadFulfillmentRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Líder:</label>
                  <input
                    type="text"
                    value={newCuadLeaderName}
                    onChange={(e) => setNewCuadLeaderName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Teléfono:</label>
                  <input
                    type="text"
                    value={newCuadLeaderPhone}
                    onChange={(e) => setNewCuadLeaderPhone(e.target.value)}
                    placeholder="+57 312..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Número de Integrantes:</label>
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={newCuadMembersCount}
                    onChange={(e) => setNewCuadMembersCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción de la Cuadrilla:</label>
                <textarea
                  rows={3}
                  value={newCuadDesc}
                  onChange={(e) => setNewCuadDesc(e.target.value)}
                  placeholder="Detalla la experiencia de tu equipo, herramientas propias con las que cuentan y capacidad técnica..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Especialidades / Actividades (Separadas por coma):</label>
                <input
                  type="text"
                  value={newCuadActivities}
                  onChange={(e) => setNewCuadActivities(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('catalogo')}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0056d2] hover:bg-[#0046a8] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar y Publicar Cuadrilla</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL DE ENVÍO DE PROPUESTA DE VALOR / ACUERDO */}
      {proposalModalCuadrilla && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-7 space-y-5 animate-scale-up">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">Enviar Propuesta de Valor / Acuerdo</h4>
                  <p className="text-xs text-slate-500">{proposalModalCuadrilla.title}</p>
                </div>
              </div>
              <button
                onClick={() => setProposalModalCuadrilla(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {proposalSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{proposalSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSendProposal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Proyecto / Obra:</label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ej. Remodelación Integral Baños y Cocina"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Modalidad del Acuerdo:</label>
                    <select
                      value={proposalPricingModel}
                      onChange={(e) => {
                        const m = e.target.value as PricingModel;
                        setProposalPricingModel(m);
                        if (m === 'POR_DIA') {
                          setProposedRate(proposalModalCuadrilla.dailyRate * 2);
                          setEstimatedDuration('2 días de jornada');
                        } else if (m === 'POR_HORA') {
                          setProposedRate(proposalModalCuadrilla.hourlyRate * 8);
                          setEstimatedDuration('8 horas de trabajo');
                        } else {
                          setProposedRate(proposalModalCuadrilla.fulfillmentRate);
                          setEstimatedDuration('Por cumplimiento total de entrega');
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      <option value="POR_DIA">📅 Por Día (Jornadas)</option>
                      <option value="POR_HORA">⏱️ Por Horas</option>
                      <option value="POR_CUMPLIMIENTO">🏆 Por Cumplimiento (Meta/Obra)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ubicación / Barrio en Cali:</label>
                    <input
                      type="text"
                      required
                      value={locationZone}
                      onChange={(e) => setLocationZone(e.target.value)}
                      placeholder="Ej. Barrio Granada, Cali"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Duración Estimada Acordada:</label>
                    <input
                      type="text"
                      required
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                      placeholder="Ej. 3 días / 16 horas / 1 semana"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Propuesta de Valor en COP:</label>
                    <input
                      type="number"
                      required
                      min={10000}
                      step={10000}
                      value={proposedRate}
                      onChange={(e) => setProposedRate(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-[#0056d2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Detalle del Requerimiento / Instrucciones:</label>
                  <textarea
                    rows={3}
                    value={proposalDescription}
                    onChange={(e) => setProposalDescription(e.target.value)}
                    placeholder="Describe los requerimientos, materiales disponibles y horario deseado para coordinar con la cuadrilla..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setProposalModalCuadrilla(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar y Negociar Acuerdo</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE INTEGRANTES DE LA CUADRILLA */}
      {detailModalCuadrilla && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Integrantes de la Cuadrilla</span>
                <h4 className="text-base font-black text-slate-900">{detailModalCuadrilla.title}</h4>
              </div>
              <button
                onClick={() => setDetailModalCuadrilla(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {detailModalCuadrilla.members.map((m) => (
                <div key={m.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center">
                      {m.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-slate-800">{m.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{m.role} &bull; <span className="text-[#0056d2]">{m.category}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                    <span>{m.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Líder: <strong>{detailModalCuadrilla.leaderName}</strong></span>
              <button
                onClick={() => {
                  const c = detailModalCuadrilla;
                  setDetailModalCuadrilla(null);
                  handleOpenProposalModal(c);
                }}
                className="px-4 py-2 bg-[#0056d2] text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Proponer Acuerdo a este Equipo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AUTENTICACIÓN REQUERIDA */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-7 space-y-5 animate-scale-up text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Shield className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Inicio de Sesión Requerido</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {authModalMessage}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-left text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Garantía de cumplimiento y respaldo oficial Conecta 360</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-800 font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Negociación transparente de horas, días y cumplimiento</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href={`/login?redirect=${encodeURIComponent('/cuadrillas')}&action_type=cuadrilla`}
                className="w-full py-3 rounded-xl bg-[#0056d2] hover:bg-[#0046a8] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Iniciar Sesión Ahora</span>
              </Link>
              <Link
                href={`/register?redirect=${encodeURIComponent('/cuadrillas')}`}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all flex items-center justify-center space-x-2"
              >
                <span>¿No tienes cuenta? Regístrate gratis</span>
              </Link>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Continuar explorando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 border-t border-slate-800 text-xs text-center">
        <p className="font-semibold text-slate-300">
          CONECTA 360 © 2026 • Plataforma de Cuadrillas y Servicios de Colombia
        </p>
        <p className="text-slate-500 mt-1">
          Contratación de cuadrillas por horas, por día y por cumplimiento con propuestas de valor en Cali y Valle del Cauca.
        </p>
      </footer>
    </div>
  );
}
