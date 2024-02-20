import { ReactNode } from 'react';

// needed for react v19
declare module 'react-query/types/react/QueryClientProvider' {
  interface QueryClientProviderProps {
    children?: ReactNode;
  }
}
