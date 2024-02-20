import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '@clients/theme/Theme/muiTheme';
import { mockExecution as mockTaskExecution } from '../../../../models/Execution/__mocks__/mockTaskExecutionsData';
import { renderTest } from '../../../../test/renderUtils';
import { TaskNameList } from '../TaskNameList';

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

const externalResourcesByPhaseWithoutUri = [
  {
    externalId: '123',
    index: 1,
    retryAttempt: 1,
    phase: 1,
    cacheStatus: 1,
    logs: [
      { name: 'Kubernetes Logs #0-0' },
      { name: 'Kubernetes Logs #0-1' },
      { name: 'Kubernetes Logs #0-2' },
    ],
  },
];

describe('TaskNameList', () => {
  it('should render log names in color if they have URI', async () => {
    const { queryAllByTestId } = renderTest(
      <ThemeProvider theme={muiTheme}>
        <TaskNameList
          externalResourcesByPhase={externalResourcesByPhase}
          taskExecution={mockTaskExecution}
          onTaskSelected={jest.fn()}
        />
      </ThemeProvider>,
    );

    const logs = queryAllByTestId('map-task-log');
    expect(logs).toHaveLength(externalResourcesByPhase.length);
    logs.forEach((log) => {
      expect(log).toBeInTheDocument();
    });
  });

  it('should render log names in black if they have URI', () => {
    const { queryAllByTestId } = renderTest(
      <TaskNameList
        externalResourcesByPhase={externalResourcesByPhaseWithoutUri}
        taskExecution={mockTaskExecution}
        onTaskSelected={jest.fn()}
      />,
    );

    const logs = queryAllByTestId('map-task-log');
    expect(logs).toHaveLength(externalResourcesByPhaseWithoutUri.length);
    logs.forEach((log) => {
      expect(log).toBeInTheDocument();
    });
  });
});
