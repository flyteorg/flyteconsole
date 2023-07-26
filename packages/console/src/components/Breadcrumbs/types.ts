/**
 * Used for defining the breadcrumbs.
 * This is used for the breadcrumb registry.
 */
export interface Breadcrumb {
  /**
   * Unique to match the breadcrumb to the registry.
   * Also used for matching the url path segment.
   * Can be namespaced with a colon.
   */
  id: string;
  /**
   * The label to display for the breadcrumb.
   */
  label: string;
  /**
   * The default value of the breadcrumb button if not just setting from the URL.
   * This can be a string or a function that returns a string at runtime.
   */
  defaultValue: string | BreadcrumbCustomDefaultValue;
  /**
   * A function used for fetching the value of a breadcrumb at runtime.
   * Overides the behavior of the defaultValue if present.
   */
  asyncValue?: BreadcrumbAsyncValue;
  /**
   * A function to descide if the breadcrumb is visible on the page or not.
   * This can be used to hide breadcrumbs that are not relevant to the current page.
   */
  validator: BreadcrumbValidator;
  /**
   * A function used for fetching the popover data of a breadcrumb at runtime.
   * This is used for the popover list of items.
   */
  asyncData: BreadcrumbAsyncPopOverData;
  /**
   * The title shown above the list within the popover.
   */
  popoverTitle?: string;
  /**
   * A react component to render instead of the default button and popover.
   * It recieved the same props as the default button and popover.
   */
  customComponent?: React.FC<any>;
  /**
   * The link that will used when a user clicks on the breadcrumb value text.
   * An empty string disables the link.
   */
  selfLink: BreadcrumbEntitySelfLink;
  /**
   * A function used for fetching the self link of a breadcrumb at runtime.
   */
  asyncSelfLink?: BreadcrumbAsyncViewAllLink;
  /**
   * The link to view all of a given collection of breadcrumb entities.
   */
  viewAllLink: BreadcrumbEntityViewAllLink;
  /**
   * A function used for fetching the view all link of a breadcrumb at runtime.
   */
  asyncViewAllLink?: BreadcrumbAsyncViewAllLink;
  /**
   * Show on all pages
   */
  required: boolean;
}

/**
 * The function used for controlling if a breadcrumb should be rednered or not.
 */
export type BreadcrumbValidator = (
  validator: BreadcrumbValidatorInterface,
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
 * The link to return to that sepecific id's detail page.
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

/**
 * The props used for rendering the breadcrumb list UI components.
 * Contains extra props for internal React rendering.
 */
export interface BreadcrumbFormControlInterfaceUI
  extends BreadcrumbFormControlInterface {
  children?: any;
  variant?: 'title' | 'inline';
}
