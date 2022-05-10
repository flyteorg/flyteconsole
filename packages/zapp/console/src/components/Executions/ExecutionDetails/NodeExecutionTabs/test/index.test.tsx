import { render, screen, waitFor } from '@testing-library/react';
import { useTabState } from 'components/hooks/useTabState';
import { long } from 'test/utils';
import * as React from 'react';
import { NodeExecutionTabs } from '../index';

const mapTask = [
  {
    logs: [
      {
        uri: 'http://localhost:30082/#!/log/flytesnacks-development/fc027ce9fe4cf4f5eba8-n0-0-0/pod?namespace=flytesnacks-development',
        name: 'Kubernetes Logs #0-0',
        messageFormat: 2,
      },
    ],
    externalId: 'fc027ce9fe4cf4f5eba8-n0-0-0',
    phase: 3,
  },
  {
    logs: [
      {
        uri: 'http://localhost:30082/#!/log/flytesnacks-development/fc027ce9fe4cf4f5eba8-n0-0-1/pod?namespace=flytesnacks-development',
        name: 'Kubernetes Logs #0-1',
        messageFormat: 2,
      },
    ],
    externalId: 'fc027ce9fe4cf4f5eba8-n0-0-1',
    index: 1,
    phase: 3,
  },
  {
    logs: [
      {
        uri: 'http://localhost:30082/#!/log/flytesnacks-development/fc027ce9fe4cf4f5eba8-n0-0-2/pod?namespace=flytesnacks-development',
        name: 'Kubernetes Logs #0-2',
        messageFormat: 2,
      },
    ],
    externalId: 'fc027ce9fe4cf4f5eba8-n0-0-2',
    index: 2,
    phase: 3,
  },
];

const nodeExecution = {
  id: {
    nodeId: 'n0',
    executionId: {
      project: 'flytesnacks',
      domain: 'development',
      name: 'fc027ce9fe4cf4f5eba8',
    },
  },
  inputUri:
    's3://flyte-demo/metadata/propeller/flytesnacks-development-fc027ce9fe4cf4f5eba8/n0/data/inputs.pb',
  closure: {
    phase: 3,
    startedAt: {
      seconds: long(0),
      nanos: 773100279,
    },
    duration: {
      seconds: long(0),
      nanos: 800572640,
    },
    createdAt: {
      seconds: long(0),
      nanos: 697168683,
    },
    updatedAt: {
      seconds: long(0),
      nanos: 573672640,
    },
    outputUri:
      's3://flyte-demo/metadata/propeller/flytesnacks-development-fc027ce9fe4cf4f5eba8/n0/data/0/outputs.pb',
  },
  metadata: {
    specNodeId: 'n0',
  },
  scopedId: 'n0',
};

jest.mock('components/hooks/useTabState');

describe('NodeExecutionTabs', () => {
  const mockUseTabState = useTabState as jest.Mock<any>;
  mockUseTabState.mockReturnValue({ onChange: jest.fn(), value: 'executions' });
  describe('with map tasks', () => {
    it('should render map task logs when it was provided and shouldShow is TRUE', async () => {
      const { queryAllByRole } = render(
        <NodeExecutionTabs
          nodeExecution={nodeExecution}
          shouldShowMapTaskInfo={true}
          mapTask={mapTask}
        />,
      );
      const mapTaskList = await waitFor(() => screen.getByTestId('map-task-list'));

      expect(queryAllByRole('tab')).toHaveLength(3);
      expect(mapTaskList).toBeInTheDocument();
    });
    it('should NOT render map task logs when it was provided and shouldShow is FALSE', async () => {
      const { queryAllByRole } = render(
        <NodeExecutionTabs
          nodeExecution={nodeExecution}
          shouldShowMapTaskInfo={false}
          mapTask={mapTask}
        />,
      );

      const mapTaskList = await waitFor(() => screen.queryByTestId('map-task-list'));
      expect(queryAllByRole('tab')).toHaveLength(3);
      expect(mapTaskList).not.toBeInTheDocument();
    });
  });

  describe('without map tasks', () => {
    it('should render task executions when mapTask was not provided', async () => {
      const { queryAllByRole, queryByText } = render(
        <NodeExecutionTabs nodeExecution={nodeExecution} shouldShowMapTaskInfo={false} />,
      );

      const mapTaskList = await waitFor(() => screen.queryByTestId('map-task-list'));
      expect(queryAllByRole('tab')).toHaveLength(3);
      expect(mapTaskList).not.toBeInTheDocument();
      expect(queryByText('Executions')).toBeInTheDocument();
    });
  });
});
