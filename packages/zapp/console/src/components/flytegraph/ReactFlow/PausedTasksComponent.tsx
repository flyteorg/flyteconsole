import * as React from 'react';
import { useState } from 'react';
import { Button } from '@material-ui/core';
import { TaskNames } from 'components/Executions/ExecutionDetails/Timeline/TaskNames';
import { dNode } from 'models/Graph/types';
import { isExpanded } from 'components/WorkflowGraph/utils';
import {
  graphButtonContainer,
  graphButtonStyle,
  leftPositionStyle,
  popupContainerStyle,
} from './commonStyles';
import t from './strings';

interface PausedTasksComponentProps {
  pausedNodes: dNode[];
  initialIsVisible?: boolean;
}

export const PausedTasksComponent: React.FC<PausedTasksComponentProps> = ({
  pausedNodes,
  initialIsVisible = false,
}) => {
  const [isVisible, setIsVisible] = useState(initialIsVisible);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const toggleNode = (id: string, scopeId: string, level: number) => {
    const searchNode = (nodes: dNode[], nodeLevel: number) => {
      if (!nodes || nodes.length === 0) {
        return;
      }
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.id === id && node.scopedId === scopeId && nodeLevel === level) {
          nodes[i].expanded = !nodes[i].expanded;
          return;
        }
        if (node.nodes.length > 0 && isExpanded(node)) {
          searchNode(node.nodes, nodeLevel + 1);
        }
      }
    };
    searchNode(pausedNodes, 0);
    // setOriginalNodes([...originalNodes]);
  };

  const resumeAction = (id: string) => {
    // TODO Launch form for node id
  };

  const renderPausedTasksBlock = () => (
    <div style={popupContainerStyle}>
      <TaskNames nodes={pausedNodes} onToggle={toggleNode} onAction={resumeAction} />
    </div>
  );

  // TODO add banner with the number of paused tasks
  return (
    <div style={leftPositionStyle}>
      <div>
        {isVisible ? renderPausedTasksBlock() : null}
        <div style={graphButtonContainer}>
          <Button
            style={graphButtonStyle}
            color="default"
            id="graph-paused-tasks"
            onClick={toggleVisibility}
            variant="contained"
          >
            {t('pausedTasksButton')}
          </Button>
        </div>
      </div>
    </div>
  );
};
