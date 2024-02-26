import set from 'lodash/set';
import * as React from 'react';
import { waitFor } from '@testing-library/react';
import { SimpleType, TypedInterface, Variable } from '../../../models/Common/types';
import { Task } from '../../../models/Task/types';
import { renderTest } from '../../../test/renderUtils';
import { EntityCardError } from '../../common/EntityCardError';
import { SimpleTaskInterface } from '../SimpleTaskInterface';

function setTaskInterface(task: Task, values: TypedInterface): Task {
  return set(task, 'closure.compiledTask.template.interface', values);
}

describe('SimpleTaskInterface', () => {
  const values: Record<string, Partial<Variable>> = {
    value2: { type: { simple: SimpleType.INTEGER } },
    value1: { type: { simple: SimpleType.INTEGER } },
  };

  it('shows loading state', async () => {
    const task = setTaskInterface(
      {} as Task,
      {
        inputs: { variables: { ...values } },
      } as TypedInterface,
    );

    const { getAllByTestId } = renderTest(
      <SimpleTaskInterface
        isLoading
        isError={false}
        ErrorComponent={() => (
          <EntityCardError errorMessage="Failed to load task interface details." />
        )}
        task={task as Task}
      />,
    );
    await waitFor(() => {
      const shimmer = getAllByTestId('shimmer');
      return expect(shimmer.length).toBe(3);
    });
  });

  it('shows error state', async () => {
    const task = setTaskInterface(
      {} as Task,
      {
        inputs: { variables: { ...values } },
      } as TypedInterface,
    );

    const errorMessage = 'Failed to load task interface details.';

    const { getAllByText } = renderTest(
      <SimpleTaskInterface
        isLoading={false}
        isError
        ErrorComponent={() => <EntityCardError errorMessage={errorMessage} />}
        task={task as Task}
      />,
    );
    await waitFor(() => {
      const shimmer = getAllByText(errorMessage);
      return expect(shimmer.length).toBe(3);
    });
  });

  it('renders sorted inputs', async () => {
    const task = setTaskInterface(
      {} as Task,
      {
        inputs: { variables: { ...values } },
      } as TypedInterface,
    );

    const { getAllByText } = renderTest(
      <SimpleTaskInterface
        isLoading={false}
        isError={false}
        ErrorComponent={() => (
          <EntityCardError errorMessage="Failed to load task interface details." />
        )}
        task={task as Task}
      />,
    );
    await waitFor(() => {
      const labels = getAllByText(/value/);
      expect(labels.length).toBe(2);
      expect(labels[0]).toHaveTextContent(/value1/);
      expect(labels[1]).toHaveTextContent(/value2/);
    });
  });

  it('renders sorted outputs', async () => {
    const task = setTaskInterface(
      {} as Task,
      {
        outputs: { variables: { ...values } },
      } as TypedInterface,
    );

    const { getAllByText } = renderTest(
      <SimpleTaskInterface
        isLoading={false}
        isError={false}
        ErrorComponent={() => (
          <EntityCardError errorMessage="Failed to load task interface details." />
        )}
        task={task as Task}
      />,
    );
    await waitFor(() => {
      const labels = getAllByText(/value/);
      expect(labels.length).toBe(2);
      expect(labels[0]).toHaveTextContent(/value1/);
      expect(labels[1]).toHaveTextContent(/value2/);
    });
  });
});
