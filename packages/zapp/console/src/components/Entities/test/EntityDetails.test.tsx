import { render, waitFor, screen, within } from '@testing-library/react';
import { ResourceIdentifier, Task, Workflow } from '@flyteconsole/components';
import * as React from 'react';
import { createMockTask } from 'models/__mocks__/taskData';
import { createMockWorkflow } from 'models/__mocks__/workflowData';
import { projects } from 'mocks/data/projects';
import * as projectApi from '@flyteconsole/components';
import { MemoryRouter } from 'react-router';
import { EntityDetails } from '../EntityDetails';

jest.mock('@flyteconsole/components');
jest.mock('@flyteconsole/components', () => {
  const originalModule = jest.requireActual('@flyteconsole/components');

  return {
    __esModule: true,
    ...originalModule,
    getProjectDomainAttributes: jest.fn(),
  };
});

describe('EntityDetails', () => {
  let mockWorkflow: Workflow;
  let mockTask: Task;

  // mock api for listProjects
  const mockListProjects = jest.spyOn(projectApi, 'listProjects');
  mockListProjects.mockResolvedValue([projects['flyteTest']]);

  const createMocks = () => {
    mockWorkflow = createMockWorkflow('MyWorkflow');
    mockTask = createMockTask('MyTask');
  };

  const renderDetails = (id: ResourceIdentifier) => {
    return render(
      <MemoryRouter>
        <EntityDetails id={id} />
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    createMocks();
  });

  const checkTextInDetailPage = async (
    id: ResourceIdentifier,
    versionsString: string,
    executionsString: string,
  ) => {
    // check text for header
    await waitFor(() =>
      expect(within(screen.getByText(`${id.domain} / ${id.name}`))).toBeInTheDocument(),
    );

    // check text for versions
    await waitFor(() => expect(within(screen.getByText(versionsString))).toBeInTheDocument());

    // check text for executions
    await waitFor(() => expect(within(screen.getByText(executionsString))).toBeInTheDocument());
  };

  it('renders Task Details Page', async () => {
    const id: ResourceIdentifier = mockTask.id as ResourceIdentifier;
    renderDetails(id);
    checkTextInDetailPage(id, 'Recent Task Versions', 'All Executions in the Task');
  });

  it('renders Workflow Details Page', async () => {
    const id: ResourceIdentifier = mockWorkflow.id as ResourceIdentifier;
    renderDetails(id);
    checkTextInDetailPage(id, 'Recent Workflow Versions', 'All Executions in the Workflow');
  });
});
