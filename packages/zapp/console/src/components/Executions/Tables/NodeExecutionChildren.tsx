import { Button, Typography } from '@material-ui/core';
import { Theme, makeStyles } from '@material-ui/core/styles';
import classnames from 'classnames';
// import { getCacheKey } from 'components/Cache/utils';
import { useTheme } from 'components/Theme/useTheme';
// import { Admin } from 'flyteidl';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { NodeExecutionGroup } from '../types';
// import { NodeExecutionRow } from './NodeExecutionRow';
import { useExecutionTableStyles } from './styles';
import { NodeExecutionColumnDefinition } from './types';
import { calculateNodeExecutionRowLeftSpacing } from './utils';
import t from './strings';

export interface NodeExecutionChildrenProps {
  columns: NodeExecutionColumnDefinition[];
  childGroups: NodeExecutionGroup[];
  level: number;
}

const PAGE_SIZE = 50;

const useStyles = makeStyles((theme: Theme) => ({
  loadMoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

/** Renders a nested list of row items for children of a NodeExecution */
export const NodeExecutionChildren: React.FC<NodeExecutionChildrenProps> = ({
  columns,
  childGroups,
  level,
}) => {
  const styles = useStyles();
  const showNames = childGroups.length > 1;
  const tableStyles = useExecutionTableStyles();
  const theme = useTheme();
  const childGroupLabelStyle = {
    // The label is aligned with the parent above, so remove one level of spacing
    marginLeft: `${calculateNodeExecutionRowLeftSpacing(level - 1, theme.spacing)}px`,
  };
  const [loadedNodes, setLoadedNodes] = useState(new Array(childGroups.length).fill(PAGE_SIZE));

  const loadMoreRows = useCallback(
    (which: number) => () => {
      const newLoadedNodes = [...loadedNodes];
      newLoadedNodes[which] += PAGE_SIZE;
      setLoadedNodes(newLoadedNodes);
    },
    [loadedNodes],
  );

  const loadMoreButton = (which: number) => (
    <div className={styles.loadMoreContainer}>
      <Button onClick={loadMoreRows(which)} size="small" variant="outlined">
        {t('loadMoreButton')}
      </Button>
    </div>
  );

  return (
    <>
      {childGroups.map(({ name, nodeExecutions }, groupIndex) => {
        const rows = nodeExecutions
          .slice(0, loadedNodes[groupIndex])
          .map((nodeExecution, index) => (
            // <NodeExecutionRow
            //   abortMetadata={abortMetadata}
            //   columns={columns}
            //   key={getCacheKey(nodeExecution.id)}
            //   index={index}
            //   nodeExecution={nodeExecution}
            //   level={level}
            // />
            <>child!!!</>
          ));
        const key = `group-${name}`;
        return showNames ? (
          <div key={key} role="list">
            <div
              className={classnames(
                { [tableStyles.borderTop]: groupIndex > 0 },
                tableStyles.borderBottom,
                tableStyles.childGroupLabel,
              )}
              title={name}
              style={childGroupLabelStyle}
            >
              <Typography variant="overline" color="textSecondary">
                {name}
              </Typography>
            </div>
            <div>{rows}</div>
            {loadMoreButton(groupIndex)}
          </div>
        ) : (
          <div key={key} role="list">
            {rows}
            {nodeExecutions.length > loadedNodes[groupIndex] && loadMoreButton(groupIndex)}
          </div>
        );
      })}
    </>
  );
};
