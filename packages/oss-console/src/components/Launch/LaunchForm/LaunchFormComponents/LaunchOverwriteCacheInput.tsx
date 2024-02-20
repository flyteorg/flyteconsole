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
import { LaunchOverwriteCacheInputRef } from '../types';
import { useStyles } from '../styles';
import t from '../strings';

const isValueValid = (value: any) => {
  return value !== undefined && value !== null;
};

interface LaunchOverwriteCacheInputProps {
  initialValue?: boolean | null;
}

export const LaunchOverwriteCacheInputImpl: ForwardRefRenderFunction<
  LaunchOverwriteCacheInputRef,
  LaunchOverwriteCacheInputProps
> = (props, ref) => {
  // overwriteCache stores the override to enable/disable the setting for an execution
  const [overwriteCache, setOverwriteCache] = useState(false);

  useEffect(() => {
    if (isValueValid(props.initialValue)) {
      setOverwriteCache(() => props.initialValue!);
    }
  }, [props.initialValue]);

  const handleInputChange = useCallback(() => {
    setOverwriteCache((prevState) => !prevState);
  }, [overwriteCache]);

  useImperativeHandle(
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

export const LaunchOverwriteCacheInput = forwardRef(LaunchOverwriteCacheInputImpl);
