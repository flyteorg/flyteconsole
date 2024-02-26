import React from 'react';
import styled from '@mui/system/styled';
import { NodeExecutionDynamicProvider } from '../../contextProvider/NodeExecutionDetails/NodeExecutionDynamicProvider';
import { ExecutionTimelineTableRow } from './ExecutionTimelineTableRow';
import { dNode } from '../../../../models/Graph/types';

export const StylesTaskNameList = styled('div')(({ theme }) => ({
  overflowY: 'scroll',
  flex: 1,
  '& .namesContainer': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'left',
    padding: '0 10px',
    height: 56,
    borderBottom: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap',
    width: '100%',
  },
  '& .namesContainerExpander': {
    display: 'flex',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  '& .namesContainerBody': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  '& .leaf': {
    width: 30,
  },
}));

export interface TaskNamesListProps {
  nodes: dNode[];
  onToggle: (node: dNode) => void;
  onAction?: (id: string) => void;
  onScroll?: () => void;
}

export const TaskNamesList = React.forwardRef<HTMLDivElement, TaskNamesListProps>(
  ({ nodes, onScroll, onToggle, onAction }, taskNamesRef) => {
    return (
      <StylesTaskNameList ref={taskNamesRef} onScroll={onScroll}>
        {nodes.map((node) => (
          <NodeExecutionDynamicProvider node={node} key={node.scopedId}>
            <ExecutionTimelineTableRow node={node} onToggle={onToggle} onAction={onAction} />
          </NodeExecutionDynamicProvider>
        ))}
      </StylesTaskNameList>
    );
  },
);
