import React, { PropsWithChildren, useContext } from 'react';
import { AppConfig } from '@flyteorg/common';

export interface ExternalConfigurationProviderProps {
  registry?: {
    nav?: React.FC<any>;
    topLevelLayout?: React.FC<any>;
    taskExecutionAttemps?: React.FC<any>;
    additionalRoutes?: any[];
  };
  env?: any;
  config?: AppConfig;
}

export const ExternalConfigurationContext =
  React.createContext<ExternalConfigurationProviderProps>({});

export const ExternalConfigurationProvider = ({
  children,
  config,
  env,
  registry,
}: PropsWithChildren<ExternalConfigurationProviderProps>) => {
  return (
    <ExternalConfigurationContext.Provider value={{ config, env, registry }}>
      {children}
    </ExternalConfigurationContext.Provider>
  );
};

export const useExternalConfigurationContext = () =>
  useContext(ExternalConfigurationContext);
