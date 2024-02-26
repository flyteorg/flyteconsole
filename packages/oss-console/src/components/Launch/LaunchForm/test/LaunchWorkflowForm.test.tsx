import { ThemeProvider } from '@mui/material/styles';
import { act, fireEvent, screen, queryAllByRole, render, waitFor } from '@testing-library/react';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import Core from '@clients/common/flyteidl/core';
import Protobuf from '@clients/common/flyteidl/protobuf';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import * as React from 'react';
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderImport,
  QueryClientProviderProps,
} from 'react-query';
import Long from 'long';
import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { APIContext } from '../../../data/apiContext';
import { mockAPIContextValue } from '../../../data/__mocks__/apiContext';
import {
  Identifier,
  Literal,
  NamedEntityIdentifier,
  Variable,
} from '../../../../models/Common/types';
import {
  CreateWorkflowExecutionArguments,
  createWorkflowExecution, // CreateWorkflowExecutionArguments
} from '../../../../models/Execution/api';
import { listLaunchPlans } from '../../../../models/Launch/api';
import { LaunchPlan } from '../../../../models/Launch/types';
import { getWorkflow, listWorkflows } from '../../../../models/Workflow/api';
import { Workflow } from '../../../../models/Workflow/types';
import { createMockWorkflowClosure } from '../../../../models/__mocks__/workflowData';
import {
  createTestQueryClient,
  delayedPromise,
  // delayedPromise,
  pendingPromise,
} from '../../../../test/utils';
import { WorkflowNodeExecutionsProvider } from '../../../Executions/contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import t from '../strings';
import { LaunchForm } from '../LaunchForm';
import { LaunchFormProps, WorkflowInitialLaunchParameters } from '../types';
import { createInputCacheKey, getInputDefintionForLiteralType } from '../utils';
import {
  createMockInputsInterface,
  mockSimpleVariables,
  simpleVariableDefaults,
} from '../__mocks__/mockInputs';
import {
  binaryInputName,
  booleanInputName,
  // booleanInputName,
  integerInputName,
  stringInputName,
  // stringInputName,
  stringNoLabelName,
} from './constants';
import { createMockObjects } from './utils';
import { workflowNoInputsString } from '../constants';

const QueryClientProvider: React.FC<React.PropsWithChildren<QueryClientProviderProps>> =
  QueryClientProviderImport;

declare module 'react-query/types/react/QueryClientProvider' {
  interface QueryClientProviderProps {
    children?: React.ReactNode;
  }
}

jest.mock('../../../../components/Executions/ExecutionDetails/Timeline/ExecutionTimeline', () => ({
  ExecutionTimelineContainer: jest.fn(() => <div id="ExecutionTimelineContainer-mock"></div>),
}));

jest.mock('../../../../components/Executions/ExecutionDetails/withExecutionDetails', () => ({
  withExecutionDetails: jest.fn((Comp) => <div id="ExecutionMetadata-mock">{Comp}</div>),
}));

