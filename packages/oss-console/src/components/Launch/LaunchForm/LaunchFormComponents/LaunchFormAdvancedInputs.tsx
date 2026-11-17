import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import Admin from '@clients/common/flyteidl/admin';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { State } from 'xstate';
import { LaunchAdvancedOptionsRef } from '../types';
import {
  TaskLaunchContext,
  TaskLaunchEvent,
  TaskLaunchTypestate,
  WorkflowLaunchContext,
  WorkflowLaunchEvent,
  WorkflowLaunchTypestate,
} from '../launchMachine';
import { useStyles } from '../styles';

interface LaunchAdvancedOptionsProps {
  state:
    | State<WorkflowLaunchContext, WorkflowLaunchEvent, any, WorkflowLaunchTypestate>
    | State<TaskLaunchContext, TaskLaunchEvent, any, TaskLaunchTypestate>;
}

const isValueValid = (value: any) => {
  return value !== undefined && value !== null;
};

export const LaunchFormAdvancedInputs = forwardRef<
  LaunchAdvancedOptionsRef,
  LaunchAdvancedOptionsProps
>(
  (
    {
      state: { context },
    },
    ref,
  ) => {
    const styles = useStyles();
    const [labelsParamData, setLabelsParamData] = useState({});
    const [annotationsParamData, setAnnotationsParamData] = useState({});
    const [disableAll, setDisableAll] = useState(false);
    const [maxParallelism, setMaxParallelism] = useState('');
    const [rawOutputDataConfig, setRawOutputDataConfig] = useState('');

    // Only show max parallelism for workflow launches, not task launches
    const isWorkflowLaunch = 'launchPlan' in context;

    useEffect(() => {
      if (isValueValid(context.disableAll)) {
        setDisableAll(context.disableAll!);
      }
      // maxParallelism only exists on WorkflowLaunchContext
      if (isWorkflowLaunch && 'maxParallelism' in context && isValueValid(context.maxParallelism)) {
        setMaxParallelism(`${context.maxParallelism}`);
      }
      if (
        context?.rawOutputDataConfig?.outputLocationPrefix !== undefined &&
        context.rawOutputDataConfig.outputLocationPrefix !== null
      ) {
        setRawOutputDataConfig(context.rawOutputDataConfig.outputLocationPrefix);
      }
      // Access launchPlan safely - it only exists in WorkflowLaunchContext
      const launchPlan = isWorkflowLaunch ? context.launchPlan : undefined;
      const newLabels = {
        ...(context.labels?.values || {}),
        ...(launchPlan?.spec?.labels?.values || {}),
      };
      const newAnnotations = {
        ...(context.annotations?.values || {}),
        ...(launchPlan?.spec?.annotations?.values || {}),
      };
      setLabelsParamData(newLabels);
      setAnnotationsParamData(newAnnotations);
    }, [
      context.disableAll,
      context.rawOutputDataConfig,
      context.labels,
      context.annotations,
      context,
      isWorkflowLaunch,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        getValues: () => {
          const baseValues = {
            disableAll,
            rawOutputDataConfig: {
              outputLocationPrefix: rawOutputDataConfig,
            },
            labels: {
              values: labelsParamData,
            },
            annotations: {
              values: annotationsParamData,
            },
          };

          // Only include maxParallelism for workflow launches
          if (isWorkflowLaunch) {
            return {
              ...baseValues,
              maxParallelism: parseInt(maxParallelism || '', 10),
            } as Admin.IExecutionSpec;
          }

          return baseValues as Admin.IExecutionSpec;
        },
        validate: () => {
          return true;
        },
      }),
      [disableAll, maxParallelism, rawOutputDataConfig, labelsParamData, annotationsParamData, isWorkflowLaunch],
    );

    const handleDisableAllChange = useCallback(() => {
      setDisableAll((prevState) => !prevState);
    }, []);

    const handleMaxParallelismChange = useCallback(({ target: { value } }) => {
      setMaxParallelism(value);
    }, []);

    const handleLabelsChange = useCallback(({ formData }) => {
      setLabelsParamData(formData);
    }, []);

    const handleAnnotationsParamData = useCallback(({ formData }) => {
      setAnnotationsParamData(formData);
    }, []);

    const handleRawOutputDataConfigChange = useCallback(({ target: { value } }) => {
      setRawOutputDataConfig(value);
    }, []);

    return (
      <>
        <section title="Labels" className={styles.collapsibleSection}>
          <Accordion className={styles.noBorder}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="Labels"
              id="labels-form"
              classes={{
                root: styles.summaryWrapper,
              }}
            >
              <header className={styles.sectionHeader}>
                <Typography variant="h6">Labels</Typography>
              </header>
            </AccordionSummary>

            <AccordionDetails>
              <Card variant="outlined">
                <CardContent>
                  <Form
                    schema={{
                      type: 'object',
                      additionalProperties: true,
                    }}
                    formData={labelsParamData}
                    onChange={handleLabelsChange as any}
                    validator={validator}
                  >
                    <div />
                  </Form>
                </CardContent>
              </Card>
            </AccordionDetails>
          </Accordion>
        </section>
        <section title="Annotations" className={styles.collapsibleSection}>
          <Accordion className={styles.noBorder}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="Annotations"
              id="annotations-form"
              classes={{
                root: styles.summaryWrapper,
              }}
            >
              <header className={styles.sectionHeader}>
                <Typography variant="h6">Annotations</Typography>
              </header>
            </AccordionSummary>

            <AccordionDetails>
              <Card variant="outlined">
                <CardContent>
                  <Form
                    schema={{
                      type: 'object',
                      additionalProperties: true,
                    }}
                    formData={annotationsParamData}
                    onChange={handleAnnotationsParamData as any}
                    validator={validator}
                  >
                    <div />
                  </Form>
                </CardContent>
              </Card>
            </AccordionDetails>
          </Accordion>
        </section>
        <section title="Enable/Disable all notifications">
          <FormControlLabel
            control={<Checkbox checked={disableAll} onChange={handleDisableAllChange} />}
            label="Disable all notifications"
          />
        </section>
        <section title="Raw output data config">
          <TextField
            variant="outlined"
            label="Raw output data config"
            fullWidth
            margin="normal"
            value={rawOutputDataConfig}
            onChange={handleRawOutputDataConfigChange}
          />
        </section>
        {isWorkflowLaunch ? (
          <section title="Max parallelism">
            <TextField
              variant="outlined"
              label="Max parallelism"
              fullWidth
              margin="normal"
              value={maxParallelism}
              onChange={handleMaxParallelismChange}
            />
          </section>
        ) : null}
      </>
    );
  },
);
