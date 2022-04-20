import { Typography } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import * as React from 'react';
import { useStyles } from './styles';
import { LaunchInterruptibleInputRef } from './types';

export interface LaunchInterruptibleInputProps {
  initialValue?: boolean | null;
}

export const LaunchInterruptibleInputImpl: React.ForwardRefRenderFunction<
  LaunchInterruptibleInputRef,
  LaunchInterruptibleInputProps
> = (props, ref) => {
  const [interruptible, setInterruptible] = React.useState(false);

  React.useEffect(() => {
    if (props.initialValue !== null && props.initialValue !== undefined) {
      setInterruptible(props.initialValue);
    }
  }, [props]);

  const handleInputChange = React.useCallback(() => {
    setInterruptible((prevState) => !prevState);
  }, []);

  React.useImperativeHandle(
    ref,
    () => ({
      getValue: () => interruptible,
      validate: () => true,
    }),
    [interruptible],
  );

  const styles = useStyles();

  return (
    <section>
      <header className={styles.sectionHeader}>
        <Typography variant="h6">Mark as interruptible</Typography>
        <Typography variant="body2">
          Marks the selected workflow (and all sub-workflows) as interruptible for a single
          execution.
        </Typography>
      </header>
      <section title="Mark as interruptible">
        <FormControlLabel
          control={<Checkbox checked={interruptible} onChange={handleInputChange} />}
          label="Interruptible"
        />
      </section>
    </section>
  );
};

export const LaunchInterruptibleInput = React.forwardRef(LaunchInterruptibleInputImpl);
