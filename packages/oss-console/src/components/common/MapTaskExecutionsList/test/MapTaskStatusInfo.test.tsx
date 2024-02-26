import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { noLogsFoundString } from '../../../Executions/constants';
import { getTaskExecutionPhaseConstants } from '../../../Executions/utils';
import { TaskExecutionPhase } from '../../../../models/Execution/enums';
import { mockExecution as mockTaskExecution } from '../../../../models/Execution/__mocks__/mockTaskExecutionsData';
import { MapTaskStatusInfo } from '../MapTaskStatusInfo';

const externalResourcesByPhase = [
  {
    externalId: '123',
    index: 1,
    retryAttempt: 1,
    phase: 1,
    cacheStatus: 1,
    logs: [
      { uri: '#', name: 'Kubernetes Logs #0-0' },
      { uri: '#', name: 'Kubernetes Logs #0-1' },
      { uri: '#', name: 'Kubernetes Logs #0-2' },
    ],
  },
];

describe('MapTaskStatusInfo', () => {
  it('Phase and amount of links rendered correctly', async () => {
    const phase = TaskExecutionPhase.RUNNING;
    const phaseData = getTaskExecutionPhaseConstants(phase);

    const { queryByText, getByTitle } = render(
      <MapTaskStatusInfo
        externalResourcesByPhase={externalResourcesByPhase}
        phase={phase}
        taskExecution={mockTaskExecution}
        onTaskSelected={jest.fn()}
      />,
    );

    expect(queryByText(phaseData.text)).toBeInTheDocument();
    expect(queryByText(`×${externalResourcesByPhase.length}`)).toBeInTheDocument();
    expect(queryByText('Logs')).not.toBeInTheDocument();

    // Expand item - see logs section
    const buttonEl = getByTitle('Expand row');
    await fireEvent.click(buttonEl);

    expect(queryByText('MyTask-0')).toBeInTheDocument();
  });

  it('Phase with no links show proper texts when opened', () => {
    const phase = TaskExecutionPhase.ABORTED;
    const phaseData = getTaskExecutionPhaseConstants(phase);

    const { queryByText } = render(
      <MapTaskStatusInfo
        externalResourcesByPhase={[]}
        phase={phase}
        selectedPhase={phase}
        taskExecution={mockTaskExecution}
        onTaskSelected={jest.fn()}
      />,
    );

    expect(queryByText(phaseData.text)).toBeInTheDocument();
    expect(queryByText(`×0`)).toBeInTheDocument();
    expect(queryByText(noLogsFoundString)).toBeInTheDocument();
  });
});
