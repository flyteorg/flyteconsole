import { Tooltip, Typography } from '@material-ui/core';
import { formatDateLocalTimezone, formatDateUTC, millisecondsToHMS } from 'common/formatters';
import { timestampToDate } from 'common/utils';
import { useCommonStyles } from 'components/common/styles';
import { isEqual } from 'lodash';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CompiledNode } from 'models/Node/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { useNodeExecutionContext } from '../contextProvider/NodeExecutionDetails';
import { ExecutionStatusBadge } from '../ExecutionStatusBadge';
import { NodeExecutionCacheStatus } from '../NodeExecutionCacheStatus';
import { getNodeExecutionTimingMS, getNodeFrontendPhase, isNodeGateNode } from '../utils';
import { NodeExecutionActions } from './NodeExecutionActions';
import { SelectNodeExecutionLink } from './SelectNodeExecutionLink';
import { useColumnStyles } from './styles';
import { NodeExecutionCellRendererData, NodeExecutionColumnDefinition } from './types';
import t from '../strings';

const ExecutionName: React.FC<NodeExecutionCellRendererData> = ({ execution, state }) => {
  const detailsContext = useNodeExecutionContext();
  const [displayName, setDisplayName] = useState<string | undefined>();

  useEffect(() => {
    let isCurrent = true;
    detailsContext.getNodeExecutionDetails(execution).then((res) => {
      if (isCurrent) {
        setDisplayName(res.displayName);
      }
    });
    return () => {
      isCurrent = false;
    };
  });

  const commonStyles = useCommonStyles();
  const styles = useColumnStyles();
  const { selectedExecution, setSelectedExecution } = state;

  const isSelected = state.selectedExecution != null && isEqual(execution.id, selectedExecution);

  const name = displayName ?? execution.id.nodeId;
  const truncatedName = name?.split('.').pop() || name;

  const readableName =
    isSelected || execution.closure.phase === NodeExecutionPhase.UNDEFINED ? (
      <Typography variant="body1" className={styles.selectedExecutionName}>
        {truncatedName}
      </Typography>
    ) : (
      <SelectNodeExecutionLink
        className={commonStyles.primaryLink}
        execution={execution}
        linkText={truncatedName || ''}
        setSelectedExecution={setSelectedExecution}
      />
    );

  return (
    <>
      {readableName}
      <Typography variant="subtitle1" color="textSecondary">
        {displayName}
      </Typography>
    </>
  );
};

const DisplayId: React.FC<NodeExecutionCellRendererData> = ({ execution }) => {
  const commonStyles = useCommonStyles();
  const detailsContext = useNodeExecutionContext();
  const [displayId, setDisplayId] = useState<string | undefined>();

  useEffect(() => {
    let isCurrent = true;
    detailsContext.getNodeExecutionDetails(execution).then((res) => {
      if (isCurrent) {
        setDisplayId(res.displayId);
      }
    });
    return () => {
      isCurrent = false;
    };
  });

  const nodeId = displayId ?? execution.id.nodeId;
  return (
    <Tooltip arrow title={nodeId} placement="top-start">
      <div className={commonStyles.truncateText}>{nodeId}</div>
    </Tooltip>
  );
};

const DisplayType: React.FC<NodeExecutionCellRendererData> = ({ execution }) => {
  const detailsContext = useNodeExecutionContext();
  const [type, setType] = useState<string | undefined>();

  useEffect(() => {
    let isCurrent = true;
    detailsContext.getNodeExecutionDetails(execution).then((res) => {
      if (isCurrent) {
        setType(res.displayType);
      }
    });
    return () => {
      isCurrent = false;
    };
  });

  return <Typography color="textSecondary">{type}</Typography>;
};

export function generateColumns(
  styles: ReturnType<typeof useColumnStyles>,
  nodes: CompiledNode[],
): NodeExecutionColumnDefinition[] {
  return [
    {
      cellRenderer: (props) => <ExecutionName {...props} />,
      className: styles.columnName,
      key: 'name',
      label: t('nameLabel'),
    },
    {
      cellRenderer: (props) => <DisplayId {...props} />,
      className: styles.columnNodeId,
      key: 'nodeId',
      label: t('nodeIdLabel'),
    },
    {
      cellRenderer: (props) => <DisplayType {...props} />,
      className: styles.columnType,
      key: 'type',
      label: t('typeLabel'),
    },
    {
      cellRenderer: ({ execution }) => {
        const isGateNode = isNodeGateNode(nodes, execution.id);
        const phase = getNodeFrontendPhase(
          execution.closure?.phase ?? NodeExecutionPhase.UNDEFINED,
          isGateNode,
        );

        return (
          <>
            <ExecutionStatusBadge phase={phase} type="node" />
            <NodeExecutionCacheStatus execution={execution} variant="iconOnly" />
          </>
        );
      },
      className: styles.columnStatus,
      key: 'phase',
      label: t('phaseLabel'),
    },
    {
      cellRenderer: ({ execution: { closure } }) => {
        const { startedAt } = closure;
        if (!startedAt) {
          return '';
        }
        const startedAtDate = timestampToDate(startedAt);
        return (
          <>
            <Typography variant="body1">{formatDateUTC(startedAtDate)}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
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
      cellRenderer: ({ execution }) => {
        const timing = getNodeExecutionTimingMS(execution);
        if (timing === null) {
          return '';
        }
        return (
          <>
            <Typography variant="body1">{millisecondsToHMS(timing.duration)}</Typography>
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
      cellRenderer: ({ execution, state }) =>
        execution.closure.phase === NodeExecutionPhase.UNDEFINED ? null : (
          <NodeExecutionActions execution={execution} state={state} />
        ),
      className: styles.columnLogs,
      key: 'actions',
      label: '',
    },
  ];
}
