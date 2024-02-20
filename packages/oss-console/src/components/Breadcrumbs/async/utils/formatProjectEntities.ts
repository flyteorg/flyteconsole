import { Project } from '../../../../models/Project/types';
import { Routes } from '../../../../routes/routes';

export const formatProjectEntitiesURLAware = (
  pathname: string,
  domainId: string,
  data: Project[] = [],
) => {
  if (!data.length) return [];

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

  return data.map((project) => {
    const isDomainSelected = project.domains.some((domain) => domain.id === domainId);
    const domainIdToUse = isDomainSelected ? domainId : project.domains[0].id;
    const url = urlBuilder(project.id, domainIdToUse);

    return {
      title: project.name,
      id: project.id,
      createdAt: '',
      url,
    };
  });
};
