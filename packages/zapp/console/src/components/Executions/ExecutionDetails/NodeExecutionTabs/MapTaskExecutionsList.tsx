import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ExternalResource } from 'models/Execution/types';
import { NewTargetLink } from 'components/common/NewTargetLink';
import { nodePhaseColorMapping } from 'components/flytegraph/ReactFlow/utils';
import { whiteColor } from 'components/Theme/constants';
import { Core } from 'flyteidl';
import { Typography } from '@material-ui/core';
import t from './strings';

const useStyles = makeStyles((theme) => {
  return {
    detailsPanelCardContent: {
      padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    phase: ({ color }: { color: string }) => ({
      color: color,
    }),
    logLink: {
      margin: `${theme.spacing(0.5)} 0`,
    },
    logName: {
      fontWeight: 'lighter',
    },
  };
});

const MapTaskLogs: React.FC<{
  text: string;
  color: string;
  retryAttempt?: number | null;
  logs?: Core.ITaskLog[] | null;
}> = ({ text, color, retryAttempt, logs }) => {
  const styles = useStyles({ color });
  const attempt = retryAttempt ? retryAttempt + 1 : 1;

  return (
    <div className={styles.detailsPanelCardContent}>
      <Typography variant="h6">{t('attempt', attempt)}</Typography>
      {text.length > 0 && (
        <Typography className={styles.phase} variant="body2">
          {text}
        </Typography>
      )}
      <Typography variant="h6">{t('logs')}</Typography>
      {logs?.map(({ name, uri }) =>
        uri ? (
          <NewTargetLink className={styles.logLink} key={name} external={true} href={uri}>
            {name}
          </NewTargetLink>
        ) : (
          // If there is no url, show item a a name string only, as it's not really clickable
          <div className={styles.logName}>{name}</div>
        ),
      )}
    </div>
  );
};

export const MapTaskExecutionsList: React.FC<{
  mapTask: ExternalResource[];
}> = ({ mapTask }) => {
  return (
    <>
      {mapTask.map((task) => {
        const color = task.phase ? nodePhaseColorMapping[task.phase].color : whiteColor;
        const text = task.phase ? nodePhaseColorMapping[task.phase].text : '';
        return (
          <MapTaskLogs
            color={color}
            text={text}
            retryAttempt={task.retryAttempt}
            logs={task.logs}
            key={task.index}
          />
        );
      })}
    </>
  );
};
