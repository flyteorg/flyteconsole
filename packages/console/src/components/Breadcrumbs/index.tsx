import {
  FormControl,
  Grid,
  Input,
  InputLabel,
  Popover,
} from '@material-ui/core';
import { ResourceType } from 'models';
import { listWorkflows } from 'models/Workflow/api';
import React, { useMemo } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import isEmpty from 'lodash/isEmpty';
import { Routes } from 'routes';
import { timestampToDate } from 'common';
import { formatDateUTC } from 'common/formatters';
import { listNamedEntities } from 'models/Common/api';
import { defaultPaginationConfig } from 'models/AdminEntity/constants';

export interface Breadcrumb {
  pathId: string;
  label: string;
  defaultValue?: string;
  valididator?: (urlPathId: string, thisPathId: string) => boolean;
  asyncData: (
    projectId: string,
    domainId: string,
  ) => Promise<BreadcrumbEntity[]>;
  customComponent?: React.FC<any>;
  viewAllLink: string | ((projectId: string, domainId: string) => string);
}

interface BreadcrumbEntity {
  url: string;
  title: string;
  createdAt: string;
}

const breadcrumbDefaultvalidator = (urlPathId: string, thisPathId: string) =>
  urlPathId === thisPathId;

const defaultBreadcrumb: Breadcrumb = {
  pathId: 'default',
  label: 'Default',
  defaultValue: 'default',
  valididator: breadcrumbDefaultvalidator,
  asyncData: async (projectId = '', domainId = '') => [],
  viewAllLink: '',
};

const makeBreadcrumb = (config: Partial<Breadcrumb>) => {
  return { ...defaultBreadcrumb, ...config };
};

const formatEntities = data => {
  console.log('data', data);
  return data.entities.map(entity => {
    return {
      title: entity.id.name,
      createdAt: entity?.closure?.createdAt
        ? formatDateUTC(timestampToDate(entity.closure.createdAt))
        : '',
      url: Routes.WorkflowDetails.makeUrl(
        entity.id.project,
        entity.id.domain,
        entity.id.name,
      ),
    };
  });
};

export const breadcrumbRegistry: Breadcrumb[] = [
  makeBreadcrumb({
    pathId: 'projects',
    label: 'Project',
  }),
  makeBreadcrumb({
    pathId: 'domains',
    label: 'Domain',
  }),
  makeBreadcrumb({
    pathId: 'workflows',
    label: 'Workflow',
    asyncData: async (projectId = '', domainId = '') => {
      return listWorkflows({
        project: projectId,
        domain: domainId,
      }).then(data => formatEntities(data));
    },
    viewAllLink: (projectId = '', domainId = '') =>
      Routes.WorkflowDetails.makeUrl(projectId, domainId, ''),
  }),
  makeBreadcrumb({
    pathId: 'tasks',
    label: 'Task',
    asyncData: async (projectId = '', domainId = '') => {
      console.log('*** data async');
      return listNamedEntities(
        {
          project: projectId,
          domain: domainId,
          resourceType: ResourceType.TASK,
        },
        defaultPaginationConfig,
      ).then(data => formatEntities(data));
    },
    viewAllLink: (projectId = '', domainId = '') =>
      Routes.TaskDetails.makeUrl(projectId, domainId, ''),
  }),
];

interface BreadcrumbPopoverInterface extends BreadcrumbFormControlInterface {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const BreadcrumbPopOver = (props: BreadcrumbPopoverInterface) => {
  const { isLoading, error, data } = useQuery(
    `breadcrumb-${props.pathId}`,
    () => props.asyncData(props.projectId, props.domainId),
  );
  const queryData = useMemo(() => {
    if (isEmpty(data) || data === undefined) return [];
    return data;
  }, [data]);

  const viewAllLink =
    typeof props.viewAllLink === 'string'
      ? props.viewAllLink
      : props.viewAllLink(props.projectId, props.domainId);

