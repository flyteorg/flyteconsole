import React from 'react';
import Typography from '@mui/material/Typography';
import Core from '@clients/common/flyteidl/core';
import { useCommonStyles } from '@clients/theme/CommonStyles/CommonStyles';
import styled from '@mui/system/styled';
import { NewTargetLink } from '../../common/NewTargetLink';
import { noLogsFoundString } from '../constants';

const LogName = styled('div')(() => ({
  fontWeight: 'lighter',
}));

const SectionHeader = styled('header')(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const StyledNewTargetLink = styled(NewTargetLink)(({ theme }) => ({
  margin: `${theme.spacing(0.5)} 0`,
})) as typeof NewTargetLink;

export const TaskLogList: React.FC<{ logs: Core.ITaskLog[] }> = ({ logs }) => {
  const commonStyles = useCommonStyles();
  if (!(logs && logs.length > 0)) {
    return <span className={commonStyles.hintText}>{noLogsFoundString}</span>;
  }
  return (
    <>
      {logs.map(({ name, uri }) =>
        uri ? (
          <StyledNewTargetLink key={name} external href={uri}>
            {name}
          </StyledNewTargetLink>
        ) : (
          // If there is no url, show item a a name string only, as it's not really clickable
          <LogName key={name}>{name}</LogName>
        ),
      )}
    </>
  );
};

/** Renders log links from a `taskLogs`(aka taskExecution.closure.logs), if they exist.
 *  Otherwise renders a message indicating that no logs are available.
 */
export const TaskExecutionLogs: React.FC<{
  taskLogs: Core.ITaskLog[];
  title?: string;
}> = ({ taskLogs, title }) => {
  return (
    <section>
      <SectionHeader>
        <Typography variant="h6">{title ?? 'Logs'}</Typography>
      </SectionHeader>
      <TaskLogList logs={taskLogs} />
    </section>
  );
};
