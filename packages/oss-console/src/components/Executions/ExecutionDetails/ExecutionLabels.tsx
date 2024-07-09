import React from 'react';
import Chip from '@mui/material/Chip';
import makeStyles from '@mui/styles/makeStyles';

type ValuesType = {[p: string]: string};
interface Props {
  values: ValuesType;
}

const useStyles = makeStyles({
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: '420px'
  },
  chip: {
    margin: 4,
  },
});


export const ExecutionLabels: React.FC<Props> = ({values}) => {
  const classes = useStyles();
  return (
    <div className={classes.chipContainer}>
      {Object.entries(values).map(([key, value]) => (
        <Chip
          key={key}
          label={value ? `${key}: ${value}` : key}
          className={classes.chip}
        />
      ))}
    </div>
  );
};
