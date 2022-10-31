import { makeStyles, Theme } from '@material-ui/core/styles';
import { noneString } from 'common/constants';
import { sortedObjectKeys, Variable, Task } from '@flyteconsole/components';
import { DetailsGroup } from 'components/common/DetailsGroup';
import { useCommonStyles } from '@flyteconsole/ui-atoms';
import { formatType, getInputDefintionForLiteralType } from 'components/Launch/LaunchForm/utils';
import * as React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  label: {
    marginRight: theme.spacing(1),
  },
  typeAnnotationContainer: {
    paddingLeft: theme.spacing(0.5),
  },
  typeAnnotation: {
    color: theme.palette.secondary.main,
  },
}));

const emptyVariables = {
  variables: {},
};

const VariablesList: React.FC<{ variables: Record<string, Variable> }> = ({ variables }) => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();
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
        <span key={`${name}-type`} className={styles.typeAnnotationContainer}>
          (<span className={styles.typeAnnotation}>{typeString}</span>)
        </span>,
      );
    }
    return out;
  }, []);
  return <span className={commonStyles.textMonospace}>{output.length ? output : noneString}</span>;
};

/** Renders Task interface details as two basic string lists with type annotations. */
export const SimpleTaskInterface: React.FC<{ task: Task }> = ({ task }) => {
  const { inputs = emptyVariables, outputs = emptyVariables } =
    task.closure.compiledTask.template.interface || {};
  return (
    <div>
      <DetailsGroup
        labelWidthGridUnits={5}
        items={[
          {
            name: 'inputs',
            content: <VariablesList variables={inputs.variables} />,
          },
          {
            name: 'outputs',
            content: <VariablesList variables={outputs.variables} />,
          },
        ]}
      />
    </div>
  );
};
