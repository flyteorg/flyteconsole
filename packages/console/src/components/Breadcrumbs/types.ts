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

export interface BreadcrumbEntity {
  url: string;
  title: string;
  createdAt: string;
}

export interface BreadcrumbPopoverInterface
  extends BreadcrumbFormControlInterface {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export interface BreadcrumbFormControlInterface extends Breadcrumb {
  value: string;
  key: string;
  projectId: string;
  domainId: string;
}
