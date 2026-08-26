import React, { useState } from 'react';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import withStyles from '@mui/styles/withStyles';
import { COLOR_SPECTRUM as ColorSpectrum } from '@clients/theme/CommonStyles/colorSpectrum';
import { dNode } from '../../../models/Graph/types';
import { NodeExecutionPhase } from '../../../models/Execution/enums';
import { nodeExecutionPhaseConstants } from '../../Executions/constants';
import { LaunchFormDialog } from '../../Launch/LaunchForm/LaunchFormDialog';
import { extractCompiledNodes } from '../../hooks/utils';
import { useEscapeKey } from '../../hooks/useKeyListener';
import {
  graphButtonContainer,
  graphButtonStyle,
  leftPositionStyle,
  popupContainerStyle,
} from './commonStyles';
import t from './strings';
import { useNodeExecutionsById } from '../../Executions/contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import { useNodeExecutionContext } from '../../Executions/contextProvider/NodeExecutionDetails/NodeExecutionDetailsContextProvider';
import { TaskNamesList } from '../../Executions/ExecutionDetails/Timeline/TaskNamesList';

interface PausedTasksComponentProps {
  pausedNodes: dNode[];
  initialIsVisible?: boolean;
}

const CustomBadge = withStyles({
  badge: {
    backgroundColor: nodeExecutionPhaseConstants()[NodeExecutionPhase.PAUSED].nodeColor,
    color: ColorSpectrum.white.color,
  },
})(Badge);

export const PausedTasksComponent: React.FC<PausedTasksComponentProps> = ({
  pausedNodes,
  initialIsVisible = false,
}) => {
  const { nodeExecutionsById, toggleNode } = useNodeExecutionsById();
  const { compiledWorkflowClosure } = useNodeExecutionContext();
  const [isVisible, setIsVisible] = useState(initialIsVisible);
  const [showResumeForm, setShowResumeForm] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEscapeKey(() => {
    setShowResumeForm(false);
  });

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const onResumeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setShowResumeForm(true);
  };

  const compiledNode = extractCompiledNodes(compiledWorkflowClosure).find(
    (node) =>
      (selectedNodeId && node.id === nodeExecutionsById[selectedNodeId]?.metadata?.specNodeId) ||
      node.id === selectedNodeId,
  );

  const selectedNode = (pausedNodes ?? []).find((node) => node.id === selectedNodeId);

  const renderPausedTasksBlock = () => (
    <div style={popupContainerStyle} data-testid="paused-tasks-table">
      <TaskNamesList nodes={pausedNodes} onToggle={toggleNode} onAction={onResumeClick} />
    </div>
  );

  return (
    <div style={leftPositionStyle}>
      <div>
        {isVisible ? renderPausedTasksBlock() : null}
        <div style={graphButtonContainer}>
          <CustomBadge badgeContent={pausedNodes.length}>
            <Button
              style={graphButtonStyle}
              id="graph-paused-tasks"
              onClick={toggleVisibility}
              variant="contained"
              title={t('pausedTasksButton')}
            >
              {t('pausedTasksButton')}
            </Button>
          </CustomBadge>
        </div>
      </div>
      {compiledNode && selectedNode ? (
        <LaunchFormDialog
          compiledNode={compiledNode}
          initialParameters={undefined}
          nodeExecutionId={nodeExecutionsById[selectedNode.scopedId].id}
          showLaunchForm={showResumeForm}
          setShowLaunchForm={setShowResumeForm}
          nodeExecutionScopeId={selectedNode.scopedId}
        />
      ) : null}
    </div>
  );
};
