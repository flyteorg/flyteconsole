import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import * as React from 'react';
import { MemoryRouter } from 'react-router';
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderImport,
  QueryClientProviderProps,
} from 'react-query';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { ThemeProvider } from '@mui/material/styles';
import { labels as commonLabels } from '../../../common/constants';
import { ExecutionContext, ExecutionContextData } from '../../contexts';
import { Identifier } from '../../../../models/Common/types';
import { WorkflowExecutionPhase } from '../../../../models/Execution/enums';
import { Execution } from '../../../../models/Execution/types';
import { createMockExecution } from '../../../../models/__mocks__/executionsData';
import { createTestQueryClient } from '../../../../test/utils';
import { BreadcrumbTitleActionsPortal } from '../../../Breadcrumbs/components/BreadcrumbTitleActions';
import { executionActionStrings } from '../constants';
import { ExecutionDetailsAppBarContentInner } from '../ExecutionDetailsAppBarContent';

const QueryClientProvider: React.FC<React.PropsWithChildren<QueryClientProviderProps>> =
  QueryClientProviderImport;

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
      <ThemeProvider theme={muiTheme}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ExecutionContext.Provider value={executionContext}>
              <BreadcrumbTitleActionsPortal />
              <ExecutionDetailsAppBarContentInner />
            </ExecutionContext.Provider>
          </MemoryRouter>
        </QueryClientProvider>
      </ThemeProvider>,
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
        buttonEl = await waitFor(() => getByLabelText(commonLabels.moreOptionsButton));
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
