import React from 'react';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import styled from '@mui/system/styled';
import { MapTaskExecution, NodeExecution } from '../../../../models/Execution/types';
import { TaskTemplate } from '../../../../models/Task/types';
import { useTabState } from '../../../hooks/useTabState';
import { PanelSection } from '../../../common/PanelSection';
import { ReactJsonViewWrapper } from '../../../common/ReactJsonView';
import { isMapTaskType } from '../../../../models/Task/utils';
import { TaskExecutionPhase } from '../../../../models/Execution/enums';
import { MapTaskExecutionDetails } from '../../TaskExecutionsList/MapTaskExecutionDetails';
import { TaskVersionDetailsLink } from '../../../Entities/VersionDetails/VersionDetailsLink';
import { Identifier } from '../../../../models/Common/types';
import { TaskExecutionsList } from '../../TaskExecutionsList/TaskExecutionsList';
import { NodeExecutionInputs } from './NodeExecutionInputs';
import { NodeExecutionOutputs } from './NodeExecutionOutputs';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    minWidth: 'auto',
  },
  '& .MuiTabs-flexContainer': {
    justifyContent: 'space-around',
  },
}));

const StyledTabItem = styled(Tab)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  minWidth: 'auto',
}));

const TabContent = styled('div')(() => ({
  overflowY: 'auto',
  paddingBottom: '100px', // TODO @FC 454 temporary fix for panel height issue
}));

export const NodeExecutionTabs: React.FC<{
  nodeExecution: NodeExecution;
  selectedTaskExecution?: MapTaskExecution;
  onTaskSelected: (val: MapTaskExecution) => void;
  phase?: TaskExecutionPhase;
  taskTemplate?: TaskTemplate | null;
  taskIndex?: number;
}> = ({ nodeExecution, selectedTaskExecution, onTaskSelected, taskTemplate, phase, taskIndex }) => {
  const QUERY_PARAM_TAB = 'ctab';
  const tabIds = {
    executions: 'executions',
    inputs: 'inputs',
    outputs: 'outputs',
    task: 'task',
  };
  const defaultTab = tabIds.executions;

  const { value, onChange } = useTabState(defaultTab, QUERY_PARAM_TAB);

  if (value === tabIds.task && !taskTemplate) {
    // Reset tab value, if task tab is selected, while no taskTemplate is avaible
    // can happen when user switches between nodeExecutions without closing the drawer
    onChange(() => {
      /* */
    }, defaultTab);
  }

  let tabContent: JSX.Element | null = null;
  // eslint-disable-next-line default-case
  switch (value) {
    case tabIds.inputs: {
      tabContent = <NodeExecutionInputs execution={nodeExecution} taskIndex={taskIndex} />;
      break;
    }
    case tabIds.outputs: {
      tabContent = <NodeExecutionOutputs execution={nodeExecution} taskIndex={taskIndex} />;
      break;
    }
    case tabIds.task: {
      tabContent = taskTemplate ? (
        <PanelSection>
          <TaskVersionDetailsLink id={taskTemplate.id as Identifier} />
          <ReactJsonViewWrapper src={taskTemplate} />
        </PanelSection>
      ) : null;
      break;
    }
    case tabIds.executions:
    default: {
      tabContent = selectedTaskExecution ? (
        <MapTaskExecutionDetails taskExecution={selectedTaskExecution} />
      ) : (
        <TaskExecutionsList
          nodeExecution={nodeExecution}
          onTaskSelected={onTaskSelected}
          phase={phase}
        />
      );
      break;
    }
  }

  const executionLabel =
    isMapTaskType(taskTemplate?.type) && !selectedTaskExecution ? 'Map Execution' : 'Executions';

  return (
    <>
      <StyledTabs value={value} onChange={onChange}>
        <StyledTabItem value={tabIds.executions} label={executionLabel} />
        <StyledTabItem value={tabIds.inputs} label="Inputs" />
        <StyledTabItem value={tabIds.outputs} label="Outputs" />
        {!!taskTemplate && <StyledTabItem value={tabIds.task} label="Task" />}
      </StyledTabs>
      <TabContent>{tabContent}</TabContent>
    </>
  );
};
