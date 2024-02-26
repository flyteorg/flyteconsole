import React from 'react';
import styled from '@mui/system/styled';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import { useCommonStyles } from '../../../common/styles';
import { useNodeExecutionsById } from '../../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import { SelectNodeExecutionLink } from '../../Tables/SelectNodeExecutionLink';
import { NodeExecutionPhase } from '../../../../models/Execution/enums';
import { dNode } from '../../../../models/Graph/types';
import { useDetailsPanel } from '../DetailsPanelContext';

interface NodeExecutionTimelineNameData {
  node: dNode;
  className?: string;
}

const NodeExecutionNameContainer = styled('div')(() => ({
  width: '100%',
  '.selectedExecutionName': {
    fontWeight: 'bold',
  },
  '.displayName': {
    marginTop: 4,
    textOverflow: 'ellipsis',
    width: '100%',
    overflow: 'hidden',
    fontSize: 12,
    margin: 0,
  },
}));

export const NodeExecutionName: React.FC<NodeExecutionTimelineNameData> = ({ node, className }) => {
  const commonStyles = useCommonStyles();
  const { nodeExecutionsById } = useNodeExecutionsById();
  const { name, nodeExecutionInfo } = node;
  const templateName = nodeExecutionInfo?.subWorkflowName ?? nodeExecutionInfo?.displayName;
  const displayName = nodeExecutionInfo?.displayName;
  const { selectedExecution, setSelectedExecution } = useDetailsPanel();
  const nodeExecution = nodeExecutionsById[node.scopedId];

  if (!nodeExecution) {
    // to avoid crash - disable items which do not have associated execution.
    // as we won't be able to provide task info for them anyway.
    return (
      <Typography
        variant="body1"
        className={classNames(commonStyles.primaryLink, commonStyles.truncateText)}
        sx={{ '&:hover': { textDecoration: 'none !important', cursor: 'default' } }}
      >
        {name}
      </Typography>
    );
  }
  const isSelected = selectedExecution != null && isEqual(nodeExecution.id, selectedExecution);

  const defaultName = displayName ?? name;
  const truncatedName = defaultName?.split('.').pop() || defaultName;

  return (
    <NodeExecutionNameContainer>
      <Typography
        variant="body1"
        className={classNames(
          className,
          'selectedExecutionName',
          commonStyles.primaryLink,
          commonStyles.truncateText,
        )}
        fontWeight={600}
      >
        {isSelected || nodeExecution.closure.phase === NodeExecutionPhase.UNDEFINED ? (
          <span className={classNames(commonStyles.truncateText)}>{truncatedName} </span>
        ) : (
          <SelectNodeExecutionLink
            className={classNames(className, commonStyles.primaryLink, commonStyles.truncateText)}
            execution={nodeExecution}
            linkText={truncatedName || ''}
            setSelectedExecution={setSelectedExecution}
          />
        )}
      </Typography>
      {templateName && (
        <Typography
          variant="subtitle1"
          color="textSecondary"
          className={classNames(className, 'displayName')}
        >
          {templateName}
        </Typography>
      )}
    </NodeExecutionNameContainer>
  );
};
