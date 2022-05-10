import { render } from '@testing-library/react';
import { taskExecutionPhaseConstants } from 'components/Executions/constants';
import { TaskExecutionPhase } from 'models/Execution/enums';
import * as React from 'react';
import { MapTaskExecutionsList, MapTaskLogs } from '../MapTaskExecutionsList';

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

describe('MapTaskExecutionsList', () => {
  describe('MapTaskLogs', () => {
    it('should render map task logs when all props were provided', async () => {
      const { queryByText } = render(
        <MapTaskLogs
          phase={TaskExecutionPhase.SUCCEEDED}
          retryAttempt={0}
          logs={mapTask[0].logs}
        />,
      );

      expect(queryByText('Attempt 01')).toBeInTheDocument();
      expect(
        queryByText(taskExecutionPhaseConstants[TaskExecutionPhase.SUCCEEDED].text),
      ).toBeInTheDocument();
      expect(queryByText(mapTask[0].logs[0].name)).toBeInTheDocument();
    });
    it('should NOT render logs section if they were NOT provided', async () => {
      const { queryByText } = render(
        <MapTaskLogs phase={TaskExecutionPhase.SUCCEEDED} retryAttempt={1} />,
      );

      expect(queryByText('Attempt 02')).toBeInTheDocument();
      expect(
        queryByText(taskExecutionPhaseConstants[TaskExecutionPhase.SUCCEEDED].text),
      ).toBeInTheDocument();
      expect(queryByText(mapTask[0].logs[0].name)).not.toBeInTheDocument();
    });
    it('should NOT render phase if it was NOT provided', async () => {
      const { queryByText } = render(<MapTaskLogs retryAttempt={0} />);

      expect(queryByText('Attempt 01')).toBeInTheDocument();
      expect(
        queryByText(taskExecutionPhaseConstants[TaskExecutionPhase.SUCCEEDED].text),
      ).not.toBeInTheDocument();
      expect(queryByText(mapTask[0].logs[0].name)).not.toBeInTheDocument();
    });
    it('should render "Attempt 01" if retryAttempt is NULL', async () => {
      const { queryByText } = render(<MapTaskLogs retryAttempt={null} />);

      expect(queryByText('Attempt 01')).toBeInTheDocument();
      expect(
        queryByText(taskExecutionPhaseConstants[TaskExecutionPhase.SUCCEEDED].text),
      ).not.toBeInTheDocument();
      expect(queryByText(mapTask[0].logs[0].name)).not.toBeInTheDocument();
    });
    it('should render "Attempt 01" if retryAttempt was NOT provided', async () => {
      const { queryByText } = render(<MapTaskLogs />);

      expect(queryByText('Attempt 01')).toBeInTheDocument();
      expect(
        queryByText(taskExecutionPhaseConstants[TaskExecutionPhase.SUCCEEDED].text),
      ).not.toBeInTheDocument();
      expect(queryByText(mapTask[0].logs[0].name)).not.toBeInTheDocument();
    });
  });

  describe('MapTaskExecutionsList', () => {
    it('should render map task executions list', async () => {
      const { queryAllByText } = render(<MapTaskExecutionsList mapTask={mapTask} />);

      expect(queryAllByText('Attempt 01')).toHaveLength(3);
    });
  });
});
