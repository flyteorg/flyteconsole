import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PlayCircleOutline from '@mui/icons-material/PlayCircleOutline';
import { RowExpander } from '../../Tables/RowExpander';
import { isParentNode } from '../../utils';
import { isExpanded } from '../../../../models/Node/utils';
import { NodeExecutionName } from './NodeExecutionName';
import t from '../strings';
import { useNodeExecutionsById } from '../../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import { useNodeExecutionDynamicContext } from '../../contextProvider/NodeExecutionDetails/NodeExecutionDynamicProvider';
import { dNode } from '../../../../models/Graph/types';

export interface TaskNameRowProps {
  node: dNode;
  onToggle: (node: dNode) => void;
  onAction?: (id: string) => void;
}

export const ExecutionTimelineTableRow = ({ node, onToggle, onAction }: TaskNameRowProps) => {
  const { nodeExecutionsById } = useNodeExecutionsById();
  const { componentProps } = useNodeExecutionDynamicContext();

  const expanderRef = React.useRef<HTMLButtonElement>();

  const nodeLevel = node?.level ?? 0;
  const nodeExecution = nodeExecutionsById[node.scopedId];
  return (
    <div
      className="namesContainer"
      key={`level=${nodeLevel}-id=${node.id}-name=${node.scopedId}`}
      data-testid="task-name-item"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingLeft: nodeLevel * 16,
      }}
      {...componentProps}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
        }}
      >
        <div className="namesContainerExpander">
          {nodeExecution && isParentNode(nodeExecution) ? (
            <RowExpander
              ref={expanderRef as React.ForwardedRef<HTMLButtonElement>}
              expanded={isExpanded(node)}
              onClick={() => onToggle(node)}
            />
          ) : (
            <div className="leaf" />
          )}
        </div>

        <div className="namesContainerBody">
          <NodeExecutionName node={node} />
        </div>
      </div>
      {onAction && (
        <Tooltip title={t('resume')}>
          <IconButton
            onClick={() => onAction(node.id)}
            data-testid={`resume-gate-node-${node.id}`}
            size="large"
            title="Resume"
          >
            <PlayCircleOutline />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};
