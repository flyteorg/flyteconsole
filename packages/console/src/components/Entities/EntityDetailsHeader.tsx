import React from 'react';
import { Button, Dialog } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { ResourceIdentifier, ResourceType } from 'models/Common/types';
import { Project } from 'models/Project/types';
import { LaunchForm } from 'components/Launch/LaunchForm/LaunchForm';
import { useEscapeKey } from 'components/hooks/useKeyListener';
import { BreadcrumbTitleActions } from 'components/Breadcrumbs';
import { entityStrings } from './constants';
import t, { patternKey } from './strings';

interface EntityDetailsHeaderProps {
  id: ResourceIdentifier;
  launchable?: boolean;
}

function getLaunchProps(id: ResourceIdentifier) {
  if (id.resourceType === ResourceType.TASK) {
    return { taskId: id };
  }

  return { workflowId: id };
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
  const [showLaunchForm, setShowLaunchForm] = React.useState(false);
  const onCancelLaunch = (_?: KeyboardEvent) => {
    setShowLaunchForm(false);
  };

  // Close modal on escape key press
  useEscapeKey(onCancelLaunch);

  return (
    <>
      <div>
        <BreadcrumbTitleActions>
          {launchable ? (
            <Button
              color="primary"
              id="launch-workflow"
              onClick={() => setShowLaunchForm(true)}
              variant="contained"
            >
              {t(patternKey('launchStrings', entityStrings[id.resourceType]))}
            </Button>
          ) : (
            <></>
          )}
        </BreadcrumbTitleActions>
      </div>
      {launchable ? (
        <Dialog
          scroll="paper"
          maxWidth="sm"
          fullWidth={true}
          open={showLaunchForm}
        >
          <LaunchForm onClose={onCancelLaunch} {...getLaunchProps(id)} />
        </Dialog>
      ) : null}
    </>
  );
};
