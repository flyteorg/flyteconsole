import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as React from 'react';
import { getCacheKey } from '../../Cache/utils';
import t from './strings';
import { LaunchFormActions } from './LaunchFormActions';
import { LaunchFormHeader } from './LaunchFormHeader';
import { LaunchFormInputs } from './LaunchFormInputs';
import { LaunchState } from './launchMachine';
import { LaunchRoleInput } from './LaunchRoleInput';
import { LaunchInterruptibleInput } from './LaunchFormComponents/LaunchInterruptibleInput';
import { LaunchOverwriteCacheInput } from './LaunchFormComponents/LaunchOverwriteCacheInput';
import { LaunchFormAdvancedInputs } from './LaunchFormComponents/LaunchFormAdvancedInputs';
import { SearchableSelector } from './LaunchFormComponents/SearchableSelector';
import { useStyles } from './styles';
import { BaseInterpretedLaunchState, BaseLaunchService, LaunchTaskFormProps } from './types';
import { useLaunchTaskFormState } from './useLaunchTaskFormState';
import { isEnterInputsState } from './utils';

/** Renders the form for initiating a Launch request based on a Task */
export const LaunchTaskForm: React.FC<LaunchTaskFormProps> = (props) => {
  const {
    formInputsRef,
    roleInputRef,
    advancedOptionsRef,
    interruptibleInputRef,
    overwriteCacheInputRef,
    state,
    service,
    taskSourceSelectorState,
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

  const { fetchSearchResults, onSelectTaskVersion, selectedTask, taskSelectorOptions } =
    taskSourceSelectorState;

  const showTaskSelector = ![
    LaunchState.LOADING_TASK_VERSIONS,
    LaunchState.FAILED_LOADING_TASK_VERSIONS,
  ].some(state.matches);

  // TODO: We removed all loading indicators here. Decide if we want skeletons
  // instead.
  // https://github.com/flyteorg/flyteconsole/issues/422

  return (
    <>
      <LaunchFormHeader title={state.context.sourceId?.name} formTitle={t('title')} />
      <DialogContent dividers className={styles.inputsSection}>
        {showTaskSelector ? (
          <section title={t('taskVersion')} className={styles.formControl}>
            <SearchableSelector
              id="launch-task-selector"
              label={t('taskVersion')}
              onSelectionChanged={onSelectTaskVersion}
              options={taskSelectorOptions}
              fetchSearchResults={fetchSearchResults}
              selectedItem={selectedTask}
            />
          </section>
        ) : null}
        <LaunchFormInputs
          key={formKey}
          ref={formInputsRef}
          state={baseState}
          variant="task"
          setIsError={setIsError}
        />
        <Accordion className={styles.noBorder}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            classes={{
              root: styles.summaryWrapper,
              content: styles.advancedOptions,
            }}
          >
            <Typography variant="body1" fontWeight={500} paddingRight={1}>
              Advanced options
            </Typography>
          </AccordionSummary>
          <AccordionDetails classes={{ root: styles.detailsWrapper }}>
            {isEnterInputsState(baseState) ? (
              <LaunchRoleInput
                initialValue={state.context.defaultAuthRole}
                ref={roleInputRef}
                showErrors={state.context.showErrors}
              />
            ) : null}
            {isEnterInputsState(baseState) ? (
              <LaunchFormAdvancedInputs ref={advancedOptionsRef} state={state} />
            ) : null}
            <LaunchInterruptibleInput
              initialValue={state.context.interruptible}
              ref={interruptibleInputRef}
            />
            <LaunchOverwriteCacheInput
              initialValue={state.context.overwriteCache}
              ref={overwriteCacheInputRef}
            />
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <LaunchFormActions
        state={baseState}
        service={baseService}
        onClose={props.onClose}
        isError={isError}
        submitTitle={t('submit')}
      />
    </>
  );
};
