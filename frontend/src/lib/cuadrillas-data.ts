// Modelos y almacén de datos para Servicios por Cuadrillas y Propuestas de Valor
import { addNotification } from './auth';

export type PricingModel = 'POR_HORA' | 'POR_DIA' | 'POR_CUMPLIMIENTO';

export interface CuadrillaMember {
  id: string | number;
  name: string;
  role: string;
  category: string;
  rating: number;
  experience?: string;
  specialty?: string;
}

export interface CuadrillaTeam {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  leaderName: string;
  leaderPhone: string;
  city: string;
  department: string;
  membersCount: number;
  members: CuadrillaMember[];
  pricingModel: PricingModel; // Modalidad principal
  supportedPricingModels: PricingModel[]; // Modalidades que acepta
  hourlyRate: number; // COP por hora del equipo
  dailyRate: number; // COP por jornada/día (8 horas)
  fulfillmentRate: number; // COP base por cumplimiento de meta/obra
  estimatedAgreementTime: string; // ej: "1 a 3 días", "Jornadas de 8 horas"
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  featuredActivities: string[];
  bannerPhoto: string;
  availability: 'INMEDIATA' | 'PREVIA_CITA' | 'EN_PROYECTO';
  badge?: string;
}

export interface CuadrillaProposal {
  id: string;
  cuadrillaId: string;
  cuadrillaTitle: string;
  clientName: string;
  clientPhone: string;
  projectName: string;
  locationZone: string;
  pricingModel: PricingModel; // 'POR_HORA' | 'POR_DIA' | 'POR_CUMPLIMIENTO'
  proposedRate: number; // Monto pactado o propuesto en COP
  estimatedDuration: string; // ej: "3 días (24 hrs de trabajo)" o "15 horas distribuidas"
  proposalDescription: string;
  status: 'PROPUESTA_ENVIADA' | 'EN_NEGOCIACION' | 'ACUERDO_PACTADO' | 'RECHAZADA';
  createdAt: string;
  agreementDate?: string;
  agreementNotes?: string;
  counterOffer?: {
    rate: number;
    duration: string;
    message: string;
  };
}

