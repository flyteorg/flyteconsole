import { act, render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createTestQueryClient } from '../../../test/utils';
import { WorkflowNodeExecutionsContext } from '../../Executions/contexts';
import { dNode } from '../../../models/Graph/types';
import { WorkflowGraph } from '../WorkflowGraph';

declare module 'react-query/types/react/QueryClientProvider' {
  interface QueryClientProviderProps {
    children?: React.ReactNode;
  }
}

jest.mock('../../flytegraph/ReactFlow/transformDAGToReactFlowV2.tsx', () => ({
  ConvertFlyteDagToReactFlows: jest.fn(() => ({
    nodes: [],
    edges: [],
  })),
}));

jest.mock('../../flytegraph/ReactFlow/ReactFlowWrapper.tsx', () => ({
  ReactFlowWrapper: jest.fn(({ children }) => (
    <div data-testid="react-flow-wrapper">{children}</div>
  )),
}));

describe('WorkflowGraph', () => {
  let queryClient: QueryClient;
  let initialNodes: dNode[] = [];

  beforeEach(() => {
    queryClient = createTestQueryClient();
    initialNodes = [];
  });

  it('should render map task logs when all props were provided', async () => {
    await act(() => {
      render(
        <QueryClientProvider client={queryClient}>
          <WorkflowNodeExecutionsContext.Provider
            value={{
              nodeExecutionsById: {},
              setCurrentNodeExecutionsById: () => {},
              visibleNodes: initialNodes,
              dagData: {
                mergedDag: {
                  edges: [],
                  scopedId: 'node',
                  id: 'node',
                  name: 'node',
                  nodes: [],
                  type: 4,
                  value: {
                    id: 'name',
                  },
                },
                dagError: undefined,
              },
              toggleNode: () => {},
            }}
          >
            <WorkflowGraph />
          </WorkflowNodeExecutionsContext.Provider>
        </QueryClientProvider>,
      );
    });

    const graph = await waitFor(() => screen.getByTestId('react-flow-wrapper'));
    expect(graph).toBeInTheDocument();
  });
});
