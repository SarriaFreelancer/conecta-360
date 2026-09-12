// Archivo de datos geográficos oficiales de Colombia para Conecta 360
// Enfocado en transporte, terminales terrestres y aeropuertos

export interface ColombiaCity {
  id: string;
  name: string;
  department: string;
  hasAirport?: boolean;
  hasTransportTerminal?: boolean;
  isCapital?: boolean;
}

export interface ColombiaDepartment {
  id: string;
  name: string;
  capital: string;
  cities: string[];
}

export const COLOMBIA_DEPARTMENTS: ColombiaDepartment[] = [
  {
    id: 'valle-del-cauca',
    name: 'Valle del Cauca',
    capital: 'Cali',
    cities: [
      'Cali',
      'Palmira',
      'Buenaventura',
      'Tuluá',
      'Yumbo',
      'Jamundí',
      'Buga',
      'Cartago',
      'Zarzal',
      'Candelaria',
      'Pradera',
      'Florida',
      'Roldanillo',
      'Sevilla',
    ],
  },
  {
    id: 'bogota-dc',
    name: 'Bogotá D.C.',
    capital: 'Bogotá D.C.',
    cities: ['Bogotá D.C.'],
  },
  {
    id: 'antioquia',
    name: 'Antioquia',
    capital: 'Medellín',
    cities: [
      'Medellín',
      'Envigado',
      'Bello',
      'Itagüí',
      'Sabaneta',
      'Rionegro',
      'Apartadó',
      'Caucasia',
      'Turbo',
      'Caldas',
      'La Ceja',
      'Marinilla',
      'Santa Rosa de Osos',
      'Yarumal',
    ],
  },
  {
    id: 'atlantico',
    name: 'Atlántico',
    capital: 'Barranquilla',
    cities: ['Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia', 'Baranoa', 'Sabanalarga'],
  },
  {
    id: 'bolivar',
    name: 'Bolívar',
    capital: 'Cartagena',
    cities: ['Cartagena', 'Magangué', 'El Carmen de Bolívar', 'Turbaco', 'Arjona'],
  },
  {
    id: 'santander',
    name: 'Santander',
    capital: 'Bucaramanga',
    cities: [
      'Bucaramanga',
      'Floridablanca',
      'Girón',
      'Piedecuesta',
      'Barrancabermeja',
      'San Gil',
      'Socorro',
    ],
  },
  {
    id: 'risaralda',
    name: 'Risaralda',
    capital: 'Pereira',
    cities: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia'],
  },
  {
    id: 'caldas',
    name: 'Caldas',
    capital: 'Manizales',
    cities: ['Manizales', 'Villamaría', 'Chinchiná', 'La Dorada', 'Riosucio', 'Anserma'],
  },
  {
    id: 'quindio',
    name: 'Quindío',
    capital: 'Armenia',
    cities: ['Armenia', 'Calarcá', 'Montenegro', 'Quimbaya', 'La Tebaida', 'Circasia'],
  },
  {
    id: 'magdalena',
    name: 'Magdalena',
    capital: 'Santa Marta',
    cities: ['Santa Marta', 'Ciénaga', 'Fundación', 'El Banco', 'Plato'],
  },
  {
    id: 'norte-de-santander',
    name: 'Norte de Santander',
    capital: 'Cúcuta',
    cities: ['Cúcuta', 'Ocaña', 'Pamplona', 'Villa del Rosario', 'Los Patios', 'Tibú'],
  },
  {
    id: 'tolima',
    name: 'Tolima',
    capital: 'Ibagué',
    cities: ['Ibagué', 'Espinal', 'Melgar', 'Honda', 'Mariquita', 'Chaparral', 'Líbano'],
  },
  {
    id: 'narino',
    name: 'Nariño',
    capital: 'Pasto',
    cities: ['Pasto', 'Ipiales', 'Tumaco', 'Túquerres', 'La Unión'],
  },
  {
    id: 'meta',
    name: 'Meta',
    capital: 'Villavicencio',
    cities: ['Villavicencio', 'Acacías', 'Granada', 'Puerto López', 'San Martín'],
  },
  {
    id: 'cordoba',
    name: 'Córdoba',
    capital: 'Montería',
    cities: ['Montería', 'Cereté', 'Lorica', 'Montelíbano', 'Sahagún', 'Tierralta'],
  },
  {
    id: 'cauca',
    name: 'Cauca',
    capital: 'Popayán',
    cities: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Patía', 'Piendamó'],
  },
  {
    id: 'huila',
    name: 'Huila',
    capital: 'Neiva',
    cities: ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre'],
  },
  {
    id: 'cesar',
    name: 'Cesar',
    capital: 'Valledupar',
    cities: ['Valledupar', 'Aguachica', 'Agustín Codazzi', 'Bosconia', 'Curumaní'],
  },
  {
    id: 'boyaca',
    name: 'Boyacá',
    capital: 'Tunja',
    cities: ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Puerto Boyacá'],
  },
  {
    id: 'cundinamarca',
    name: 'Cundinamarca',
    capital: 'Bogotá D.C.',
    cities: [
      'Soacha',
      'Chía',
      'Zipaquirá',
      'Facatativá',
      'Fusagasugá',
      'Girardot',
      'Mosquera',
      'Madrid',
      'Funza',
      'Cajicá',
      'Sopó',
      'Tocancipá',
      'Cota',
      'La Calera',
    ],
  },
  {
    id: 'sucre',
    name: 'Sucre',
    capital: 'Sincelejo',
    cities: ['Sincelejo', 'Corozal', 'San Marcos', 'Sampués', 'Tolú'],
  },
  {
    id: 'la-guajira',
    name: 'La Guajira',
    capital: 'Riohacha',
    cities: ['Riohacha', 'Maicao', 'Uribia', 'San Juan del Cesar', 'Fonseca'],
  },
  {
    id: 'casanare',
    name: 'Casanare',
    capital: 'Yopal',
    cities: ['Yopal', 'Aguazul', 'Villanueva', 'Tauramena', 'Paz de Ariporo'],
  },
  {
    id: 'arauca',
    name: 'Arauca',
    capital: 'Arauca',
    cities: ['Arauca', 'Saravena', 'Tame', 'Arauquita'],
  },
  {
    id: 'putumayo',
    name: 'Putumayo',
    capital: 'Mocoa',
    cities: ['Mocoa', 'Puerto Asís', 'Orito', 'Sibundoy'],
  },
  {
    id: 'choco',
    name: 'Chocó',
    capital: 'Quibdó',
    cities: ['Quibdó', 'Istmina', 'Condoto', 'Tadó'],
  },
  {
    id: 'caqueta',
    name: 'Caquetá',
    capital: 'Florencia',
    cities: ['Florencia', 'San Vicente del Caguán', 'Cartagena del Chairá'],
  },
  {
    id: 'san-andres',
    name: 'San Andrés y Providencia',
    capital: 'San Andrés',
    cities: ['San Andrés', 'Providencia'],
  },
  {
    id: 'amazonas',
    name: 'Amazonas',
    capital: 'Leticia',
    cities: ['Leticia', 'Puerto Nariño'],
  },
];

// Ciudad predeterminada del sistema
export const DEFAULT_CITY = 'Cali';
export const DEFAULT_DEPARTMENT = 'Valle del Cauca';

// Obtener todas las ciudades ordenadas
export const ALL_COLOMBIAN_CITIES = Array.from(
  new Set(
    COLOMBIA_DEPARTMENTS.flatMap((dept) =>
      dept.cities.map((city) => ({
        city,
        department: dept.name,
        label: `${city}, ${dept.name}`,
      }))
    )
  )
).sort((a, b) => {
  // Poner Cali de primera
  if (a.city === 'Cali') return -1;
  if (b.city === 'Cali') return 1;
  return a.city.localeCompare(b.city);
});

// Obtener ciudades por departamento
export function getCitiesForDepartment(deptName: string): string[] {
  const found = COLOMBIA_DEPARTMENTS.find(
    (d) => d.name.toLowerCase() === deptName.toLowerCase()
  );
  return found ? found.cities : [];
}
