import { Tooltip, Typography } from '@material-ui/core';
import {
  formatDateLocalTimezone,
  formatDateUTC,
  millisecondsToHMS,
} from 'common/formatters';
import { timestampToDate } from 'common/utils';
import { useCommonStyles } from 'components/common/styles';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CompiledNode } from 'models/Node/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { getNodeTemplateName } from 'components/WorkflowGraph/utils';
import classnames from 'classnames';
import { useNodeExecutionContext } from '../contextProvider/NodeExecutionDetails';
import { ExecutionStatusBadge } from '../ExecutionStatusBadge';
import { NodeExecutionCacheStatus } from '../NodeExecutionCacheStatus';
import {
  getNodeExecutionTimingMS,
  getNodeFrontendPhase,
  isNodeGateNode,
} from '../utils';
import { NodeExecutionActions } from './NodeExecutionActions';
import { useColumnStyles } from './styles';
import {
  NodeExecutionCellRendererData,
  NodeExecutionColumnDefinition,
} from './types';
import t from '../strings';
import { NodeExecutionName } from '../ExecutionDetails/Timeline/NodeExecutionName';

const DisplayId: React.FC<NodeExecutionCellRendererData> = ({
  execution,
  className,
}) => {
  const commonStyles = useCommonStyles();
  const { getNodeExecutionDetails } = useNodeExecutionContext();
  const [displayId, setDisplayId] = useState<string | undefined>();

  useEffect(() => {
    let isCurrent = true;
    getNodeExecutionDetails(execution).then(res => {
      if (isCurrent) {
        setDisplayId(res?.displayId);
      }
    });
    return () => {
      isCurrent = false;
    };
  });

  const nodeId = displayId ?? execution.id.nodeId;
  return (
    <Tooltip arrow title={nodeId} placement="top-start">
      <div className={classnames(commonStyles.truncateText, className)}>
        {nodeId}
      </div>
    </Tooltip>
  );
};

const DisplayType: React.FC<NodeExecutionCellRendererData> = ({
  execution,
  className,
}) => {
  const { getNodeExecutionDetails } = useNodeExecutionContext();
  const [type, setType] = useState<string | undefined>();

  useEffect(() => {
    let isCurrent = true;
    getNodeExecutionDetails(execution).then(res => {
      if (isCurrent) {
        setType(res?.displayType);
      }
    });
    return () => {
      isCurrent = false;
    };
  });

  return (
    <Typography color="textSecondary" className={className}>
      {type}
    </Typography>
  );
};

export function generateColumns(
  styles: ReturnType<typeof useColumnStyles>,
  nodes: CompiledNode[],
): NodeExecutionColumnDefinition[] {
  return [
    {
      cellRenderer: ({ node, className }) => (
        <NodeExecutionName
          name={node.name}
          templateName={getNodeTemplateName(node)}
          execution={node.execution}
          className={className}
        />
      ),
      className: styles.columnName,
      key: 'name',
      label: t('nameLabel'),
    },
    {
      cellRenderer: props => <DisplayId {...props} />,
      className: styles.columnNodeId,
      key: 'nodeId',
      label: t('nodeIdLabel'),
    },
    {
      cellRenderer: props => <DisplayType {...props} />,
      className: styles.columnType,
      key: 'type',
      label: t('typeLabel'),
    },
    {
      cellRenderer: ({ execution, className }) => {
        const isGateNode = isNodeGateNode(
          nodes,
          execution.metadata?.specNodeId || execution.id.nodeId,
        );

        const phase = getNodeFrontendPhase(
          execution.closure?.phase ?? NodeExecutionPhase.UNDEFINED,
          isGateNode,
        );

        return (
          <>
            <ExecutionStatusBadge
              phase={phase}
              type="node"
              className={className}
            />
            <NodeExecutionCacheStatus
              execution={execution}
              variant="iconOnly"
              className={className}
            />
          </>
        );
      },
      className: styles.columnStatus,
      key: 'phase',
      label: t('phaseLabel'),
    },
    {
      cellRenderer: ({ execution: { closure }, className }) => {
        const { startedAt } = closure;
        if (!startedAt) {
          return '';
        }
        const startedAtDate = timestampToDate(startedAt);
        return (
          <>
            <Typography variant="body1" className={className}>
              {formatDateUTC(startedAtDate)}
            </Typography>
            <Typography
              variant="subtitle1"
              color="textSecondary"
              className={className}
            >
              {formatDateLocalTimezone(startedAtDate)}
            </Typography>
          </>
        );
      },
      className: styles.columnStartedAt,
      key: 'startedAt',
      label: t('startedAtLabel'),
    },
    {
      cellRenderer: ({ execution, className }) => {
        const timing = getNodeExecutionTimingMS(execution);
        if (timing === null) {
          return '';
        }
        return (
          <>
            <Typography variant="body1" className={className}>
              {millisecondsToHMS(timing.duration)}
            </Typography>
          </>
        );
      },
      className: styles.columnDuration,
      key: 'duration',
      label: () => (
        <>
          <Typography component="div" variant="overline">
            {t('durationLabel')}
          </Typography>
          <Typography component="div" variant="subtitle1" color="textSecondary">
            {t('queuedTimeLabel')}
          </Typography>
        </>
      ),
    },
    {
      cellRenderer: ({ execution, className }) =>
        execution.closure.phase === NodeExecutionPhase.UNDEFINED ? null : (
          <NodeExecutionActions execution={execution} className={className} />
        ),
      className: styles.columnLogs,
      key: 'actions',
      label: '',
    },
  ];
}