export const INITIAL_CUADRILLAS: CuadrillaTeam[] = [
  {
    id: 'cuad-101',
    title: 'Cuadrilla Remodelación & Acabados Exprés',
    slug: 'cuadrilla-remodelacion-acabados',
    description: 'Equipo maestro multidisciplinario para reformas de apartamentos, casas y locales comerciales. Enchapes de porcelanato, drywall, pintura arquitectónica e iluminación.',
    category: 'Remodelaciones',
    leaderName: 'David Fernando Ospina',
    leaderPhone: '+57 312 456 7890',
    city: 'Cali',
    department: 'Valle del Cauca',
    membersCount: 4,
    members: [
      { id: 'm-1', name: 'David Ospina', role: 'Maestro de Obra y Coordinador', category: 'Remodelaciones', rating: 5.0 },
      { id: 'm-2', name: 'Carlos Mendoza', role: 'Electricista Certificado RETIE', category: 'Electricidad', rating: 4.9 },
      { id: 'm-3', name: 'Diana Martínez', role: 'Pintora y Acabados Finos', category: 'Pintura', rating: 4.8 },
      { id: 'm-4', name: 'Julián Becerra', role: 'Oficial de Enchape y Albañilería', category: 'Construcción', rating: 4.9 },
    ],
    pricingModel: 'POR_DIA',
    supportedPricingModels: ['POR_DIA', 'POR_CUMPLIMIENTO', 'POR_HORA'],
    hourlyRate: 85000,
    dailyRate: 480000,
    fulfillmentRate: 1850000,
    estimatedAgreementTime: '2 a 6 días hábiles',
    rating: 4.9,
    totalReviews: 42,
    isVerified: true,
    featuredActivities: [
      'Demolición y retiro controlado de escombros',
      'Enchapes de alta precisión en pisos y muros',
      'Iluminación LED indirecta y cableado empotrado',
      'Pintura vinílica tipo 1 antibacterial',
    ],
    bannerPhoto: '/images/service-reparaciones.jpg',
    availability: 'INMEDIATA',
  },
  {
    id: 'cuad-102',
    title: 'Equipo Técnico Eléctrico & Climatización HVAC',
    slug: 'equipo-tecnico-electrico-climatizacion',
    description: 'Cuadrilla especializada en montaje eléctrico industrial y residencial, balance de cargas en tableros trifásicos, instalación y mantenimiento preventivo de aires acondicionados inverter.',
    category: 'Electricidad & Climatización',
    leaderName: 'Carlos Andrés Rodríguez',
    leaderPhone: '+57 315 987 6543',
    city: 'Cali',
    department: 'Valle del Cauca',
    membersCount: 3,
    members: [
      { id: 'm-5', name: 'Carlos Andrés Rodríguez', role: 'Ingeniero Eléctrico Líder', category: 'Electricidad', rating: 5.0 },
      { id: 'm-6', name: 'Sofía Castro', role: 'Técnica Especialista en Refrigeración', category: 'Climatización', rating: 4.9 },
      { id: 'm-7', name: 'Andrés Felipe Gil', role: 'Técnico Cableado Estructurado', category: 'Redes', rating: 4.8 },
    ],
    pricingModel: 'POR_HORA',
    supportedPricingModels: ['POR_HORA', 'POR_DIA', 'POR_CUMPLIMIENTO'],
    hourlyRate: 95000,
    dailyRate: 520000,
    fulfillmentRate: 1400000,
    estimatedAgreementTime: '1 a 3 días hábiles',
    rating: 5.0,
    totalReviews: 38,
    isVerified: true,
    featuredActivities: [
      'Certificación y firma RETIE para acometidas',
      'Instalación de aires acondicionados minisplit',
      'Montaje de tableros de transferencia automática',
      'Diagnóstico termográfico de puntos calientes',
    ],
    bannerPhoto: '/images/service-electricista.jpg',
    availability: 'INMEDIATA',
  },
  {
    id: 'cuad-103',
    title: 'Cuadrilla Fontanería & Redes Hidráulicas Cali',
    slug: 'cuadrilla-fontaneria-redes-hidraulicas',
    description: 'Atención de emergencias y proyectos de plomería pesada para condominios, restaurantes y edificios. Destape hidrocinético con sonda eléctrica, detección geofónica de fugas invisibles.',
    category: 'Plomería',
    leaderName: 'Luis García',
    leaderPhone: '+57 318 901 2345',
    city: 'Cali',
    department: 'Valle del Cauca',
    membersCount: 3,
    members: [
      { id: 'm-8', name: 'Luis García', role: 'Plomero Maestro Sanitario', category: 'Plomería', rating: 4.9 },
      { id: 'm-9', name: 'Mauricio Restrepo', role: 'Operador de Maquinaria Hidrosonda', category: 'Plomería', rating: 4.8 },
      { id: 'm-10', name: 'Fabio Morales', role: 'Técnico en Motobombas y Tanques', category: 'Redes', rating: 4.7 },
    ],
    pricingModel: 'POR_CUMPLIMIENTO',
    supportedPricingModels: ['POR_CUMPLIMIENTO', 'POR_DIA', 'POR_HORA'],
    hourlyRate: 75000,
    dailyRate: 420000,
    fulfillmentRate: 850000,
    estimatedAgreementTime: '1 a 2 días de obra',
    rating: 4.8,
    totalReviews: 29,
    isVerified: true,
    featuredActivities: [
      'Detección geofónica digital de fugas sin romper',
      'Destape industrial de cajas de inspección',
      'Lavado y desinfección de tanques de reserva',
      'Reemplazo total de bajantes de aguas negras',
    ],
    bannerPhoto: '/images/service-plomero.jpg',
    availability: 'PREVIA_CITA',
  },
  {
    id: 'cuad-104',
    title: 'Cuadrilla Cerrajería & Blindaje de Seguridad Residencial',
    slug: 'cuadrilla-cerrajeria-blindaje-seguridad',
    description: 'Equipo veloz para instalación de cerraduras electromagnéticas, cerraduras biométricas de huella y código, cajas fuertes, puertas blindadas y sistemas de cerrajería coordinada.',
    category: 'Cerrajería & Seguridad',
    leaderName: 'Roberto Morales',
    leaderPhone: '+57 320 876 5432',
    city: 'Cali',
    department: 'Valle del Cauca',
    membersCount: 2,
    members: [
      { id: 'm-11', name: 'Roberto Morales', role: 'Cerrajero Maestro de Seguridad', category: 'Cerrajería', rating: 4.9 },
      { id: 'm-12', name: 'Javier Ortiz', role: 'Técnico en Control de Acceso y CCTV', category: 'Seguridad', rating: 4.9 },
    ],
    pricingModel: 'POR_HORA',
    supportedPricingModels: ['POR_HORA', 'POR_DIA', 'POR_CUMPLIMIENTO'],
    hourlyRate: 70000,
    dailyRate: 380000,
    fulfillmentRate: 720000,
    estimatedAgreementTime: '2 a 5 horas acordadas',
    rating: 4.9,
    totalReviews: 54,
    isVerified: true,
    featuredActivities: [
      'Apertura técnica sin daño de cerraduras multipunto',
      'Instalación de cerraduras inteligentes WiFi/Biométricas',
      'Amaestramiento de cilindros para empresas',
      'Refuerzo perimetral y barras antipánico',
    ],
    bannerPhoto: '/images/service-cerrajero.jpg',
    availability: 'INMEDIATA',
  },
  {
    id: 'cuad-105',
    title: 'Equipo Pintura Arquitectónica & Estuco Profesional',
    slug: 'equipo-pintura-arquitectonica-estuco',
    description: 'Cuadrilla experta en embellecimiento de fachadas, bodegas, casas campestres y conjuntos residenciales en Cali. Impermeabilización de terrazas, estuco plástico y pintura epóxica.',
    category: 'Pintura & Acabados',
    leaderName: 'Diana Martínez',
    leaderPhone: '+57 301 234 5678',
    city: 'Cali',
    department: 'Valle del Cauca',
    membersCount: 4,
    members: [
      { id: 'm-13', name: 'Diana Martínez', role: 'Directora de Color y Acabados', category: 'Pintura', rating: 4.9 },
      { id: 'm-14', name: 'Hernán Arango', role: 'Pintor Fachadas en Altura (Certificado)', category: 'Pintura', rating: 4.8 },
      { id: 'm-15', name: 'Samuel Caicedo', role: 'Aplicador de Estuco y Graniplast', category: 'Acabados', rating: 4.8 },
      { id: 'm-16', name: 'Nicolás Toro', role: 'Impermeabilizador de Terrazas', category: 'Techos', rating: 4.7 },
    ],
    pricingModel: 'POR_DIA',
    supportedPricingModels: ['POR_DIA', 'POR_CUMPLIMIENTO', 'POR_HORA'],
    hourlyRate: 80000,
    dailyRate: 460000,
    fulfillmentRate: 2100000,
    estimatedAgreementTime: '3 a 8 días hábiles',
    rating: 4.8,
    totalReviews: 31,
    isVerified: true,
    featuredActivities: [
      'Pintura en altura para fachadas residenciales',
      'Estuco veneciano y acabados de lujo para salas',
      'Aplicación de pintura epóxica antideslizante en pisos',
      'Impermeabilización garantizada por 5 años',
    ],
    bannerPhoto: '/images/service-pintura.jpg',
    availability: 'PREVIA_CITA',
  },
  {
    id: 'cuad-106',
    title: 'Cuadrilla Limpieza Profunda, Desinfección & Fin de Obra',
    slug: 'cuadrilla-limpieza-profunda-fin-obra',
    description: 'Equipo de limpieza intensiva con maquinaria industrial de vapor, pulidoras de pisos de mármol y aspiradoras industriales. Ideal para entregas de obra, mudanzas y eventos en Cali.',
    category: 'Limpieza Especializada',
    leaderName: 'Patricia López',
    leaderPhone: '+57 316 456 0123',
    city: 'Cali',
    department: 'Valle del Cauca',
    membersCount: 3,
    members: [
      { id: 'm-17', name: 'Patricia López', role: 'Supervisora de Higiene y Calidad', category: 'Limpieza', rating: 4.9 },
      { id: 'm-18', name: 'Marta Lucía Rivas', role: 'Especialista en Cristales y Ventanales', category: 'Limpieza', rating: 4.8 },
      { id: 'm-19', name: 'Esteban Quiñones', role: 'Operador Pulidora y Cristalizador', category: 'Pisos', rating: 4.9 },
    ],
    pricingModel: 'POR_DIA',
    supportedPricingModels: ['POR_DIA', 'POR_HORA', 'POR_CUMPLIMIENTO'],
    hourlyRate: 65000,
    dailyRate: 350000,
    fulfillmentRate: 600000,
    estimatedAgreementTime: '1 a 2 jornadas completas',
    rating: 4.9,
    totalReviews: 47,
    isVerified: true,
    featuredActivities: [
      'Limpieza y desmanchado post-construcción / fin de obra',
      'Cristalizado y brillado mecánico de pisos',
      'Lavado con inyección-succión de muebles y alfombras',
      'Desinfección de cocinas industriales y campanas',
    ],
    bannerPhoto: '/images/service-limpieza.jpg',
    availability: 'INMEDIATA',
  },
];

