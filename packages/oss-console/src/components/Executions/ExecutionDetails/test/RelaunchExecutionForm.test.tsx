import * as React from 'react';
import { render, waitFor } from '@testing-library/react';
import Admin from '@clients/common/flyteidl/admin';
import Protobuf from '@clients/common/flyteidl/protobuf';
import { APIContext, APIContextValue } from '../../../data/apiContext';
import { mockAPIContextValue } from '../../../data/__mocks__/apiContext';
import { LaunchForm } from '../../../Launch/LaunchForm/LaunchForm';
import { LaunchFormProps, LiteralValueMap } from '../../../Launch/LaunchForm/types';
import {
  createInputCacheKey,
  getInputDefintionForLiteralType,
} from '../../../Launch/LaunchForm/utils';
import { mockSimpleVariables } from '../../../Launch/LaunchForm/__mocks__/mockInputs';
import { primitiveLiteral } from '../../../Launch/LaunchForm/__mocks__/utils';
import { LiteralMap, ResourceType, Variable } from '../../../../models/Common/types';
import { getExecutionData } from '../../../../models/Execution/api';
import { Execution, ExecutionData } from '../../../../models/Execution/types';
import { getTask } from '../../../../models/Task/api';
import { Task } from '../../../../models/Task/types';
import { getWorkflow } from '../../../../models/Workflow/api';
import { Workflow } from '../../../../models/Workflow/types';
import { createMockExecution } from '../../../../models/__mocks__/executionsData';
import { createMockTask } from '../../../../models/__mocks__/taskData';
import {
  createMockWorkflow,
  createMockWorkflowClosure,
} from '../../../../models/__mocks__/workflowData';
import { long } from '../../../../test/utils';
import { RelaunchExecutionForm } from '../RelaunchExecutionForm';

const mockContentString = 'launchFormRendered';
const simpleStringValue = 'abcdefg';
const simpleIntegerValue = long(123456);

jest.mock('../../../../components/Launch/LaunchForm/LaunchForm', () => ({
  LaunchForm: jest.fn(() => mockContentString),
}));

