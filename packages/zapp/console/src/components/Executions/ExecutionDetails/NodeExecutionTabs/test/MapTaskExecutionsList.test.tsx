import { render } from '@testing-library/react';
import { taskExecutionPhaseConstants } from 'components/Executions/constants';
import { TaskExecutionPhase } from 'models/Execution/enums';
import * as React from 'react';
import { MapTaskExecutionsList, MapTaskLogs } from '../MapTaskExecutionsList';
import { mapTask } from './mapTask.mock';

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
