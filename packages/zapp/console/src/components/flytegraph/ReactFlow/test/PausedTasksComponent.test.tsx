import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { dTypes } from 'models/Graph/types';
import { PausedTasksComponent } from '../PausedTasksComponent';

const pausedNodes = [
  {
    id: 'n1',
    scopedId: 'n1',
    type: dTypes.gateNode,
    name: 'node1',
    nodes: [],
    edges: [],
  },
  {
    id: 'n2',
    scopedId: 'n2',
    type: dTypes.gateNode,
    name: 'node2',
    nodes: [],
    edges: [],
  },
];

describe('flytegraph > ReactFlow > PausedTasksComponent', () => {
  const renderComponent = (props) => render(<PausedTasksComponent {...props} />);

  it('should render just the Paused Tasks button, if initialIsVisible was not passed', () => {
    const { queryByTitle, queryByTestId } = renderComponent({ pausedNodes });
    expect(queryByTitle('Paused Tasks')).toBeInTheDocument();
    expect(queryByTestId('paused-tasks-table')).not.toBeInTheDocument();
  });

  it('should render just the Paused Tasks button, if initialIsVisible is false', () => {
    const { queryByTitle, queryByTestId } = renderComponent({
      pausedNodes,
      initialIsVisible: false,
    });
    expect(queryByTitle('Paused Tasks')).toBeInTheDocument();
    expect(queryByTestId('paused-tasks-table')).not.toBeInTheDocument();
  });

  it('should render Paused Tasks table, if initialIsVisible is true', () => {
    const { queryByTitle, queryByTestId, queryAllByTestId } = renderComponent({
      pausedNodes,
      initialIsVisible: true,
    });
    expect(queryByTitle('Paused Tasks')).toBeInTheDocument();
    expect(queryByTestId('paused-tasks-table')).toBeInTheDocument();
    expect(queryAllByTestId('task-name-item').length).toEqual(pausedNodes.length);
  });

  it('should render Paused Tasks table on button click, and hide it, when clicked again', async () => {
    const { getByRole, queryByTitle, queryByTestId } = renderComponent({ pausedNodes });
    expect(queryByTitle('Paused Tasks')).toBeInTheDocument();
    expect(queryByTestId('paused-tasks-table')).not.toBeInTheDocument();

    const button = getByRole('button');
    await fireEvent.click(button);

    expect(queryByTestId('paused-tasks-table')).toBeInTheDocument();

    await fireEvent.click(button);

    expect(queryByTestId('paused-tasks-table')).not.toBeInTheDocument();
  });
});
