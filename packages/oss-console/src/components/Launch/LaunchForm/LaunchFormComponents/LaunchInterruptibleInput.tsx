import React, {
  ForwardRefRenderFunction,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Protobuf from '@clients/common/flyteidl/protobuf';
import { useStyles } from '../styles';
import { LaunchInterruptibleInputRef } from '../types';
import t from '../strings';

const isValueValid = (value: any) => {
  return value !== undefined && value !== null;
};

interface LaunchInterruptibleInputProps {
  initialValue?: Protobuf.IBoolValue | null;
}

export const LaunchInterruptibleInputImpl: ForwardRefRenderFunction<
  LaunchInterruptibleInputRef,
  LaunchInterruptibleInputProps
> = (props, ref) => {
  // interruptible stores the override to enable/disable the setting for an execution
  const [interruptible, setInterruptible] = useState(false);
  // indeterminate tracks whether the interruptible flag is unspecified/indeterminate (true) or an override has been selected (false)
  const [indeterminate, setIndeterminate] = useState(true);

  useEffect(() => {
    if (isValueValid(props.initialValue) && isValueValid(props.initialValue!.value)) {
      setInterruptible(() => props.initialValue!.value!);
      setIndeterminate(() => false);
    } else {
      setInterruptible(() => false);
      setIndeterminate(() => true);
    }
  }, [props.initialValue?.value]);

  const handleInputChange = useCallback(() => {
    if (indeterminate) {
      setInterruptible(() => true);
      setIndeterminate(() => false);
    } else if (interruptible) {
      setInterruptible(() => false);
      setIndeterminate(() => false);
    } else {
      setInterruptible(() => false);
      setIndeterminate(() => true);
    }
  }, [interruptible, indeterminate]);

  useImperativeHandle(
    ref,
    () => ({
      getValue: () => {
        if (indeterminate) {
          return null;
        }

        return Protobuf.BoolValue.create({ value: interruptible });
      },
      validate: () => true,
    }),
    [interruptible, indeterminate],
  );

  const styles = useStyles();

  // TODO: to cover all text variants in localization conditional
  const getInterruptibleLabel = () => {
    if (indeterminate) {
      return (
        <Typography
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >{`${t('interruptible')} (no override)`}</Typography>
      );
    }
    if (interruptible) {
      return <Typography>{`${t('interruptible')} (enabled)`}</Typography>;
    }
    return <Typography>{`${t('interruptible')} (disabled)`}</Typography>;
  };

  return (
    <section>
      <header className={styles.sectionHeader}>
        <Typography variant="h6">Override interruptible flag</Typography>
        <Typography variant="body2">
          Overrides the interruptible flag of a workflow for a single execution, allowing it to be
          forced on or off. If no value was selected, the workflow's default will be used.
        </Typography>
      </header>
      <section title={t('interruptible')}>
        <FormControlLabel
          control={
            <Checkbox
              checked={interruptible}
              indeterminate={indeterminate}
              onChange={handleInputChange}
            />
          }
          label={getInterruptibleLabel()}
        />
      </section>
    </section>
  );
};

export const LaunchInterruptibleInput = forwardRef(LaunchInterruptibleInputImpl);
