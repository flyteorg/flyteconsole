import { Tooltip, Typography } from '@material-ui/core';
import { formatDateLocalTimezone, formatDateUTC, millisecondsToHMS } from 'common/formatters';
import { timestampToDate } from 'common/utils';
import { useCommonStyles } from 'components/common/styles';
import { isEqual } from 'lodash';
import { NodeExecutionPhase } from 'models/Execution/enums';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { CompiledNode } from 'models/Node/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { useNodeExecutionContext } from '../contextProvider/NodeExecutionDetails';
import { ExecutionStatusBadge } from '../ExecutionStatusBadge';
import { NodeExecutionCacheStatus } from '../NodeExecutionCacheStatus';
import { getNodeExecutionTimingMS } from '../utils';
import { NodeExecutionActions } from './NodeExecutionActions';
import { SelectNodeExecutionLink } from './SelectNodeExecutionLink';
import { useColumnStyles } from './styles';
import { NodeExecutionCellRendererData, NodeExecutionColumnDefinition } from './types';
import t from '../strings';
import { DetailsPanelContext } from '../ExecutionDetails/DetailsPanelContext';

const ExecutionName: React.FC<NodeExecutionCellRendererData> = ({ execution }) => {
  const commonStyles = useCommonStyles();
  const styles = useColumnStyles();

  const { getNodeExecutionDetails } = useNodeExecutionContext();
  const { selectedExecution, setSelectedExecution } = useContext(DetailsPanelContext);
  const [displayName, setDisplayName] = useState<string | undefined>();

  useEffect(() => {
    let isCurrent = true;
    getNodeExecutionDetails(execution).then((res) => {
      if (isCurrent) {
        setDisplayName(res.displayName);
      }
    });
    return () => {
      isCurrent = false;
    };
  });

  const isSelected = selectedExecution != null && isEqual(execution.id, selectedExecution);

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
  const { getNodeExecutionDetails } = useNodeExecutionContext();
  const [displayId, setDisplayId] = useState<string | undefined>();

  useEffect(() => {
    let isCurrent = true;
    getNodeExecutionDetails(execution).then((res) => {
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
  const { getNodeExecutionDetails } = useNodeExecutionContext();
  const [type, setType] = useState<string | undefined>();

  useEffect(() => {
    let isCurrent = true;
    getNodeExecutionDetails(execution).then((res) => {
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
): NodeExecutionColumnDefinition[] {
  return [
    {
      cellRenderer: (props) => <ExecutionName {...props} />,
      className: styles.columnName,
      key: 'name',
      label: 'task name',
    },
    {
      cellRenderer: (props) => <DisplayId {...props} />,
      className: styles.columnNodeId,
      key: 'nodeId',
      label: 'node id',
    },
    {
      cellRenderer: (props) => <DisplayType {...props} />,
      className: styles.columnType,
      key: 'type',
      label: 'type',
    },
    {
      cellRenderer: ({ execution }) => (
        <>
          <ExecutionStatusBadge
            phase={execution.closure?.phase ?? NodeExecutionPhase.UNDEFINED}
            type="node"
          />
          <NodeExecutionCacheStatus execution={execution} variant="iconOnly" />
        </>
      ),
      className: styles.columnStatus,
      key: 'phase',
      label: 'status',
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
      label: 'start time',
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
            duration
          </Typography>
          <Typography component="div" variant="subtitle1" color="textSecondary">
            Queued Time
          </Typography>
        </>
      ),
    },
    {
      cellRenderer: ({ execution }) =>
        execution.closure.phase === NodeExecutionPhase.UNDEFINED ? null : (
          <NodeExecutionActions execution={execution} />
        ),
      className: styles.columnLogs,
      key: 'actions',
      label: '',
    },
  ];
}
