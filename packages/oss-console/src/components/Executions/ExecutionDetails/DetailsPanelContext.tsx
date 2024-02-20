import React, { PropsWithChildren, useContext, useEffect, createContext, useState } from 'react';
import Core from '@clients/common/flyteidl/core';
import { NodeExecutionIdentifier } from '../../../models/Execution/types';
import { DetailsPanel } from '../../common/DetailsPanel';
import { isStartOrEndNodeId } from '../../../models/Node/utils';
import { NodeExecutionDetailsPanelContent } from './NodeExecutionDetailsPanelContent';
import { useNodeExecutionsById } from '../contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import { TaskExecutionPhase } from '../../../models/Execution/enums';

export interface DetailsPanelContextData {
  selectedExecution?: NodeExecutionIdentifier | null;
  setSelectedExecution: (selectedExecutionId: NodeExecutionIdentifier | null) => void;
  onNodeSelectionChanged: (newSelection: string[]) => void;
  selectedPhase: Core.TaskExecution.Phase | undefined;
  setSelectedPhase: (value: React.SetStateAction<Core.TaskExecution.Phase | undefined>) => void;
  isDetailsTabClosed: boolean;
  setIsDetailsTabClosed: (val: boolean) => void;
}

export const DetailsPanelContext = createContext<DetailsPanelContextData>(
  {} as DetailsPanelContextData,
);

export interface DetailsPanelContextProviderProps {
  selectedPhase?: TaskExecutionPhase;
}
export const DetailsPanelContextProvider = ({
  children,
}: PropsWithChildren<DetailsPanelContextProviderProps>) => {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const { nodeExecutionsById } = useNodeExecutionsById();

  const [selectedPhase, setSelectedPhase] = useState<TaskExecutionPhase | undefined>(undefined);

  // Note: flytegraph allows multiple selection, but we only support showing
  // a single item in the details panel
  const [selectedExecution, setSelectedExecution] = useState<NodeExecutionIdentifier | null>(
    // eslint-disable-next-line no-nested-ternary
    selectedNodes.length
      ? nodeExecutionsById[selectedNodes[0]]
        ? nodeExecutionsById[selectedNodes[0]].id
        : {
            nodeId: selectedNodes[0],
            executionId: nodeExecutionsById[Object.keys(nodeExecutionsById)[0]].id.executionId,
          }
      : null,
  );

  const [isDetailsTabClosed, setIsDetailsTabClosed] = useState<boolean>(!selectedExecution);

  useEffect(() => {
    setIsDetailsTabClosed(!selectedExecution);
  }, [selectedExecution]);

  const onNodeSelectionChanged = (newSelection: string[]) => {
    const validSelection = newSelection.filter((nodeId) => {
      if (isStartOrEndNodeId(nodeId)) {
        return false;
      }
      return true;
    });
    setSelectedNodes(validSelection);
    // eslint-disable-next-line no-nested-ternary
    const newSelectedExecution = validSelection.length
      ? nodeExecutionsById[validSelection[0]]
        ? nodeExecutionsById[validSelection[0]].id
        : {
            nodeId: validSelection[0],
            executionId: nodeExecutionsById[Object.keys(nodeExecutionsById)[0]].id.executionId,
          }
      : null;
    setSelectedExecution(newSelectedExecution);
  };

  const onCloseDetailsPanel = () => {
    setSelectedExecution(null);
    setSelectedPhase(undefined);
    setSelectedNodes([]);
  };

  return (
    <DetailsPanelContext.Provider
      value={{
        selectedExecution,
        setSelectedExecution,
        onNodeSelectionChanged,
        selectedPhase,
        setSelectedPhase,
        isDetailsTabClosed,
        setIsDetailsTabClosed,
      }}
    >
      {children}
      <DetailsPanel open={!isDetailsTabClosed} onClose={onCloseDetailsPanel}>
        {!isDetailsTabClosed && selectedExecution && (
          <NodeExecutionDetailsPanelContent
            onClose={onCloseDetailsPanel}
            taskPhase={selectedPhase ?? TaskExecutionPhase.UNDEFINED}
            nodeExecutionId={selectedExecution}
          />
        )}
      </DetailsPanel>
    </DetailsPanelContext.Provider>
  );
};

export const useDetailsPanel = () => {
  return useContext(DetailsPanelContext);
};
