import { act, render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { createTestQueryClient } from 'test/utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { WorkflowNodeExecutionsContext } from 'components/Executions/contexts';
import { WorkflowGraph } from '../WorkflowGraph';

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

  beforeEach(() => {
    queryClient = createTestQueryClient();
  });

  it('should render map task logs when all props were provided', async () => {
    await act(() => {
      render(
        <QueryClientProvider client={queryClient}>
          <WorkflowNodeExecutionsContext.Provider
            value={{
              initialDNodes: [],
              nodeExecutionsById: {},
              setCurrentNodeExecutionsById: () => {},
              setShouldUpdate: () => {},
              shouldUpdate: false,
              dagData: {
                mergedDag: {
                  edges: [],
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
