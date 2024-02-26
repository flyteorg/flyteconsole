import React from 'react';
import { useTheme } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';

const namespace = 'LISTERALS-';

const literalStyles: Record<string, string> = {
  nestedContainer: `${namespace}nestedContainer`,
  labelValueContainer: `${namespace}labelValueContainer`,
  valueLabel: `${namespace}valueLabel`,
};

export const useLiteralStyles = () => {
  return literalStyles;
};

export const LiteralStyles = () => {
  const theme = useTheme();
  return (
    <GlobalStyles
      styles={{
        [`.${literalStyles.nestedContainer}`]: {
          marginLeft: theme.spacing(1),
        },
        [`.${literalStyles.labelValueContainer}`]: {
          display: 'flex',
          flexDirection: 'row',
        },
        [`.${literalStyles.valueLabel}`]: {
          color: theme.palette.grey[500],
          marginRight: theme.spacing(1),
        },
      }}
    />
  );
};
