/**
 * Used for defining the breadcrumbs.
 * This is used for the breadcrumb registry.
 */
export interface Breadcrumb {
  id: string;
  label: string;
  defaultValue: string | BreadcrumbCustomDefaultValue;
  asyncValue?: BreadcrumbAsyncValue;
  validator: BreadcrumbValidator;
  asyncData: BreadcrumbAsyncPopOverData;
  customComponent?: React.FC<any>;
  selfLink: BreadcrumbEntitySelfLink;
  asyncSelfLink?: BreadcrumbAsyncViewAllLink;
  viewAllLink: BreadcrumbEntityViewAllLink;
  asyncViewAllLink?: BreadcrumbAsyncViewAllLink;
  required: boolean;
}

/**
 * The function used for controlling if a breadcrumb should be rednered or not.
 */
export type BreadcrumbValidator = (
  valididator: BreadcrumbValidatorInterface,
) => boolean;

/**
 * The props used for controlling if a breadcrumb should be rednered or not.
 */
export interface BreadcrumbValidatorInterface {
  targetBreadcrumbId: string;
  currentPathSegment: string;
  currentPathValue: string;
  prevPathSegment: string;
  nextPathSegment: string;
  url: string;
}

/**
 * The function used for defining the default value of a breadcrumb at runtime.
 */
export type BreadcrumbCustomDefaultValue = (
  location: Location,
  breadcrumb: Breadcrumb,
) => string;

/**
 * The function used for fetching the value of a breadcrumb at runtime.
 */
export type BreadcrumbAsyncValue = (
  location: Location,
  breadcrumb: BreadcrumbFormControlInterface,
) => Promise<string>;

/**
 * The function used for fetching the value of a breadcrumb popover at runtime.
 */
export type BreadcrumbAsyncPopOverData = (
  location: Location,
  breadcrumb: BreadcrumbFormControlInterface,
) => Promise<BreadcrumbEntity[]>;

/**
 * interactive breadcrumb popover list item
 */
export interface BreadcrumbEntity {
  url: string;
  title: string;
  createdAt: string;
  active?: boolean;
}

/**
 * The link to view all of a given collection of breadcrumb entities.
 * This happens when the user clicks on the "View All" button within the popover.
 * This can be a string or a function that returns a string at runtime.
 * Empty string means no link.
 */
export type BreadcrumbEntityViewAllLink =
  | string
  | ((projectId: string, domainId: string, location: Location) => string);

/**
 * The link to view all of a given collection of breadcrumb entities.
 * This happens when the user clicks on the "View All" button within the popover.
 * This can be a string or a function that returns a string at runtime.
 * Empty string means no link.
 */
export type BreadcrumbAsyncViewAllLink = (
  location: Location,
  breadcrumb: BreadcrumbFormControlInterface,
) => Promise<string>;

/**
 * The link to return to taht sepecific id's detail page.
 * This happens when a user clicks on the breadcrumb vlue text.
 * This can be a string or a function that returns a string at runtime.
 * Empty string means no link.
 */
export type BreadcrumbEntitySelfLink =
  | string
  | ((
      location: Location,
      breadcrumb: BreadcrumbFormControlInterface,
    ) => string);

export type BreadcrumbEntitySelfLinkAsync = (
  location: Location,
  breadcrumb: BreadcrumbFormControlInterface,
) => Promise<string>;

export interface BreadcrumbPopoverInterface
  extends BreadcrumbFormControlInterface {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

/**
 * The props used for rendering the breadcrumb list UI components.
 */
export interface BreadcrumbFormControlInterface extends Breadcrumb {
  value: string;
  key: string;
  projectId: string;
  domainId: string;
}
