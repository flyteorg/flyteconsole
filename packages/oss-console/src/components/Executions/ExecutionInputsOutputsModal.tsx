import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useTheme } from '@mui/material/styles';
import styled from '@mui/system/styled';
import { ClosableDialogTitle } from '../common/ClosableDialogTitle';
import { WaitForData } from '../common/WaitForData';
import { LiteralMapViewer } from '../Literals/LiteralMapViewer';
import { emptyLiteralMapBlob } from '../../models/Common/constants';
import { Execution } from '../../models/Execution/types';
import { useEscapeKey } from '../hooks/useKeyListener';
import { useWorkflowExecutionData } from './useWorkflowExecution';

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  paddingTop: theme.spacing(2),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  padding: `0 ${theme.spacing(2)}`,
}));

enum TabId {
  INPUTS = 'inputs',
  OUTPUTS = 'outputs',
}

const RemoteExecutionInputs: React.FC<{ execution: Execution }> = ({ execution }) => {
  const executionData = useWorkflowExecutionData(execution.id);
  return (
    <WaitForData {...executionData} spinnerVariant="none">
      <LiteralMapViewer map={executionData.value.fullInputs} />
    </WaitForData>
  );
};

const RemoteExecutionOutputs: React.FC<{ execution: Execution }> = ({ execution }) => {
  const executionData = useWorkflowExecutionData(execution.id);
  return (
    <WaitForData {...executionData} spinnerVariant="none">
      <LiteralMapViewer map={executionData.value.fullOutputs} />
    </WaitForData>
  );
};

const RenderInputs: React.FC<{ execution: Execution }> = ({ execution }) => {
  // computedInputs is deprecated, but older data may still use that field.
  // For new records, the inputs will always need to be fetched separately
  return execution.closure.computedInputs ? (
    <LiteralMapViewer map={execution.closure.computedInputs} />
  ) : (
    <RemoteExecutionInputs execution={execution} />
  );
};

const RenderOutputs: React.FC<{ execution: Execution }> = ({ execution }) => {
  const outputs = execution.closure.outputs || emptyLiteralMapBlob;

  // Small outputs will be stored directly in the execution.
  // For larger outputs, we need to fetch them using the /data endpoint
  return outputs.uri ? (
    <RemoteExecutionOutputs execution={execution} />
  ) : (
    <LiteralMapViewer map={outputs.values} />
  );
};

interface RenderDialogProps {
  execution: Execution;
  onClose: () => void;
}

const RenderDialog: React.FC<RenderDialogProps> = ({ execution, onClose }) => {
  // const styles = useStyles();
  const [selectedTab, setSelectedTab] = React.useState(TabId.INPUTS);
  const handleTabChange = (event: React.ChangeEvent<{}>, tabId: TabId) => setSelectedTab(tabId);
  return (
    <>
      <ClosableDialogTitle onClose={onClose}>{execution.id.name}</ClosableDialogTitle>
      <StyledTabs onChange={handleTabChange} value={selectedTab}>
        <Tab value={TabId.INPUTS} label="Inputs" />
        <Tab value={TabId.OUTPUTS} label="Outputs" />
      </StyledTabs>
      <StyledDialogContent>
        {selectedTab === TabId.INPUTS && <RenderInputs execution={execution} />}
        {selectedTab === TabId.OUTPUTS && <RenderOutputs execution={execution} />}
      </StyledDialogContent>
    </>
  );
};

interface ExecutionInputsOutputsModalProps {
  execution: Execution | null;
  onClose(): void;
}

/** Renders a Modal that will load/display the inputs/outputs for a given
 * Execution in a tabbed/scrollable container
 */
export const ExecutionInputsOutputsModal: React.FC<ExecutionInputsOutputsModalProps> = ({
  execution,
  onClose,
}) => {
  const theme = useTheme();
  useEscapeKey(onClose);
  return (
    <Dialog
      PaperProps={{
        sx: {
          // Attempt to fill the window up to a max width/height
          // This will normally result in the dialog being maxWidth X maxHeight
          // except when the viewport is smaller, in which case we will take as
          // much room as possible while leaving consistent margins (enforced
          // by the MUI Dialog component)
          maxWidth: `calc(100% - ${theme.spacing(12)})`,
          maxHeight: `calc(100% - ${theme.spacing(12)})`,
          height: theme.spacing(90),
          width: theme.spacing(100),
        },
      }}
      maxWidth={false}
      open={!!execution}
      onClose={onClose}
    >
      {execution ? <RenderDialog execution={execution} onClose={onClose} /> : <div />}
    </Dialog>
  );
};
