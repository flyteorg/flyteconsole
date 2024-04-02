import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import styled from '@mui/system/styled';
import isNil from 'lodash/isNil';
import Grid from '@mui/material/Grid';
import { Identifier, ResourceIdentifier, ResourceType } from '../../models/Common/types';
import { LaunchForm } from '../Launch/LaunchForm/LaunchForm';
import { useEscapeKey } from '../hooks/useKeyListener';
import { LaunchTaskFormProps, LaunchWorkflowFormProps } from '../Launch/LaunchForm/types';
import t, { patternKey } from './strings';
import { entityStrings } from './constants';
import BreadcrumbTitleActions from '../Breadcrumbs/components/BreadcrumbTitleActions';
import { LaunchPlanDetailsHeader } from '../LaunchPlan/components/LaunchPlanDetailsHeader';

const EntityDetailsHeaderContainer = styled('div')(({ theme }) => ({
  '.headerContainer': {
    alignItems: 'center',
    display: 'flex',
    height: theme.spacing(5),
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
    width: '100%',
  },
  '.headerText': {
    margin: theme.spacing(0, 1),
  },
  '.headerTextContainer': {
    display: 'flex',
    flex: '1 0 auto',
  },
}));

interface EntityDetailsHeaderProps {
  id: ResourceIdentifier;
  launchable?: boolean;
}

const isTaskIdentifier = (id: any): id is Identifier => {
  return id?.resourceType === ResourceType.TASK;
};

const isVersionedId = (id: any): id is Identifier => {
  return !isNil(id?.version);
};

function getLaunchProps(
  id: ResourceIdentifier,
): LaunchWorkflowFormProps | Pick<LaunchTaskFormProps, 'taskId' | 'initialParameters'> {
  if (isTaskIdentifier(id)) {
    return {
      taskId: id,
      ...(isVersionedId(id)
        ? {
            initialParameters: { taskId: id },
          }
        : {}),
    };
  }

  return {
    workflowId: id,
    ...(isVersionedId(id)
      ? {
          initialParameters: { workflowId: id },
        }
      : {}),
  } as any as LaunchWorkflowFormProps;
}

/**
 * Renders the entity name and any applicable actions.
 * @param id
 * @param project
 * @param launchable - controls if we show launch button
 * @param backToWorkflow - if true breadcrumb navigates to main workflow details view.
 * @constructor
 */
export const EntityDetailsHeader: React.FC<EntityDetailsHeaderProps> = ({
  id,
  launchable = false,
}) => {
  const [showLaunchForm, setShowLaunchForm] = useState(false);
  const onCancelLaunch = (_?: any) => {
    setShowLaunchForm(false);
  };

  // Close modal on escape key press
  useEscapeKey(() => {
    onCancelLaunch();
  });

  const showLaunchPlanDetails = id.resourceType === ResourceType.LAUNCH_PLAN;

  return (
    <EntityDetailsHeaderContainer>
      <div>
        <BreadcrumbTitleActions>
          <Grid
            container
            direction="row"
            sx={showLaunchPlanDetails ? { maxWidth: '654px', width: '100%' } : {}}
          >
            {launchable ? (
              <Button
                color="primary"
                id="launch-workflow"
                onClick={() => {
                  setShowLaunchForm(true);
                }}
                variant="contained"
              >
                {t(patternKey('launchStrings', entityStrings[id.resourceType]))}
              </Button>
            ) : (
              <></>
            )}
            {showLaunchPlanDetails ? <LaunchPlanDetailsHeader id={id} /> : null}
          </Grid>
        </BreadcrumbTitleActions>
      </div>
      {launchable ? (
        <Dialog
          scroll="paper"
          maxWidth="sm"
          fullWidth
          open={showLaunchForm}
          onClose={onCancelLaunch}
        >
          <LaunchForm onClose={onCancelLaunch} {...getLaunchProps(id)} />
        </Dialog>
      ) : null}
    </EntityDetailsHeaderContainer>
  );
};
