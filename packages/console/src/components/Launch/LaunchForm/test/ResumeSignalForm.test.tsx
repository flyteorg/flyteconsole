import { ThemeProvider } from '@material-ui/styles';
import {
  fireEvent,
  queryAllByRole,
  render,
  waitFor,
} from '@testing-library/react';
import { APIContext } from 'components/data/apiContext';
import { mockAPIContextValue } from 'components/data/__mocks__/apiContext';
import { getMuiTheme } from 'components/Theme/muiTheme';
import { SimpleType } from 'models/Common/types';
import { resumeSignalNode } from 'models/Execution/api';
import * as React from 'react';
import { WorkflowNodeExecutionsContext } from 'components/Executions/contexts';
import { dateToTimestamp } from 'common/utils';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { createTestQueryClient } from 'test/utils';
import { mockWorkflowId } from 'mocks/data/fixtures/types';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Core } from '@flyteorg/flyteidl-types';
import { CompiledNode } from 'models/Node/types';
import { CompiledWorkflowClosure } from 'models/Workflow/types';
import { NodeExecutionDetailsContext } from 'components/Executions/contextProvider/NodeExecutionDetails';
import { signalInputName } from './constants';
import { ResumeSignalForm } from '../ResumeSignalForm';

const mockScopeId = 'n0';
const mockNodeId = 'node0';
const mockExecutionId = { domain: 'domain', name: 'name', project: 'project' };
const mockNodeExecutionId = {
  nodeId: mockScopeId,
  executionId: mockExecutionId,
};

const mockNodeExecutionsById = {
  [mockScopeId]: {
    closure: {
      createdAt: dateToTimestamp(new Date()),
      outputUri: '',
      phase: NodeExecutionPhase.UNDEFINED,
    },
    id: {
      executionId: mockExecutionId,
      nodeId: mockNodeId,
    },
    inputUri: '',
    scopedId: mockScopeId,
  },
};

const createMockCompiledWorkflowClosure = (
  nodes: CompiledNode[],
): CompiledWorkflowClosure => ({
  primary: {
    connections: {
      downstream: {},
      upstream: {},
    },
    template: {
      id: mockWorkflowId,
      nodes,
    },
  },
  tasks: [],
});

const createMockCompiledNode = (type?: Core.ILiteralType): CompiledNode => ({
  id: mockScopeId,
  metadata: {
    name: 'my-signal-name',
    timeout: '3600s',
    retries: {},
  },
  upstreamNodeIds: [],
  gateNode: {
    signal: {
      signalId: 'my-signal-name',
      type,
      outputVariableName: 'o0',
    },
  },
});

describe('ResumeSignalForm', () => {
  let onClose: jest.Mock;
  let queryClient: QueryClient;
  let mockResumeSignalNode: jest.Mock<ReturnType<typeof resumeSignalNode>>;

  beforeEach(() => {
    onClose = jest.fn();
    queryClient = createTestQueryClient();
  });

  const renderForm = (type?: Core.ILiteralType) => {
    const mockCompiledNode = createMockCompiledNode(type);
    const mockCompiledWorkflowClosure = createMockCompiledWorkflowClosure([
      mockCompiledNode,
    ]);
    return render(
      <ThemeProvider theme={getMuiTheme({})}>
        <QueryClientProvider client={queryClient}>
          <APIContext.Provider
            value={mockAPIContextValue({
              resumeSignalNode: mockResumeSignalNode,
            })}
          >
            <NodeExecutionDetailsContext.Provider
              value={{
                getNodeExecutionDetails: jest.fn(),
                workflowId: mockWorkflowId,
                compiledWorkflowClosure: mockCompiledWorkflowClosure,
              }}
            >
              <WorkflowNodeExecutionsContext.Provider
                value={{ nodeExecutionsById: mockNodeExecutionsById }}
              >
                <ResumeSignalForm
                  onClose={onClose}
                  compiledNode={mockCompiledNode}
                  nodeExecutionId={mockNodeExecutionId}
                />
              </WorkflowNodeExecutionsContext.Provider>
            </NodeExecutionDetailsContext.Provider>
          </APIContext.Provider>
        </QueryClientProvider>
      </ThemeProvider>,
    );
  };

  const getSubmitButton = (container: HTMLElement) => {
    const buttons = queryAllByRole(container, 'button').filter(
      el => el.getAttribute('type') === 'submit',
    );
    expect(buttons.length).toBe(1);
    return buttons[0];
  };

  describe('With inputs', () => {
    beforeEach(() => {
      mockResumeSignalNode = jest.fn();
    });

    it('should render the node id as a header title', async () => {
      const { getByText } = renderForm();
      expect(getByText('node0')).toBeInTheDocument();
    });

    it('should disable the submit button until the input is filled', async () => {
      const { container } = renderForm();
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).toBeDisabled();
    });

    it('should show disabled submit button if the value in input is invalid', async () => {
      const { container, getByLabelText } = renderForm({
        simple: SimpleType.INTEGER,
      });
      await waitFor(() => {});

      const integerInput = await waitFor(() =>
        getByLabelText(signalInputName, {
          exact: false,
        }),
      );
      const submitButton = getSubmitButton(container);
      await fireEvent.change(integerInput, { target: { value: 'abc' } });
      await fireEvent.click(getSubmitButton(container));
      await waitFor(() => expect(submitButton).toBeDisabled());

      await fireEvent.change(integerInput, { target: { value: '123' } });
      await waitFor(() => expect(submitButton).toBeEnabled());
    });

    it('should allow submission after fixing validation errors', async () => {
      const { container, getByLabelText } = renderForm({
        simple: SimpleType.INTEGER,
      });
      await waitFor(() => {});

      const integerInput = await waitFor(() =>
        getByLabelText(signalInputName, {
          exact: false,
        }),
      );
      const submitButton = getSubmitButton(container);
      await fireEvent.change(integerInput, { target: { value: 'abc' } });
      await waitFor(() => expect(submitButton).toBeDisabled());

      await fireEvent.change(integerInput, { target: { value: '123' } });
      await waitFor(() => expect(submitButton).toBeEnabled());
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockResumeSignalNode).toHaveBeenCalled());
    });

    it('should show error when the submission fails', async () => {
      const errorString = 'Something went wrong';
      mockResumeSignalNode.mockRejectedValue(new Error(errorString));

      const { container, getByText, getByLabelText } = renderForm({
        simple: SimpleType.INTEGER,
      });
      const integerInput = await waitFor(() =>
        getByLabelText(signalInputName, {
          exact: false,
        }),
      );
      const submitButton = getSubmitButton(container);
      await fireEvent.change(integerInput, { target: { value: '123' } });
      await waitFor(() => expect(submitButton).toBeEnabled());

      await fireEvent.click(getSubmitButton(container));
      await waitFor(() => expect(getByText(errorString)).toBeInTheDocument());
    });
  });
});
