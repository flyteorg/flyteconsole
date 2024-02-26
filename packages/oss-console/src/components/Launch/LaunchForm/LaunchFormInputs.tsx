import React, { useEffect, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ErrorBoundary } from '../../common/ErrorBoundary';
import t from './strings';
import { LaunchState } from './launchMachine';
import { NoInputsNeeded } from './NoInputsNeeded';
import { useStyles } from './styles';
import { BaseInterpretedLaunchState, InputProps } from './types';
import { UnsupportedRequiredInputsError } from './UnsupportedRequiredInputsError';
import { useFormInputsState } from './useFormInputsState';
import { isEnterInputsState } from './utils';
import { getComponentForInput } from './LaunchFormComponents/getComponentForInput';

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

  useEffect(() => {
    /**
     * Invalidate the form if:
     * * value is required and the input is invalid
     * * value is supplied and the input is invalid
     */
    const hasError = inputs.some((i) => (i.required || i.value) && !!i.error);
    setIsError(hasError);
  }, [inputs]);

  const inputsFormElements = useMemo(() => {
    return (
      <Grid container spacing={1} sx={{ pb: 2 }}>
        {inputs.map((input) => (
          <Grid item key={input.label} className={styles.formControl} xs={12}>
            {getComponentForInput(input, true)}
          </Grid>
        ))}
      </Grid>
    );
  }, [inputs]);

  return inputs.length === 0 ? (
    <NoInputsNeeded variant={variant} />
  ) : (
    <>
      <Grid container spacing={1} sx={{ pb: 2 }}>
        <Grid item xs={12}>
          <header className={styles.sectionHeader}>
            <Typography variant="h6">{t('inputs')}</Typography>
            <Typography variant="body2">{t('inputsDescription')}</Typography>
          </header>
        </Grid>
      </Grid>
      {inputsFormElements}
    </>
  );
};

export const LaunchFormInputsImpl = ({ state, variant, setIsError }, ref) => {
  const { parsedInputs, unsupportedRequiredInputs, showErrors } = state.context;
  const { getValues, inputs, validate } = useFormInputsState(parsedInputs);
  React.useImperativeHandle(ref, () => ({
    getValues,
    validate,
  }));

  return isEnterInputsState(state) ? (
    <section title={t('inputs')}>
      {state.matches(LaunchState.UNSUPPORTED_INPUTS) ? (
        <UnsupportedRequiredInputsError inputs={unsupportedRequiredInputs} variant={variant} />
      ) : (
        <ErrorBoundary>
          <RenderFormInputs
            inputs={inputs}
            showErrors={showErrors}
            variant={variant}
            setIsError={setIsError}
          />
        </ErrorBoundary>
      )}
    </section>
  ) : null;
};

/** Renders an array of `ParsedInput` values using the appropriate
 * components. A `ref` to this component is used to access the current
 * form values and trigger manual validation if needed.
 */
export const LaunchFormInputs = React.forwardRef(LaunchFormInputsImpl);
