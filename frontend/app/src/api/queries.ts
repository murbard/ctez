import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { getCfmmStorage } from '../contracts/cfmm';
import { getExternalOvenData, getOvens } from '../contracts/ctez';
import { Baker, BaseStats, CfmmStorage, Oven, UserBalance } from '../interfaces';
import { CTEZ_ADDRESS } from '../utils/globals';
import { getExternalOvens } from '../utils/ovenUtils';
import { getBaseStats } from './contracts';
import { getDelegates } from './tzkt';
import { getUserBalance } from './user';

export const useDelegates = () => {
  return useQuery<Baker[], AxiosError, Baker[]>(['delegates'], () => {
    return getDelegates();
  });
};

export const useCtezBaseStats = () => {
  return useQuery<BaseStats, AxiosError, BaseStats>(['baseStats'], async () => {
    return getBaseStats();
  });
};

export const useUserBalance = (userAddress?: string) => {
  return useQuery<UserBalance | undefined, AxiosError, UserBalance | undefined>(
    [`user-balance-${userAddress}`],
    () => {
      if (userAddress) {
        return getUserBalance(userAddress);
      }
    },
  );
};
export const useCfmmStorage = () => {
  return useQuery<CfmmStorage, AxiosError, CfmmStorage>(
    ['cfmmStorage'],
    async () => {
      return getCfmmStorage();
    },
    {
      refetchInterval: 30000,
      staleTime: 3000,
    },
  );
};

export const useOvenData = (userAddress?: string) => {
  return useQuery<Oven[], AxiosError, Oven[]>(
    ['ovenData', userAddress],
    async () => {
      if (userAddress && CTEZ_ADDRESS) {
        const externalOvens = getExternalOvens(userAddress, CTEZ_ADDRESS);
        const externals = await getExternalOvenData(externalOvens, userAddress);
        const userOvens = await getOvens(userAddress);
        const ovens: Oven[] = [];
        if (userOvens) {
          ovens.push(...userOvens);
        }
        if (externals) {
          ovens.push(...externals);
        }
        const result =
          typeof ovens !== 'undefined'
            ? ovens.filter((data: Oven) => {
                return data && data.baker !== null;
              })
            : [];
        return result;
      }
      return [];
    },
    {
      refetchInterval: 30000,
      staleTime: 3000,
    },
  );
};