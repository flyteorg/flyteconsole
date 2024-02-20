import React from 'react';
import classnames from 'classnames';
import styled from '@mui/system/styled';
import { contentContainerId } from '@clients/common/constants';
import {
  contentMarginGridUnits,
  maxContainerGridWidth,
  sideNavGridWidth,
} from '../../common/layout';
import { ErrorBoundary } from './ErrorBoundary';
import BreadCrumbs from '../Breadcrumbs/components/Breadcrumbs';

enum ContainerClasses {
  Centered = 'centered',
  NoMargin = 'nomargin',
  WithDetailsPanel = 'withDetailsPanel',
  WithSideNav = 'withSideNav',
}

const StyledWrapper = styled('div')(({ theme }) => {
  return {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'column',
    minHeight: '100dvh',
    height: '100%',
    padding: `0 ${theme.spacing(contentMarginGridUnits)} 0 ${theme.spacing(
      contentMarginGridUnits,
    )}`,
    [`&.${ContainerClasses.NoMargin}`]: {
      margin: 0,
      padding: 0,
    },
    [`&.${ContainerClasses.Centered}`]: {
      margin: '0 auto',
      maxWidth: theme.spacing(maxContainerGridWidth),
    },
    [`&.${ContainerClasses.WithSideNav}`]: {
      marginLeft: theme.spacing(sideNavGridWidth),
    },
  };
});

export interface ContentContainerProps extends React.AllHTMLAttributes<HTMLDivElement> {
  /** Renders content centered in the page. Usually should not be combined
   * with other modifiers
   */
  center?: boolean;
  /** Controls rendering of a `DetailsPanel` instance, which child content
   * can render into using `DetailsPanelContent`
   */
  detailsPanel?: boolean;
  /** Renders the container with no margin or padding.  Usually should not be combined
   * with other modifiers */
  noMargin?: boolean;
  /** Whether to include spacing for the SideNavigation component */
  sideNav?: boolean;
}

/** Defines the main content container for the application. Only one of these
 * should be present at a time, as it uses an id to assist with some
 * react-virtualized behavior.
 */
export const ContentContainer: React.FC<ContentContainerProps> = (props) => {
  const {
    center = false,
    noMargin = true,
    className: additionalClassName,
    children,
    sideNav = false,
  } = props;

  const className = classnames(additionalClassName, {
    [ContainerClasses.Centered]: center,
    [ContainerClasses.NoMargin]: noMargin,
    [ContainerClasses.WithSideNav]: sideNav,
  });

  return (
    <StyledWrapper className={className} id={contentContainerId}>
      <ErrorBoundary>
        <>
          <BreadCrumbs />
          {children}
        </>
      </ErrorBoundary>
    </StyledWrapper>
  );
};
