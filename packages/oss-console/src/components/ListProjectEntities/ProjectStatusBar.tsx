import React from 'react';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';
import styled from '@mui/system/styled';
import { WorkflowExecutionPhase } from '../../models/Execution/enums';

import { useCommonStyles } from '../common/styles';
import { getExecutionStatusClassName } from '../utils/classes';

const StyledContainer = styled('div')(() => ({
  display: 'block',
  '& .barItem': {
    display: 'inline-block',
    marginRight: 2,
    borderRadius: 2,
    width: 10,
    height: 12,
  },
  '& .linkInactive': {
    cursor: 'default',
  },
}));

interface ProjectStatusBarProps {
  items: WorkflowExecutionPhase[];
  paths: string[];
}

/**
 * Renders status of executions
 * @param items
 * @constructor
 */
const ProjectStatusBar: React.FC<ProjectStatusBarProps> = ({ items, paths }) => {
  const commonStyles = useCommonStyles();
  const history = useHistory();
  return (
    <StyledContainer>
      {items.map((item, idx) => {
        return (
          // eslint-disable-next-line jsx-a11y/control-has-associated-label
          <span
            role="button"
            tabIndex={0}
            className={classNames(commonStyles.linkUnstyled, !paths[idx] && 'linkInactive')}
            onClick={(e) => {
              if (!paths[idx]) {
                return;
              }
              history.push(paths[idx]);
              e.stopPropagation();
            }}
            // eslint-disable-next-line react/no-array-index-key
            key={`bar-item-${idx}`}
          >
            <div
              className={classNames('barItem', {
                [getExecutionStatusClassName('background', item)]: true,
              })}
            />
          </span>
        );
      })}
    </StyledContainer>
  );
};

export default ProjectStatusBar;
