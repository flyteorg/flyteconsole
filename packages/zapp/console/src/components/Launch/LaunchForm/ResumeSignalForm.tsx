import { Accordion, AccordionDetails, AccordionSummary, DialogContent } from '@material-ui/core';
import { getCacheKey } from 'components/Cache/utils';
import * as React from 'react';
import { useStyles } from './styles';
import { BaseInterpretedLaunchState, BaseLaunchService, ResumeSignalFormProps } from './types';
import { useLaunchTaskFormState } from './useLaunchTaskFormState';
import { ResumeFormHeader } from './ResumeFormHeader';
import { ResumeFormInputs } from './ResumeFormInputs';
import { ResumeFormActions } from './ResumeFormActions';
import { formStrings } from './constants';

/** Renders the form for initiating a Launch request based on a Task */
export const ResumeSignalForm: React.FC<ResumeSignalFormProps> = (props) => {
  const {
    formInputsRef,
    state,
    service,
  } = useLaunchTaskFormState(props);
  const styles = useStyles();
  const baseState = state as BaseInterpretedLaunchState;
  const baseService = service as BaseLaunchService;
  const [isError, setIsError] = React.useState<boolean>(false);

  // Any time the inputs change (even if it's just re-ordering), we must
  // change the form key so that the inputs component will re-mount.
  const formKey = React.useMemo<string>(() => {
    return getCacheKey(state.context.parsedInputs);
  }, [state.context.parsedInputs]);

  // TODO: We removed all loading indicators here. Decide if we want skeletons
  // instead.
  // https://github.com/flyteorg/flyteconsole/issues/422

  return (
    <>
      <ResumeFormHeader title={state.context.sourceId?.name} />
      <DialogContent dividers={true} className={styles.inputsSection}>
        <ResumeFormInputs
          key={formKey}
          ref={formInputsRef}
          state={baseState}
          variant="task"
          setIsError={setIsError}
        />
        <Accordion className={styles.noBorder}>
          <AccordionSummary
            classes={{
              root: styles.summaryWrapper,
              content: styles.viewNodeInputs,
            }}
          >
            {formStrings.viewNodeInputs}
          </AccordionSummary>
          <AccordionDetails classes={{ root: styles.detailsWrapper }}>
            Node details..
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <ResumeFormActions
        state={baseState}
        service={baseService}
        onClose={props.onClose}
        isError={isError}
      />
    </>
  );
};