describe('LaunchForm: Workflow', () => {
  let onClose: jest.Mock;
  let mockLaunchPlans: LaunchPlan[];
  let mockSingleLaunchPlan: LaunchPlan;
  let mockWorkflow: Workflow;
  let mockWorkflowVersions: Workflow[];
  let workflowId: NamedEntityIdentifier;
  let variables: Record<string, Variable>;
  let queryClient: QueryClient;

  let mockListLaunchPlans: jest.Mock<ReturnType<typeof listLaunchPlans>>;
  let mockListWorkflows: jest.Mock<ReturnType<typeof listWorkflows>>;
  let mockGetWorkflow: jest.Mock<ReturnType<typeof getWorkflow>>;
  let mockCreateWorkflowExecution: jest.Mock<ReturnType<typeof createWorkflowExecution>>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    onClose = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const createMockWorkflowWithInputs = (id: Identifier) => {
    const workflow: Workflow = {
      id,
    };
    workflow.closure = createMockWorkflowClosure();
    workflow.closure!.compiledWorkflow!.primary.template.interface =
      createMockInputsInterface(variables);
    return workflow;
  };

  const createMocks = () => {
    const mockObjects = createMockObjects(variables);
    mockWorkflow = mockObjects.mockWorkflow;
    mockLaunchPlans = mockObjects.mockLaunchPlans;
    // eslint-disable-next-line prefer-destructuring
    mockSingleLaunchPlan = mockLaunchPlans[0];

    // We want the second launch plan to have inputs which differ, so we'll
    // remove one of the inputs
    delete mockLaunchPlans[1].closure!.expectedInputs.parameters[stringNoLabelName];

    mockWorkflowVersions = mockObjects.mockWorkflowVersions;

    workflowId = mockWorkflow.id;
    mockCreateWorkflowExecution = jest.fn();
    // Return our mock inputs for any version requested
    mockGetWorkflow = jest
      .fn()
      .mockImplementation((id) => Promise.resolve(createMockWorkflowWithInputs(id)));
    mockListLaunchPlans = jest
      .fn()
      .mockImplementation((scope: Partial<Identifier>, { filter }: RequestConfig) => {
        // If the scope has a filter, the calling
        // code is searching for a specific item. So we'll
        // return a single-item list containing it.
        if (filter && filter[0].key === 'version') {
          const launchPlan = { ...mockSingleLaunchPlan };
          launchPlan.id = {
            ...scope,
            version: filter[0].value,
          } as Identifier;
          return Promise.resolve({
            entities: [launchPlan],
          });
        }
        return Promise.resolve({ entities: mockLaunchPlans });
      });

    // For workflow/task list endpoints: If the scope has a filter, the calling
    // code is searching for a specific item. So we'll return a single-item
    // list containing it.
    mockListWorkflows = jest
      .fn()
      .mockImplementation((scope: Partial<Identifier>, { filter }: RequestConfig) => {
        if (filter && filter[0].key === 'version') {
          const workflow = { ...mockWorkflowVersions[0] };
          workflow.id = {
            ...scope,
            version: filter[0].value,
          } as Identifier;
          return Promise.resolve({
            entities: [workflow],
          });
        }
        return Promise.resolve({ entities: mockWorkflowVersions });
      });
  };

  /**
   * TODO: Fix warning:
   * 'Warning: React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.%s',
   */
  const renderForm = (props?: Partial<LaunchFormProps>) => {
    return render(
      <ThemeProvider theme={muiTheme}>
        <QueryClientProvider client={queryClient}>
          <APIContext.Provider
            value={mockAPIContextValue({
              createWorkflowExecution: mockCreateWorkflowExecution,
              getWorkflow: mockGetWorkflow,
              listLaunchPlans: mockListLaunchPlans,
              listWorkflows: mockListWorkflows,
            })}
          >
            <WorkflowNodeExecutionsProvider initialNodeExecutions={[]}>
              <LaunchForm onClose={onClose} workflowId={workflowId} {...props} />
            </WorkflowNodeExecutionsProvider>
          </APIContext.Provider>
        </QueryClientProvider>
      </ThemeProvider>,
      {},
    );
  };

  const getSubmitButton = (container: HTMLElement) => {
    const buttons = queryAllByRole(container, 'button').filter(
      (el) => el.getAttribute('type') === 'submit',
    );
    expect(buttons.length).toBe(1);
    return buttons[0];
  };

  describe('With No Inputs', () => {
    beforeEach(() => {
      variables = {};
      createMocks();
    });

    it('should render info message', async () => {
      const { container, getByText } = renderForm();
      const submitButton = await waitFor(() => getSubmitButton(container));
      await waitFor(() => expect(submitButton).toBeEnabled());

      expect(getByText(workflowNoInputsString)).toBeInTheDocument();
    });

    it('should not render inputs header/description', async () => {
      const { container, queryByText } = renderForm();
      const submitButton = await waitFor(() => getSubmitButton(container));
      await waitFor(() => expect(submitButton).toBeEnabled());

      expect(queryByText(t('inputs'))).toBeNull();
      expect(queryByText(t('inputsDescription'))).toBeNull();
    });
  });

  describe('With Simple Inputs', () => {
    beforeEach(() => {
      variables = cloneDeep(mockSimpleVariables);
      createMocks();
    });

    it('should not show workflow selector until options have loaded', async () => {
      mockListWorkflows.mockReturnValue(pendingPromise());
      const { queryByText } = renderForm();
      await waitFor(() => {});
      expect(queryByText(t('workflowVersion'))).not.toBeInTheDocument();
    });

    it('should not show launch plan selector until list has loaded', async () => {
      mockListLaunchPlans.mockReturnValue(pendingPromise());
      const { getByLabelText, queryByText } = renderForm();
      await waitFor(() => getByLabelText(t('workflowVersion')));
      expect(queryByText(t('launchPlan'))).not.toBeInTheDocument();
    });

    it('should select the most recent workflow version by default', async () => {
      const { container } = renderForm();
      await waitFor(() => {
        const label = container.querySelector('#launch-workflow-selector');
        expect(label).toHaveValue(mockWorkflowVersions[0].id.version);
      });
    });

    it('should select the launch plan matching the workflow name by default', async () => {
      const { container } = renderForm();
      await waitFor(() => {
        const label = container.querySelector('#launch-lp-selector');
        expect(label).toHaveValue(mockWorkflow.id.name);
      });
    });

    it('should not render inputs if no launch plan is selected', async () => {
      mockListLaunchPlans.mockResolvedValue({
        entities: [],
      });
      const { container, queryByLabelText } = renderForm();
      await waitFor(() => {
        expect(mockListLaunchPlans).toHaveBeenCalled();
      });

      // Find the launch plan selector, verify it has no value selected
      const launchPlanInput = await waitFor(() => {
        const selector = container.querySelector('#launch-lp-selector');
        return selector;
      });
      expect(launchPlanInput).toBeInTheDocument();
      expect(launchPlanInput).toHaveValue('');

      expect(
        queryByLabelText(stringInputName, {
          // Don't use exact match because the label will be decorated with type info
          exact: false,
        }),
      ).toBeNull();
    });

    it('should disable submit button until inputs have loaded', async () => {
      let identifier: Identifier = {} as Identifier;
      const { promise, resolve } = delayedPromise<Workflow>();
      mockGetWorkflow.mockImplementation((id) => {
        identifier = id;
        return promise;
      });
      const { container } = renderForm();

      let submitButton = await waitFor(() => getSubmitButton(container));

      expect(submitButton).toBeDisabled();
      const mockWorkflow = createMockWorkflowWithInputs(identifier);
      resolve(mockWorkflow);

      await waitFor(() => {
        submitButton = getSubmitButton(container);
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should show disabled submit button if the value in input is invalid', async () => {
      const { container, getByLabelText } = renderForm();

      const integerInput = await waitFor(() =>
        getByLabelText(integerInputName, {
          exact: false,
        }),
      );
      let submitButton = getSubmitButton(container);

      await fireEvent.change(integerInput, { target: { value: 'abc' } });
      await act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => expect(submitButton).toBeDisabled());

      await fireEvent.change(integerInput, { target: { value: 123 } });
      await act(() => {
        jest.runAllTimers();
      });

      submitButton = getSubmitButton(container);
      await waitFor(() => expect(submitButton).toBeEnabled());
    });

    it('should allow submission after fixing validation errors', async () => {
      const { container, getByLabelText } = renderForm();
      await waitFor(() => {});

      const integerInput = await waitFor(() =>
        getByLabelText(integerInputName, {
          exact: false,
        }),
      );
      const submitButton = getSubmitButton(container);

      await fireEvent.change(integerInput, { target: { value: 'abc' } });
      await waitFor(() => expect(submitButton).toBeDisabled());

      await fireEvent.change(integerInput, { target: { value: '123' } });
      await waitFor(() => expect(submitButton).toBeEnabled());

      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toHaveBeenCalled());
    });

    it('should update launch plan when selecting a new workflow version', async () => {
      const { getByTitle, container } = renderForm();
      await waitFor(() => getByTitle(t('launchPlan')));

      const selector = await waitFor(() => container.querySelector('#launch-workflow-selector'));

      // Click the expander for the workflow, select the second item
      fireEvent(selector!, new MouseEvent('mousedown', { bubbles: true }));
      await waitFor(() => {
        expect(selector).toHaveAttribute('aria-expanded', 'true');
      });
      const items = await waitFor(() => screen.getAllByRole('option'));
      const title = items[1].querySelector('span')?.textContent;
      expect(title).toBeTruthy();

      // get number of launch plan calls before click
      const mockListLaunchPlansCalls = mockListLaunchPlans.mock.calls.length;
      fireEvent(items[1], new MouseEvent('click', { bubbles: true }));

      // wait for the selector to close
      await waitFor(() => {
        expect(selector).toHaveAttribute('aria-expanded', 'false');
      });

      await waitFor(() =>
        expect(mockListLaunchPlans).toHaveBeenCalledTimes(mockListLaunchPlansCalls + 1),
      );
    });

    it('should not clear launch plan when selecting the already selected workflow version', async () => {
      const { container, getByLabelText, getByTitle } = renderForm();
      await waitFor(() => getByTitle(t('launchPlan')));

      const wfselector = await waitFor(() => container.querySelector('#launch-workflow-selector'));

      // Click the expander for the workflow, select the second item
      fireEvent(wfselector!, new MouseEvent('mousedown', { bubbles: true }));
      await waitFor(() => {
        expect(wfselector).toHaveAttribute('aria-expanded', 'true');
      });
      const items = await waitFor(() => screen.getAllByRole('option'));
      const title = items[0].querySelector('span')?.textContent;
      expect(title).toBeTruthy();

      // get number of launch plan calls before click
      const mockListLaunchPlansCalls = mockListLaunchPlans.mock.calls.length;
      fireEvent(items[0], new MouseEvent('click', { bubbles: true }));

      // wait for the selector to close
      await waitFor(() => {
        expect(wfselector).toHaveAttribute('aria-expanded', 'false');
      });

      await waitFor(() => {
        expect(mockListLaunchPlans).toHaveBeenCalledTimes(mockListLaunchPlansCalls);
      });

      const launchPlanSelector = await waitFor(() => getByLabelText(t('launchPlan')));
      expect(launchPlanSelector).toHaveValue(mockWorkflow.id.name);
    });

    it('should update inputs when selecting a new launch plan', async () => {
      const { queryByLabelText, getByTitle, container } = renderForm();
      await waitFor(() => getByTitle(t('launchPlan')));

      // Delete the string input so that its corresponding input will
      // disappear after the new launch plan is loaded.
      delete mockLaunchPlans[1].closure!.expectedInputs.parameters[stringInputName];

      // Click the expander for the launch plan, select the second item
      const lpselector = await waitFor(() => container.querySelector('#launch-lp-selector'));

      fireEvent(lpselector!, new MouseEvent('mousedown', { bubbles: true }));
      await waitFor(() => {
        expect(lpselector).toHaveAttribute('aria-expanded', 'true');
      });

      // click on lp option
      const items = await waitFor(() => screen.getAllByRole('option'));
      const title = items[1].querySelector('span')?.textContent;
      expect(title).toBeTruthy();
      fireEvent(items[1], new MouseEvent('click', { bubbles: true }));

      // wait for the selector to close
      await waitFor(() => {
        expect(lpselector).toHaveAttribute('aria-expanded', 'false');
      });

      await waitFor(() => getByTitle(t('inputs')));

      expect(
        queryByLabelText(stringInputName, {
          // Don't use exact match because the label will be decorated with type info
          exact: false,
        }),
      ).toBeNull();
    });

    it('should preserve input values when changing launch plan', async () => {
      const { getByLabelText, container } = renderForm();

      const integerInput = await waitFor(() =>
        getByLabelText(integerInputName, {
          exact: false,
        }),
      );
      await fireEvent.change(integerInput, { target: { value: '10' } });

      await waitFor(() => {
        expect(integerInput).toHaveValue('10');
      });

      // Click the expander for the launch plan, select the second item
      const lpselector = await waitFor(() => container.querySelector('#launch-lp-selector'));
      await fireEvent.click(lpselector!);
      fireEvent(lpselector!, new MouseEvent('mousedown', { bubbles: true }));
      await waitFor(() => {
        expect(lpselector).toHaveAttribute('aria-expanded', 'true');
      });

      // click on lp option
      const items = await waitFor(() => screen.getAllByRole('option'));
      const clickedTitle = items[1].querySelector('span')?.textContent;
      expect(clickedTitle).toBeTruthy();
      fireEvent(items[1], new MouseEvent('click', { bubbles: true }));

      // wait for the selector to close
      await waitFor(() => {
        expect(lpselector).toHaveAttribute('aria-expanded', 'false');
      });

      expect(lpselector).toHaveValue(clickedTitle);

      await waitFor(() => {
        expect(
          getByLabelText(integerInputName, {
            exact: false,
          }),
        ).toHaveValue('10');
      });
    });

    it('should reset form error when inputs change', async () => {
      const errorString = 'Something went wrong';
      mockCreateWorkflowExecution.mockRejectedValue(new Error(errorString));

      const { container, getByText, queryByText } = renderForm();
      const submitButton = await waitFor(() => getSubmitButton(container));
      await waitFor(() => expect(submitButton).toBeEnabled());

      await fireEvent.click(submitButton);
      await waitFor(() => {
        const error = getByText(errorString);
        expect(error).toBeInTheDocument();
      });

      // eslint-disable-next-line prefer-destructuring
      mockSingleLaunchPlan = mockLaunchPlans[1];
      // Click the expander for the launch plan, select the second item
      const lpselector = await waitFor(() => container.querySelector('#launch-lp-selector'));
      await fireEvent.click(lpselector!);
      fireEvent(lpselector!, new MouseEvent('mousedown', { bubbles: true }));
      await waitFor(() => {
        expect(lpselector).toHaveAttribute('aria-expanded', 'true');
      });

      // click on lp option
      const items = await waitFor(() => screen.getAllByRole('option'));
      const clickedTitle = items[1].querySelector('span')?.textContent;
      expect(clickedTitle).toBeTruthy();
      fireEvent(items[1], new MouseEvent('click', { bubbles: true }));

      // wait for the selector to close
      await waitFor(() => {
        expect(lpselector).toHaveAttribute('aria-expanded', 'false');
      });

      expect(lpselector).toHaveValue(clickedTitle);

      await waitFor(() => {
        // const error = getByText(errorString);
        expect(queryByText(errorString)).not.toBeInTheDocument();
      });
    });

    describe('Input Values', () => {
      it('Should send false for untouched toggles', async () => {
        let inputs: Core.ILiteralMap = {};
        mockCreateWorkflowExecution.mockImplementation(
          ({ inputs: passedInputs }: CreateWorkflowExecutionArguments) => {
            inputs = passedInputs;
            return pendingPromise();
          },
        );
        const { container } = renderForm();

        // wait for submit button and click
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());
        await fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockCreateWorkflowExecution).toHaveBeenCalled();
        });

        expect(inputs.literals).toBeDefined();
        const value = get(inputs.literals, `${booleanInputName}.scalar.primitive.boolean`);
        expect(value).toBe(false);
      });

      it('should use default values when provided', async () => {
        // Add defaults for the string/integer inputs and check that they are
        // correctly populated
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[stringInputName].default = {
          scalar: { primitive: { stringValue: 'abc' } },
        } as Literal;
        parameters[integerInputName].default = {
          scalar: { primitive: { integer: Long.fromNumber(10000) } },
        } as any as Literal;

        const { getByLabelText } = renderForm();

        const stringInput = await waitFor(() => getByLabelText(stringInputName, { exact: false }));
        expect(stringInput).toHaveValue('abc');

        const integerInput = await waitFor(() =>
          getByLabelText(integerInputName, { exact: false }),
        );
        expect(integerInput).toHaveValue('10000');
      });

      it('should decorate labels for required inputs', async () => {
        // Add defaults for the string/integer inputs and check that they are
        // correctly populated
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[stringInputName].required = true;

        const { getByText } = renderForm();

        const stringInputLabel = await waitFor(() =>
          getByText(stringInputName, {
            exact: false,
            selector: 'label',
          }),
        );
        expect(stringInputLabel.textContent).toContain('*');
      });
    });

    describe('When using initial parameters', () => {
      it('should prefer the provided workflow version', async () => {
        const initialParameters: WorkflowInitialLaunchParameters = {
          workflowId: mockWorkflowVersions[2].id,
        };
        const { container } = renderForm({ initialParameters });
        await waitFor(() => {
          const workflowVersion = container.querySelector('#launch-workflow-selector');
          expect(workflowVersion).toHaveValue(mockWorkflowVersions[2].id.version);
        });
      });

      it('should only include one instance of the preferred version in the selector', async () => {
        const initialParameters: WorkflowInitialLaunchParameters = {
          workflowId: mockWorkflowVersions[2].id,
        };
        const { container, getByTitle } = renderForm({ initialParameters });
        await waitFor(() => getByTitle(t('launchPlan')));

        const wfselector = await waitFor(() =>
          container.querySelector('#launch-workflow-selector'),
        );

        fireEvent(wfselector!, new MouseEvent('mousedown', { bubbles: true }));
        await waitFor(() => {
          expect(wfselector).toHaveAttribute('aria-expanded', 'true');
        });

        const items = await waitFor(() => screen.getAllByRole('option'));

        const expectedVersion = mockWorkflowVersions[2].id.version;
        expect(
          items.filter((item) => item.textContent && item.textContent.includes(expectedVersion)),
        ).toHaveLength(1);
      });

      it('should fall back to the first item in the list if preferred workflow is not found', async () => {
        mockListWorkflows.mockImplementation((scope: Partial<Identifier>) => {
          // If we get a request for a specific item,
          // simulate not found
          if (scope.version) {
            return Promise.resolve({ entities: [] });
          }
          return Promise.resolve({
            entities: mockWorkflowVersions,
          });
        });
        const baseId = mockWorkflowVersions[2].id;
        const initialParameters: WorkflowInitialLaunchParameters = {
          workflowId: { ...baseId, version: 'nonexistentValue' },
        };
        const { container } = renderForm({ initialParameters });
        await waitFor(() => {
          const workflowVersion = container.querySelector('#launch-workflow-selector');
          expect(workflowVersion).toHaveValue(mockWorkflowVersions[0].id.version);
        });
      });

      it('should prefer the provided launch plan', async () => {
        const initialParameters: WorkflowInitialLaunchParameters = {
          launchPlan: mockLaunchPlans[1].id,
        };
        const { container } = renderForm({ initialParameters });
        await waitFor(() => {
          const workflowVersion = container.querySelector('#launch-lp-selector');
          expect(workflowVersion).toHaveValue(mockLaunchPlans[1].id.name);
        });
      });

      it('should only include one instance of the preferred launch plan in the selector', async () => {
        const initialParameters: WorkflowInitialLaunchParameters = {
          launchPlan: mockLaunchPlans[1].id,
        };
        const { container, getByTitle } = renderForm({ initialParameters });
        await waitFor(() => getByTitle(t('launchPlan')));

        // Click the expander for the launch plan
        const lpselector = await waitFor(() => container.querySelector('#launch-lp-selector'));
        fireEvent(lpselector!, new MouseEvent('mousedown', { bubbles: true }));
        await waitFor(() => {
          expect(lpselector).toHaveAttribute('aria-expanded', 'true');
        });

        // get all options
        const items = await waitFor(() => screen.getAllByRole('option'));
        const expectedName = mockLaunchPlans[1].id.name;

        expect(
          items.filter((item) => item.textContent && item.textContent.includes(expectedName)),
        ).toHaveLength(1);
      });

      it('should fall back to the default launch plan if the preferred is not found', async () => {
        mockListLaunchPlans.mockImplementation((scope: Partial<Identifier>) => {
          // If we get a request for a specific item,
          // simulate not found
          if (scope.version) {
            return Promise.resolve({ entities: [] });
          }
          return Promise.resolve({ entities: mockLaunchPlans });
        });
        const launchPlanId = { ...mockLaunchPlans[1].id };
        launchPlanId.name = 'InvalidLauchPlan';
        const initialParameters: WorkflowInitialLaunchParameters = {
          launchPlan: launchPlanId,
        };
        const { container } = renderForm({ initialParameters });
        await waitFor(() => {
          const label = container.querySelector('#launch-lp-selector');
          expect(label).toHaveValue(mockLaunchPlans[0].id.name);
        });
      });

      it('should maintain selected launch plan by name after switching workflow versions', async () => {
        const { getByTitle, container } = renderForm();
        await waitFor(() => getByTitle(t('launchPlan')));

        // Click the expander for the launch plan, select the first item
        const lpselector = await waitFor(() => container.querySelector('#launch-lp-selector'));
        fireEvent(lpselector!, new MouseEvent('mousedown', { bubbles: true }));
        await waitFor(() => {
          expect(lpselector).toHaveAttribute('aria-expanded', 'true');
        });

        // click on second lp option
        const lpitems = await waitFor(() => screen.getAllByRole('option'));
        const selectedlp = lpitems[1].querySelector('span')?.textContent;
        expect(selectedlp).toBeTruthy();
        fireEvent(lpitems[1], new MouseEvent('click', { bubbles: true }));

        // wait for the selector to close
        await waitFor(() => {
          expect(lpselector).toHaveAttribute('aria-expanded', 'false');
        });

        expect(lpselector).toHaveValue(selectedlp);

        // Click the expander for the workflow, select the second item
        const wfselector = await waitFor(() =>
          container.querySelector('#launch-workflow-selector'),
        );

        fireEvent(wfselector!, new MouseEvent('mousedown', { bubbles: true }));
        await waitFor(() => {
          expect(wfselector).toHaveAttribute('aria-expanded', 'true');
        });
        const wfitems = await waitFor(() => screen.getAllByRole('option'));
        const selectedwf = wfitems[1].querySelector('span')?.textContent;
        expect(selectedwf).toBeTruthy();

        fireEvent(wfitems[0], new MouseEvent('click', { bubbles: true }));

        // wait for the selector to close
        await waitFor(() => {
          expect(wfselector).toHaveAttribute('aria-expanded', 'false');
        });

        await waitFor(() => {
          expect(lpselector).toHaveValue(selectedlp);
        });
      });

      it('should prepopulate inputs with provided initial values', async () => {
        const stringValue = 'initialStringValue';
        const initialStringValue: Core.ILiteral = {
          scalar: { primitive: { stringValue } },
        };
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        const values = new Map();
        const stringCacheKey = createInputCacheKey(
          stringInputName,
          getInputDefintionForLiteralType(parameters[stringInputName].var.type),
        );
        values.set(stringCacheKey, initialStringValue);
        const { getByLabelText, getByTitle } = renderForm({
          initialParameters: { values },
        });
        await waitFor(() => getByTitle(t('inputs')));

        expect(getByLabelText(stringInputName, { exact: false })).toHaveValue(stringValue);
      });

      it('loads preferred workflow version when it does not exist in the list of suggestions', async () => {
        const missingWorkflow = mockWorkflowVersions[0];
        missingWorkflow.id.version = 'missingVersionString';
        const initialParameters: WorkflowInitialLaunchParameters = {
          workflowId: missingWorkflow.id,
        };
        const { container } = renderForm({ initialParameters });
        // Click the expander for the workflow, check value
        await waitFor(() =>
          expect(container.querySelector('#launch-workflow-selector')).toHaveValue(
            missingWorkflow.id.version,
          ),
        );
      });

      it('loads the preferred launch plan when it does not exist in the list of suggestions', async () => {
        const missingLaunchPlan = mockLaunchPlans[0];
        missingLaunchPlan.id.name = 'missingLaunchPlanName';
        const initialParameters: WorkflowInitialLaunchParameters = {
          launchPlan: missingLaunchPlan.id,
        };
        const { container } = renderForm({ initialParameters });

        await waitFor(() => {
          const lpSelector = container.querySelector('#launch-lp-selector');
          expect(lpSelector).toHaveValue(missingLaunchPlan.id.name);
        });
      });

      it('should select contents of workflow version input on focus', async () => {
        const { container } = renderForm();
        await waitFor(() => {});
        // Focus the workflow version input
        const workflowInput = await waitFor(() => {
          const wfSelector = container.querySelector('#launch-workflow-selector');
          expect(wfSelector).not.toBeNull();
          return wfSelector;
        });
        fireEvent.focus(workflowInput!);
        await act(() => {
          jest.runAllTimers();
        });
        const expectedValue = mockWorkflowVersions[0].id.version;
        // The value should remain, but selection should be the entire string
        expect(workflowInput).toHaveValue(expectedValue);
      });
    });

    describe('With Unsupported Required Inputs', () => {
      beforeEach(() => {
        // Binary is currently unsupported, setting the binary input to
        // required and removing the default value will trigger our use case
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[binaryInputName].required = true;
        delete parameters[binaryInputName].default;
      });

      it('should render error message', async () => {
        const { getByText } = renderForm();
        const errorElement = await waitFor(() => getByText(t('cannotLaunchWorkflowString')));
        expect(errorElement).toBeInTheDocument();
      });

      it('should show unsupported inputs', async () => {
        const { getByText } = renderForm();
        const inputElement = await waitFor(() => getByText(binaryInputName, { exact: false }));
        expect(inputElement).toBeInTheDocument();
      });

      it('should print input labels without decoration', async () => {
        const { getByText } = renderForm();
        const inputElement = await waitFor(() => getByText(binaryInputName, { exact: false }));
        expect(inputElement.textContent).not.toContain(t('requiredInputSuffix'));
      });

      it('should disable submission', async () => {
        const { getByRole } = renderForm();

        const submitButton = await waitFor(() => getByRole('button', { name: t('submit') }));

        expect(submitButton).toBeDisabled();
      });

      it('should not show error if launch plan has default value', async () => {
        mockLaunchPlans[0].closure!.expectedInputs.parameters[binaryInputName].default =
          simpleVariableDefaults.simpleBinary as Literal;
        const { queryByText } = renderForm();
        await waitFor(() => queryByText(binaryInputName, { exact: false }));
        expect(queryByText(t('cannotLaunchWorkflowString'))).toBeNull();
      });

      it('should not show error if initial value is provided', async () => {
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        const values = new Map();
        const cacheKey = createInputCacheKey(
          binaryInputName,
          getInputDefintionForLiteralType(parameters[binaryInputName].var.type),
        );
        values.set(cacheKey, simpleVariableDefaults.simpleBinary);
        const { queryByText } = renderForm({
          initialParameters: { values },
        });

        await waitFor(() => queryByText(binaryInputName, { exact: false }));
        expect(queryByText(t('cannotLaunchWorkflowString'))).toBeNull();
      });
    });

    describe('Interruptible', () => {
      it('should render checkbox', async () => {
        const { getByLabelText } = renderForm();
        const inputElement = await waitFor(() =>
          getByLabelText(t('interruptible'), { exact: false }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).not.toBeChecked();
      });

      it('should use initial values when provided', async () => {
        const initialParameters: WorkflowInitialLaunchParameters = {
          workflowId: mockWorkflowVersions[2].id,
          interruptible: Protobuf.BoolValue.create({ value: true }),
        };

        const { getByLabelText } = renderForm({
          initialParameters,
        });

        const inputElement = await waitFor(() =>
          getByLabelText(t('interruptible'), { exact: false }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toBeChecked();
      });

      it('should cycle between states correctly when clicked', async () => {
        const { getByLabelText } = renderForm();

        let inputElement = await waitFor(() =>
          getByLabelText(`${t('interruptible')} (no override)`, {
            exact: true,
          }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).not.toBeChecked();
        expect(inputElement).toHaveAttribute('data-indeterminate', 'true');

        await fireEvent.click(inputElement);
        inputElement = await waitFor(() =>
          getByLabelText(`${t('interruptible')} (enabled)`, { exact: true }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toBeChecked();
        expect(inputElement).toHaveAttribute('data-indeterminate', 'false');

        await fireEvent.click(inputElement);
        inputElement = await waitFor(() =>
          getByLabelText(`${t('interruptible')} (disabled)`, { exact: true }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).not.toBeChecked();
        expect(inputElement).toHaveAttribute('data-indeterminate', 'false');

        await fireEvent.click(inputElement);
        inputElement = await waitFor(() =>
          getByLabelText(`${t('interruptible')} (no override)`, {
            exact: true,
          }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).not.toBeChecked();
        expect(inputElement).toHaveAttribute('data-indeterminate', 'true');
      });
    });

    describe('overwrite cache', () => {
      it('should render checkbox', async () => {
        const { getByLabelText } = renderForm();
        const inputElement = await waitFor(() =>
          getByLabelText(t('overwriteCache'), { exact: false }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).not.toBeChecked();
      });

      it('should use initial values when provided', async () => {
        const initialParameters: WorkflowInitialLaunchParameters = {
          workflowId: mockWorkflowVersions[2].id,
          overwriteCache: true,
        };

        const { getByLabelText } = renderForm({
          initialParameters,
        });

        const inputElement = await waitFor(() =>
          getByLabelText(t('overwriteCache'), { exact: false }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toBeChecked();
      });
    });
  });

  describe('overwrite cache', () => {
    it('should render checkbox', async () => {
      const { getByLabelText } = renderForm();
      const inputElement = await waitFor(() =>
        getByLabelText(t('overwriteCache'), { exact: false }),
      );
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).not.toBeChecked();
    });

    it('should use initial values when provided', async () => {
      const initialParameters: WorkflowInitialLaunchParameters = {
        workflowId: mockWorkflowVersions[2].id,
        overwriteCache: true,
      };

      const { getByLabelText } = renderForm({
        initialParameters,
      });

      const inputElement = await waitFor(() =>
        getByLabelText(t('overwriteCache'), { exact: false }),
      );
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toBeChecked();
    });
  });
});
