import { getExecutionSpecProjectDomain } from '..';
import { BreadcrumbFormControlInterface } from '../../../types';
import { DomainIdentifierScope } from '../../../../../models/Common/types';

describe('getExecutionSpecProjectDomain', () => {
  const breadcrumb = { projectId: 'production', domainId: 'staging' } as BreadcrumbFormControlInterface;

  it('returns the execution spec project and domain', () => {
    const executionSpecIdentifier = {
      project: 'my-project',
      domain: 'development',
    } as DomainIdentifierScope;

    expect(getExecutionSpecProjectDomain(executionSpecIdentifier, breadcrumb)).toEqual({
      project: 'my-project',
      domain: 'development',
    });
  });

  it('returns the execution domain when a project is named after a domain', () => {
    // breadcrumb.projectId ('production') matches the execution's domain, which is the case the
    // domain branch compares against.
    const executionSpecIdentifier = {
      project: 'my-project',
      domain: 'production',
    } as DomainIdentifierScope;

    expect(getExecutionSpecProjectDomain(executionSpecIdentifier, breadcrumb)).toEqual({
      project: 'my-project',
      domain: 'production',
    });
  });
});
