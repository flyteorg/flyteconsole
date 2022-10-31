import { RequestConfig } from '@flyteconsole/flyteidl';
import { Execution, NodeExecution } from '@flyteconsole/components';
import * as React from 'react';

export interface ExecutionContextData {
  execution: Execution;
}

export const ExecutionContext = React.createContext<ExecutionContextData>(
  {} as ExecutionContextData,
);

export const NodeExecutionsByIdContext = React.createContext<Dictionary<NodeExecution>>({});

export const NodeExecutionsRequestConfigContext = React.createContext<RequestConfig>({});
