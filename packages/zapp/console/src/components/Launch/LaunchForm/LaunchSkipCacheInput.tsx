import { Typography } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import * as React from 'react';
import { useStyles } from './styles';
import { LaunchSkipCacheInputRef } from './types';
import t from './strings';

const isValueValid = (value: any) => {
  return value !== undefined && value !== null;
};

interface LaunchSkipCacheInputProps {
  initialValue?: boolean | null;
}

export const LaunchSkipCacheInputImpl: React.ForwardRefRenderFunction<
  LaunchSkipCacheInputRef,
  LaunchSkipCacheInputProps
> = (props, ref) => {
  // interruptible stores the override to enable/disable the setting for an execution
  const [skipCache, setSkipCache] = React.useState(false);

  React.useEffect(() => {
    if (isValueValid(props.initialValue)) {
      setSkipCache(() => props.initialValue!);
    }
  }, [props.initialValue]);

  const handleInputChange = React.useCallback(() => {
    setSkipCache((prevState) => !prevState);
  }, [skipCache]);

  React.useImperativeHandle(
    ref,
    () => ({
      getValue: () => {
        return skipCache;
      },
      validate: () => true,
    }),
    [skipCache],
  );

  const styles = useStyles();

  return (
    <section>
      <header className={styles.sectionHeader}>
        <Typography variant="h6">Caching</Typography>
        <Typography variant="body2">
          Enabling the cache skip causes Flyte to ignore all previously computed and stored outputs
          for a single execution and run all calculations again, overwriting any cached data after a
          successful execution.
        </Typography>
      </header>
      <section title={t('skipCache')}>
        <FormControlLabel
          control={<Checkbox checked={skipCache} onChange={handleInputChange} />}
          label={t('skipCache')}
        />
      </section>
    </section>
  );
};

export const LaunchSkipCacheInput = React.forwardRef(LaunchSkipCacheInputImpl);
