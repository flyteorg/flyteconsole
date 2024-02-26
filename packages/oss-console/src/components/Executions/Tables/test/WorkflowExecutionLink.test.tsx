import React from 'react';
import { Router, Route } from 'react-router-dom';
import { fireEvent, render } from '@testing-library/react';
import { history } from '../../../../routes/history';
import { WorkflowExecutionLink } from '../WorkflowExecutionLink';
import { WorkflowExecutionIdentifier } from '../../../../models/Execution/types';

const testWorkflowId = {
  name: 'click-me',
  project: 'test-project',
  domain: 'test-domain',
} as WorkflowExecutionIdentifier;

const TestSubjectApp = () => (
  <div>
    <Route
      exact
      path="/console/projects/flytesnacks/domains/development/executions/:executionId"
      render={() => (
        <div>
          <h1>Welcome</h1>
        </div>
      )}
    />
    <Route
      path="/console/projects/flytesnacks/domains/development/launchPlans/:launchPlanName"
      render={() => (
        <div>
          <h1>Dashboard</h1>
          <WorkflowExecutionLink id={testWorkflowId} className="test-click-me" />
        </div>
      )}
    />
  </div>
);

it('should format a backlink on navigation', () => {
  const initialPathname = '/console/projects/flytesnacks/domains/development/launchPlans/testId';
  const initialUrl = `${initialPathname}?foo=bar#hash`;

  history.push(initialUrl);

  const testRender = render(
    <Router history={history}>
      Foo
      <TestSubjectApp />
    </Router>,
  );

  expect(history.location.pathname).toBe(initialPathname);

  fireEvent.click(testRender.getByText(testWorkflowId.name));

  // Navigated
  expect(history.location.state?.backLink).toBe(initialUrl);
});
