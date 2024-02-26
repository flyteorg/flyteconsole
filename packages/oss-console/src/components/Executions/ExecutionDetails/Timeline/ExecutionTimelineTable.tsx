import React, { createRef, forwardRef, useRef } from 'react';
import Typography from '@mui/material/Typography';
import styled from '@mui/system/styled';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import { useNodeExecutionsById } from '../../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import t from '../strings';
import { dNode } from '../../../../models/Graph/types';
import { TaskNamesList } from './TaskNamesList';

const StyledTaskNames = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${theme.palette.divider}`,
  overflowY: 'auto',
  width: '256px',
  maxWidth: '256px',
}));

const TaskNamesHeader = styled(Typography)(({ theme }) => ({
  textTransform: 'uppercase',
  fontSize: 12,
  fontWeight: 'bold',
  lineHeight: '16px',
  color: CommonStylesConstants.tableHeaderColor,
  height: 45,
  flexBasis: 45,
  display: 'flex',
  alignItems: 'center',
  borderBottom: `4px solid ${theme.palette.divider}`,
  paddingLeft: 30,
}));

export interface ExecutionTimelineTableProps {
  showNodes: dNode[];
  onVerticalNodesScroll: () => void;
}

export const ExecutionTimelineTable = forwardRef<HTMLDivElement, ExecutionTimelineTableProps>(
  ({ showNodes, onVerticalNodesScroll }, taskNamesRef) => {
    const { toggleNode } = useNodeExecutionsById();

    return (
      <StyledTaskNames>
        <TaskNamesHeader>{t('taskNameColumnHeader')}</TaskNamesHeader>

        <TaskNamesList
          nodes={showNodes}
          onToggle={toggleNode}
          onScroll={onVerticalNodesScroll}
          ref={taskNamesRef}
        />
      </StyledTaskNames>
    );
  },
);
