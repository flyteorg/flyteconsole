import React from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';
import { useTheme } from '@mui/material/styles';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';

const namespace = 'LAUNCHFORM_STYLES-';

const launchFormStyles = {
  footer: `${namespace}footer`,
  formControl: `${namespace}formControl`,
  header: `${namespace}header`,
  inputsSection: `${namespace}inputsSection`,
  inputLabel: `${namespace}inputLabel`,
  root: `${namespace}root`,
  sectionHeader: `${namespace}sectionHeader`,
  advancedOptions: `${namespace}advancedOptions`,
  viewNodeInputs: `${namespace}viewNodeInputs`,
  noBorder: `${namespace}noBorder`,
  summaryWrapper: `${namespace}summaryWrapper`,
  detailsWrapper: `${namespace}detailsWrapper`,
  collapsibleSection: `${namespace}collapsibleSection`,
};

export const useStyles = () => {
  return launchFormStyles;
};

export const LaunchFormStyles = () => {
  const theme = useTheme();

  return (
    <GlobalStyles
      styles={{
        [`.${launchFormStyles.footer}`]: {
          // padding: theme.spacing(2),
        },
        [`.${launchFormStyles.formControl}`]: {
          padding: `${theme.spacing(1.5)} 0`,
        },
        [`.${launchFormStyles.header}`]: {
          // padding: theme.spacing(2),
          // width: '100%',
        },
        [`.${launchFormStyles.inputsSection}`]: {
          // padding: theme.spacing(2),
          // maxHeight: theme.spacing(90),
        },
        [`.${launchFormStyles.inputLabel}`]: {
          color: theme.palette.info.main,
          fontSize: CommonStylesConstants.smallFontSize,
        },
        [`.${launchFormStyles.root}`]: {
          // display: 'flex',
          // flexDirection: 'column',
          // width: '100%',
        },
        [`.${launchFormStyles.sectionHeader}`]: {
          marginBottom: theme.spacing(1),
          marginTop: theme.spacing(1),
          '& > h6': {
            paddingBottom: '0.5em',
          },
        },
        [`.${launchFormStyles.advancedOptions}`]: {
          color: theme.palette.primary.main,
          justifyContent: 'flex-end',
          paddingRight: 0,
        },
        [`.${launchFormStyles.viewNodeInputs}`]: {
          // color: CommonStylesConstants.interactiveTextColor,
        },
        [`.${launchFormStyles.noBorder}`]: {
          boxShadow: 'none',
          padding: 0,
          '&:before': {
            height: 0,
          },
        },
        [`.${launchFormStyles.summaryWrapper}`]: {
          padding: 0,
        },
        [`.${launchFormStyles.detailsWrapper}`]: {
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: theme.spacing(2),
          paddingBottom: theme.spacing(2),
          '& section': {
            paddingTop: theme.spacing(0),
            paddingBottom: theme.spacing(2),
            '& .MuiAccordionSummary-content': {
              margin: 0,
            },
          },
          '& section h6': {
            paddingBottom: 0,
          },
        },
        [`.${launchFormStyles.collapsibleSection}`]: {
          // margin: 0,
        },
      }}
    />
  );
};
