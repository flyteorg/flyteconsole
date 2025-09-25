import * as React from 'react';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import classnames from 'classnames';
import {
  formatDateLocalTimezone,
  formatDateUTC,
  millisecondsToHMS,
} from '../../../common/formatters';
import { timestampToDate } from '../../../common/utils';
import { useCommonStyles } from '../../common/styles';
import { NodeExecutionPhase } from '../../../models/Execution/enums';
import { ExecutionStatusBadge } from '../ExecutionStatusBadge';
import { NodeExecutionCacheStatus } from '../NodeExecutionCacheStatus';
import { getNodeExecutionTimingMS, getNodeFrontendPhase } from '../utils';
import { NodeExecutionActions } from './NodeExecutionActions/NodeExecutionActions';
import { useColumnStyles } from './styles';
import { NodeExecutionCellRendererData, NodeExecutionColumnDefinition } from './types';
import t from '../strings';
import { NodeExecutionName } from '../ExecutionDetails/Timeline/NodeExecutionName';
import { NodeExecutionsById } from '../contexts';
import { useNodeExecutionsById } from '../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';

const DisplayId: React.FC<NodeExecutionCellRendererData> = ({ node, className }) => {
  const commonStyles = useCommonStyles();

  const { nodeExecutionsById } = useNodeExecutionsById();

  const displayId = node.nodeExecutionInfo?.displayId;

  const execution = nodeExecutionsById[node.scopedId];

  const nodeId = displayId ?? execution?.id?.nodeId;
  return (
    <Tooltip arrow title={nodeId} placement="top-start">
      <div className={classnames(commonStyles.truncateText, className)}>{nodeId}</div>
    </Tooltip>
  );
};

const DisplayType: React.FC<NodeExecutionCellRendererData> = ({ node, className }) => {
  const type = node?.nodeExecutionInfo?.displayType;

  return (
    <Typography color="textSecondary" className={className}>
      {type}
    </Typography>
  );
};

export function generateColumns(
  styles: ReturnType<typeof useColumnStyles>,
  nodeExecutionsById: NodeExecutionsById,
): NodeExecutionColumnDefinition[] {
  return [
    {
      cellRenderer: ({ node, className }) => {
        return <NodeExecutionName node={node} className={className} />;
      },

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
      cellRenderer: ({ node, className }) => {
        const execution = nodeExecutionsById[node.scopedId];
        const isGateNode = !!node.value?.gateNode;

        const phase = getNodeFrontendPhase(
          execution?.closure?.phase ?? NodeExecutionPhase.UNDEFINED,
          isGateNode,
        );

        return (
          <>
            <Grid
              container
              alignContent="center"
              justifyContent="flex-start"
              sx={{ flexWrap: 'nowrap' }}
            >
              <Grid item alignItems="center" sx={{ display: 'flex' }}>
                <ExecutionStatusBadge phase={phase} type="node" className={className} />
              </Grid>
              <Grid item alignItems="center" sx={{ display: 'flex' }}>
                <NodeExecutionCacheStatus
                  execution={execution}
                  variant="iconOnly"
                  className={className}
                  nodeExecutionDetails={node.nodeExecutionInfo}
                />
              </Grid>
            </Grid>
          </>
        );
      },
      className: styles.columnStatus,
      key: 'phase',
      label: t('phaseLabel'),
    },
    {
      cellRenderer: ({ node, className }) => {
        const execution = nodeExecutionsById[node.scopedId];
        const startedAt = execution?.closure?.startedAt;
        if (!startedAt) {
          return '';
        }
        const startedAtDate = timestampToDate(startedAt);
        return (
          <>
            <Typography variant="body1" className={className}>
              {formatDateLocalTimezone(startedAtDate)}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" className={className}>
              {formatDateUTC(startedAtDate)}
            </Typography>
          </>
        );
      },
      className: styles.columnStartedAt,
      key: 'startedAt',
      label: t('startedAtLabel'),
    },
    {
      cellRenderer: ({ node, className }) => {
        const execution = nodeExecutionsById[node.scopedId];
        const timing = execution && getNodeExecutionTimingMS(execution || {});
        if (!timing) {
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
      cellRenderer: ({ node, className }) => {
        const execution = nodeExecutionsById[node.scopedId];
        const phase = execution?.closure?.phase || NodeExecutionPhase.UNDEFINED;
        return phase === NodeExecutionPhase.UNDEFINED ? null : (
          <NodeExecutionActions node={node} className={className} />
        );
      },
      className: styles.columnLogs,
      key: 'actions',
      label: '',
    },
  ];
}