const CUADRILLAS_STORAGE_KEY = 'conecta360_cuadrillas';
const PROPOSALS_STORAGE_KEY = 'conecta360_cuadrilla_proposals';

export function getStoredCuadrillas(): CuadrillaTeam[] {
  if (typeof window === 'undefined') return INITIAL_CUADRILLAS;
  try {
    const raw = localStorage.getItem(CUADRILLAS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CUADRILLAS_STORAGE_KEY, JSON.stringify(INITIAL_CUADRILLAS));
      return INITIAL_CUADRILLAS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo cuadrillas:', e);
    return INITIAL_CUADRILLAS;
  }
}

export function saveStoredCuadrilla(cuadrilla: CuadrillaTeam): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getStoredCuadrillas();
    const existingIdx = list.findIndex((c) => c.id === cuadrilla.id);
    if (existingIdx >= 0) {
      list[existingIdx] = cuadrilla;
    } else {
      list.unshift(cuadrilla);
    }
    localStorage.setItem(CUADRILLAS_STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error('Error guardando cuadrilla:', e);
    return false;
  }
}

export function getStoredCuadrillaProposals(): CuadrillaProposal[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROPOSALS_STORAGE_KEY);
    if (!raw) {
      const initialSeed: CuadrillaProposal[] = [
        {
          id: 'prop-501',
          cuadrillaId: 'cuad-101',
          cuadrillaTitle: 'Cuadrilla Remodelación & Acabados Exprés',
          clientName: 'Carolina Gómez Perea',
          clientPhone: '+57 310 345 6789',
          projectName: 'Remodelación Integral Apartamento Ciudad Jardín',
          locationZone: 'Cali (Barrio Ciudad Jardín)',
          pricingModel: 'POR_DIA',
          proposedRate: 1440000,
          estimatedDuration: '3 días (24 horas laborales)',
          proposalDescription: 'Requerimos cuadrilla para remodelar 2 baños y cocina. Desmonte de azulejos, nivelación e instalación de piso porcelanato.',
          status: 'ACUERDO_PACTADO',
          createdAt: 'Ayer, 10:15 AM',
          agreementDate: 'Acuerdo cerrado: 3 jornadas acordadas a $480.000 COP/día.',
        },
        {
          id: 'prop-502',
          cuadrillaId: 'cuad-102',
          cuadrillaTitle: 'Equipo Técnico Eléctrico & Climatización HVAC',
          clientName: 'Mauricio Andrade',
          clientPhone: '+57 314 222 3344',
          projectName: 'Montaje Eléctrico y 4 Aires Acondicionados en Sede Empresarial',
          locationZone: 'Cali (Barrio San Fernando)',
          pricingModel: 'POR_CUMPLIMIENTO',
          proposedRate: 1600000,
          estimatedDuration: 'Cumplimiento por entrega de obra concluida (4 días estimados)',
          proposalDescription: 'Instalación de 4 unidades de 18.000 BTU y tablero de breakers con balance de carga para oficinas corporativas.',
          status: 'EN_NEGOCIACION',
          createdAt: 'Hoy, 08:40 AM',
          counterOffer: {
            rate: 1750000,
            duration: 'Entrega en 4 días con materiales de fijación incluidos',
            message: 'Aceptamos la propuesta ajustando a $1.750.000 COP para incluir pruebas de estanqueidad de nitrógeno y cable de uso rudo.',
          },
        },
      ];
      localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(initialSeed));
      return initialSeed;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo propuestas:', e);
    return [];
  }
}

