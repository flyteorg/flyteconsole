import { Typography } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import * as React from 'react';
import { useStyles } from './styles';
import { LaunchOverwriteCacheInputRef } from './types';
import t from './strings';

const isValueValid = (value: any) => {
  return value !== undefined && value !== null;
};

interface LaunchOverwriteCacheInputProps {
  initialValue?: boolean | null;
}

export const LaunchOverwriteCacheInputImpl: React.ForwardRefRenderFunction<
  LaunchOverwriteCacheInputRef,
  LaunchOverwriteCacheInputProps
> = (props, ref) => {
  // overwriteCache stores the override to enable/disable the setting for an execution
  const [overwriteCache, setOverwriteCache] = React.useState(false);

  React.useEffect(() => {
    if (isValueValid(props.initialValue)) {
      setOverwriteCache(() => props.initialValue!);
    }
  }, [props.initialValue]);

  const handleInputChange = React.useCallback(() => {
    setOverwriteCache((prevState) => !prevState);
  }, [overwriteCache]);

  React.useImperativeHandle(
    ref,
    () => ({
      getValue: () => {
        return overwriteCache;
      },
      validate: () => true,
    }),
    [overwriteCache],
  );

  const styles = useStyles();

  return (
    <section>
      <header className={styles.sectionHeader}>
        <Typography variant="h6">Caching</Typography>
        <Typography variant="body2">
          Enabling the cache overwrite causes Flyte to ignore all previously computed and stored
          outputs for a single execution and run all calculations again, overwriting any cached data
          after a successful execution.
        </Typography>
      </header>
      <section title={t('overwriteCache')}>
        <FormControlLabel
          control={<Checkbox checked={overwriteCache} onChange={handleInputChange} />}
          label={t('overwriteCache')}
        />
      </section>
    </section>
  );
};

export const LaunchOverwriteCacheInput = React.forwardRef(LaunchOverwriteCacheInputImpl);
