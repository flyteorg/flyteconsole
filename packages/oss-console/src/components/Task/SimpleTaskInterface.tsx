import React from 'react';
import styled from '@mui/system/styled';
import Typography from '@mui/material/Typography';
import { Shimmer } from '@clients/primitives/Shimmer';
import { noneString } from '@clients/common/constants';
import { sortedObjectKeys } from '../../common/utils';
import { DetailsGroup } from '../common/DetailsGroup';
import { formatType, getInputDefintionForLiteralType } from '../Launch/LaunchForm/utils';
import { Variable } from '../../models/Common/types';
import { Task } from '../../models/Task/types';

const SimpleTaskInterfaceContainer = styled('div')(({ theme }) => ({
  '.label': {
    marginRight: theme.spacing(1),
  },
  '.typeAnnotationContainer': {
    paddingLeft: theme.spacing(0.5),
  },
  '.typeAnnotation': {
    color: theme.palette.secondary.main,
  },
}));

const emptyVariables = {
  variables: {},
};

export const VariablesList: React.FC<{ variables: Record<string, Variable> }> = ({ variables }) => {
  const output = sortedObjectKeys(variables).reduce<React.ReactNode[]>((out, name, idx) => {
    const variable = variables[name];
    out.push(
      <span key={`${name}-label`}>
        {idx > 0 ? ', ' : ''}
        {name}
      </span>,
    );
    const typeString = formatType(getInputDefintionForLiteralType(variable.type));
    if (typeString.length > 0) {
      out.push(
        <span key={`${name}-type`} className="typeAnnotationContainer">
          (<span className="typeAnnotation">{typeString}</span>)
        </span>,
      );
    }
    return out;
  }, []);
  return <Typography variant="code">{output.length ? output : noneString}</Typography>;
};

/** Renders Task interface details as two basic string lists with type annotations. */
export const SimpleTaskInterface: React.FC<{
  task?: Task;
  isLoading: boolean;
  isError: boolean;
  ErrorComponent: React.FC;
}> = ({ task, isLoading, isError, ErrorComponent }) => {
  const { inputs = emptyVariables, outputs = emptyVariables } =
    task?.closure?.compiledTask?.template?.interface || {};
  const description = task?.shortDescription || 'No description found.';
  const key = JSON.stringify(task?.id || {});
  return (
    <SimpleTaskInterfaceContainer>
      <DetailsGroup
        // labelWidthGridUnits={10}
        items={[
          {
            name: 'inputs',
            content: isLoading ? (
              <Shimmer key={`${key}-inputs`} />
            ) : isError ? (
              <ErrorComponent />
            ) : (
              <VariablesList variables={inputs.variables} />
            ),
          },
          {
            name: 'outputs',
            content: isLoading ? (
              <Shimmer key={`${key}-outputs`} />
            ) : isError ? (
              <ErrorComponent />
            ) : (
              <VariablesList variables={outputs.variables} />
            ),
          },
          {
            name: 'description',
            content: isLoading ? (
              <Shimmer key={`${key}-description`} />
            ) : isError ? (
              <ErrorComponent />
            ) : (
              <span>{description}</span>
            ),
          },
        ]}
      />
    </SimpleTaskInterfaceContainer>
  );
};
