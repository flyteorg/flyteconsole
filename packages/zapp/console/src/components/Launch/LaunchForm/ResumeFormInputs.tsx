import { Typography } from '@material-ui/core';
import * as React from 'react';
import { BlobInput } from './BlobInput';
import { CollectionInput } from './CollectionInput';
import { formStrings, gateInputDescription } from './constants';
import { LaunchState } from './launchMachine';
import { MapInput } from './MapInput';
import { NoInputsNeeded } from './NoInputsNeeded';
import { SimpleInput } from './SimpleInput';
import { StructInput } from './StructInput';
import { UnionInput } from './UnionInput';
import { useStyles } from './styles';
import {
  BaseInterpretedLaunchState,
  InputProps,
  InputType,
  InputValue,
  ResumeFormInputsRef,
} from './types';
import { UnsupportedInput } from './UnsupportedInput';
import { UnsupportedRequiredInputsError } from './UnsupportedRequiredInputsError';
import { useFormInputsState } from './useFormInputsState';
import { isEnterInputsState } from './utils';
import { getHelperForInput } from './inputHelpers/getHelperForInput';
import { NoneInput } from './NoneInput';

export function getComponentForInput(
  input: InputProps,
  showErrors: boolean,
  setIsError: (boolean) => void,
) {
  const onChange = (newValue: InputValue) => {
    const helper = getHelperForInput(input.typeDefinition.type);
    try {
      helper.validate({ ...input, value: newValue });
      setIsError(false);
    } catch (e) {
      setIsError(true);
    }
    input.onChange(newValue);
  };

  const props = { ...input, error: showErrors ? input.error : undefined, setIsError, onChange };

  switch (input.typeDefinition.type) {
    case InputType.Union:
      return <UnionInput {...props} />;
    case InputType.Blob:
      return <BlobInput {...props} />;
    case InputType.Collection:
      return <CollectionInput {...props} />;
    case InputType.Struct:
      return <StructInput {...props} />;
    case InputType.Map:
      return <MapInput {...props} />;
    case InputType.Unknown:
      return <UnsupportedInput {...props} />;
    case InputType.None:
      return <NoneInput {...props} />;
    default:
      return <SimpleInput {...props} />;
  }
}

export interface ResumeFormInputsProps {
  state: BaseInterpretedLaunchState;
  variant: 'workflow' | 'task';
  setIsError: (boolean) => void;
}

const RenderFormInputs: React.FC<{
  inputs: InputProps[];
  showErrors: boolean;
  variant: ResumeFormInputsProps['variant'];
  setIsError: (boolean) => void;
}> = ({ inputs, showErrors, variant, setIsError }) => {
  const styles = useStyles();
  return inputs.length === 0 ? (
    <NoInputsNeeded variant={variant} />
  ) : (
    <>
      <header className={styles.sectionHeader}>
        <Typography variant="h6">{formStrings.gateInput}</Typography>
        <Typography variant="body2">{gateInputDescription}</Typography>
      </header>
      {inputs.map((input) => (
        <div key={input.label} className={styles.formControl}>
          {getComponentForInput(input, showErrors, setIsError)}
        </div>
      ))}
    </>
  );
};

export const ResumeFormInputsImpl: React.RefForwardingComponent<
  ResumeFormInputsRef,
  ResumeFormInputsProps
> = ({ state, variant, setIsError }, ref) => {
  const { parsedInputs, unsupportedRequiredInputs, showErrors } = state.context;
  const { getValues, inputs, validate } = useFormInputsState(parsedInputs);
  React.useImperativeHandle(ref, () => ({
    getValues,
    validate,
  }));

  return isEnterInputsState(state) ? (
    <section title={formStrings.inputs}>
      {state.matches(LaunchState.UNSUPPORTED_INPUTS) ? (
        <UnsupportedRequiredInputsError inputs={unsupportedRequiredInputs} variant={variant} />
      ) : (
        <RenderFormInputs
          inputs={inputs}
          showErrors={showErrors}
          variant={variant}
          setIsError={setIsError}
        />
      )}
    </section>
  ) : null;
};

/** Renders an array of `ParsedInput` values using the appropriate
 * components. A `ref` to this component is used to access the current
 * form values and trigger manual validation if needed.
 */
export const ResumeFormInputs = React.forwardRef(ResumeFormInputsImpl);