  console.log('*** BreadcrumbPopOver', data);
  return (
    <Popover
      open={props.open}
      anchorEl={props.anchorEl}
      onClose={props.onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Grid
        container
        spacing={2}
        style={{ maxWidth: 350, maxHeight: '80vh', overflowY: 'scroll' }}
      >
        {queryData.length &&
          queryData.slice(0, 5).map(data => {
            return (
              <>
                <Grid item xs={6}>
                  <Link to={data.url}>{data?.title || 'name not found'}</Link>
                </Grid>
                <Grid item xs={6}>
                  <Link to={data.url}>{data?.createdAt}</Link>
                </Grid>
              </>
            );
          })}
        <Grid item xs={12}>
          <Link to={viewAllLink}>View All…</Link>
        </Grid>
      </Grid>
    </Popover>
  );
};

interface BreadcrumbFormControlInterface extends Breadcrumb {
  value: string;
  key: string;
  projectId: string;
  domainId: string;
}
const BreadcrumbFormControl = (props: BreadcrumbFormControlInterface) => {
  const htmlLabel = `breadcrumb-${props.pathId}`;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <FormControl onClick={handleClick}>
        <InputLabel htmlFor={htmlLabel}>{props.label}</InputLabel>
        <Input
          name={htmlLabel}
          id={htmlLabel}
          defaultValue={props.defaultValue}
          value={props.value}
        />
      </FormControl>
      {!!anchorEl && (
        <BreadcrumbPopOver
          onClose={handleClose}
          anchorEl={anchorEl}
          open={!!anchorEl}
          {...props}
        />
      )}
    </>
  );
};

const BreadCrumbs = () => {
  const routerLocation = useLocation();
  const routerParams = useParams();

  const currentProjectId = routerParams['projectId'] || '';

  const projectQuery = useQuery('projects', () => listProjects());
  const projectData = useMemo(() => {
    return !projectQuery.isLoading && projectQuery.data
      ? projectQuery.data
      : [];
  }, [projectQuery.data, projectQuery.isLoading]);

  const currentDomainId = useMemo(() => {
    if (routerParams['domainId']) {
      return routerParams['domainId'];
    }
    if (routerLocation.search.includes('domain')) {
      const searchParams = new URLSearchParams(routerLocation.search);
      return searchParams.get('domain') || '';
    }
    if (projectData.length) {
      const currentProject = projectData.find(p => p.id === currentProjectId);
      if (currentProject) {
        return currentProject.domains[0].id;
      } else {
        return '';
      }
    }
    return '';
  }, [routerParams, routerLocation.search, projectData, currentProjectId]);

  console.log('*** projectData', projectData);
  console.log('*** routerParams', routerParams);
  console.log('*** routerLocation', routerLocation);
  console.log('*** currentDomainId', currentDomainId);

  const pathSegments = useMemo(() => {
    const pathName = routerLocation.pathname;
    const pathFragments = pathName.split('/').filter(f => !!f);

    const values = {};
    for (let i = 1; i < pathFragments.length; i = i + 2) {
      const key = pathFragments[i];
      const value = pathFragments[i + 1];
      values[key] = value;
    }

    return Object.entries(values);
  }, [routerLocation.pathname]);

  const breadcrumbs = useMemo(() => {
    return pathSegments.map(segment => {
      const key = segment[0];
      const value: string = segment[1] ? (segment[1] as string) : '';

      const breadcrumb = breadcrumbRegistry.find(b => b.pathId === key);
      if (breadcrumb) {
        return { key, value, ...breadcrumb };
      }

      return {
        key,
        value,
        ...makeBreadcrumb({ pathId: key, label: key }),
      };
    });
  }, [pathSegments]);

  return (
    <Grid container className="breadcrumbs" spacing={2}>
      {breadcrumbs.map(breadcrumbValue => (
        <Grid item key={breadcrumbValue.key}>
          <BreadcrumbFormControl
            {...breadcrumbValue}
            projectId={currentProjectId}
            domainId={currentDomainId}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default BreadCrumbs;
