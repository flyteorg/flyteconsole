import { Project } from '../../../../models/Project/types';
import { Routes } from '../../../../routes/routes';

export const formatProjectEntitiesAsDomains = (
  pathname: string,
  projectId: string,
  data: Project[] = [],
) => {
  if (!data.length) return [];

  const project = data.find((p) => p.id === projectId) || data[0];

  // maintain the current app context
  // bring to "app" root on domain/project switch
  let urlBuilder = Routes.ProjectDetails.sections.dashboard.makeUrl;
  if (
    pathname.includes('/workflow/') || // versions
    pathname.endsWith('/workflows') || // list page
    pathname.includes('/workflows/') //  details
  ) {
    urlBuilder = Routes.ProjectDetails.sections.workflows.makeUrl;
  } else if (
    pathname.includes('/task/') || // versions
    pathname.endsWith('/tasks') || // list page
    pathname.includes('/tasks/') // details
  ) {
    urlBuilder = Routes.ProjectDetails.sections.tasks.makeUrl;
  } else if (
    pathname.includes('/launch_plan/') || // versions
    pathname.endsWith('/launchPlans') || // list page
    pathname.includes('/launchPlans/') // details
  ) {
    urlBuilder = Routes.ProjectDetails.sections.launchPlans.makeUrl;
  }

  return project.domains.map((domain) => {
    const url = urlBuilder(project.id, domain.id);

    return {
      title: domain.name,
      id: domain.id,
      createdAt: '',
      url,
    };
  });
};
