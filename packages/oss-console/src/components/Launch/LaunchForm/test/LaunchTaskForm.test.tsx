import * as React from 'react';
import StyledEngineProvider from '@mui/material/StyledEngineProvider';
import { type Theme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import {
  fireEvent,
  getByLabelText,
  queryAllByRole,
  render,
  waitFor,
  screen,
} from '@testing-library/react';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import Core from '@clients/common/flyteidl/core';
import Protobuf from '@clients/common/flyteidl/protobuf';
import cloneDeep from 'lodash/cloneDeep';
import { RequestConfig } from '@clients/common/types/adminEntityTypes';
import { mockAPIContextValue } from '../../../data/__mocks__/apiContext';
import { APIContext } from '../../../data/apiContext';
import { Identifier, NamedEntityIdentifier, Variable } from '../../../../models/Common/types';
import { createWorkflowExecution } from '../../../../models/Execution/api';
import { getTask, listTasks } from '../../../../models/Task/api';
import { Task } from '../../../../models/Task/types';
import { createMockTaskClosure } from '../../../../models/__mocks__/taskData';
import { delayedPromise, pendingPromise } from '../../../../test/utils';
import { AuthRoleStrings } from '../constants';
import t from '../strings';
import { LaunchForm } from '../LaunchForm';
import { AuthRoleTypes, LaunchFormProps, TaskInitialLaunchParameters } from '../types';
import { createInputCacheKey, getInputDefintionForLiteralType } from '../utils';
import {
  createMockInputsInterface,
  mockSimpleVariables,
  simpleVariableDefaults,
} from '../__mocks__/mockInputs';
import {
  binaryInputName,
  floatInputName,
  iamRoleString,
  integerInputName,
  stringInputName,
} from './constants';
import { createMockObjects } from './utils';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

jest.mock('../../../Executions/ExecutionDetails/Timeline/ExecutionTimeline', () => ({
  ExecutionTimelineContainer: jest.fn(() => <div id="ExecutionTimelineContainer-mock"></div>),
}));

describe('LaunchForm: Task', () => {
  let onClose: jest.Mock;
  let mockTask: Task;
  let mockTaskVersions: Task[];
  let taskId: NamedEntityIdentifier;
  let variables: Record<string, Variable>;

  let mockListTasks: jest.Mock<ReturnType<typeof listTasks>>;
  let mockGetTask: jest.Mock<ReturnType<typeof getTask>>;
  let mockCreateWorkflowExecution: jest.Mock<ReturnType<typeof createWorkflowExecution>>;

  beforeEach(() => {
    onClose = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const createMockTaskWithInputs = (id: Identifier) => {
    const task: Task = {
      id,
      closure: createMockTaskClosure(),
    };
    task.closure!.compiledTask!.template.interface = createMockInputsInterface(variables);
    return task;
  };

  const renderInitialLaunchParams = () => {
    const initialValues = {
      iam: 'test_IAM_value',
      k8: 'test_K8_value',
    };
    const initialParameters: TaskInitialLaunchParameters = {
      authRole: {
        assumableIamRole: initialValues.iam,
        kubernetesServiceAccount: initialValues.k8,
      },
      securityContext: {
        runAs: {
          iamRole: initialValues.iam,
          k8sServiceAccount: initialValues.k8,
        },
      },
    };
    return { initialValues, initialParameters };
  };

  const createMocks = () => {
    const mockObjects = createMockObjects(variables);
    mockTask = mockObjects.mockTask;

    mockTaskVersions = mockObjects.mockTaskVersions;

    taskId = mockTask.id;
    mockCreateWorkflowExecution = jest.fn();
    // Return our mock inputs for any version requested
    mockGetTask = jest
      .fn()
      .mockImplementation((id) => Promise.resolve(createMockTaskWithInputs(id)));

    // For workflow/task list endpoints: If the scope has a filter, the calling
    // code is searching for a specific item. So we'll return a single-item
    // list containing it.
    mockListTasks = jest
      .fn()
      .mockImplementation((scope: Partial<Identifier>, { filter }: RequestConfig) => {
        if (filter && filter[0].key === 'version') {
          const task = { ...mockTaskVersions[0] };
          task.id = {
            ...scope,
            version: filter[0].value,
          } as Identifier;
          return Promise.resolve({
            entities: [task],
          });
        }
        return Promise.resolve({ entities: mockTaskVersions });
      });
  };

  const renderForm = (props?: Partial<LaunchFormProps>) => {
    return render(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>
          <APIContext.Provider
            value={mockAPIContextValue({
              createWorkflowExecution: mockCreateWorkflowExecution,
              getTask: mockGetTask,
              listTasks: mockListTasks,
            })}
          >
            <LaunchForm onClose={onClose} taskId={taskId} {...props} />
          </APIContext.Provider>
        </ThemeProvider>
      </StyledEngineProvider>,
    );
  };

  const getSubmitButton = (container: HTMLElement) => {
    const buttons = queryAllByRole(container, 'button').filter(
      (el) => el.getAttribute('type') === 'submit',
    );
    expect(buttons.length).toBe(1);
    return buttons[0];
  };

  const fillInputs = async (container: HTMLElement) => {
    await fireEvent.change(
      getByLabelText(container, stringInputName, {
        exact: false,
      }),
      { target: { value: 'abc' } },
    );
    await fireEvent.change(
      getByLabelText(container, integerInputName, {
        exact: false,
      }),
      { target: { value: '10' } },
    );
    await fireEvent.change(
      getByLabelText(container, floatInputName, {
        exact: false,
      }),
      { target: { value: '1.5' } },
    );
    await fireEvent.change(
      getByLabelText(container, AuthRoleStrings[AuthRoleTypes.IAM].inputLabel, {
        exact: false,
      }),
      { target: { value: iamRoleString } },
    );
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

      expect(getByText(t('taskNoInputsString'))).toBeInTheDocument();
    });

    it('should not render inputs header/description', async () => {
      const { container, queryByText } = renderForm();
      const submitButton = await waitFor(() => getSubmitButton(container));
      await waitFor(() => expect(submitButton).toBeEnabled());

      expect(queryByText(t('inputs'))).toBeNull();
      expect(queryByText(t('inputsDescription'))).toBeNull();
    });
  });

  describe('With Inputs', () => {
    beforeEach(() => {
      const { simpleString, simpleInteger, simpleFloat, simpleBoolean } = mockSimpleVariables;
      // Only taking supported variable types since they are all required.
      variables = cloneDeep({
        simpleString,
        simpleInteger,
        simpleFloat,
        simpleBoolean,
      });
      createMocks();
    });
    afterEach(() => {
      variables = {};
    });

    it('should not show task selector until options have loaded', async () => {
      mockListTasks.mockReturnValue(pendingPromise());
      const { getByText, queryByText } = renderForm();
      await waitFor(() => getByText(t('title')));
      expect(queryByText(t('taskVersion'))).not.toBeInTheDocument();
    });

    it('should select the most recent task version by default', async () => {
      const { container } = renderForm();

      await waitFor(() => {
        const selector = container.querySelector('#launch-task-selector');
        expect(selector).toHaveValue(mockTaskVersions[0].id.version);
      });
    });

    it('should disable submit button until inputs have loaded', async () => {
      let identifier: Identifier = {} as Identifier;
      const { promise, resolve } = delayedPromise<Task>();
      mockGetTask.mockImplementation((id) => {
        identifier = id;
        return promise;
      });
      const { container, getByLabelText } = renderForm();

      const submitButton = await waitFor(() => getSubmitButton(container));

      expect(submitButton).toBeDisabled();
      resolve(createMockTaskWithInputs(identifier));

      // wait for inputs to load
      await waitFor(() =>
        getByLabelText(integerInputName, {
          exact: false,
        }),
      );
      // fill inputs because they are required
      await fillInputs(container);

      await waitFor(() => expect(submitButton).not.toBeDisabled());
    });

    it('should show disabled submit button if the value in input is invalid', async () => {
      const { container, getByLabelText } = renderForm();
      await waitFor(() => {});

      const integerInput = await waitFor(() =>
        getByLabelText(integerInputName, {
          exact: false,
        }),
      );

      // fill inputs because they are required
      await fillInputs(container);

      await fireEvent.change(integerInput, { target: { value: 'abc' } });

      const submitButton = getSubmitButton(container);
      await waitFor(() => expect(submitButton).toBeDisabled());

      await fireEvent.change(integerInput, { target: { value: 123 } });

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
      await fillInputs(container);
      const submitButton = getSubmitButton(container);
      await fireEvent.change(integerInput, { target: { value: 'abc' } });
      await waitFor(() => expect(submitButton).toBeDisabled());

      await fireEvent.change(integerInput, { target: { value: '123' } });
      await waitFor(() => expect(submitButton).toBeEnabled());
      await fireEvent.click(submitButton);
      await waitFor(() => expect(mockCreateWorkflowExecution).toHaveBeenCalled());
    });

    it('should update inputs when selecting a new task version', async () => {
      const { queryByText, getByTitle, container } = renderForm();

      await waitFor(() => getByTitle(t('taskVersion')));
      const taskSelector = await waitFor(() => container.querySelector('#launch-task-selector'));
      // Delete the string input so that its corresponding input will
      // disappear after the new launch plan is loaded.
      delete variables[stringInputName];

      // Click the expander for the task version, select the second item
      fireEvent(taskSelector!, new MouseEvent('mousedown', { bubbles: true }));

      const items = await waitFor(() => screen.getAllByRole('option'));

      await fireEvent.click(items[1]);

      await waitFor(() => getByTitle(t('inputs')));
      await waitFor(() =>
        expect(
          queryByText(stringInputName, {
            // Don't use exact match because the label will be decorated with type info
            exact: false,
          }),
        ).toBeNull(),
      );
    });

    it('should preserve input values when changing task version', async () => {
      const { getByLabelText, getByTitle, container } = renderForm();
      await waitFor(() => getByTitle(t('taskVersion')));

      const integerInput = await waitFor(() =>
        getByLabelText(integerInputName, {
          exact: false,
        }),
      );
      await fireEvent.change(integerInput, { target: { value: '10' } });

      // Click the expander for the task version, select the second item
      const taskSelector = await waitFor(() => container.querySelector('#launch-task-selector'));
      fireEvent(taskSelector!, new MouseEvent('mousedown', { bubbles: true }));
      const items = await waitFor(() => screen.getAllByRole('option'));

      await fireEvent.click(items[1]);
      await waitFor(() => getByTitle(t('inputs')));

      expect(
        getByLabelText(integerInputName, {
          exact: false,
        }),
      ).toHaveValue('10');
    });

    it('should reset form error when inputs change', async () => {
      const errorString = 'Something went wrong';
      mockCreateWorkflowExecution.mockRejectedValue(new Error(errorString));

      const { container, getByText, getByTitle, queryByText, getByLabelText } = renderForm();
      await waitFor(() => getByTitle(t('taskVersion')));
      await waitFor(() =>
        getByLabelText(integerInputName, {
          exact: false,
        }),
      );

      await fillInputs(container);

      const submitButton = await waitFor(() => getSubmitButton(container));
      await waitFor(() => expect(submitButton).toBeEnabled());
      await fireEvent.click(submitButton);

      await waitFor(() => expect(mockCreateWorkflowExecution).toHaveBeenCalled());

      await waitFor(() => expect(getByText(errorString)).toBeInTheDocument());

      // Click the expander for the launch plan, select the second item
      const taskSelector = await waitFor(() => container.querySelector('#launch-task-selector'));
      fireEvent(taskSelector!, new MouseEvent('mousedown', { bubbles: true }));
      const items = await waitFor(() => screen.getAllByRole('option'));
      await fireEvent.click(items[1]);
      await waitFor(() => expect(queryByText(errorString)).not.toBeInTheDocument());
    });

    describe('Auth Role', () => {
      describe('should show correct label/helper text', () => {
        it('for IAM', async () => {
          const { getByText, getByLabelText } = renderForm();
          await waitFor(() =>
            getByLabelText(AuthRoleStrings[AuthRoleTypes.IAM].inputLabel, {
              exact: false,
            }),
          );
          expect(getByText(AuthRoleStrings[AuthRoleTypes.IAM].helperText)).toBeInTheDocument();
        });
        it('for K8', async () => {
          const { getByText, getByLabelText } = renderForm();
          await waitFor(() =>
            getByLabelText(AuthRoleStrings[AuthRoleTypes.k8].inputLabel, {
              exact: false,
            }),
          );
          expect(getByText(AuthRoleStrings[AuthRoleTypes.k8].helperText)).toBeInTheDocument();
        });
      });
      describe('should use initial values when provided', () => {
        const { initialValues, initialParameters } = renderInitialLaunchParams();

        it('for IAM', async () => {
          const { getByLabelText } = renderForm({
            initialParameters,
          });
          await waitFor(() =>
            expect(
              getByLabelText(AuthRoleStrings[AuthRoleTypes.IAM].inputLabel, {
                exact: false,
              }),
            ).toHaveValue(initialValues.iam),
          );
        });

        it('for K8', async () => {
          const { getByLabelText } = renderForm({
            initialParameters,
          });
          await waitFor(() =>
            expect(
              getByLabelText(AuthRoleStrings[AuthRoleTypes.k8].inputLabel, {
                exact: false,
              }),
            ).toHaveValue(initialValues.k8),
          );
        });
      });
    });

    describe('Input Values', () => {
      it('should decorate all inputs with required labels', async () => {
        const { getByTitle, queryAllByText } = renderForm();
        await waitFor(() => getByTitle(t('inputs')));
        Object.keys(variables).forEach((name) => {
          const elements = queryAllByText(name, {
            exact: false,
          });
          expect(elements.length).toBeGreaterThan(0);
          expect(elements[0].textContent).toContain('*');
        });
      });
    });

    describe('When using initial parameters', () => {
      it('should prefer the provided task version', async () => {
        const initialParameters: TaskInitialLaunchParameters = {
          taskId: mockTaskVersions[2].id,
        };
        const { container } = renderForm({ initialParameters });
        await waitFor(() => {
          const taskSelector = container.querySelector('#launch-task-selector');

          expect(taskSelector).toHaveValue(mockTaskVersions[2].id.version);
        });
      });

      it('should only include one instance of the preferred version in the selector', async () => {
        const initialParameters: TaskInitialLaunchParameters = {
          taskId: mockTaskVersions[2].id,
        };
        const { getByTitle, container } = renderForm({ initialParameters });
        await waitFor(() => getByTitle(t('taskVersion')));

        // Click the expander for the workflow, select the second item
        const taskSelector = container.querySelector('#launch-task-selector');
        fireEvent(taskSelector!, new MouseEvent('mousedown', { bubbles: true }));
        const items = await waitFor(() => screen.getAllByRole('option'));

        const expectedVersion = mockTaskVersions[2].id.version;
        await waitFor(() =>
          expect(
            items.filter((item) => item.textContent && item.textContent.includes(expectedVersion)),
          ).toHaveLength(1),
        );
      });

      it('should fall back to the first item in the list if preferred version is not found', async () => {
        mockListTasks.mockImplementation((scope: Partial<Identifier>) => {
          // If we get a request for a specific item,
          // simulate not found
          if (scope.version) {
            return Promise.resolve({ entities: [] });
          }
          return Promise.resolve({
            entities: mockTaskVersions,
          });
        });
        const baseId = mockTaskVersions[2].id;
        const initialParameters: TaskInitialLaunchParameters = {
          taskId: { ...baseId, version: 'nonexistentValue' },
        };
        const { getByTitle, container } = renderForm({ initialParameters });
        await waitFor(() => getByTitle(t('taskVersion')));

        // check task version
        await waitFor(() => {
          const taskSelector = container.querySelector('#launch-task-selector');

          expect(taskSelector).toHaveValue(mockTaskVersions[0].id.version);
        });
      });

      it('should prepopulate inputs with provided initial values', async () => {
        const stringValue = 'initialStringValue';
        const initialStringValue: Core.ILiteral = {
          scalar: { primitive: { stringValue } },
        };
        const values = new Map();
        const stringCacheKey = createInputCacheKey(
          stringInputName,
          getInputDefintionForLiteralType(variables[stringInputName].type),
        );
        values.set(stringCacheKey, initialStringValue);
        const { getByLabelText } = renderForm({
          initialParameters: { values },
        });
        await waitFor(() =>
          expect(getByLabelText(stringInputName, { exact: false })).toHaveValue(stringValue),
        );
      });

      it('loads preferred task version when it does not exist in the list of suggestions', async () => {
        const missingTask = mockTaskVersions[0];
        missingTask.id.version = 'missingVersionString';
        const initialParameters: TaskInitialLaunchParameters = {
          taskId: missingTask.id,
        };
        const { getByTitle, container } = renderForm({ initialParameters });
        await waitFor(() => getByTitle(t('taskVersion')));

        // check task version
        await waitFor(() => {
          const taskSelector = container.querySelector('#launch-task-selector');

          expect(taskSelector).toHaveValue(missingTask.id.version);
        });
      });

      it('should select contents of task version input on focus', async () => {
        const { getByTitle, container } = renderForm();
        await waitFor(() => getByTitle(t('taskVersion')));

        // Focus the workflow version input
        const taskSelector = await waitFor(() => container.querySelector('#launch-task-selector'));
        expect(taskSelector).toBeInTheDocument();
        fireEvent.focus(taskSelector!);

        const expectedValue = mockTaskVersions[0].id.version;

        // The value should remain, but selection should be the entire string
        await waitFor(() => expect(taskSelector).toHaveValue(expectedValue));
      });
    });

    describe('With Unsupported Required Inputs', () => {
      beforeEach(() => {
        // Binary is currently unsupported, and all values are required.
        // So adding a binary variable will generate our test case.
        variables[binaryInputName] = cloneDeep(mockSimpleVariables[binaryInputName]);
      });

      it('should render error message', async () => {
        const { getByText } = renderForm();
        const errorElement = await waitFor(() => getByText(t('cannotLaunchTaskString')));
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

      it('should not show error if initial value is provided', async () => {
        const values = new Map();
        const cacheKey = createInputCacheKey(
          binaryInputName,
          getInputDefintionForLiteralType(variables[binaryInputName].type),
        );
        values.set(cacheKey, simpleVariableDefaults.simpleBinary);
        const { getByLabelText, queryByText } = renderForm({
          initialParameters: { values },
        });

        await waitFor(() => getByLabelText(binaryInputName, { exact: false }));
        expect(queryByText(t('cannotLaunchTaskString'))).toBeNull();
      });
    });

    describe('Interruptible', () => {
      beforeEach(() => {
        createMocks();
      });
      it('should render checkbox', async () => {
        const { getByLabelText } = renderForm();
        const inputElement = await waitFor(() =>
          getByLabelText(t('interruptible'), { exact: false }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).not.toBeChecked();
      });

      it('should use initial values when provided', async () => {
        const initialParameters: TaskInitialLaunchParameters = {
          taskId: mockTask.id,
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

      it('should cycle between states correctly', async () => {
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

      it('should submit without interruptible override set', async () => {
        const { container, getByLabelText, getByTitle } = renderForm();
        await waitFor(() => getByTitle(t('taskVersion')));

        const inputElement = await waitFor(() =>
          getByLabelText(t('interruptible'), { exact: false }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).not.toBeChecked();
        expect(inputElement).toHaveAttribute('data-indeterminate', 'true');

        await fillInputs(container);
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());
        fireEvent.click(submitButton);

        await waitFor(() =>
          expect(mockCreateWorkflowExecution).toHaveBeenCalledWith(
            expect.objectContaining({
              interruptible: null,
            }),
          ),
        );
      });

      it('should submit with interruptible override enabled', async () => {
        const initialParameters: TaskInitialLaunchParameters = {
          interruptible: Protobuf.BoolValue.create({ value: true }),
        };
        const { container, getByLabelText, getByTitle } = renderForm({ initialParameters });
        await waitFor(() => getByTitle(t('taskVersion')));

        const inputElement = await waitFor(() =>
          getByLabelText(t('interruptible'), { exact: false }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toBeChecked();
        expect(inputElement).toHaveAttribute('data-indeterminate', 'false');

        await fillInputs(container);
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());
        fireEvent.click(submitButton);

        await waitFor(() =>
          expect(mockCreateWorkflowExecution).toHaveBeenCalledWith(
            expect.objectContaining({
              interruptible: Protobuf.BoolValue.create({ value: true }),
            }),
          ),
        );
      });

      it('should submit with interruptible override disabled', async () => {
        const initialParameters: TaskInitialLaunchParameters = {
          interruptible: Protobuf.BoolValue.create({ value: false }),
        };
        const { container, getByLabelText, getByTitle } = renderForm({ initialParameters });
        await waitFor(() => getByTitle(t('taskVersion')));

        const inputElement = await waitFor(() =>
          getByLabelText(t('interruptible'), { exact: false }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).not.toBeChecked();
        expect(inputElement).toHaveAttribute('data-indeterminate', 'false');

        await fillInputs(container);
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());
        await fireEvent.click(submitButton);

        await waitFor(() =>
          expect(mockCreateWorkflowExecution).toHaveBeenCalledWith(
            expect.objectContaining({
              interruptible: Protobuf.BoolValue.create({ value: false }),
            }),
          ),
        );
      });
    });

    describe('overwrite cache', () => {
      beforeEach(() => {
        createMocks();
      });
      it('should render checkbox', async () => {
        const { getByLabelText } = renderForm();
        const inputElement = await waitFor(() =>
          getByLabelText(t('overwriteCache'), { exact: false }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).not.toBeChecked();
      });

      it('should use initial values when provided', async () => {
        const initialParameters: TaskInitialLaunchParameters = {
          taskId: mockTask.id,
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

      it('should submit without cache skip override set', async () => {
        const { container, getByLabelText, getByTitle } = renderForm();
        await waitFor(() => getByTitle(t('taskVersion')));

        const inputElement = await waitFor(() =>
          getByLabelText(t('overwriteCache'), { exact: false }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).not.toBeChecked();

        await fillInputs(container);
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());
        fireEvent.click(submitButton);

        await waitFor(() =>
          expect(mockCreateWorkflowExecution).toHaveBeenCalledWith(
            expect.objectContaining({
              overwriteCache: false,
            }),
          ),
        );
      });

      it('should submit with cache skip override enabled', async () => {
        const initialParameters: TaskInitialLaunchParameters = {
          overwriteCache: true,
        };
        const { container, getByLabelText, getByTitle } = renderForm({ initialParameters });
        await waitFor(() => getByTitle(t('taskVersion')));

        const inputElement = await waitFor(() =>
          getByLabelText(t('overwriteCache'), { exact: false }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toBeChecked();

        await fillInputs(container);
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());
        fireEvent.click(submitButton);

        await waitFor(() =>
          expect(mockCreateWorkflowExecution).toHaveBeenCalledWith(
            expect.objectContaining({
              overwriteCache: true,
            }),
          ),
        );
      });

      it('should submit with cache skip override disabled', async () => {
        const initialParameters: TaskInitialLaunchParameters = {
          overwriteCache: false,
        };
        const { container, getByLabelText, getByTitle } = renderForm({ initialParameters });
        await waitFor(() => getByTitle(t('taskVersion')));

        const inputElement = await waitFor(() =>
          getByLabelText(t('overwriteCache'), { exact: false }),
        );
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).not.toBeChecked();

        await fillInputs(container);
        const submitButton = await waitFor(() => getSubmitButton(container));
        await waitFor(() => expect(submitButton).toBeEnabled());
        fireEvent.click(submitButton);

        await waitFor(() =>
          expect(mockCreateWorkflowExecution).toHaveBeenCalledWith(
            expect.objectContaining({
              overwriteCache: false,
            }),
          ),
        );
      });
    });
  });

  describe('overwrite cache', () => {
    beforeEach(() => {
      const { simpleString, simpleInteger, simpleFloat, simpleBoolean } =
        cloneDeep(mockSimpleVariables);
      // Only taking supported variable types since they are all required.
      variables = {
        simpleString,
        simpleInteger,
        simpleFloat,
        simpleBoolean,
      };
      createMocks();
    });

    it('should render checkbox', async () => {
      const { getByLabelText } = renderForm();
      const inputElement = await waitFor(() =>
        getByLabelText(t('overwriteCache'), { exact: false }),
      );
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).not.toBeChecked();
    });

    it('should use initial values when provided', async () => {
      const initialParameters: TaskInitialLaunchParameters = {
        taskId: mockTask.id,
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

    it('should submit without cache skip override set', async () => {
      const { container, getByLabelText, getByTitle } = renderForm();
      await waitFor(() => getByTitle(t('taskVersion')));

      const inputElement = await waitFor(() =>
        getByLabelText(t('overwriteCache'), { exact: false }),
      );
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).not.toBeChecked();

      await fillInputs(container);

      const submitButton = await waitFor(() => getSubmitButton(container));
      await waitFor(() => expect(submitButton).toBeEnabled());
      fireEvent.click(submitButton);

      await waitFor(() =>
        expect(mockCreateWorkflowExecution).toHaveBeenCalledWith(
          expect.objectContaining({
            overwriteCache: false,
          }),
        ),
      );
    });

    it('should submit with cache skip override enabled', async () => {
      const initialParameters: TaskInitialLaunchParameters = {
        overwriteCache: true,
      };
      const { container, getByLabelText, getByTitle } = renderForm({ initialParameters });
      await waitFor(() => getByTitle(t('taskVersion')));

      const inputElement = await waitFor(() =>
        getByLabelText(t('overwriteCache'), { exact: false }),
      );
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).toBeChecked();

      await fillInputs(container);

      const submitButton = await waitFor(() => getSubmitButton(container));
      await waitFor(() => expect(submitButton).toBeEnabled());
      fireEvent.click(submitButton);

      await waitFor(() =>
        expect(mockCreateWorkflowExecution).toHaveBeenCalledWith(
          expect.objectContaining({
            overwriteCache: true,
          }),
        ),
      );
    });

    it('should submit with cache skip override disabled', async () => {
      const initialParameters: TaskInitialLaunchParameters = {
        overwriteCache: false,
      };
      const { container, getByLabelText, getByTitle } = renderForm({
        initialParameters,
      });
      await waitFor(() => getByTitle(t('taskVersion')));
      const inputElement = await waitFor(() =>
        getByLabelText(t('overwriteCache'), { exact: false }),
      );
      expect(inputElement).toBeInTheDocument();
      expect(inputElement).not.toBeChecked();
      await fillInputs(container);

      const submitButton = await waitFor(() => getSubmitButton(container));
      await waitFor(() => expect(submitButton).toBeEnabled());

      await fireEvent.click(submitButton);

      await waitFor(() =>
        expect(mockCreateWorkflowExecution).toHaveBeenCalledWith(
          expect.objectContaining({
            overwriteCache: false,
          }),
        ),
      );
    });
  });
});
