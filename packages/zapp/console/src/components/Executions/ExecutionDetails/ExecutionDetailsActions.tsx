import { Button } from '@material-ui/core';
import * as React from 'react';
import { ResourceIdentifier } from 'models/Common/types';
import { LaunchFormDialog } from 'components/Launch/LaunchForm/LaunchFormDialog';
import { NodeExecutionDetails } from '../types';
import t from './strings';

export const ExecutionDetailsActions: React.FC<{
  className?: string;
  details: NodeExecutionDetails;
}> = ({ className, details }) => {
  const [showLaunchForm, setShowLaunchForm] = React.useState<boolean>(false);

  const id = details.taskTemplate?.id as ResourceIdentifier | undefined;

  const rerunOnClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setShowLaunchForm(true);
  };

  return (
    <>
      <div className={className}>
        <Button variant="outlined" color="primary" onClick={rerunOnClick}>
          {t('rerun')}
        </Button>
      </div>
      {id && (
        <LaunchFormDialog
          id={id}
          showLaunchForm={showLaunchForm}
          setShowLaunchForm={setShowLaunchForm}
        />
      )}
    </>
  );
};
