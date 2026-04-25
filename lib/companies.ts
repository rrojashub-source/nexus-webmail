export interface Company {
  id: string;
  name: string;
  logo: string;
}

export const COMPANIES: Company[] = [
  {
    id: 'rym',
    name: 'RYM Corporation',
    logo: '/logos/rym.svg',
  },
  {
    id: 'electroser',
    name: 'Electroservices USA',
    logo: '/logos/electroser.svg',
  },
  {
    id: 'central-power',
    name: 'Central Power Solutions',
    logo: '/logos/central-power.svg',
  },
];
