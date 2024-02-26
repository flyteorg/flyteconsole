import React from 'react';
import classnames from 'classnames';
import styled from '@mui/system/styled';
import { palette } from '@clients/theme/Theme/muiTheme';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import Typography from '@mui/material/Typography';
import {
  NodeExecutionPhase,
  TaskExecutionPhase,
  WorkflowExecutionPhase,
} from '../../models/Execution/enums';
import {
  getNodeExecutionPhaseConstants,
  getTaskExecutionPhaseConstants,
  getWorkflowExecutionPhaseConstants,
} from './utils';

const StyledWrapper = styled('div')(({ theme }) => ({
  fontWeight: 'normal',
  '&.default': {
    padding: theme.spacing(0.25, 0.5),
    alignItems: 'center',
    backgroundColor: theme.palette.common.primary.white,
    borderRadius: theme.spacing(0.5),
    color: theme.palette.text.primary,
    display: 'flex',
    flex: '0 0 auto',
    height: theme.spacing(2.5),
    fontSize: CommonStylesConstants.smallFontSize,
    justifyContent: 'center',
    textTransform: 'uppercase',
    width: theme.spacing(11), // 88px
  },
  '&.text': {
    backgroundColor: 'inherit',
    border: 'none',
    marginTop: theme.spacing(1),
    textTransform: 'lowercase',
  },
}));

interface BaseProps {
  variant?: 'default' | 'text';
  disabled?: boolean;
}

interface WorkflowExecutionStatusBadgeProps extends BaseProps {
  phase: WorkflowExecutionPhase;
  type: 'workflow';
}

interface NodeExecutionStatusBadgeProps extends BaseProps {
  phase: NodeExecutionPhase;
  type: 'node';
}

interface TaskExecutionStatusBadgeProps extends BaseProps {
  phase: TaskExecutionPhase;
  type: 'task';
}

type ExecutionStatusBadgeProps =
  | WorkflowExecutionStatusBadgeProps
  | NodeExecutionStatusBadgeProps
  | TaskExecutionStatusBadgeProps;

export function getPhaseConstants(
  type: 'workflow' | 'node' | 'task',
  phase: WorkflowExecutionPhase | NodeExecutionPhase | TaskExecutionPhase,
) {
  if (type === 'task') {
    return getTaskExecutionPhaseConstants(phase as TaskExecutionPhase);
  }
  if (type === 'node') {
    return getNodeExecutionPhaseConstants(phase as NodeExecutionPhase);
  }
  return getWorkflowExecutionPhaseConstants(phase as WorkflowExecutionPhase);
}

/** Given a `closure.phase` value for a Workflow/Task/NodeExecution, will render
 * a badge with the proper text and styling to indicate the status (succeeded/
 * failed etc.)
 */
export const ExecutionStatusBadge: React.FC<
  ExecutionStatusBadgeProps &
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ phase, type, variant = 'default', disabled = false, className, ...htmlProps }) => {
  const style: React.CSSProperties = {};
  const { badgeColor, text, textColor } = getPhaseConstants(type, phase);

  if (variant === 'text') {
    style.color = textColor;
  } else {
    style.backgroundColor = `${disabled ? palette.state.undefined : badgeColor} !important`;
  }

  return (
    <StyledWrapper className={classnames(variant, className)} sx={style} {...htmlProps}>
      <Typography variant="label">{text}</Typography>
    </StyledWrapper>
  );
};
