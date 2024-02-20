import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import withRouteParams from '../../common/withRouteParams';
import { withExecutionDetails } from './withExecutionDetails';
import { ExecutionContainer, type ExecutionDetailsRouteParams } from './ExecutionContainer';

export const ExecutionDetails: React.FunctionComponent<
  RouteComponentProps<ExecutionDetailsRouteParams>
> = withRouteParams<ExecutionDetailsRouteParams>(withExecutionDetails(ExecutionContainer));

export default ExecutionDetails;
