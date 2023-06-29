import React, { useEffect } from 'react';
import { Typography } from '@material-ui/core';
import { isEqual } from 'lodash';
import t from './strings';
import { LaunchState } from './launchMachine';
import { NoInputsNeeded } from './NoInputsNeeded';
import { useStyles } from './styles';
import {
  BaseInterpretedLaunchState,
  InputProps,
  LaunchFormInputsRef,
} from './types';
import { UnsupportedRequiredInputsError } from './UnsupportedRequiredInputsError';
import { useFormInputsState } from './useFormInputsState';
import { isEnterInputsState } from './utils';
import { getComponentForInput } from './LaunchFormComponents';

export interface LaunchFormInputsProps {
  state: BaseInterpretedLaunchState;
  variant: 'workflow' | 'task';
  setIsError: (boolean) => void;
}

const RenderFormInputs: React.FC<{
  inputs: InputProps[];
  showErrors: boolean;
  variant: LaunchFormInputsProps['variant'];
  setIsError: (boolean) => void;
}> = ({ inputs, variant, setIsError }) => {
  const styles = useStyles();
  const [errors, setErrors] = React.useState<boolean[]>([]);
  const updateErrors = (value, index) => {
    setErrors(prev => {
      const newErrors = [...errors];
      newErrors[index] = value;
      if (isEqual(prev, newErrors)) {
        return prev;
      }
      return newErrors;
    });
  };

  useEffect(() => {
    setIsError(errors.some(error => error));
  }, [errors]);
  return inputs.length === 0 ? (
    <NoInputsNeeded variant={variant} />
  ) : (
    <>
      <header className={styles.sectionHeader}>
        <Typography variant="h6">{t('inputs')}</Typography>
        <Typography variant="body2">{t('inputsDescription')}</Typography>
      </header>
      {inputs.map((input, index) => (
        <div key={input.label} className={styles.formControl}>
          {getComponentForInput(input, true, isError =>
            updateErrors(isError, index),
          )}
        </div>
      ))}
    </>
  );
};

export const LaunchFormInputsImpl: React.RefForwardingComponent<
  LaunchFormInputsRef,
  LaunchFormInputsProps
> = ({ state, variant, setIsError }, ref) => {
  const { parsedInputs, unsupportedRequiredInputs, showErrors } = state.context;
  const { getValues, inputs, validate } = useFormInputsState(parsedInputs);
  React.useImperativeHandle(ref, () => ({
    getValues,
    validate,
  }));

  return isEnterInputsState(state) ? (
    <section title={t('inputs')}>
      {state.matches(LaunchState.UNSUPPORTED_INPUTS) ? (
        <UnsupportedRequiredInputsError
          inputs={unsupportedRequiredInputs}
          variant={variant}
        />
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
export const LaunchFormInputs = React.forwardRef(LaunchFormInputsImpl);
