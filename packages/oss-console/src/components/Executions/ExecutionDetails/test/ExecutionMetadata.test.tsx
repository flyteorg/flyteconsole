import { getByTestId, render } from '@testing-library/react';
import Protobuf from '@clients/common/flyteidl/protobuf';
import * as React from 'react';
import { MemoryRouter } from 'react-router';
import { dashedValueString } from '@clients/common/constants';
import { Execution } from '../../../../models/Execution/types';
import { createMockExecution } from '../../../../models/__mocks__/executionsData';
import { ExecutionContext } from '../../contexts';
import { ExecutionMetadataLabels } from '../constants';
import { ExecutionMetadata } from '../ExecutionMetadata';

const clusterTestId = `metadata-${ExecutionMetadataLabels.cluster}`;
const startTimeTestId = `metadata-${ExecutionMetadataLabels.time}`;
const durationTestId = `metadata-${ExecutionMetadataLabels.duration}`;
const interruptibleTestId = `metadata-${ExecutionMetadataLabels.interruptible}`;
const overwriteCacheTestId = `metadata-${ExecutionMetadataLabels.overwriteCache}`;
const relatedToTestId = `metadata-${ExecutionMetadataLabels.relatedTo}`;
const parentNodeExecutionTestId = `metadata-${ExecutionMetadataLabels.parent}`
const labelsTestId = `metadata-${ExecutionMetadataLabels.labels}`;

jest.mock('../../../../models/Launch/api', () => ({
  getLaunchPlan: jest.fn(() => Promise.resolve({ spec: {} })),
}));

describe('ExecutionMetadata', () => {
  let execution: Execution;
  beforeEach(() => {
    execution = createMockExecution();
  });

  const renderMetadata = () =>
    render(
      <MemoryRouter>
        <ExecutionContext.Provider
          value={{
            execution,
          }}
        >
          <ExecutionMetadata />
        </ExecutionContext.Provider>
      </MemoryRouter>,
    );

  it('shows cluster name if available', () => {
    const { getByTestId } = renderMetadata();

    expect(execution.spec.metadata.systemMetadata?.executionCluster).toBeDefined();
    expect(getByTestId(clusterTestId)).toHaveTextContent(
      execution.spec.metadata.systemMetadata!.executionCluster!,
    );
  });

  it('shows empty string for cluster if no metadata', () => {
    delete execution.spec.metadata.systemMetadata;
    const { getByTestId } = renderMetadata();
    expect(getByTestId(clusterTestId)).toHaveTextContent(dashedValueString);
  });

  it('shows empty string for cluster if no cluster name', () => {
    delete execution.spec.metadata.systemMetadata?.executionCluster;
    const { getByTestId } = renderMetadata();
    expect(getByTestId(clusterTestId)).toHaveTextContent(dashedValueString);
  });

  it('shows empty string for start time if not available', () => {
    delete execution.closure.startedAt;
    const { getByTestId } = renderMetadata();
    expect(getByTestId(startTimeTestId)).toHaveTextContent(dashedValueString);
  });

  it('shows empty string for duration if not available', () => {
    delete execution.closure.duration;
    const { getByTestId } = renderMetadata();
    expect(getByTestId(durationTestId)).toHaveTextContent(dashedValueString);
  });

  it('shows true if execution was marked as interruptible', () => {
    execution.spec.interruptible = Protobuf.BoolValue.create({ value: true });
    const { getByTestId } = renderMetadata();
    expect(getByTestId(interruptibleTestId)).toHaveTextContent('true');
  });

  it('shows false if execution was not marked as interruptible', () => {
    execution.spec.interruptible = Protobuf.BoolValue.create({ value: false });
    const { getByTestId } = renderMetadata();
    expect(getByTestId(interruptibleTestId)).toHaveTextContent('false');
  });

  it('shows dashes if no interruptible value is found in execution spec', () => {
    delete execution.spec.interruptible;
    const { getByTestId } = renderMetadata();
    expect(getByTestId(interruptibleTestId)).toHaveTextContent(dashedValueString);
  });

  it('shows true if cache was overwritten for execution', () => {
    execution.spec.overwriteCache = true;
    const { getByTestId } = renderMetadata();
    expect(getByTestId(overwriteCacheTestId)).toHaveTextContent('true');
  });

  it('shows false if cache was not overwritten for execution', () => {
    execution.spec.overwriteCache = false;
    const { getByTestId } = renderMetadata();
    expect(getByTestId(overwriteCacheTestId)).toHaveTextContent('false');
  });

  it('shows false if no cache overwrite value is found in execution spec', () => {
    delete execution.spec.overwriteCache;
    const { getByTestId } = renderMetadata();
    expect(getByTestId(overwriteCacheTestId)).toHaveTextContent('false');
  });

  it('shows related to if metadata is available', () => {
    const { getByTestId } = renderMetadata();
    expect(getByTestId(relatedToTestId)).toHaveTextContent('name');
  })

  it('shows parent execution if metadata is available', () => {
    const { getByTestId } = renderMetadata();
    expect(getByTestId(parentNodeExecutionTestId)).toHaveTextContent('name');
  })

  it('shows labels if spec has them', () => {
    const { getByTestId } = renderMetadata();
    expect(getByTestId(labelsTestId)).toHaveTextContent("key: value");
  })
});
