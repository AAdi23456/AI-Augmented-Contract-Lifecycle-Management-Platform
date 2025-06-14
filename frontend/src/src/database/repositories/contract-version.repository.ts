import { ContractVersion } from '../models/contract-version.model';

export const contractVersionProviders = [
  {
    provide: 'CONTRACT_VERSION_REPOSITORY',
    useValue: ContractVersion,
  },
]; 