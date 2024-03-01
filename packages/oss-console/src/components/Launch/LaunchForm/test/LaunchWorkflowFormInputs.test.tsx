import * as React from 'react';

import {
  BlobDimensionality,
  Identifier,
  NamedEntityIdentifier,
  SimpleType,
  Variable,
} from '../../../../models/Common/types';
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderImport,
  QueryClientProviderProps,
} from 'react-query';
import {
  blobType,
  collectionType,
  createMockInputsInterface,
  enumType,
  noneType,
  simpleType,
  unionType,
} from '../__mocks__/mockInputs';
import {
  fireEvent,
  getByRole,
  queryAllByRole,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { getWorkflow, listWorkflows } from '../../../../models/Workflow/api';

import { APIContext } from '../../../data/apiContext';
import { LaunchForm } from '../LaunchForm';
import { LaunchFormProps } from '../types';
import { LaunchPlan } from '../../../../models/Launch/types';
import Long from 'long';
import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { ThemeProvider } from '@mui/material/styles';
import { Workflow } from '../../../../models/Workflow/types';
import { WorkflowNodeExecutionsProvider } from '../../../Executions/contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import { createMockObjects } from './utils';
import { createMockWorkflowClosure } from '../../../../models/__mocks__/workflowData';
import { createTestQueryClient } from '../../../../test/utils';
import {
  createWorkflowExecution
} from '../../../../models/Execution/api';
import { listLaunchPlans } from '../../../../models/Launch/api';
import { mockAPIContextValue } from '../../../data/__mocks__/apiContext';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import {
  stringNoLabelName,
} from './constants';
import t from '../strings';
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

  describe('No inputs', () => {
    it('should correctly display no inputs message', async () => {
      variables = {};
      createMocks();

      const { getByTitle } = renderForm();

      const inputs = await waitFor(() => getByTitle(t('inputs')));

      expect(inputs.textContent).toContain(workflowNoInputsString);
    });
  });

  describe('INTEGER type', () => {
    it('non-required should work as expected', async () => {
      const varName = 'intVar';
      variables = {
        [varName]: simpleType(SimpleType.INTEGER),
      };
      createMocks();

      const { getByTitle, getByLabelText, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).toBeEnabled();
      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (integer)`);
        expect(label).not.toContain(`*`);
      });

      const integerInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      // change to invalid value, validate error
      fireEvent.change(integerInput, { target: { value: 'abc' } });
      await waitFor(() => expect(inputs).toHaveTextContent('Value is not a valid integer'));
      expect(submitButton).not.toBeEnabled();

      // change to valid value, validate no error
      fireEvent.change(integerInput, { target: { value: '1' } });
      await waitFor(() => expect(inputs).not.toHaveTextContent('Value is not a valid integer'));
      expect(submitButton).toBeEnabled();

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });

    it('required should work as expected', async () => {
      const varName = 'intVar';
      variables = {
        [varName]: simpleType(SimpleType.INTEGER),
      };

      createMocks();
      const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
      parameters[varName].required = true;

      const { getByTitle, getByLabelText, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).not.toBeEnabled();

      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (integer)*`);
      });

      const integerInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      // change to invalid value, validate error
      fireEvent.change(integerInput, { target: { value: 'abc' } });
      await waitFor(() => expect(inputs).toHaveTextContent('Value is not a valid integer'));
      expect(submitButton).not.toBeEnabled();

      // change to valid value, validate no error
      fireEvent.change(integerInput, { target: { value: '1' } });
      await waitFor(() => expect(inputs).not.toHaveTextContent('Value is not a valid integer'));
      expect(submitButton).toBeEnabled();

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });
  });

  describe('FLOAT type', () => {
    it('non-required should work as expected', async () => {
      const varName = 'floatVar';
      variables = {
        [varName]: simpleType(SimpleType.FLOAT),
      };
      createMocks();

      const { getByTitle, getByLabelText, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).toBeEnabled();
      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (float)`);
        expect(label).not.toContain(`*`);
      });

      const integerInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      // change to invalid value, validate error
      fireEvent.change(integerInput, { target: { value: 'abc' } });
      await waitFor(() =>
        expect(inputs).toHaveTextContent('Value is not a valid floating point number'),
      );
      expect(submitButton).not.toBeEnabled();

      // change to valid value, validate no error
      fireEvent.change(integerInput, { target: { value: '1' } });
      await waitFor(() =>
        expect(inputs).not.toHaveTextContent('Value is not a valid floating point number'),
      );
      expect(submitButton).toBeEnabled();

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });

    it('required should work as expected', async () => {
      const varName = 'floatVar';
      variables = {
        [varName]: simpleType(SimpleType.FLOAT),
      };

      createMocks();
      const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
      parameters[varName].required = true;

      const { getByTitle, getByLabelText, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).not.toBeEnabled();

      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (float)*`);
      });

      const floatInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      // validate required error
      await waitFor(() => expect(inputs).toHaveTextContent('Value is required'));

      // change to invalid value, validate error
      fireEvent.change(floatInput, { target: { value: 'abc' } });
      await waitFor(() =>
        expect(inputs).toHaveTextContent('Value is not a valid floating point number'),
      );
      expect(submitButton).not.toBeEnabled();

      // change to valid value, validate no error
      fireEvent.change(floatInput, { target: { value: '1' } });
      await waitFor(() =>
        expect(inputs).not.toHaveTextContent('Value is not a valid floating point number'),
      );
      expect(submitButton).toBeEnabled();

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });
  });

  describe('STRING type', () => {
    it('non-required should work as expected', async () => {
      const varName = 'stringVar';
      variables = {
        [varName]: simpleType(SimpleType.STRING),
      };
      createMocks();

      const { getByTitle, getByLabelText, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).toBeEnabled();

      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (string)`);
        expect(label).not.toContain(`*`);
      });

      const integerInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      // change to valid value, validate no error
      fireEvent.change(integerInput, { target: { value: 'abc' } });
      await waitFor(() => expect(inputs).not.toHaveTextContent('Value is not a string'));
      expect(submitButton).toBeEnabled();

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });

    it('required should work as expected', async () => {
      const varName = 'stringVar';
      variables = {
        [varName]: simpleType(SimpleType.STRING),
      };

      createMocks();
      const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
      parameters[varName].required = true;

      const { getByTitle, getByLabelText, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).not.toBeEnabled();

      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (string)*`);
      });

      const stringInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      // validate required error
      await waitFor(() => expect(inputs).toHaveTextContent('Value is required'));
      expect(submitButton).not.toBeEnabled();

      // change to valid value, validate no error
      fireEvent.change(stringInput, { target: { value: 'abc' } });
      await waitFor(() => expect(inputs).not.toHaveTextContent('Value is not a valid string'));
      await waitFor(() => expect(submitButton).toBeEnabled());

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });
  });

  describe('BOOLEAN type', () => {
    it('non-required should work as expected', async () => {
      const varName = 'booleanVar';
      variables = {
        [varName]: simpleType(SimpleType.BOOLEAN),
      };
      createMocks();

      const { getByTitle, getByLabelText, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).toBeEnabled();

      // check label content
      const boolInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );
      await waitFor(() => {
        const label = getByLabelText(`${varName} (boolean)`);
        expect(label).toBeInTheDocument();
        expect(boolInput.parentElement).not.toHaveClass('checked', 'Mui-checked');
      });

      // change to valid value, validate no error
      fireEvent.click(boolInput);
      await waitFor(() => expect(inputs).not.toHaveTextContent('Value is not a boolean'));
      await waitFor(() => {
        expect(boolInput.parentElement).not.toHaveClass('checked', 'Mui-checked');
      });
      expect(submitButton).toBeEnabled();

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });
  });

  describe('DATETIME type', () => {
    it('non-required should work as expected', async () => {
      const varName = 'datetimeVar';
      variables = {
        [varName]: simpleType(SimpleType.DATETIME),
      };
      createMocks();

      const { container } = renderForm();

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      await waitFor(() => expect(submitButton).toBeEnabled());

      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (datetime - UTC)`);
        expect(label).not.toContain(`*`);
      });

      await waitFor(() => expect(submitButton).toBeEnabled());

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });

    it('required should work as expected', async () => {
      const varName = 'datetimeVar';
      variables = {
        [varName]: simpleType(SimpleType.DATETIME),
      };

      createMocks();
      const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
      parameters[varName].required = true;

      const { getByTitle, getByLabelText, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).not.toBeEnabled();

      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (datetime - UTC)*`);
      });

      const datetimeInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      // validate required error
      await waitFor(() => expect(inputs).toHaveTextContent('Value is required'));
      expect(submitButton).not.toBeEnabled();

      // change to valid value, validate no error
      const calButton = getByRole(datetimeInput.parentElement!, 'button');
      fireEvent.click(calButton);
      await waitFor(() => expect(inputs).not.toHaveTextContent('Value is not a valid string'));
      fireEvent.change(datetimeInput, { target: { value: 'abc' } });
      const dialog = await waitFor(() => screen.getByRole('dialog'));
      const buttons = within(dialog).getAllByRole('button');
      buttons.find((b) => b.textContent === 'Today')?.click();
      buttons.find((b) => b.textContent === 'OK')?.click();
      await waitFor(() => {
        expect(datetimeInput).toHaveValue();
      });
      await waitFor(() => expect(submitButton).toBeEnabled());

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });
  });

  describe('DURATION type', () => {
    it('non-required should work as expected', async () => {
      const varName = 'durationVar';
      variables = {
        [varName]: simpleType(SimpleType.DURATION),
      };
      createMocks();

      const { getByTitle, getByLabelText, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).toBeEnabled();
      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (duration - ms)`);
        expect(label).not.toContain(`*`);
      });

      const durationInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      // change to invalid value, validate error
      fireEvent.change(durationInput, { target: { value: 'abc' } });
      await waitFor(() => {
        expect(inputs).toHaveTextContent('Value is not a valid duration');
      });
      expect(submitButton).not.toBeEnabled();

      // change to valid value, validate no error
      fireEvent.change(durationInput, { target: { value: '1' } });
      await waitFor(() => expect(inputs).not.toHaveTextContent('Value is not a valid duration'));
      expect(submitButton).toBeEnabled();

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });

    it('required should work as expected', async () => {
      const varName = 'durationVar';
      variables = {
        [varName]: simpleType(SimpleType.DURATION),
      };

      createMocks();
      const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
      parameters[varName].required = true;

      const { getByTitle, getByLabelText, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).not.toBeEnabled();

      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (duration - ms)*`);
      });

      const durationInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      // change to invalid value, validate error
      fireEvent.change(durationInput, { target: { value: 'abc' } });
      await waitFor(() => expect(inputs).toHaveTextContent('Value is not a valid duration'));
      expect(submitButton).not.toBeEnabled();

      // change to valid value, validate no error
      fireEvent.change(durationInput, { target: { value: '6000' } });
      await waitFor(() => expect(inputs).not.toHaveTextContent('Value is not a valid duration'));
      expect(submitButton).toBeEnabled();

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });
  });

  describe('ERROR type', () => {
    it('non-required should work as expected', async () => {
      const varName = 'errorVar';
      variables = {
        [varName]: simpleType(SimpleType.ERROR),
      };
      createMocks();

      const { getByLabelText, container } = renderForm();
      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).not.toBeEnabled();
      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (error)`);
        expect(label).not.toContain(`*`);
      });

      const errorInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      expect(errorInput).toHaveValue('Flyte Console does not support entering values of this type');
    });
  });

  describe('STRUCT type', () => {
    it('non-required should work as expected', async () => {
      const varName = 'structVar';
      variables = {
        [varName]: simpleType(SimpleType.STRUCT),
      };
      createMocks();

      const { getByTitle, getByLabelText, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).toBeEnabled();
      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (struct)`);
        expect(label).not.toContain(`*`);
      });

      const structInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      // change to invalid value, validate error
      fireEvent.change(structInput, { target: { value: 'abc' } });
      await waitFor(() => {
        expect(inputs).toHaveTextContent('Value did not parse to an object');
      });
      expect(submitButton).not.toBeEnabled();

      // change to valid value, validate no error
      fireEvent.change(structInput, { target: { value: '{}' } });
      await waitFor(() => expect(inputs).not.toHaveTextContent('Value did not parse to an object'));
      expect(submitButton).toBeEnabled();

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });

    it('required should work as expected', async () => {
      const varName = 'structVar';
      variables = {
        [varName]: simpleType(SimpleType.STRUCT),
      };

      createMocks();
      const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
      parameters[varName].required = true;

      const { getByTitle, getByLabelText, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).not.toBeEnabled();

      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (struct)*`);
      });

      const structInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      await waitFor(() => expect(inputs).toHaveTextContent('Value is required'));

      // change to invalid value, validate error
      fireEvent.change(structInput, { target: { value: 'abc' } });
      await waitFor(() => expect(inputs).toHaveTextContent('Value did not parse to an object'));
      expect(submitButton).not.toBeEnabled();

      // change to valid value, validate no error
      fireEvent.change(structInput, { target: { value: '{}' } });
      await waitFor(() => expect(inputs).not.toHaveTextContent('Value did not parse to an object'));
      expect(submitButton).toBeEnabled();

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });
  });

  describe('BLOB type', () => {
    it('non-required should work as expected', async () => {
      const varName = 'blobVar';
      variables = {
        [varName]: blobType(BlobDimensionality.SINGLE, 'a simple single-dimensional blob'),
      };
      createMocks();

      const { getByTitle, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).toBeEnabled();

      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (file/blob)`);
        expect(label).not.toContain(`*`);
      });

      const uriInput = await waitFor(() => container.querySelector('#launch-input-blobVar-uri'));

      // change to valid value, validate no error
      fireEvent.change(uriInput!, { target: { value: 'abc' } });
      await waitFor(() => expect(inputs).not.toHaveTextContent('Invalid blob value'));
      expect(submitButton).toBeEnabled();

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });

    it('required should work as expected', async () => {
      const varName = 'blobVar';
      variables = {
        [varName]: blobType(BlobDimensionality.SINGLE, 'a simple single-dimensional blob'),
      };
      createMocks();
      const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
      parameters[varName].required = true;

      const { getByTitle, container } = renderForm();
      const inputs = await waitFor(() => getByTitle(t('inputs')));

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      await waitFor(() => expect(inputs).toHaveTextContent('Value is required'));
      await waitFor(() => expect(submitButton).not.toBeEnabled());

      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (file/blob)*`);
      });

      const uriInput = await waitFor(() => container.querySelector('#launch-input-blobVar-uri'));

      // change to valid value, validate no error

      fireEvent.change(uriInput!, { target: { value: 'abc' } });
      await waitFor(() => expect(inputs).not.toHaveTextContent('Value is required'));
      await waitFor(() => expect(submitButton).toBeEnabled());

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });
  });

  describe('ENUM type', () => {
    it('non-required should work as expected', async () => {
      const varName = 'enumVar';
      variables = {
        [varName]: enumType(['red', 'blue', 'green'], 'a simple enum'),
      };
      createMocks();

      const { getByLabelText, container } = renderForm();

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      await waitFor(() => expect(submitButton).not.toBeEnabled());

      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (enum)`);
      });

      // expect no option selected
      await waitFor(() => {
        const combobox = container.querySelector(`#launch-input-${varName}`);
        expect(combobox?.innerHTML).toEqual('<span class="notranslate">​</span>');
      });

      const enumInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      // click on the input to open the dropdown
      fireEvent(enumInput!, new MouseEvent('mousedown', { bubbles: true }));
      const enumItems = await waitFor(() => screen.getAllByRole('option'));

      // select last option
      fireEvent.click(enumItems[2]);
      await waitFor(() => expect(enumInput).toHaveTextContent('green'));

      expect(submitButton).toBeEnabled();

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });

    it('required should work as expected', async () => {
      const varName = 'enumVar';
      variables = {
        [varName]: enumType(['red', 'blue', 'green'], 'a simple enum'),
      };

      createMocks();
      const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
      parameters[varName].required = true;

      const { getByLabelText, container } = renderForm();

      // submit button should be enabled for non-required inputs
      const submitButton = await waitFor(() => getSubmitButton(container));
      expect(submitButton).not.toBeEnabled();

      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (enum)*`);
      });

      // expect no option selected
      await waitFor(() => {
        const combobox = container.querySelector(`#launch-input-${varName}`);
        expect(combobox?.innerHTML).toEqual('<span class="notranslate">​</span>');
      });

      const enumInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      // click on the input to open the dropdown
      fireEvent(enumInput!, new MouseEvent('mousedown', { bubbles: true }));
      const enumItems = await waitFor(() => screen.getAllByRole('option'));

      // select last option
      fireEvent.click(enumItems[2]);
      await waitFor(() => expect(enumInput).toHaveTextContent('green'));

      await waitFor(() => expect(submitButton).toBeEnabled());

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });

    it('default value should work as expected', async () => {
      const varName = 'enumVar';
      variables = {
        [varName]: enumType(['red', 'blue', 'green'], 'a simple enum'),
      };

      createMocks();
      mockLaunchPlans[0]!.closure!.expectedInputs!.parameters![varName]!.default = {
        scalar: {
          primitive: {
            stringValue: 'red',
          },
        },
      } as any;
      const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
      parameters[varName].required = true;

      const { getByLabelText, container } = renderForm();

      // submit button should be enabled
      const submitButton = await waitFor(() => getSubmitButton(container));
      await waitFor(() => expect(submitButton).toBeEnabled());

      // check label content
      await waitFor(() => {
        const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
        expect(label).toEqual(`${varName} (enum)*`);
      });

      // expect no option selected
      await waitFor(() => {
        const combobox = container.querySelector(`#launch-input-${varName}`);
        expect(combobox?.innerHTML).toEqual('red');
      });

      const enumInput = await waitFor(() =>
        getByLabelText(varName, {
          exact: false,
        }),
      );

      // click on the input to open the dropdown
      fireEvent(enumInput!, new MouseEvent('mousedown', { bubbles: true }));
      const enumItems = await waitFor(() => screen.getAllByRole('option'));

      // select last option
      fireEvent.click(enumItems[2]);
      await waitFor(() => expect(enumInput).toHaveTextContent('green'));

      await waitFor(() => expect(submitButton).toBeEnabled());

      // clicking submit should work
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
    });
  });

  describe('UNION type', () => {
    describe('of INTEGER type', () => {
      it('non-required should work as expected', async () => {
        const varName = 'unionAndIntVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.INTEGER), noneType()]),
        };
        createMocks();

        const { getByLabelText, container } = renderForm();

        // submit button should be enabled for non-required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (union [integer | none])`);
        });

        // expect no option selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.innerHTML).toEqual('integer');
        });

        const unionInput = await waitFor(() =>
          getByLabelText(varName, {
            exact: false,
          }),
        );

        await waitFor(() => {
          const helperText = container.querySelector(`#launch-input-integer-helper-text`);
          expect(helperText?.innerHTML).toEqual('Value is not a valid integer');
        });
        const integerInput = await waitFor(() => {
          return container.querySelector(`#launch-input-integer`);
        });

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(integerInput!, { target: { value: 'abc' } });
        await waitFor(() => {
          const helperText = container.querySelector(`#launch-input-integer-helper-text`);
          expect(helperText?.innerHTML).toEqual('Value is not a valid integer');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(integerInput!, { target: { value: '1' } });
        await waitFor(() => {
          const helperText = container.querySelector(`#launch-input-integer-helper-text`);
          expect(helperText?.textContent).not.toEqual('Value is not a valid integer');
        });
        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // click on the input to open the dropdown
        fireEvent(unionInput!, new MouseEvent('mousedown', { bubbles: true }));
        const enumItems = await waitFor(() => screen.getAllByRole('option'));

        expect(enumItems).toHaveLength(2);
        expect(enumItems[0]).toHaveTextContent('integer');
        expect(enumItems[1]).toHaveTextContent('none');

        // select none type
        fireEvent.click(enumItems[1]);
        await waitFor(() => {
          expect(unionInput).toHaveTextContent('none');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('required should work as expected', async () => {
        const varName = 'unionAndIntVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.INTEGER), noneType()]),
        };
        createMocks();
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;

        const { getByLabelText, container } = renderForm();

        // submit button should not be enabled for required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (union [integer | none])*`);
        });

        // expect integer to be selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.innerHTML).toEqual('integer');
        });

        const unionInput = await waitFor(() =>
          getByLabelText(varName, {
            exact: false,
          }),
        );

        await waitFor(() => {
          const helperText = container.querySelector(`#launch-input-integer-helper-text`);
          expect(helperText?.innerHTML).toEqual('Value is not a valid integer');
        });
        const integerInput = await waitFor(() => {
          return container.querySelector(`#launch-input-integer`);
        });

        // expect submit button to be disabled
        await waitFor(() => expect(submitButton).not.toBeEnabled());

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(integerInput!, { target: { value: 'abc' } });
        await waitFor(() => {
          const helperText = container.querySelector(`#launch-input-integer-helper-text`);
          expect(helperText?.innerHTML).toEqual('Value is not a valid integer');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(integerInput!, { target: { value: '1' } });
        await waitFor(() => {
          const helperText = container.querySelector(`#launch-input-integer-helper-text`);
          expect(helperText?.textContent).not.toEqual('Value is not a valid integer');
        });
        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // click on the input to open the dropdown
        fireEvent(unionInput!, new MouseEvent('mousedown', { bubbles: true }));
        const enumItems = await waitFor(() => screen.getAllByRole('option'));

        expect(enumItems).toHaveLength(2);
        expect(enumItems[0]).toHaveTextContent('integer');
        expect(enumItems[1]).toHaveTextContent('none');

        // select none type
        fireEvent.click(enumItems[1]);
        await waitFor(() => {
          expect(unionInput).toHaveTextContent('none');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('default value should work as expected', async () => {
        const varName = 'enumVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.INTEGER), noneType()]),
        };

        createMocks();
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;
        mockLaunchPlans[0]!.closure!.expectedInputs!.parameters![varName]!.default = {
          scalar: {
            primitive: {
              integer: Long.fromInt(111),
            },
          },
        } as any;

        const { getByLabelText, container } = renderForm();

        // submit button should not be enabled for required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (union [integer | none])*`);
        });

        // expect integer to be selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.innerHTML).toEqual('integer');
        });

        const unionInput = await waitFor(() =>
          getByLabelText(varName, {
            exact: false,
          }),
        );

        await waitFor(() => {
          const helperText = container.querySelector(`#launch-input-integer-helper-text`);
          expect(helperText?.innerHTML).not.toEqual('Value is not a valid integer');
        });
        const integerInput = await waitFor(() => {
          return container.querySelector(`#launch-input-integer`);
        });

        await waitFor(() => {
          expect(integerInput).toHaveValue('111');
        });

        // expect submit button to be disabled
        await waitFor(() => expect(submitButton).toBeEnabled());

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(integerInput!, { target: { value: 'abc' } });
        await waitFor(() => {
          const helperText = container.querySelector(`#launch-input-integer-helper-text`);
          expect(helperText?.innerHTML).toEqual('Value is not a valid integer');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(integerInput!, { target: { value: '111' } });
        await waitFor(() => {
          const helperText = container.querySelector(`#launch-input-integer-helper-text`);
          expect(helperText?.textContent).not.toEqual('Value is not a valid integer');
        });
        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // click on the input to open the dropdown
        fireEvent(unionInput!, new MouseEvent('mousedown', { bubbles: true }));
        const enumItems = await waitFor(() => screen.getAllByRole('option'));

        expect(enumItems).toHaveLength(2);
        expect(enumItems[0]).toHaveTextContent('integer');
        expect(enumItems[1]).toHaveTextContent('none');

        // select none type
        fireEvent.click(enumItems[1]);
        await waitFor(() => {
          expect(unionInput).toHaveTextContent('none');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });
    });

    describe('of FLOAT type', () => {
      it('non-required should work as expected', async () => {
        const varName = 'unionAnFloaytVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.FLOAT), noneType()]),
        };
        createMocks();

        const { getByLabelText, container } = renderForm();

        // submit button should be enabled for non-required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (union [float | none])`);
        });

        // expect no option selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.innerHTML).toEqual('float');
        });

        const unionInput = await waitFor(() =>
          getByLabelText(varName, {
            exact: false,
          }),
        );

        const floatInput = await waitFor(() => {
          return container.querySelector(`#launch-input-float`);
        });

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(floatInput!, { target: { value: 'abc' } });
        await waitFor(() => {
          const helperText = container.querySelector(
            `#launch-input-float-helper-text`,
          )?.textContent;
          expect(helperText).toEqual('Value is not a valid floating point number');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(floatInput!, { target: { value: '1.1' } });
        await waitFor(() => {
          const helperText = container.querySelector(
            `#launch-input-float-helper-text`,
          )?.textContent;
          expect(helperText).not.toEqual('Value is not a valid floating point number');
        });
        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // click on the input to open the dropdown
        fireEvent(unionInput!, new MouseEvent('mousedown', { bubbles: true }));
        const enumItems = await waitFor(() => screen.getAllByRole('option'));

        expect(enumItems).toHaveLength(2);
        expect(enumItems[0]).toHaveTextContent('float');
        expect(enumItems[1]).toHaveTextContent('none');

        // select none type
        fireEvent.click(enumItems[1]);
        await waitFor(() => {
          expect(unionInput).toHaveTextContent('none');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('required should work as expected', async () => {
        const varName = 'unionAnFloaytVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.FLOAT), noneType()]),
        };
        createMocks();

        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;

        const { getByLabelText, container } = renderForm();

        // submit button should be enabled for non-required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).not.toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (union [float | none])*`);
        });

        // expect no option selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.innerHTML).toEqual('float');
        });

        const unionInput = await waitFor(() =>
          getByLabelText(varName, {
            exact: false,
          }),
        );

        const floatInput = await waitFor(() => {
          return container.querySelector(`#launch-input-float`);
        });

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(floatInput!, { target: { value: 'abc' } });
        await waitFor(() => {
          const helperText = container.querySelector(
            `#launch-input-float-helper-text`,
          )?.textContent;
          expect(helperText).toEqual('Value is not a valid floating point number');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(floatInput!, { target: { value: '1.1' } });
        await waitFor(() => {
          const helperText = container.querySelector(
            `#launch-input-float-helper-text`,
          )?.textContent;
          expect(helperText).not.toEqual('Value is not a valid floating point number');
        });
        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // click on the input to open the dropdown
        fireEvent(unionInput!, new MouseEvent('mousedown', { bubbles: true }));
        const enumItems = await waitFor(() => screen.getAllByRole('option'));

        expect(enumItems).toHaveLength(2);
        expect(enumItems[0]).toHaveTextContent('float');
        expect(enumItems[1]).toHaveTextContent('none');

        // select none type
        fireEvent.click(enumItems[1]);
        await waitFor(() => {
          expect(unionInput).toHaveTextContent('none');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('default value should work as expected', async () => {
        const varName = 'unionAnFloaytVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.FLOAT), noneType()]),
        };
        createMocks();
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;
        mockLaunchPlans[0]!.closure!.expectedInputs!.parameters![varName]!.default = {
          scalar: {
            primitive: {
              floatValue: 1.2,
            },
          },
        } as any;

        const { getByLabelText, container } = renderForm();

        // submit button should be enabled for non-required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (union [float | none])*`);
        });

        // expect  option selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.innerHTML).toEqual('float');
        });

        const unionInput = await waitFor(() =>
          getByLabelText(varName, {
            exact: false,
          }),
        );

        const floatInput = await waitFor(() => {
          return container.querySelector(`#launch-input-float`);
        });

        // default value should be populated
        expect(floatInput).toHaveValue('1.2');

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(floatInput!, { target: { value: 'abc' } });
        await waitFor(() => {
          const helperText = container.querySelector(
            `#launch-input-float-helper-text`,
          )?.textContent;
          expect(helperText).toEqual('Value is not a valid floating point number');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(floatInput!, { target: { value: '1.1' } });
        await waitFor(() => {
          const helperText = container.querySelector(
            `#launch-input-float-helper-text`,
          )?.textContent;
          expect(helperText).not.toEqual('Value is not a valid floating point number');
        });
        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // click on the input to open the dropdown
        fireEvent(unionInput!, new MouseEvent('mousedown', { bubbles: true }));
        const enumItems = await waitFor(() => screen.getAllByRole('option'));

        expect(enumItems).toHaveLength(2);
        expect(enumItems[0]).toHaveTextContent('float');
        expect(enumItems[1]).toHaveTextContent('none');

        // select none type
        fireEvent.click(enumItems[1]);
        await waitFor(() => {
          expect(unionInput).toHaveTextContent('none');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });
    });

    describe('of STRING type', () => {
      it('non-required should work as expected', async () => {
        const varName = 'unionAnStringVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.STRING), noneType()]),
        };
        createMocks();

        const { getByLabelText, container } = renderForm();

        // submit button should be enabled for non-required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (union [string | none])`);
        });

        // expect no option selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.innerHTML).toEqual('string');
        });

        const unionInput = await waitFor(() =>
          getByLabelText(varName, {
            exact: false,
          }),
        );

        const stringInput = await waitFor(() => {
          return container.querySelector(`#launch-input-string`);
        });

        // change to valid value, validate error, submit button should be enabled
        await fireEvent.change(stringInput!, { target: { value: 'abc' } });
        await waitFor(() => {
          const helperText = container.querySelector(
            `#launch-input-string-helper-text`,
          )?.textContent;
          expect(helperText).not.toEqual('Value is not a valid string');
        });
        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // click on the input to open the dropdown
        fireEvent(unionInput!, new MouseEvent('mousedown', { bubbles: true }));
        const enumItems = await waitFor(() => screen.getAllByRole('option'));

        expect(enumItems).toHaveLength(2);
        expect(enumItems[0]).toHaveTextContent('string');
        expect(enumItems[1]).toHaveTextContent('none');

        // select none type
        fireEvent.click(enumItems[1]);
        await waitFor(() => {
          expect(unionInput).toHaveTextContent('none');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('required should work as expected', async () => {
        const varName = 'unionAnStringtVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.STRING), noneType()]),
        };
        createMocks();

        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;

        const { getByLabelText, container } = renderForm();

        // submit button should be enabled for non-required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).not.toBeEnabled());

        // expect string to be required
        await waitFor(() => {
          const helperText = container.querySelector(
            `#launch-input-string-helper-text`,
          )?.textContent;
          expect(helperText).not.toEqual('Value is required');
        });

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (union [string | none])*`);
        });

        // expect string option selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.innerHTML).toEqual('string');
        });

        const unionInput = await waitFor(() =>
          getByLabelText(varName, {
            exact: false,
          }),
        );

        const stringInput = await waitFor(() => {
          return container.querySelector(`#launch-input-string`);
        });

        // change to valid value, validate error
        await fireEvent.change(stringInput!, { target: { value: 'abc' } });
        await waitFor(() => {
          const helperText = container.querySelector(
            `#launch-input-string-helper-text`,
          )?.textContent;
          expect(helperText).not.toEqual('Value is not a valid string');
        });
        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // click on the input to open the dropdown
        fireEvent(unionInput!, new MouseEvent('mousedown', { bubbles: true }));
        const enumItems = await waitFor(() => screen.getAllByRole('option'));

        expect(enumItems).toHaveLength(2);
        expect(enumItems[0]).toHaveTextContent('string');
        expect(enumItems[1]).toHaveTextContent('none');

        // select none type
        fireEvent.click(enumItems[1]);
        await waitFor(() => {
          expect(unionInput).toHaveTextContent('none');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('default value should work as expected', async () => {
        const varName = 'unionAnFStringtVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.STRING), noneType()]),
        };
        createMocks();
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;
        mockLaunchPlans[0]!.closure!.expectedInputs!.parameters![varName]!.default = {
          scalar: {
            primitive: {
              stringValue: 'abc',
            },
          },
        } as any;

        const { getByLabelText, container } = renderForm();

        // submit button should be enabled for non-required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (union [string | none])*`);
        });

        // expect  option selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.innerHTML).toEqual('string');
        });
        const stringInput = await waitFor(() => {
          return container.querySelector(`#launch-input-string`);
        });

        // expect string to be prepopulated
        await waitFor(() => {
          expect(stringInput).toHaveValue('abc');
        });

        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.innerHTML).toEqual('string');
        });

        const unionInput = await waitFor(() =>
          getByLabelText(varName, {
            exact: false,
          }),
        );

        // change to valid value, validate error
        await fireEvent.change(stringInput!, { target: { value: 'abcde' } });
        await waitFor(() => {
          const helperText = container.querySelector(
            `#launch-input-string-helper-text`,
          )?.textContent;
          expect(helperText).not.toEqual('Value is not a valid string');
        });
        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // click on the input to open the dropdown
        fireEvent(unionInput!, new MouseEvent('mousedown', { bubbles: true }));
        const enumItems = await waitFor(() => screen.getAllByRole('option'));

        expect(enumItems).toHaveLength(2);
        expect(enumItems[0]).toHaveTextContent('string');
        expect(enumItems[1]).toHaveTextContent('none');

        // select none type
        fireEvent.click(enumItems[1]);
        await waitFor(() => {
          expect(unionInput).toHaveTextContent('none');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });
    });

    describe('of BOOLEAN type', () => {
      it('non-required should work as expected', async () => {
        const varName = 'unionAnBoolVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.BOOLEAN), noneType()]),
        };
        createMocks();

        const { getByLabelText, container } = renderForm();

        // submit button should be enabled for non-required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (union [boolean | none])`);
        });

        // expect no option selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.innerHTML).toEqual('boolean');
        });

        const booleanInput = await waitFor(() => {
          return container.querySelector(`#launch-input-boolean`);
        });

        // expect boolean to be correctly prepopulated
        await waitFor(() => {
          // bool should be true
          expect(booleanInput!.parentElement).not.toHaveClass('Mui-checked');
        });

        const unionInput = await waitFor(() =>
          getByLabelText(varName, {
            exact: false,
          }),
        );

        // click on the input to open the dropdown
        fireEvent(unionInput!, new MouseEvent('mousedown', { bubbles: true }));
        const enumItems = await waitFor(() => screen.getAllByRole('option'));

        expect(enumItems).toHaveLength(2);
        expect(enumItems[0]).toHaveTextContent('boolean');
        expect(enumItems[1]).toHaveTextContent('none');

        // select none type
        fireEvent.click(enumItems[1]);
        await waitFor(() => {
          expect(unionInput).toHaveTextContent('none');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('required should work as expected', async () => {
        const varName = 'unionAnbooleantVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.BOOLEAN), noneType()]),
        };
        createMocks();

        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;

        const { getByLabelText, container } = renderForm();

        // submit button should be enabled for required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).not.toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (union [boolean | none])*`);
        });

        // expect boolean option selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.innerHTML).toEqual('boolean');
        });

        const unionInput = await waitFor(() =>
          getByLabelText(varName, {
            exact: false,
          }),
        );

        const booleanInput = await waitFor(() => {
          return container.querySelector(`#launch-input-boolean`);
        });

        // check initial boolean value
        await waitFor(() => {
          // bool is false
          expect(booleanInput!.parentElement).not.toHaveClass('Mui-checked');
        });

        // click boolean input
        await fireEvent.click(booleanInput!);

        await waitFor(() => {
          // bool should be true
          expect(booleanInput!.parentElement).toHaveClass('Mui-checked');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // click boolean input
        await fireEvent.click(booleanInput!);

        await waitFor(() => {
          // bool should be true
          expect(booleanInput!.parentElement).not.toHaveClass('Mui-checked');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // click on the input to open the dropdown
        fireEvent(unionInput!, new MouseEvent('mousedown', { bubbles: true }));
        const enumItems = await waitFor(() => screen.getAllByRole('option'));

        expect(enumItems).toHaveLength(2);
        expect(enumItems[0]).toHaveTextContent('boolean');
        expect(enumItems[1]).toHaveTextContent('none');

        // select none type
        fireEvent.click(enumItems[1]);
        await waitFor(() => {
          expect(unionInput).toHaveTextContent('none');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('default value should work as expected', async () => {
        const varName = 'unionAndBooleanVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.BOOLEAN), noneType()]),
        };

        createMocks();

        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;
        mockLaunchPlans[0]!.closure!.expectedInputs!.parameters![varName]!.default = {
          scalar: {
            primitive: {
              boolean: true,
            },
          },
        } as any;

        const { getByLabelText, container } = renderForm();

        // submit button should be enabled for non-required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`);
          expect(label?.textContent).toEqual(`${varName} (union [boolean | none])*`);
        });

        // expect option selected
        const booleanInput = await waitFor(() => {
          return container.querySelector(`#launch-input-boolean`);
        });

        // expect boolean to be prepopulated
        await waitFor(() => {
          expect(booleanInput!.parentElement).toHaveClass('Mui-checked');
        });

        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.innerHTML).toEqual('boolean');
        });

        const unionInput = await waitFor(() =>
          getByLabelText(varName, {
            exact: false,
          }),
        );

        // change to valid value, validate error
        // click boolean input
        await fireEvent.click(booleanInput!);

        await waitFor(() => {
          // bool should be true
          expect(booleanInput!.parentElement).not.toHaveClass('Mui-checked');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // click on the input to open the dropdown
        fireEvent(unionInput!, new MouseEvent('mousedown', { bubbles: true }));
        const enumItems = await waitFor(() => screen.getAllByRole('option'));

        expect(enumItems).toHaveLength(2);
        expect(enumItems[0]).toHaveTextContent('boolean');
        expect(enumItems[1]).toHaveTextContent('none');

        // select none type
        fireEvent.click(enumItems[1]);
        await waitFor(() => {
          expect(unionInput).toHaveTextContent('none');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });
    });

    describe('of DATETIME type', () => {
      it('non-required should work as expected', async () => {
        const varName = 'unionAnDatetimeVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.DATETIME), noneType()]),
        };
        createMocks();

        const { container, getByTitle } = renderForm();

        // submit button should be enabled for non-required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());
        const inputs = await waitFor(() => getByTitle(t('inputs')));

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`);
          expect(label?.textContent).toEqual(`${varName} (union [datetime - UTC | none])`);
          expect(label?.textContent).not.toContain(`*`);
        });

        // expect no option selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.textContent).toEqual('datetime - UTC');
        });

        const datetimeInput = await waitFor(() => {
          return container.querySelector(`#launch-input-datetime---UTC`);
        });

        // expect datetime to be correctly prepopulated
        await waitFor(() => {
          // bool should be true
          expect(datetimeInput!).not.toHaveValue();
        });

        // expect no validation error
        await waitFor(() => expect(inputs).not.toHaveTextContent('Value is required'));
        expect(submitButton).toBeEnabled();

        // change to valid value, validate no error
        const calButton = getByRole(datetimeInput?.parentElement!, 'button');
        fireEvent.click(calButton);
        await waitFor(() => expect(inputs).not.toHaveTextContent('Value is not a valid string'));
        fireEvent.change(datetimeInput!, { target: { value: 'abc' } });
        const dialog = await waitFor(() => screen.getByRole('dialog'));
        const buttons = within(dialog).getAllByRole('button');
        buttons.find((b) => b.textContent === 'Today')?.click();
        buttons.find((b) => b.textContent === 'OK')?.click();
        await waitFor(() => {
          expect(datetimeInput).toHaveValue();
        });
        await waitFor(() => expect(submitButton).toBeEnabled());

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('required should work as expected', async () => {
        const varName = 'unionAndDatetimeVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.DATETIME), noneType()]),
        };
        createMocks();

        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;

        const { container, getByTitle } = renderForm();

        // submit button should not be enabled for required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).not.toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`);
          expect(label?.textContent).toEqual(`${varName} (union [datetime - UTC | none])*`);
        });

        // expect no option selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.textContent).toEqual('datetime - UTC');
        });

        const datetimeInput = await waitFor(() => {
          return container.querySelector(`#launch-input-datetime---UTC`);
        });

        // expect datetime to be correctly prepopulated
        await waitFor(() => {
          // bool should be true
          expect(datetimeInput!).not.toHaveValue();
        });

        // expect validation error
        const inputs = await waitFor(() => getByTitle(t('inputs')));
        await waitFor(() => expect(inputs).toHaveTextContent('Value is required'));
        expect(submitButton).not.toBeEnabled();

        // change to valid value, validate no error
        const calButton = getByRole(datetimeInput?.parentElement!, 'button');
        fireEvent.click(calButton);
        const dialog = await waitFor(() => screen.getByRole('dialog'));
        const buttons = within(dialog).getAllByRole('button');
        buttons.find((b) => b.textContent === 'Today')?.click();
        buttons.find((b) => b.textContent === 'OK')?.click();
        await waitFor(() => {
          expect(datetimeInput).toHaveValue();
        });
        await waitFor(() => expect(submitButton).toBeEnabled());

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('default value should work as expected', async () => {
        const varName = 'unionAndDatetimeVar';
        variables = {
          [varName]: unionType([simpleType(SimpleType.DATETIME), noneType()]),
        };

        createMocks();

        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;
        mockLaunchPlans[0]!.closure!.expectedInputs!.parameters![varName]!.default = {
          scalar: {
            primitive: {
              datetime: {
                seconds: {
                  low: 1697569659,
                  high: 0,
                  unsigned: false,
                },
                nanos: 554000000,
              },
            },
          },
        } as any;

        const { container, getByTitle } = renderForm();

        // submit button should not be enabled for required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).not.toBeEnabled());
        const inputs = await waitFor(() => getByTitle(t('inputs')));

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`);
          expect(label?.textContent).toEqual(`${varName} (union [datetime - UTC | none])*`);
        });

        // expect no option selected
        await waitFor(() => {
          const combobox = container.querySelector(`#launch-input-${varName}`);
          expect(combobox?.textContent).toEqual('datetime - UTC');
        });

        const datetimeInput = await waitFor(() => {
          return container.querySelector(`#launch-input-datetime---UTC`);
        });

        // expect datetime to be correctly prepopulated
        await waitFor(() => {
          // bool should be true
          expect(datetimeInput!).toHaveValue('2023-10-17 19:07:39');
        });

        // expect  no validation error
        await waitFor(() => expect(inputs).not.toHaveTextContent('Value is required'));

        await waitFor(() => expect(submitButton).toBeEnabled());

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });
    });
  });

  describe('COLLECTION type', () => {
    describe('of INTEGER type', () => {
      it('non-required should work as expected', async () => {
        const varName = 'collectionOfInt';
        variables = {
          [varName]: collectionType(simpleType(SimpleType.INTEGER)),
        };
        createMocks();

        const { container } = renderForm();

        // submit button should be enabled for non-required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (integer[])`);
        });

        const integerInput = await waitFor(() => {
          return container.querySelector(`#launch-input-${varName}`);
        });

        // expect no value populated
        await waitFor(() => {
          expect(integerInput).toHaveTextContent('');
        });

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(integerInput!, { target: { value: '1' }, bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent;
          expect(helperText).toContain('Failed to parse to expected format: integer[].');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(integerInput!, { target: { value: '[1, 2, 3]' }, bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent || '';
          expect(helperText).not.toContain('Failed to parse to expected format: integer[].');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('required should work as expected', async () => {
        const varName = 'collectionOfInt';
        variables = {
          [varName]: collectionType(simpleType(SimpleType.INTEGER)),
        };

        createMocks();
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;

        const { container } = renderForm();

        // submit button should be not enabled for required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).not.toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (integer[])*`);
        });

        const integerInput = await waitFor(() => {
          return container.querySelector(`#launch-input-${varName}`);
        });

        // expect no value populated
        await waitFor(() => {
          expect(integerInput).toHaveTextContent('');
        });

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(integerInput!, { target: { value: '1' }, bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent;
          expect(helperText).toContain('Failed to parse to expected format: integer[].');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(integerInput!, { target: { value: '[1, 2, 3]' }, bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent || '';
          expect(helperText).not.toContain('Failed to parse to expected format: integer[].');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('default value should work as expected', async () => {
        const varName = 'collectionOfInt';
        variables = {
          [varName]: collectionType(simpleType(SimpleType.INTEGER)),
        };

        createMocks();
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;
        mockLaunchPlans[0]!.closure!.expectedInputs!.parameters![varName]!.default = {
          collection: {
            literals: [
              {
                scalar: {
                  primitive: {
                    integer: Long.fromNumber(-3),
                  },
                },
              },
              {
                scalar: {
                  primitive: {
                    integer: Long.fromNumber(0),
                  },
                },
              },
              {
                scalar: {
                  primitive: {
                    integer: Long.fromNumber(3),
                  },
                },
              },
            ],
          },
        } as any;

        const { container } = renderForm();

        // submit button should be enabled for pre-populated inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (integer[])*`);
        });

        const integerInput = await waitFor(() => {
          return container.querySelector(`#launch-input-${varName}`);
        });

        // expect value populated
        await waitFor(() => {
          expect(integerInput).toHaveValue('[-3, 0, 3]');
        });

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(integerInput!, { target: { value: '1' }, bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent;
          expect(helperText).toContain('Failed to parse to expected format: integer[].');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(integerInput!, { target: { value: '[1, 2, 3]' }, bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent || '';
          expect(helperText).not.toContain('Failed to parse to expected format: integer[].');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });
    });

    describe('of FLOAT type', () => {
      it('non-required should work as expected', async () => {
        const varName = 'collectionOfFloat';
        variables = {
          [varName]: collectionType(simpleType(SimpleType.FLOAT)),
        };
        createMocks();

        const { container } = renderForm();

        // submit button should be enabled for non-required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (float[])`);
        });

        const floatInput = await waitFor(() => {
          return container.querySelector(`#launch-input-${varName}`);
        });

        // expect no value populated
        await waitFor(() => {
          expect(floatInput).toHaveTextContent('');
        });

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(floatInput!, { target: { value: '1' }, bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent;
          expect(helperText).toContain('Failed to parse to expected format: float[].');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(floatInput!, { target: { value: '[1, 2, 3]' }, bubbles: true });
        // await fireEvent.click(floatInput!, { bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent || '';
          expect(helperText).not.toContain('Failed to parse to expected format: float[].');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('required should work as expected', async () => {
        const varName = 'collectionOfFloat';
        variables = {
          [varName]: collectionType(simpleType(SimpleType.FLOAT)),
        };

        createMocks();
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;

        const { container } = renderForm();

        // submit button should be not enabled for required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).not.toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (float[])*`);
        });

        const floatInput = await waitFor(() => {
          return container.querySelector(`#launch-input-${varName}`);
        });

        // expect no value populated
        await waitFor(() => {
          expect(floatInput).toHaveTextContent('');
        });

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(floatInput!, { target: { value: '0.1' }, bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent;
          expect(helperText).toContain('Failed to parse to expected format: float[].');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(floatInput!, { target: { value: '[-1, 0.2, 3]' }, bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent || '';
          expect(helperText).not.toContain('Failed to parse to expected format: float[].');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('default value should work as expected', async () => {
        const varName = 'collectionOfFloat';
        variables = {
          [varName]: collectionType(simpleType(SimpleType.FLOAT)),
        };

        createMocks();
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;
        mockLaunchPlans[0]!.closure!.expectedInputs!.parameters![varName]!.default = {
          collection: {
            literals: [
              {
                scalar: {
                  primitive: {
                    floatValue: -0.1,
                  },
                },
              },
              {
                scalar: {
                  primitive: {
                    floatValue: 0.0,
                  },
                },
              },
              {
                scalar: {
                  primitive: {
                    floatValue: 0.1,
                  },
                },
              },
            ],
          },
        } as any;

        const { container } = renderForm();

        // submit button should be enabled for pre-populated inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (float[])*`);
        });

        const floatInput = await waitFor(() => {
          return container.querySelector(`#launch-input-${varName}`);
        });

        // expect value populated
        await waitFor(() => {
          expect(floatInput).toHaveValue('[-0.1, 0, 0.1]');
        });

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(floatInput!, { target: { value: '1' }, bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent;
          expect(helperText).toContain('Failed to parse to expected format: float[].');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(floatInput!, { target: { value: '[1, 2, 3]' }, bubbles: true });
        // await fireEvent.click(floatInput!, { bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent || '';
          expect(helperText).not.toContain('Failed to parse to expected format: integer[].');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });
    });

    describe('of STRING type', () => {
      it('non-required should work as expected', async () => {
        const varName = 'collectionOfString';
        variables = {
          [varName]: collectionType(simpleType(SimpleType.STRING)),
        };
        createMocks();

        const { container } = renderForm();

        // submit button should be enabled for non-required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (string[])`);
        });

        const stringInput = await waitFor(() => {
          return container.querySelector(`#launch-input-${varName}`);
        });

        // expect no value populated
        await waitFor(() => {
          expect(stringInput).toHaveTextContent('');
        });

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(stringInput!, { target: { value: 'a' }, bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent;
          expect(helperText).toContain('Failed to parse to expected format: string[].');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(stringInput!, {
          target: { value: '["a", "b", "c"]' },
          bubbles: true,
        });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent || '';
          expect(helperText).not.toContain('Failed to parse to expected format: string[].');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('required should work as expected', async () => {
        const varName = 'collectionOfString';
        variables = {
          [varName]: collectionType(simpleType(SimpleType.STRING)),
        };

        createMocks();
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;

        const { container } = renderForm();

        // submit button should be not enabled for required inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).not.toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (string[])*`);
        });

        const stringInput = await waitFor(() => {
          return container.querySelector(`#launch-input-${varName}`);
        });

        // expect no value populated
        await waitFor(() => {
          expect(stringInput).toHaveTextContent('');
        });

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(stringInput!, { target: { value: '1' }, bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent;
          expect(helperText).toContain('Failed to parse to expected format: string[].');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(stringInput!, {
          target: { value: '["1", "2", "3"]' },
          bubbles: true,
        });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent || '';
          expect(helperText).not.toContain('Failed to parse to expected format: string[].');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });

      it('default value should work as expected', async () => {
        const varName = 'collectionOfString';
        variables = {
          [varName]: collectionType(simpleType(SimpleType.STRING)),
        };

        createMocks();
        const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
        parameters[varName].required = true;
        mockLaunchPlans[0]!.closure!.expectedInputs!.parameters![varName]!.default = {
          collection: {
            literals: [
              {
                scalar: {
                  primitive: {
                    stringValue: 'a',
                  },
                },
              },
              {
                scalar: {
                  primitive: {
                    stringValue: 'b',
                  },
                },
              },
              {
                scalar: {
                  primitive: {
                    stringValue: 'c',
                  },
                },
              },
            ],
          },
        } as any;

        const { container } = renderForm();

        // submit button should be enabled for pre-populated inputs
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());

        // check label content
        await waitFor(() => {
          const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
          expect(label).toEqual(`${varName} (string[])*`);
        });

        const stringInput = await waitFor(() => {
          return container.querySelector(`#launch-input-${varName}`);
        });

        // expect value populated
        await waitFor(() => {
          expect(stringInput).toHaveValue('["a", "b", "c"]');
        });

        // change to invalid value, validate error, submit button should be disabled
        await fireEvent.change(stringInput!, { target: { value: '1' }, bubbles: true });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent;
          expect(helperText).toContain('Failed to parse to expected format: string[].');
        });
        await waitFor(() => {
          expect(submitButton).not.toBeEnabled();
        });

        // change to valid value, validate error
        await fireEvent.change(stringInput!, {
          target: { value: '["1", "2", "3"]' },
          bubbles: true,
        });

        await waitFor(() => {
          const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

          const helperText = helperElement?.textContent || '';
          expect(helperText).not.toContain('Failed to parse to expected format: string[].');
        });

        await waitFor(() => {
          expect(submitButton).toBeEnabled();
        });

        // clicking submit should work
        await fireEvent.click(submitButton);
        await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
      });
    });

    describe('of COLLECTION type', () => {
      describe('of INTEGER type', () => {
        it('non-required should work as expected', async () => {
          const varName = 'collectionOfInt';
          variables = {
            [varName]: collectionType(collectionType(simpleType(SimpleType.INTEGER))),
          };
          createMocks();

          const { container } = renderForm();

          // submit button should be enabled for non-required inputs
          const submitButton = await waitFor(() => getSubmitButton(container));
          await waitFor(() => expect(submitButton).toBeEnabled());

          // check label content
          await waitFor(() => {
            const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
            expect(label).toEqual(`${varName} (integer[][])`);
          });

          const integerInput = await waitFor(() => {
            return container.querySelector(`#launch-input-${varName}`);
          });

          // expect no value populated
          await waitFor(() => {
            expect(integerInput).toHaveTextContent('');
          });

          // change to invalid value, validate error, submit button should be disabled
          await fireEvent.change(integerInput!, { target: { value: '1' }, bubbles: true });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent;

            expect(helperText).toContain(
              'Failed to parse to expected format: integer[][]. Value did not parse to an array',
            );
          });
          await waitFor(() => {
            expect(submitButton).not.toBeEnabled();
          });

          // change to valid value, validate error
          await fireEvent.change(integerInput!, {
            target: { value: '[[1, 2, 3]]' },
            bubbles: true,
          });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent || '';
            expect(helperText).not.toContain(
              'Failed to parse to expected format: integer[][]. Value did not parse to an array',
            );
          });

          await waitFor(() => {
            expect(submitButton).toBeEnabled();
          });

          // clicking submit should work
          await fireEvent.click(submitButton);
          await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
        });

        it('required should work as expected', async () => {
          const varName = 'collectionOfInt';
          variables = {
            [varName]: collectionType(collectionType(simpleType(SimpleType.INTEGER))),
          };

          createMocks();
          const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
          parameters[varName].required = true;

          const { container } = renderForm();

          // submit button should be not enabled for required inputs
          const submitButton = await waitFor(() => getSubmitButton(container));
          await waitFor(() => expect(submitButton).not.toBeEnabled());

          // check label content
          await waitFor(() => {
            const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
            expect(label).toEqual(`${varName} (integer[][])*`);
          });

          const integerInput = await waitFor(() => {
            return container.querySelector(`#launch-input-${varName}`);
          });

          // expect no value populated
          await waitFor(() => {
            expect(integerInput).toHaveTextContent('');
          });

          // change to invalid value, validate error, submit button should be disabled
          await fireEvent.change(integerInput!, { target: { value: '1' }, bubbles: true });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent;
            expect(helperText).toContain(
              'Failed to parse to expected format: integer[][]. Value did not parse to an array',
            );
          });

          await waitFor(() => {
            expect(submitButton).not.toBeEnabled();
          });

          // change to valid value, validate error
          await fireEvent.change(integerInput!, {
            target: { value: '[[1, 2, 3]]' },
            bubbles: true,
          });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent || '';
            expect(helperText).not.toContain(
              'Failed to parse to expected format: integer[][]. Value did not parse to an array',
            );
          });

          await waitFor(() => {
            expect(submitButton).toBeEnabled();
          });

          // clicking submit should work
          await fireEvent.click(submitButton);
          await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
        });

        it('default value should work as expected', async () => {
          const varName = 'collectionOfInt';
          variables = {
            [varName]: collectionType(collectionType(simpleType(SimpleType.INTEGER))),
          };

          createMocks();
          const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
          parameters[varName].required = true;
          mockLaunchPlans[0]!.closure!.expectedInputs!.parameters![varName]!.default = {
            collection: {
              literals: [
                {
                  collection: {
                    literals: [
                      {
                        scalar: {
                          primitive: {
                            integer: Long.fromNumber(-3),
                          },
                        },
                      },
                      {
                        scalar: {
                          primitive: {
                            integer: Long.fromNumber(0),
                          },
                        },
                      },
                      {
                        scalar: {
                          primitive: {
                            integer: Long.fromNumber(3),
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          } as any;

          const { container } = renderForm();

          // submit button should be enabled for pre-populated inputs
          const submitButton = await waitFor(() => getSubmitButton(container));
          await waitFor(() => expect(submitButton).toBeEnabled());

          // check label content
          await waitFor(() => {
            const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
            expect(label).toEqual(`${varName} (integer[][])*`);
          });

          const integerInput = await waitFor(() => {
            return container.querySelector(`#launch-input-${varName}`);
          });

          // expect value populated
          await waitFor(() => {
            expect(integerInput).toHaveValue('[[-3, 0, 3]]');
          });

          // change to invalid value, validate error, submit button should be disabled
          await fireEvent.change(integerInput!, { target: { value: '1' }, bubbles: true });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent;
            expect(helperText).toContain(
              'Failed to parse to expected format: integer[][]. Value did not parse to an array',
            );
          });
          await waitFor(() => {
            expect(submitButton).not.toBeEnabled();
          });

          // change to valid value, validate error
          await fireEvent.change(integerInput!, {
            target: { value: '[[1, 2, 3]]' },
            bubbles: true,
          });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent || '';
            expect(helperText).not.toContain(
              'Failed to parse to expected format: integer[][]. Value did not parse to an array',
            );
          });

          await waitFor(() => {
            expect(submitButton).toBeEnabled();
          });

          // clicking submit should work
          await fireEvent.click(submitButton);
          await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
        });
      });

      describe('of FLOAT type', () => {
        it('non-required should work as expected', async () => {
          const varName = 'collectionOfFloat';
          variables = {
            [varName]: collectionType(collectionType(simpleType(SimpleType.FLOAT))),
          };
          createMocks();

          const { container } = renderForm();

          // submit button should be enabled for non-required inputs
          const submitButton = await waitFor(() => getSubmitButton(container));
          await waitFor(() => expect(submitButton).toBeEnabled());

          // check label content
          await waitFor(() => {
            const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
            expect(label).toEqual(`${varName} (float[][])`);
          });

          const floatInput = await waitFor(() => {
            return container.querySelector(`#launch-input-${varName}`);
          });

          // expect no value populated
          await waitFor(() => {
            expect(floatInput).toHaveTextContent('');
          });

          // change to invalid value, validate error, submit button should be disabled
          await fireEvent.change(floatInput!, { target: { value: '1' }, bubbles: true });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent;
            expect(helperText).toContain(
              'Failed to parse to expected format: float[][]. Value did not parse to an array',
            );
          });
          await waitFor(() => {
            expect(submitButton).not.toBeEnabled();
          });

          // change to valid value, validate error
          await fireEvent.change(floatInput!, { target: { value: '[[1, 2, 3]]' }, bubbles: true });
          // await fireEvent.click(floatInput!, { bubbles: true });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent || '';
            expect(helperText).not.toContain(
              'Failed to parse to expected format: float[][]. Value did not parse to an array',
            );
          });

          await waitFor(() => {
            expect(submitButton).toBeEnabled();
          });

          // clicking submit should work
          await fireEvent.click(submitButton);
          await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
        });

        it('required should work as expected', async () => {
          const varName = 'collectionOfFloat';
          variables = {
            [varName]: collectionType(collectionType(simpleType(SimpleType.FLOAT))),
          };

          createMocks();
          const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
          parameters[varName].required = true;

          const { container } = renderForm();

          // submit button should be not enabled for required inputs
          const submitButton = await waitFor(() => getSubmitButton(container));
          await waitFor(() => expect(submitButton).not.toBeEnabled());

          // check label content
          await waitFor(() => {
            const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
            expect(label).toEqual(`${varName} (float[][])*`);
          });

          const floatInput = await waitFor(() => {
            return container.querySelector(`#launch-input-${varName}`);
          });

          // expect no value populated
          await waitFor(() => {
            expect(floatInput).toHaveTextContent('');
          });

          // change to invalid value, validate error, submit button should be disabled
          await fireEvent.change(floatInput!, {
            target: { value: '1' },
            bubbles: true,
          });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent;
            expect(helperText).toContain(
              'Failed to parse to expected format: float[][]. Value did not parse to an array',
            );
          });
          await waitFor(() => {
            expect(submitButton).not.toBeEnabled();
          });

          // change to valid value, validate error
          await fireEvent.change(floatInput!, {
            target: { value: '[[-1, 0.2, 3]]' },
            bubbles: true,
          });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent || '';
            expect(helperText).not.toContain(
              'Failed to parse to expected format: float[][]. Value did not parse to an array',
            );
          });

          await waitFor(() => {
            expect(submitButton).toBeEnabled();
          });

          // clicking submit should work
          await fireEvent.click(submitButton);
          await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
        });

        it('default value should work as expected', async () => {
          const varName = 'collectionOfFloat';
          variables = {
            [varName]: collectionType(collectionType(simpleType(SimpleType.FLOAT))),
          };

          createMocks();
          const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
          parameters[varName].required = true;
          mockLaunchPlans[0]!.closure!.expectedInputs!.parameters![varName]!.default = {
            collection: {
              literals: [
                {
                  collection: {
                    literals: [
                      {
                        scalar: {
                          primitive: {
                            floatValue: -0.1,
                          },
                        },
                      },
                      {
                        scalar: {
                          primitive: {
                            floatValue: 0.0,
                          },
                        },
                      },
                      {
                        scalar: {
                          primitive: {
                            floatValue: 0.1,
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          } as any;

          const { container } = renderForm();

          // submit button should be enabled for pre-populated inputs
          const submitButton = await waitFor(() => getSubmitButton(container));
          await waitFor(() => expect(submitButton).toBeEnabled());

          // check label content
          await waitFor(() => {
            const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
            expect(label).toEqual(`${varName} (float[][])*`);
          });

          const floatInput = await waitFor(() => {
            return container.querySelector(`#launch-input-${varName}`);
          });

          // expect value populated
          await waitFor(() => {
            expect(floatInput).toHaveValue('[[-0.1, 0, 0.1]]');
          });

          // change to invalid value, validate error, submit button should be disabled
          await fireEvent.change(floatInput!, { target: { value: '1' }, bubbles: true });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent;
            expect(helperText).toContain(
              'Failed to parse to expected format: float[][]. Value did not parse to an array',
            );
          });
          await waitFor(() => {
            expect(submitButton).not.toBeEnabled();
          });

          // change to valid value, validate error
          await fireEvent.change(floatInput!, {
            target: { value: '[[1, 2, 3]]' },
            bubbles: true,
          });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent || '';
            expect(helperText).not.toContain(
              'Failed to parse to expected format: float[][]. Value did not parse to an array',
            );
          });

          await waitFor(() => {
            expect(submitButton).toBeEnabled();
          });

          // clicking submit should work
          await fireEvent.click(submitButton);
          await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
        });
      });

      describe('of STRING type', () => {
        it('non-required should work as expected', async () => {
          const varName = 'collectionOfString';
          variables = {
            [varName]: collectionType(collectionType(simpleType(SimpleType.STRING))),
          };
          createMocks();

          const { container } = renderForm();

          // submit button should be enabled for non-required inputs
          const submitButton = await waitFor(() => getSubmitButton(container));
          await waitFor(() => expect(submitButton).toBeEnabled());

          // check label content
          await waitFor(() => {
            const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
            expect(label).toEqual(`${varName} (string[][])`);
          });

          const stringInput = await waitFor(() => {
            return container.querySelector(`#launch-input-${varName}`);
          });

          // expect no value populated
          await waitFor(() => {
            expect(stringInput).toHaveTextContent('');
          });

          // change to invalid value, validate error, submit button should be disabled
          await fireEvent.change(stringInput!, { target: { value: 'a' }, bubbles: true });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent;
            expect(helperText).toContain('Failed to parse to expected format: string[][].');
          });
          await waitFor(() => {
            expect(submitButton).not.toBeEnabled();
          });

          // change to valid value, validate error
          await fireEvent.change(stringInput!, {
            target: { value: '[["a", "b", "c"]]' },
            bubbles: true,
          });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent || '';
            expect(helperText).toContain('Failed to parse to expected format: string[][].');
          });

          await waitFor(() => {
            expect(submitButton).toBeEnabled();
          });

          // clicking submit should work
          await fireEvent.click(submitButton);
          await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
        });

        it('required should work as expected', async () => {
          const varName = 'collectionOfString';
          variables = {
            [varName]: collectionType(collectionType(simpleType(SimpleType.STRING))),
          };

          createMocks();
          const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
          parameters[varName].required = true;

          const { container } = renderForm();

          // submit button should be not enabled for required inputs
          const submitButton = await waitFor(() => getSubmitButton(container));
          await waitFor(() => expect(submitButton).not.toBeEnabled());

          // check label content
          await waitFor(() => {
            const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
            expect(label).toEqual(`${varName} (string[][])*`);
          });

          const stringInput = await waitFor(() => {
            return container.querySelector(`#launch-input-${varName}`);
          });

          // expect no value populated
          await waitFor(() => {
            expect(stringInput).toHaveTextContent('');
          });

          // change to invalid value, validate error, submit button should be disabled
          await fireEvent.change(stringInput!, { target: { value: '1' }, bubbles: true });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent;
            expect(helperText).toContain('Failed to parse to expected format: string[][].');
          });
          await waitFor(() => {
            expect(submitButton).not.toBeEnabled();
          });

          // change to valid value, validate error
          await fireEvent.change(stringInput!, {
            target: { value: '[["1", "2", "3"]]' },
            bubbles: true,
          });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent || '';
            expect(helperText).toContain('Failed to parse to expected format: string[][].');
          });

          await waitFor(() => {
            expect(submitButton).toBeEnabled();
          });

          // clicking submit should work
          await fireEvent.click(submitButton);
          await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
        });

        it('default value should work as expected', async () => {
          const varName = 'collectionOfString';
          variables = {
            [varName]: collectionType(collectionType(simpleType(SimpleType.STRING))),
          };

          createMocks();
          const { parameters } = mockLaunchPlans[0].closure!.expectedInputs;
          parameters[varName].required = true;
          mockLaunchPlans[0]!.closure!.expectedInputs!.parameters![varName]!.default = {
            collection: {
              literals: [
                {
                  collection: {
                    literals: [
                      {
                        scalar: {
                          primitive: {
                            stringValue: 'a',
                          },
                        },
                      },
                      {
                        scalar: {
                          primitive: {
                            stringValue: 'b',
                          },
                        },
                      },
                      {
                        scalar: {
                          primitive: {
                            stringValue: 'c',
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          } as any;

          const { container } = renderForm();

          // submit button should be enabled for pre-populated inputs
          const submitButton = await waitFor(() => getSubmitButton(container));
          await waitFor(() => expect(submitButton).toBeEnabled());

          // check label content
          await waitFor(() => {
            const label = container.querySelector(`#launch-input-${varName}-label`)?.textContent;
            expect(label).toEqual(`${varName} (string[][])*`);
          });

          const stringInput = await waitFor(() => {
            return container.querySelector(`#launch-input-${varName}`);
          });

          // expect value populated
          await waitFor(() => {
            expect(stringInput).toHaveValue('[["a", "b", "c"]]');
          });

          // change to invalid value, validate error, submit button should be disabled
          await fireEvent.change(stringInput!, { target: { value: '1' }, bubbles: true });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent;
            expect(helperText).toContain('Failed to parse to expected format: string[][].');
          });
          await waitFor(() => {
            expect(submitButton).not.toBeEnabled();
          });

          // change to valid value, validate error
          await fireEvent.change(stringInput!, {
            target: { value: '[["1", "2", "3"]]' },
            bubbles: true,
          });

          await waitFor(() => {
            const helperElement = container.querySelector(`#launch-input-${varName}-helper-text`);

            const helperText = helperElement?.textContent || '';
            expect(helperText).toContain('Failed to parse to expected format: string[][].');
          });

          await waitFor(() => {
            expect(submitButton).toBeEnabled();
          });

          // clicking submit should work
          await fireEvent.click(submitButton);
          await waitFor(() => expect(mockCreateWorkflowExecution).toBeCalledTimes(1));
        });
      });
    });
  });
});
