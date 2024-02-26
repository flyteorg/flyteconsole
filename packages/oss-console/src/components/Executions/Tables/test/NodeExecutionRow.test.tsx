import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderImport,
  QueryClientProviderProps,
} from 'react-query';
import cloneDeep from 'lodash/cloneDeep';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { createTestQueryClient } from '../../../../test/utils';
import { insertFixture } from '../../../../mocks/data/insertFixture';
import { mockServer } from '../../../../mocks/server';
import { basicPythonWorkflow } from '../../../../mocks/data/fixtures/basicPythonWorkflow';
import { NodeExecution } from '../../../../models/Execution/types';
import { dNode, dTypes } from '../../../../models/Graph/types';
import { NodeExecutionDynamicContext } from '../../contextProvider/NodeExecutionDetails/NodeExecutionDynamicProvider';
import { createWorkflowObject } from '../../../../models/__mocks__/workflowData';
import { NodeExecutionRow } from '../NodeExecutionRow';
import { NodeExecutionDetailsContextProvider } from '../../contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';
import { WorkflowNodeExecutionsProvider } from '../../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';

const workflow = createWorkflowObject();

const QueryClientProvider: React.FC<React.PropsWithChildren<QueryClientProviderProps>> =
  QueryClientProviderImport;

jest.mock('../../../../queries/workflowQueries');
const { fetchWorkflow } = require('../../../../queries/workflowQueries');

jest.mock('../../../../models/Execution/api');
const { listNodeExecutions } = require('../../../../models/Execution/api');

const columns = [];

const onToggle = jest.fn();

describe('Executions > Tables > NodeExecutionRow', () => {
  let queryClient: QueryClient;
  let fixture: ReturnType<typeof basicPythonWorkflow.generate>;
  let execution: NodeExecution;
  let node: dNode;
  beforeEach(() => {
    fixture = basicPythonWorkflow.generate();
    execution = fixture.workflowExecutions.top.nodeExecutions.pythonNode.data;
    execution = cloneDeep(execution);
    const fixtureNode = fixture.workflows.top.closure?.compiledWorkflow?.primary?.template.nodes[0];
    node = {
      id: fixtureNode?.id,
      scopedId: fixtureNode?.id,
      type: dTypes.start,
      name: fixtureNode?.id,
      nodes: [],
      edges: [],
    } as dNode;
    queryClient = createTestQueryClient();
    insertFixture(mockServer, fixture);
    fetchWorkflow.mockImplementation(() => Promise.resolve(fixture.workflows.top));
    listNodeExecutions.mockImplementation(() => {
      return Promise.resolve({ entities: [execution] });
    });
  });

  const renderComponent = (props) => {
    const { node } = props;
    return render(
      <QueryClientProvider client={queryClient}>
        <NodeExecutionDetailsContextProvider initialWorkflow={workflow}>
          <NodeExecutionDynamicContext.Provider
            value={{
              node,
              componentProps: {
                ref: null,
              },
              inView: false,
            }}
          >
            <WorkflowNodeExecutionsProvider initialNodeExecutions={[execution]}>
              <TableContainer>
                <Table>
                  <TableBody>
                    <NodeExecutionRow {...props} />
                  </TableBody>
                </Table>
              </TableContainer>
            </WorkflowNodeExecutionsProvider>
          </NodeExecutionDynamicContext.Provider>
        </NodeExecutionDetailsContextProvider>
      </QueryClientProvider>,
    );
  };
  it('should not render expander if node is a leaf', async () => {
    const { queryByTestId } = renderComponent({
      columns,
      node,
      onToggle,
    });
    await waitFor(() => queryByTestId('node-execution-row'));

    expect(queryByTestId('node-execution-row')).toBeInTheDocument();
    expect(queryByTestId('expander')).not.toBeInTheDocument();
  });

  it('should render expander if node contains list of nodes', async () => {
    execution!.metadata!.isParentNode = true;
    const mockNode = {
      ...node,
      nodes: [node, node],
    };

    const { queryByTestId, queryByTitle } = renderComponent({
      columns,
      node: mockNode,
      nodeExecution: execution,
      onToggle,
    });
    await waitFor(() => queryByTestId('node-execution-row'));

    expect(queryByTestId('node-execution-row')).toBeInTheDocument();
    expect(queryByTitle('Expand row')).toBeInTheDocument();
  });
});
