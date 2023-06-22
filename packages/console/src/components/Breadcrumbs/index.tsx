import { FormControl, Grid, Input, InputLabel } from '@material-ui/core';
import React, { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';

export interface Breadcrumb {
  pathId: string;
  label: string;
  defaultValue?: string;
  valididator?: (urlPathId: string, thisPathId: string) => boolean;
  asyncData?: () => Promise<any>;
  customComponent?: React.FC<any>;
}

const breadcrumbDefaultvalidator = (urlPathId: string, thisPathId: string) =>
  urlPathId === thisPathId;

const defaultBreadcrumb: Breadcrumb = {
  pathId: 'default',
  label: 'Default',
  defaultValue: 'default',
  valididator: breadcrumbDefaultvalidator,
  asyncData: () => Promise.resolve([{ foo: 'bar' }]),
};

const makeBreadcrumb = (config: Breadcrumb) => {
  return { ...defaultBreadcrumb, ...config };
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
  }),
];

interface BreadcrumbFormControlInterface extends Breadcrumb {
  value: string;
  key: string;
}

const BreadcrumbFormControl = (props: BreadcrumbFormControlInterface) => {
  const htmlLabel = `breadcrumb-${props.pathId}`;

  return (
    <FormControl>
      <InputLabel htmlFor={htmlLabel}>{props.label}</InputLabel>
      <Input
        name={htmlLabel}
        id={htmlLabel}
        defaultValue={props.defaultValue}
        value={props.value}
      />
    </FormControl>
  );
};

const BreadCrumbs = () => {
  const routerLocation = useLocation();

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
      return { key, value, ...makeBreadcrumb({ pathId: key, label: key }) };
    });
  }, [pathSegments]);

  return (
    <Grid container className="breadcrumbs">
      <Grid item>
        {breadcrumbs.map((breadcrumbValue, index) => (
          <BreadcrumbFormControl {...breadcrumbValue} />
        ))}
      </Grid>
    </Grid>
  );
};

export default BreadCrumbs;