jest.mock('../../../../components/common/WaitForData', () => ({
  WaitForData: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

function createValuesMap(
  inputDefinitions: Record<string, Variable>,
  { literals }: LiteralMap,
): LiteralValueMap {
  return Object.entries(inputDefinitions).reduce((out, [name, input]) => {
    out.set(createInputCacheKey(name, getInputDefintionForLiteralType(input.type)), literals[name]);
    return out;
  }, new Map());
}

describe('RelaunchExecutionForm', () => {
  let apiContext: APIContextValue;
  let execution: Execution;
  let executionData: ExecutionData;
  let executionInputs: LiteralMap;
  let workflow: Workflow;
  let task: Task;
  let taskInputDefinitions: Record<string, Variable>;
  let workflowInputDefinitions: Record<string, Variable>;
  let onClose: jest.Mock;
  let mockGetWorkflow: jest.Mock<ReturnType<typeof getWorkflow>>;
  let mockGetTask: jest.Mock<ReturnType<typeof getTask>>;
  let mockGetExecutionData: jest.Mock<ReturnType<typeof getExecutionData>>;

  beforeEach(() => {
    onClose = jest.fn();
    execution = createMockExecution();
    workflow = createMockWorkflow('MyWorkflow');
    workflow.closure = createMockWorkflowClosure();
    task = createMockTask('MyTask');
    executionData = {
      inputs: { url: 'http://somePath', bytes: long(1000) },
      outputs: {},
      fullInputs: null,
      fullOutputs: null,
    };

    mockGetWorkflow = jest.fn().mockResolvedValue(workflow);
    mockGetTask = jest.fn().mockResolvedValue(task);
    mockGetExecutionData = jest.fn().mockResolvedValue(executionData);
    apiContext = mockAPIContextValue({
      getExecutionData: mockGetExecutionData,
      getTask: mockGetTask,
      getWorkflow: mockGetWorkflow,
    });
  });

  const renderForm = () =>
    render(
      <APIContext.Provider value={apiContext}>
        <RelaunchExecutionForm execution={execution} onClose={onClose} />
      </APIContext.Provider>,
    );

  const checkLaunchFormProps = (props: Partial<LaunchFormProps>) => {
    expect(LaunchForm).toHaveBeenCalledWith(expect.objectContaining(props), expect.anything());
  };

  it('passes original execution as a referenceExecution', async () => {
    const { getByText } = renderForm();
    await waitFor(() => expect(getByText(mockContentString)).toBeDefined());
    checkLaunchFormProps({
      referenceExecutionId: expect.objectContaining(execution.id),
    });
  });

  describe('with workflow execution', () => {
    let values: LiteralValueMap;
    beforeEach(() => {
      workflowInputDefinitions = {
        workflowSimpleString: mockSimpleVariables.simpleString,
        workflowSimpleInteger: mockSimpleVariables.simpleInteger,
      };

      workflow.closure!.compiledWorkflow!.primary.template.interface!.inputs = {
        variables: workflowInputDefinitions,
      };

      executionInputs = {
        literals: {
          workflowSimpleString: primitiveLiteral({
            stringValue: simpleStringValue,
          }),
          workflowSimpleInteger: primitiveLiteral({
            integer: simpleIntegerValue,
          }),
        },
      };
      execution.closure.computedInputs = executionInputs;

      values = createValuesMap(workflowInputDefinitions, executionInputs);
    });

    it('passes workflowId to LaunchForm', async () => {
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        workflowId: expect.objectContaining(execution.closure.workflowId),
      });
    });

    it('maps execution input values to workflow inputs', async () => {
      const { getByText } = renderForm();
      await waitFor(() => getByText(mockContentString));

      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          values,
        }),
      });
    });

    it('correctly fetches remote execution inputs', async () => {
      delete execution.closure.computedInputs;
      const { getByText } = renderForm();
      await waitFor(() => getByText(mockContentString));
      expect(mockGetExecutionData).toHaveBeenCalledWith(execution.id);
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          values,
        }),
      });
    });

    it('should not set interruptible value if not provided', async () => {
      delete execution.spec.interruptible;
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          interruptible: undefined,
        }),
      });
    });

    it('should have correct interruptible value if override is enabled', async () => {
      execution.spec.interruptible = Protobuf.BoolValue.create({ value: true });
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          interruptible: Protobuf.BoolValue.create({ value: true }),
        }),
      });
    });

    it('should have correct interruptible value if override is disabled', async () => {
      execution.spec.interruptible = Protobuf.BoolValue.create({
        value: false,
      });
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          interruptible: Protobuf.BoolValue.create({ value: false }),
        }),
      });
    });

    it('should not set cache overwrite value if not provided', async () => {
      delete execution.spec.overwriteCache;
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          overwriteCache: undefined,
        }),
      });
    });

    it('should have correct cache overwrite value if override is enabled', async () => {
      execution.spec.overwriteCache = true;
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          overwriteCache: true,
        }),
      });
    });

    it('should have correct cache overwrite value if override is disabled', async () => {
      execution.spec.overwriteCache = false;
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          overwriteCache: false,
        }),
      });
    });
  });

  describe('Launch form with full inputs', () => {
    let values: LiteralValueMap;
    beforeEach(() => {
      workflowInputDefinitions = {
        workflowSimpleString: mockSimpleVariables.simpleString,
        workflowSimpleInteger: mockSimpleVariables.simpleInteger,
      };
      workflow.closure!.compiledWorkflow!.primary.template.interface!.inputs = {
        variables: workflowInputDefinitions,
      };
      executionInputs = {
        literals: {
          workflowSimpleString: primitiveLiteral({
            stringValue: simpleStringValue,
          }),
          workflowSimpleInteger: primitiveLiteral({
            integer: simpleIntegerValue,
          }),
        },
      };
      executionData.fullInputs = executionInputs;
      execution.closure.computedInputs = executionInputs;
      values = createValuesMap(workflowInputDefinitions, executionInputs);
    });
    it('correctly uses fullInputs', async () => {
      delete execution.closure.computedInputs;
      const { getByText } = renderForm();
      await waitFor(() => getByText(mockContentString));
      expect(mockGetExecutionData).toHaveBeenCalledWith(execution.id);
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          values,
        }),
      });
    });

    it('should not set cache overwrite value if not provided', async () => {
      delete execution.spec.overwriteCache;
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          overwriteCache: undefined,
        }),
      });
    });

    it('should have correct cache overwrite value if override is enabled', async () => {
      execution.spec.overwriteCache = true;
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          overwriteCache: true,
        }),
      });
    });

    it('should have correct cache overwrite value if override is disabled', async () => {
      execution.spec.overwriteCache = false;
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          overwriteCache: false,
        }),
      });
    });
  });

  describe('with single task execution', () => {
    let values: LiteralValueMap;
    let authRole: Admin.IAuthRole;
    beforeEach(() => {
      authRole = {
        assumableIamRole: 'arn:aws:iam::12345678:role/defaultrole',
      };
      execution.spec.launchPlan.resourceType = ResourceType.TASK;
      execution.spec.authRole = { ...authRole };
      taskInputDefinitions = {
        taskSimpleString: mockSimpleVariables.simpleString,
        taskSimpleInteger: mockSimpleVariables.simpleInteger,
      };
      task.closure.compiledTask.template.interface!.inputs = {
        variables: taskInputDefinitions,
      };

      executionInputs = {
        literals: {
          taskSimpleString: primitiveLiteral({
            stringValue: simpleStringValue,
          }),
          taskSimpleInteger: primitiveLiteral({
            integer: simpleIntegerValue,
          }),
        },
      };
      execution.closure.computedInputs = executionInputs;
      values = createValuesMap(taskInputDefinitions, executionInputs);
    });

    it('passes taskId to LaunchForm', async () => {
      renderForm();
      await waitFor(() =>
        checkLaunchFormProps({
          taskId: execution.spec.launchPlan,
        }),
      );
    });

    it('passes authRole from original execution', async () => {
      const { getByText } = renderForm();
      await waitFor(() => getByText(mockContentString));

      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          authRole,
        }),
      });
    });

    it('maps execution input values to workflow inputs', async () => {
      const { getByText } = renderForm();
      await waitFor(() => getByText(mockContentString));

      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          values,
        }),
      });
    });

    it('should not set interruptible value if not provided', async () => {
      delete execution.spec.interruptible;
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          interruptible: undefined,
        }),
      });
    });

    it('should have correct interruptible value if override is enabled', async () => {
      execution.spec.interruptible = Protobuf.BoolValue.create({ value: true });
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          interruptible: Protobuf.BoolValue.create({ value: true }),
        }),
      });
    });

    it('should have correct interruptible value if override is disabled', async () => {
      execution.spec.interruptible = Protobuf.BoolValue.create({
        value: false,
      });
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          interruptible: Protobuf.BoolValue.create({ value: false }),
        }),
      });
    });

    it('should not set cache overwrite value if not provided', async () => {
      delete execution.spec.overwriteCache;
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          overwriteCache: undefined,
        }),
      });
    });

    it('should have correct cache overwrite value if override is enabled', async () => {
      execution.spec.overwriteCache = true;
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          overwriteCache: true,
        }),
      });
    });

    it('should have correct cache overwrite value if override is disabled', async () => {
      execution.spec.overwriteCache = false;
      const { getByText } = renderForm();
      await waitFor(() => expect(getByText(mockContentString)));
      checkLaunchFormProps({
        initialParameters: expect.objectContaining({
          overwriteCache: false,
        }),
      });
    });
  });
});
