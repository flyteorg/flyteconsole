import {
  fireEvent,
  render,
  RenderResult,
  waitFor,
} from '@testing-library/react';
import { labels as commonLabels } from 'components/common/constants';
import {
  ExecutionContext,
  ExecutionContextData,
} from 'components/Executions/contexts';
import { Identifier } from 'models/Common/types';
import { WorkflowExecutionPhase } from 'models/Execution/enums';
import { Execution } from 'models/Execution/types';
import { createMockExecution } from 'models/__mocks__/executionsData';
import * as React from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createTestQueryClient } from 'test/utils';
import { executionActionStrings } from '../constants';
import { ExecutionDetailsAppBarContentInner } from '../ExecutionDetailsAppBarContent';

jest.mock('components/Navigation/SubNavBarContent', () => ({
  SubNavBarContent: ({ children }: React.Props<any>) => children,
}));

describe('ExecutionDetailsAppBarContent', () => {
  let execution: Execution;
  let executionContext: ExecutionContextData;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let sourceId: Identifier;
  let queryClient: QueryClient;

  beforeEach(() => {
    execution = createMockExecution();
    sourceId = execution.closure.workflowId;

    executionContext = {
      execution,
    };

    queryClient = createTestQueryClient();
  });

  const renderContent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ExecutionContext.Provider value={executionContext}>
            <ExecutionDetailsAppBarContentInner />
          </ExecutionContext.Provider>
        </MemoryRouter>
      </QueryClientProvider>,
    );

  describe('for running executions', () => {
    beforeEach(() => {
      execution.closure.phase = WorkflowExecutionPhase.RUNNING;
    });

    it('renders an overflow menu', async () => {
      const { getByLabelText } = renderContent();
      expect(getByLabelText(commonLabels.moreOptionsButton)).toBeTruthy();
    });

    describe('in overflow menu', () => {
      let renderResult: RenderResult;
      let buttonEl: HTMLElement;

      beforeEach(async () => {
        renderResult = renderContent();
        const { getByLabelText } = renderResult;
        buttonEl = await waitFor(() =>
          getByLabelText(commonLabels.moreOptionsButton),
        );
        await fireEvent.click(buttonEl);
        await waitFor(() => getByLabelText(commonLabels.moreOptionsMenu));
      });

      it('renders a clone option', () => {
        const { getByText } = renderResult;
        expect(getByText(executionActionStrings.clone)).toBeInTheDocument();
      });
    });
  });

  describe('for terminal executions', () => {
    beforeEach(() => {
      execution.closure.phase = WorkflowExecutionPhase.SUCCEEDED;
    });

    it('does not render an overflow menu', async () => {
      const { queryByLabelText } = renderContent();
      expect(queryByLabelText(commonLabels.moreOptionsButton)).toBeNull();
    });
  });
});