export function saveCuadrillaProposal(proposalData: Omit<CuadrillaProposal, 'id' | 'createdAt' | 'status'>): CuadrillaProposal {
  const list = getStoredCuadrillaProposals();
  const newProposal: CuadrillaProposal = {
    ...proposalData,
    id: `prop-${Date.now()}`,
    status: 'PROPUESTA_ENVIADA',
    createdAt: `Hoy, ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`,
  };
  list.unshift(newProposal);
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(list));
  }

  // Notificar al líder de cuadrilla y al admin
  addNotification({
    userId: 'cuadrilla-leader',
    title: 'Nueva Propuesta de Valor para tu Cuadrilla',
    message: `El cliente ${newProposal.clientName} ha enviado una propuesta de ${newProposal.pricingModel === 'POR_DIA' ? 'días' : newProposal.pricingModel === 'POR_HORA' ? 'horas' : 'cumplimiento'} para el proyecto "${newProposal.projectName}". Tarifa ofertada: $${newProposal.proposedRate.toLocaleString('es-CO')} COP.`,
    type: 'TEAM_REQUEST',
    actionRequired: true,
  });

  addNotification({
    userId: 'admin',
    title: 'Nueva Negociación de Cuadrilla',
    message: `Se inició propuesta para ${newProposal.cuadrillaTitle} por parte de ${newProposal.clientName}. Monto: $${newProposal.proposedRate.toLocaleString('es-CO')} COP.`,
    type: 'TEAM_REQUEST',
  });

  return newProposal;
}

