import { NonIdealState } from 'components/common';
import { useCommonStyles } from 'components/common/styles';
import * as React from 'react';
import {
    cannotLaunchWorkflowString,
    unsupportedRequiredInputsString
} from './constants';
import { ParsedInput } from './types';

export interface UnsupportedRequiredInputsErrorProps {
    inputs: ParsedInput[];
}
export const UnsupportedRequiredInputsError: React.FC<UnsupportedRequiredInputsErrorProps> = ({
    inputs
}) => {
    const commonStyles = useCommonStyles();
    return (
        <NonIdealState
            size="small"
            title={cannotLaunchWorkflowString}
            description={unsupportedRequiredInputsString}
        >
            <ul className={commonStyles.listUnstyled}>
                {inputs.map(input => (
                    <li key={input.name} className={commonStyles.textMonospace}>
                        {input.label}
                    </li>
                ))}
            </ul>
        </NonIdealState>
    );
};
