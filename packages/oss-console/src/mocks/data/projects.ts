import { Project } from '../../models/Project/types';
import { testDomain, testProject } from './constants';

const flyteTest: Project = {
  id: testProject,
  name: testProject,
  description: 'An umbrella project with a single domain to contain all of the test data.',
  domains: [
    {
      id: testDomain,
      name: testDomain,
    },
  ],
};

export const projects = {
  flyteTest,
};
