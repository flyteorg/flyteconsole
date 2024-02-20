import React from 'react';
import styled from '@mui/system/styled';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import { NonIdealState } from '../../common/NonIdealState';
import { useCommonStyles } from '../../common/styles';
import t from './strings';
import { ParsedInput } from './types';

const StyledNonIdealState = styled(NonIdealState)(({ theme }) => ({
  marginBottom: theme.spacing(2),

  '.contentContainer': {
    whiteSpace: 'pre-line',
    textAlign: 'left',
  },
}));

function formatLabel(label: string) {
  return label.endsWith(t('requiredInputSuffix')) ? label.substring(0, label.length - 1) : label;
}

export interface UnsupportedRequiredInputsErrorProps {
  inputs: ParsedInput[];
  variant: 'workflow' | 'task';
}
/** An informational error to be shown if a Workflow cannot be launch due to
 * required inputs for which we will not be able to provide a value.
 */
export const UnsupportedRequiredInputsError: React.FC<UnsupportedRequiredInputsErrorProps> = ({
  inputs,
  variant,
}) => {
  const commonStyles = useCommonStyles();
  const [titleString, errorString] =
    variant === 'workflow'
      ? [t('cannotLaunchWorkflowString'), t('workflowUnsupportedRequiredInputsString')]
      : [t('cannotLaunchTaskString'), t('taskUnsupportedRequiredInputsString')];
  return (
    <StyledNonIdealState icon={ErrorOutline} size="medium" title={titleString}>
      <div className="contentContainer">
        <p>{errorString}</p>
        <ul className={commonStyles.listUnstyled}>
          {inputs.map((input) => (
            <li key={input.name} className={commonStyles.textMonospace}>
              {formatLabel(input.label)}
            </li>
          ))}
        </ul>
      </div>
    </StyledNonIdealState>
  );
};
