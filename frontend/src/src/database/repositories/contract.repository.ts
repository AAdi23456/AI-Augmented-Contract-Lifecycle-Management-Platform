import { Contract } from '../models/contract.model';

export const contractProviders = [
  {
    provide: 'CONTRACT_REPOSITORY',
    useValue: Contract,
  },
]; 