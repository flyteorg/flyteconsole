import { useContext } from 'react';
import { IdentityContext } from './IdentityContext';

export const useUserIdentity = () => {
  return useContext(IdentityContext);
};
