import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryClientProvider } from 'react-query';
import { FilterOperationName } from '@clients/common/types/adminEntityTypes';
import { ResourceIdentifier, ResourceType } from '../../../models/Common/types';
import * as launchPlanApi from '../../../models/Launch/api';
import { CREATED_AT_DESCENDING_SORT } from '../../../models/Launch/constants';
import { LaunchPlanState } from '../../../models/Launch/types';
import { createTestQueryClient } from '../../../test/utils';
import { EntitySchedules } from '../EntitySchedules';

it('scopes active launch plans to the workflow project, domain and name', async () => {
  const id: ResourceIdentifier = {
    resourceType: ResourceType.WORKFLOW,
    project: 'flytesnacks',
    domain: 'development',
    name: 'scheduled-workflow',
  };
  const client = createTestQueryClient();
  const listLaunchPlans = jest.spyOn(launchPlanApi, 'listLaunchPlans').mockResolvedValue({
    entities: [],
  });

  try {
    render(
      <QueryClientProvider client={client}>
        <EntitySchedules id={id} />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(listLaunchPlans).toHaveBeenCalledWith(
        { project: id.project, domain: id.domain, name: undefined },
        {
          limit: 5,
          sort: CREATED_AT_DESCENDING_SORT,
          filter: [
            {
              key: 'state',
              operation: FilterOperationName.EQ,
              value: LaunchPlanState.ACTIVE,
            },
            {
              key: 'workflow.name',
              operation: FilterOperationName.EQ,
              value: id.name,
            },
            {
              key: 'workflow.project',
              operation: FilterOperationName.EQ,
              value: id.project,
            },
            {
              key: 'workflow.domain',
              operation: FilterOperationName.EQ,
              value: id.domain,
            },
          ],
        },
      ),
    );
  } finally {
    listLaunchPlans.mockRestore();
    client.clear();
  }
});
