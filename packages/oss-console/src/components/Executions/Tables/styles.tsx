import React from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import { headerGridHeight } from '@clients/common/constants/tableConstants';
import { nodeExecutionsTableColumnWidths, workflowVersionsTableColumnWidths } from './constants';

export const selectedClassName = 'selected';
export const grayedClassName = 'grayed';

// NOTE: The order of these `makeStyles` calls is important, as it determines
// specificity in the browser. The execution table styles are overridden by
// the columns styles in some cases. So the column styles should be defined
// last.
// DEPRICATED, REMOVE ONCE VARIFIED
const executionTableStylesNameSpace = 'EXECUTION_TABLE-';
const executionTableStyles: Record<string, string> = {
  filters: `${executionTableStylesNameSpace}filters`,
  grayedClassName: `${executionTableStylesNameSpace}grayedClassName`,
  borderBottom: `${executionTableStylesNameSpace}borderBottom`,
  errorContainer: `${executionTableStylesNameSpace}errorContainer`,
  expander: `${executionTableStylesNameSpace}expander`,
  headerColumn: `${executionTableStylesNameSpace}headerColumn`,
  headerColumnVersion: `${executionTableStylesNameSpace}headerColumnVersion`,
  noRowsContent: `${executionTableStylesNameSpace}noRowsContent`,
  row: `${executionTableStylesNameSpace}row`,
  rowColumns: `${executionTableStylesNameSpace}rowColumns`,
  rowColumn: `${executionTableStylesNameSpace}rowColumn`,
};

export const ExecutionTableStyles = () => {
  const theme = useTheme();
  return (
    <GlobalStyles
      styles={{
        [`.${executionTableStyles.filters}`]: {
          paddingLeft: theme.spacing(3),
        },
        [`.${executionTableStyles.grayedClassName}`]: {
          color: theme.palette.grey[300],
        },
        [`.${executionTableStyles.borderBottom}`]: {
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
        [`.${executionTableStyles.errorContainer}`]: {
          '& .errorMessage': {
            maxHeight: 300,
            overflowY: 'auto',
          },
        },
        [`.${executionTableStyles.expander}`]: {
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          marginLeft: theme.spacing(-4),
          marginRight: theme.spacing(1),
          width: theme.spacing(3),
        },
        [`.${executionTableStyles.headerColumn}`]: {
          marginRight: theme.spacing(1),
          minWidth: 0,
          '&:first-of-type': {
            marginLeft: theme.spacing(2),
          },
        },
        [`.${executionTableStyles.headerColumnVersion}`]: {
          width: theme.spacing(4),
        },
        [`.${executionTableStyles.headerRow}`]: {
          alignItems: 'center',
          borderBottom: `4px solid ${theme.palette.divider}`,
          borderTop: `1px solid ${theme.palette.divider}`,
          color: CommonStylesConstants.tableHeaderColor,
          display: 'flex',
          fontFamily: CommonStylesConstants.headerFontFamily,
          flexDirection: 'row',
          height: theme.spacing(headerGridHeight),
        },
        [`.${executionTableStyles.noRowsContent}`]: {
          color: CommonStylesConstants.tablePlaceholderColor,
          margin: `${theme.spacing(5)} auto`,
          textAlign: 'center',
        },
        [`.${executionTableStyles.row}`]: {
          '&:hover': {
            backgroundColor: CommonStylesConstants.listhoverColor,
          },
          [`&.${selectedClassName}`]: {
            backgroundColor: CommonStylesConstants.listhoverColor,
          },
          [`&.${grayedClassName}`]: {
            color: theme.palette.grey[300],
          },
        },
        [`.${executionTableStyles.rowColumn}`]: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      }}
    />
  );
};

export const useExecutionTableStyles = () => {
  return executionTableStyles;
};

const columnStylesNameSpace = 'COLUMN_TABLE-';
const columnStyles: Record<string, string> = {
  columnName: `${columnStylesNameSpace}columnName`,
  columnNodeId: `${columnStylesNameSpace}columnNodeId`,
  columnType: `${columnStylesNameSpace}columnType`,
  columnStatus: `${columnStylesNameSpace}columnStatus`,
  columnStartedAt: `${columnStylesNameSpace}columnStartedAt`,
  columnDuration: `${columnStylesNameSpace}columnDuration`,
  columnLogs: `${columnStylesNameSpace}columnLogs`,
  selectedExecutionName: `${columnStylesNameSpace}selectedExecutionName`,
};

export const ColumnStyles = () => {
  const theme = useTheme();
  return (
    <GlobalStyles
      styles={{
        [`&.${executionTableStyles.grayedClassName}`]: {
          color: theme.palette.grey[400],
        },
        [`.${columnStyles.columnNodeId}`]: {
          minWidth: nodeExecutionsTableColumnWidths.nodeId,
          [`&.${grayedClassName}`]: {
            color: theme.palette.grey[400],
          },
        },
        [`.${columnStyles.columnType}`]: {
          minWidth: nodeExecutionsTableColumnWidths.type,
          textTransform: 'capitalize',
          [`&.${grayedClassName}`]: {
            color: theme.palette.grey[400],
          },
        },
        [`.${columnStyles.columnStatus}`]: {
          minWidth: nodeExecutionsTableColumnWidths.phase,
        },
        [`.${columnStyles.columnStartedAt}`]: {
          minWidth: nodeExecutionsTableColumnWidths.startedAt,
          [`&.${grayedClassName}`]: {
            color: theme.palette.grey[400],
          },
        },
        [`.${columnStyles.columnDuration}`]: {
          minWidth: nodeExecutionsTableColumnWidths.duration,
          textAlign: 'right',
          [`&.${grayedClassName}`]: {
            color: theme.palette.grey[400],
          },
        },
        [`.${columnStyles.columnLogs}`]: {
          minWidth: nodeExecutionsTableColumnWidths.logs,
          [`&.${grayedClassName}`]: {
            color: theme.palette.grey[400],
          },
        },
        [`.${columnStyles.selectedExecutionName}`]: {
          fontWeight: 'bold',
        },
      }}
    />
  );
};

export const useColumnStyles = () => {
  return columnStyles;
};

export const useWorkflowVersionsColumnStyles = makeStyles(() => ({
  columnRadioButton: {
    width: workflowVersionsTableColumnWidths.radio,
  },
  columnName: {
    minWidth: workflowVersionsTableColumnWidths.name,
    whiteSpace: 'normal',
  },
  columnCreatedAt: {
    minWidth: workflowVersionsTableColumnWidths.createdAt,
  },
  columnLastRun: {
    minWidth: workflowVersionsTableColumnWidths.lastRun,
  },
  columnRecentRun: {
    minWidth: workflowVersionsTableColumnWidths.recentRun,
  },
}));
