import { getCacheKey } from 'components/Cache/utils';
import * as React from 'react';
import { BlobInput } from './BlobInput';
import { CollectionInput } from './CollectionInput';
import { formStrings } from './constants';
import { LaunchState } from './launchMachine';
import { SimpleInput } from './SimpleInput';
import { useStyles } from './styles';
import {
    BaseInterpretedLaunchState,
    InputProps,
    InputType,
    LaunchFormInputsRef
} from './types';
import { UnsupportedInput } from './UnsupportedInput';
import { UnsupportedRequiredInputsError } from './UnsupportedRequiredInputsError';
import { useFormInputsState } from './useFormInputsState';

function getComponentForInput(input: InputProps, showErrors: boolean) {
    const props = { ...input, error: showErrors ? input.error : undefined };
    switch (input.typeDefinition.type) {
        case InputType.Blob:
            return <BlobInput {...props} />;
        case InputType.Collection:
            return <CollectionInput {...props} />;
        case InputType.Map:
        case InputType.Schema:
        case InputType.Unknown:
        case InputType.None:
            return <UnsupportedInput {...props} />;
        default:
            return <SimpleInput {...props} />;
    }
}

export interface LaunchFormInputsProps {
    state: BaseInterpretedLaunchState;
}

export const LaunchFormInputsImpl: React.RefForwardingComponent<
    LaunchFormInputsRef,
    LaunchFormInputsProps
> = ({ state }, ref) => {
    const {
        parsedInputs,
        unsupportedRequiredInputs,
        showErrors
    } = state.context;
    const { getValues, inputs, validate } = useFormInputsState(parsedInputs);
    const styles = useStyles();
    React.useImperativeHandle(ref, () => ({
        getValues,
        validate
    }));

    // Any time the inputs change (even if it's just re-ordering), we must
    // change the form key so that the inputs component will re-mount.
    const formKey = React.useMemo<string>(() => {
        return getCacheKey(state.context.parsedInputs);
    }, [state.context.parsedInputs]);

    const showInputs = ![
        LaunchState.UNSUPPORTED_INPUTS,
        LaunchState.ENTER_INPUTS,
        LaunchState.VALIDATING_INPUTS,
        LaunchState.INVALID_INPUTS,
        LaunchState.SUBMIT_VALIDATING,
        LaunchState.SUBMITTING,
        LaunchState.SUBMIT_FAILED,
        LaunchState.SUBMIT_SUCCEEDED
    ].some(state.matches);

    return showInputs ? (
        <section key={formKey} title={formStrings.inputs}>
            {state.matches(LaunchState.UNSUPPORTED_INPUTS) ? (
                <UnsupportedRequiredInputsError
                    inputs={unsupportedRequiredInputs}
                />
            ) : (
                <>
                    {inputs.map(input => (
                        <div key={input.label} className={styles.formControl}>
                            {getComponentForInput(input, showErrors)}
                        </div>
                    ))}
                </>
            )}
        </section>
    ) : null;
};

/** Renders an array of `ParsedInput` values using the appropriate
 * components. A `ref` to this component is used to access the current
 * form values and trigger manual validation if needed.
 */
export const LaunchFormInputs = React.forwardRef(LaunchFormInputsImpl);
