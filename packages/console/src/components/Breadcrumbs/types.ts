export interface Breadcrumb {
  id: string;
  label: string;
  defaultValue: string | BreadcrumbCustomDefaultValue;
  valididator: BreadcrumbValidator;
  asyncData: (
    projectId: string,
    domainId: string,
  ) => Promise<BreadcrumbEntity[]>;
  customComponent?: React.FC<any>;
  viewAllLink: string | ((projectId: string, domainId: string) => string);
  required: boolean;
}

export type BreadcrumbValidator = (
  valididator: BreadcrumbValidatorInterface,
) => boolean;

export type BreadcrumbCustomDefaultValue = (
  location: Location,
  breadcrumb: Breadcrumb,
) => string;

export interface BreadcrumbValidatorInterface {
  targetBreadcrumbId: string;
  currentPathSegment: string;
  currentPathValue: string;
  prevPathSegment: string;
  nextPathSegment: string;
  url: string;
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
