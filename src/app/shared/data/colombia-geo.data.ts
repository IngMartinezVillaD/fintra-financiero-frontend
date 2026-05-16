export interface Departamento {
  nombre: string;
  ciudades: string[];
}

export const COLOMBIA_GEO: Departamento[] = [
  {
    nombre: 'Amazonas',
    ciudades: ['Leticia', 'Puerto Nariño'],
  },
  {
    nombre: 'Antioquia',
    ciudades: [
      'Medellín', 'Bello', 'Itagüí', 'Envigado', 'Sabaneta', 'La Estrella',
      'Copacabana', 'Girardota', 'Barbosa', 'Caldas', 'Rionegro', 'Marinilla',
      'El Carmen de Viboral', 'Apartadó', 'Turbo', 'Carepa', 'Chigorodó',
      'Caucasia', 'Yarumal', 'Andes', 'Jericó', 'Santa Fe de Antioquia',
      'Puerto Berrío', 'Segovia', 'Zaragoza',
    ],
  },
  {
    nombre: 'Arauca',
    ciudades: ['Arauca', 'Saravena', 'Arauquita', 'Tame', 'Fortul'],
  },
  {
    nombre: 'Atlántico',
    ciudades: [
      'Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia',
      'Galapa', 'Baranoa',
    ],
  },
  {
    nombre: 'Bolívar',
    ciudades: [
      'Cartagena', 'Magangué', 'El Carmen de Bolívar', 'Mompós', 'Turbaco',
      'Arjona', 'San Juan Nepomuceno',
    ],
  },
  {
    nombre: 'Boyacá',
    ciudades: [
      'Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa', 'Villa de Leyva',
      'Moniquirá', 'Nobsa', 'Tibasosa', 'Puerto Boyacá',
    ],
  },
  {
    nombre: 'Caldas',
    ciudades: [
      'Manizales', 'Villamaría', 'La Dorada', 'Chinchiná', 'Riosucio',
      'Supía', 'Anserma', 'Manzanares',
    ],
  },
  {
    nombre: 'Caquetá',
    ciudades: ['Florencia', 'San Vicente del Caguán', 'Puerto Rico', 'El Doncello'],
  },
  {
    nombre: 'Casanare',
    ciudades: ['Yopal', 'Aguazul', 'Villanueva', 'Paz de Ariporo', 'Monterrey', 'Tauramena'],
  },
  {
    nombre: 'Cauca',
    ciudades: [
      'Popayán', 'Santander de Quilichao', 'Puerto Tejada', 'Patía',
      'Piendamó', 'El Bordo',
    ],
  },
  {
    nombre: 'Cesar',
    ciudades: [
      'Valledupar', 'Aguachica', 'Codazzi', 'La Paz', 'Bosconia',
      'El Copey', 'Curumaní',
    ],
  },
  {
    nombre: 'Chocó',
    ciudades: ['Quibdó', 'Istmina', 'Tadó', 'Riosucio', 'Bagadó'],
  },
  {
    nombre: 'Córdoba',
    ciudades: [
      'Montería', 'Lorica', 'Cereté', 'Montelíbano', 'Sahagún',
      'Tierralta', 'Planeta Rica', 'Ayapel',
    ],
  },
  {
    nombre: 'Cundinamarca',
    ciudades: [
      'Bogotá D.C.', 'Soacha', 'Chía', 'Mosquera', 'Madrid',
      'Facatativá', 'Zipaquirá', 'Fusagasugá', 'Girardot', 'La Mesa',
      'Cajicá', 'Tabio', 'Tocancipá', 'Sopó', 'Funza',
      'Zipacón', 'Sibaté', 'Cota', 'Tenjo', 'Nemocón',
    ],
  },
  {
    nombre: 'Guainía',
    ciudades: ['Inírida'],
  },
  {
    nombre: 'Guaviare',
    ciudades: ['San José del Guaviare', 'El Retorno', 'Calamar'],
  },
  {
    nombre: 'Huila',
    ciudades: [
      'Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre',
      'Palermo', 'Rivera', 'San Agustín',
    ],
  },
  {
    nombre: 'La Guajira',
    ciudades: ['Riohacha', 'Maicao', 'Uribia', 'Manaure', 'San Juan del Cesar', 'Fonseca'],
  },
  {
    nombre: 'Magdalena',
    ciudades: [
      'Santa Marta', 'Ciénaga', 'Fundación', 'Plato', 'El Banco',
      'Aracataca', 'Pivijay',
    ],
  },
  {
    nombre: 'Meta',
    ciudades: [
      'Villavicencio', 'Acacías', 'Granada', 'Puerto López', 'Puerto Gaitán',
      'Restrepo', 'Cumaral', 'San Martín',
    ],
  },
  {
    nombre: 'Nariño',
    ciudades: [
      'Pasto', 'Tumaco', 'Ipiales', 'Túquerres', 'La Unión',
      'Samaniego', 'Barbacoas',
    ],
  },
  {
    nombre: 'Norte de Santander',
    ciudades: [
      'Cúcuta', 'Ocaña', 'Villa del Rosario', 'Los Patios', 'El Zulia',
      'Pamplona', 'Tibú', 'Chinácota',
    ],
  },
  {
    nombre: 'Putumayo',
    ciudades: ['Mocoa', 'Puerto Asís', 'Orito', 'Valle del Guamuez', 'Sibundoy'],
  },
  {
    nombre: 'Quindío',
    ciudades: ['Armenia', 'Calarcá', 'Montenegro', 'La Tebaida', 'Quimbaya', 'Circasia'],
  },
  {
    nombre: 'Risaralda',
    ciudades: [
      'Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia',
      'Belén de Umbría', 'Quinchía',
    ],
  },
  {
    nombre: 'San Andrés y Providencia',
    ciudades: ['San Andrés', 'Providencia'],
  },
  {
    nombre: 'Santander',
    ciudades: [
      'Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja',
      'Socorro', 'San Gil', 'Vélez', 'Málaga', 'Lebrija',
    ],
  },
  {
    nombre: 'Sucre',
    ciudades: ['Sincelejo', 'Corozal', 'San Marcos', 'Sampués', 'Tolú', 'Morroa'],
  },
  {
    nombre: 'Tolima',
    ciudades: [
      'Ibagué', 'Espinal', 'Melgar', 'Honda', 'Líbano',
      'Chaparral', 'Flandes', 'Girardot (sector Tolima)',
    ],
  },
  {
    nombre: 'Valle del Cauca',
    ciudades: [
      'Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Buga',
      'Cartago', 'Yumbo', 'Jamundí', 'Candelaria', 'Dagua',
      'Roldanillo', 'La Unión', 'Zarzal', 'El Cerrito',
    ],
  },
  {
    nombre: 'Vaupés',
    ciudades: ['Mitú'],
  },
  {
    nombre: 'Vichada',
    ciudades: ['Puerto Carreño', 'La Primavera', 'Santa Rosalía'],
  },
];
