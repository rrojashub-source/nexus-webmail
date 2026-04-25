export interface Company {
  id: string;
  name: string;
  logo: string;
  loginHint?: string;
}

export const COMPANIES: Company[] = [
  {
    id: 'rym',
    name: 'RYM Corporation',
    logo: '/logos/rym.png',
    loginHint: 'ricardorojas@rymcorporation.com',
  },
  {
    id: 'electroser',
    name: 'Electroservices USA',
    logo: '/logos/electroser.png',
    // Two accounts (admin@ and sales@) — user selects after OAuth redirect
  },
  {
    id: 'central-power',
    name: 'Central Power Solutions',
    logo: '/logos/central-power.png',
    loginHint: 'ricardorojas@centralpowersolutions.com',
  },
];
