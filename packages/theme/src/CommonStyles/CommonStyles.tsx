import GlobalStyles from '@mui/system/GlobalStyles';
import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  buttonHoverColor,
  dangerousButtonBorderColor,
  dangerousButtonColor,
  dangerousButtonHoverColor,
  mutedPrimaryTextColor,
  smallFontSize,
} from './constants';
import { buttonGroup, unstyledLinkProps } from './utils';

const NAMESPACE = 'COMMON_STYLES';

const commonStyles: Record<string, string> = {
  buttonWhiteOutlined: `${NAMESPACE}-button-white-outlined`,
  codeBlock: `${NAMESPACE}-codeBlock`,
  flexCenter: `${NAMESPACE}-flexCenter`,
  dangerousButton: `${NAMESPACE}-dangerousButton`,
  errorText: `${NAMESPACE}-errorText`,
  flexFill: `${NAMESPACE}-flexFill`,
  formButtonGroup: `${NAMESPACE}-formButtonGroup`,
  formControlLabelSmall: `${NAMESPACE}-formControlLabelSmall`,
  formControlSmall: `${NAMESPACE}-formControlSmall`,
  hintText: `${NAMESPACE}-hintText`,
  iconLeft: `${NAMESPACE}-iconLeft`,
  iconRight: `${NAMESPACE}-iconRight`,
  iconSecondary: `${NAMESPACE}-iconSecondary`,
  linkUnstyled: `${NAMESPACE}-linkUnstyled`,
  listUnstyled: `${NAMESPACE}-listUnstyled`,
  microHeader: `${NAMESPACE}-microHeader`,
  mutedHeader: `${NAMESPACE}-mutedHeader`,
  primaryLink: `${NAMESPACE}-primaryLink`,
  secondaryLink: `${NAMESPACE}-secondaryLink`,
  smallDropdownWindow: `${NAMESPACE}-smallDropdownWindow`,
  textMonospace: `${NAMESPACE}-textMonospace`,
  textMuted: `${NAMESPACE}-textMuted`,
  textSmall: `${NAMESPACE}-textSmall`,
  textWrapped: `${NAMESPACE}-textWrapped`,
  truncateText: `${NAMESPACE}-truncateText`,
};

export const CommonStyles = () => {
  const theme = useTheme();
  return (
    <GlobalStyles
      styles={{
        [`.${commonStyles.buttonWhiteOutlined}`]: {
          backgroundColor: theme.palette.common.primary.white,
          '&:hover': {
            backgroundColor: buttonHoverColor,
          },
        },
        [`.${commonStyles.codeBlock}`]: {
          display: 'block',
          fontFamily: 'monospace',
          marginTop: theme.spacing(1),
          textTransform: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          wordWrap: 'break-word',
        },
        [`.${commonStyles.dangerousButton}`]: {
          borderColor: dangerousButtonBorderColor,
          color: dangerousButtonColor,
          '&:hover': {
            borderColor: dangerousButtonHoverColor,
            color: dangerousButtonHoverColor,
          },
        },
        [`.${commonStyles.errorText}`]: {
          color: theme.palette.error.main,
        },
        [`.${commonStyles.flexCenter}`]: {
          alignItems: 'center',
          display: 'flex',
        },
        [`.${commonStyles.flexFill}`]: {
          flex: '1 1 100%',
        },
        [`.${commonStyles.formButtonGroup}`]: {
          ...buttonGroup(theme),
          justifyContent: 'center',
          marginTop: theme.spacing(1),
        },
        [`.${commonStyles.formControlLabelSmall}`]: {
          // This is adjusting the negative margin used by
          // FormControlLabel to make sure the control lines up correctly
          marginLeft: -3,
          marginTop: theme.spacing(1),
        },
        [`.${commonStyles.formControlSmall}`]: {
          marginRight: theme.spacing(1),
          padding: 0,
        },
        [`.${commonStyles.hintText}`]: {
          // MIGRATION_TODO
          color: theme.palette.info.light,
        },
        [`.${commonStyles.iconLeft}`]: {
          marginRight: theme.spacing(1),
        },
        [`.${commonStyles.iconRight}`]: {
          marginLeft: theme.spacing(1),
        },
        [`.${commonStyles.iconSecondary}`]: {
          color: theme.palette.text.secondary,
        },
        [`.${commonStyles.linkUnstyled}`]: {
          ...unstyledLinkProps,
          '&:hover': {
            ...unstyledLinkProps,
          },
        },
        [`.${commonStyles.listUnstyled}`]: {
          listStyle: 'none',
          margin: 0,
          padding: 0,
          '& li': {
            padding: 0,
          },
        },
        [`.${commonStyles.microHeader}`]: {
          textTransform: 'uppercase',
          fontWeight: 'bold',
          fontSize: smallFontSize,
          lineHeight: '.9375rem',
        },
        [`.${commonStyles.mutedHeader}`]: {
          color: mutedPrimaryTextColor,
          fontWeight: 'bold',
          fontSize: '1rem',
          lineHeight: '1.375rem',
        },
        [`.${commonStyles.primaryLink}`]: {
          color: theme.palette.info.main,
          cursor: 'pointer',
          fontWeight: 'bold',
          textDecoration: 'none',
          '&:hover': {
            color: theme.palette.primary.main,
            textDecoration: 'underline',
          },
        },
        [`.${commonStyles.secondaryLink}`]: {
          color: theme.palette.text.secondary,
          cursor: 'pointer',
          fontWeight: 'bold',
          textDecoration: 'none',
          '&:hover': {
            color: theme.palette.text.secondary,
            textDecoration: 'underline',
          },
        },
        [`.${commonStyles.smallDropdownWindow}`]: {
          border: `1px solid ${theme.palette.divider}`,
          marginTop: theme.spacing(0.5),
        },
        [`.${commonStyles.textMonospace}`]: {
          textTransform: 'none',
          fontFamily: 'monospace',
        },
        [`.${commonStyles.textMuted}`]: {
          color: theme.palette.grey[500],
        },
        [`.${commonStyles.textSmall}`]: {
          fontSize: smallFontSize,
          lineHeight: 1.25,
        },
        [`.${commonStyles.textWrapped}`]: {
          overflowWrap: 'break-word',
          wordBreak: 'break-all',
        },
        [`.${commonStyles.truncateText}`]: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      }}
    />
  );
};

export const useCommonStyles = () => {
  return commonStyles;
};
