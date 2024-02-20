import React from 'react';
import { Flyte } from '../../types/flyteTypes';
import { QueryError } from '../DataProvider/apis/admin';

export interface RequestState {
  isLoading?: boolean;
  error?: QueryError;
  refetch?: () => {};
}

export type RequestResult<T> = {
  data?: T;
} & RequestState;

export type ProfileResult = RequestResult<Flyte.Profile>;

export type IdentityContextType = {
  profile: ProfileResult;
};

const defaultBehaviour: IdentityContextType = {
  profile: {
    isLoading: false,
  },
};

export const IdentityContext = React.createContext<IdentityContextType>(defaultBehaviour);