export function updateProposalStatus(
  proposalId: string,
  action: 'ACEPTAR' | 'NEGOCIAR' | 'RECHAZAR',
  counterData?: { rate: number; duration: string; message: string }
): boolean {
  const list = getStoredCuadrillaProposals();
  const idx = list.findIndex((p) => p.id === proposalId);
  if (idx < 0) return false;

  if (action === 'ACEPTAR') {
    list[idx].status = 'ACUERDO_PACTADO';
    list[idx].agreementDate = `Acuerdo cerrado exitosamente por ambas partes: ${list[idx].estimatedDuration} por $${list[idx].proposedRate.toLocaleString('es-CO')} COP.`;
    addNotification({
      userId: list[idx].clientName,
      title: '¡Propuesta de Cuadrilla Aceptada y Acuerdo Pactado!',
      message: `El equipo de ${list[idx].cuadrillaTitle} ha aceptado tu propuesta para "${list[idx].projectName}". ¡El acuerdo está cerrado!`,
      type: 'SERVICE_CONFIRMED',
    });
  } else if (action === 'NEGOCIAR' && counterData) {
    list[idx].status = 'EN_NEGOCIACION';
    list[idx].counterOffer = counterData;
    list[idx].proposedRate = counterData.rate;
    list[idx].estimatedDuration = counterData.duration;
    addNotification({
      userId: list[idx].clientName,
      title: 'Contrapropuesta de la Cuadrilla en Negociación',
      message: `El líder de ${list[idx].cuadrillaTitle} envió una contrapropuesta: $${counterData.rate.toLocaleString('es-CO')} COP (${counterData.duration}). Mensaje: "${counterData.message}".`,
      type: 'TEAM_REQUEST',
      actionRequired: true,
    });
  } else if (action === 'RECHAZAR') {
    list[idx].status = 'RECHAZADA';
    addNotification({
      userId: list[idx].clientName,
      title: 'Propuesta de Cuadrilla no Aceptada',
      message: `La cuadrilla ${list[idx].cuadrillaTitle} no cuenta con disponibilidad para las fechas/modalidad solicitadas.`,
      type: 'SERVICE_REJECTED',
    });
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(list));
  }
  return true;
}
