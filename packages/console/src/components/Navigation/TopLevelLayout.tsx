import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Grid, styled, makeStyles, Box, useTheme } from '@material-ui/core';
import { ContentContainer } from 'components/common/ContentContainer';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import { sideNavGridWidth } from 'common/layout';
import debounce from 'lodash/debounce';
import { TopLevelLayoutContext } from './TopLevelLayoutState';

const GrowGrid = styled(Grid)(() => ({
  display: 'flex',
  flexGrow: 1,
}));

export interface TopLevelLayoutInterFace {
  headerComponent: JSX.Element;
  sideNavigationComponent: JSX.Element;
  routerView: JSX.Element;
  className?: string;
  isHorizontalLayout: boolean;
}

export const TopLevelLayoutGrid = ({
  headerComponent,
  sideNavigationComponent,
  routerView,
  className = '',
  isHorizontalLayout = false,
}: TopLevelLayoutInterFace) => {
  const userHorizontalPref = isHorizontalLayout;
  const theme = useTheme();
  const HeaderComponent = headerComponent ? () => headerComponent : () => <></>;
  const SideNavigationComponent = sideNavigationComponent
    ? () => sideNavigationComponent
    : () => <></>;
  const RouterView = routerView ? () => routerView : () => <></>;

  const styles = makeStyles(theme => ({
    sticky: {
      position: 'sticky',
      top: 0,
    },
    relative: {
      position: 'relative',
    },
    absolute: {
      position: 'absolute',
    },
    w100: {
      width: '100%',
    },
    h100: {
      minHeight: '100dvh',
    },
    above: {
      zIndex: 1,
    },
    nav: {
      top: 0,
      position: 'relative',
      height: '100%',
      minWidth: theme.spacing(sideNavGridWidth),
      background: theme.palette.background.paper,
      // transition: 'top ease',
    },
    mobileNav: {
      zIndex: 2,
      position: 'absolute',
      boxShadow: theme.shadows[4],
    },
    sideNavAnimation: {
      animationName: `$sideNavAnimation`,
      animationTimingFunction: `${theme.transitions.easing.easeInOut}`,
      animationDuration: `300ms`,
      animationFillMode: 'forwards',
    },
    '@keyframes sideNavAnimation': {
      '0%': {
        opacity: 0,
        display: 'none',
      },
      '1%': {
        opacity: 0,
        transform: 'translateX(-20%)',
        display: 'block',
      },
      '99%': {
        opacity: 1,
        transform: 'translateX(0)',
      },
      '100%': {
        opacity: 1,
        display: 'block',
      },
    },
    closeSideNav: {
      animationDirection: 'reverse',
      display: 'none',
    },
    openSideNav: {
      animationDirection: 'normal',
    },
  }))();

  const {
    isMobileNav,
    isSideNavOpen,
    openSideNav,
    closeSideNav,
    isLayoutHorizontal,
    rowLayout,
    columnLayout,
  } = React.useContext(TopLevelLayoutContext);

  // hide nav on narrow screen by default
  useLayoutEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < theme.breakpoints.values.md) {
        if (!isMobileNav) openSideNav();
      } else {
        if (!isMobileNav) closeSideNav();
      }
    };
    const debouncedResize = debounce(handleResize, 50);

    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, []);

  // flip layout on narrow screen
  useLayoutEffect(() => {
    const handleResize = () => {
      if (isLayoutHorizontal || userHorizontalPref) {
        if (window.innerWidth < theme.breakpoints.values.md) {
          rowLayout();
        } else {
          columnLayout();
        }
      }
    };
    const debouncedResize = debounce(handleResize, 50);

    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, []);

  // run on init
  useEffect(() => {
    if (userHorizontalPref) {
      columnLayout();
    } else {
      rowLayout();
    }
  }, []);

  const [firstRender, setFirstRender] = useState(true);
  useEffect(() => {
    if (!isMobileNav) {
      // close nav only if screen resized during session
      if (!firstRender) {
        closeSideNav();
      } else {
        setFirstRender(false);
      }
    } else {
      openSideNav();
    }
  }, [isMobileNav]);

  // ref to update offset on scroll
  const scrollRef = useRef<HTMLDivElement>(null);

  // pin left nav to top of screen
  useLayoutEffect(() => {
    const handleScroll = () => {
      const scrollElement = scrollRef.current;
      const scroll = window.scrollY;

      if (scrollElement) {
        scrollElement.style.top = `${scroll}px`;
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Grid
      className={`top-level-layout ${styles.h100} ${className}`}
      container
      direction={isLayoutHorizontal ? 'row' : 'column'}
      justifyContent="flex-start"
      alignItems="stretch"
    >
      <Grid
        item
        className={`sticky-header-container
          ${styles.sticky}
          ${isLayoutHorizontal || isMobileNav ? '' : styles.above}
        `}
      >
        <HeaderComponent />
      </Grid>
      <GrowGrid item>
        {/* Grow X Axis */}
        <GrowGrid
          container
          direction="row"
          alignItems="stretch"
          justifyContent="flex-start"
          className={`${styles.sticky}`}
        >
          <Grid
            item
            ref={scrollRef}
            className={`side-nav-container
              ${styles.nav}
              ${isMobileNav ? styles.mobileNav : ''}
              ${styles.sideNavAnimation}
              ${isSideNavOpen ? styles.openSideNav : styles.closeSideNav}
              `}
          >
            <SideNavigationComponent />
          </Grid>
          <GrowGrid item className={`${styles.relative}`}>
            <Grid container>
              <Grid item className={`${styles.absolute} ${styles.w100}`}>
                <Box className={`${styles.relative}`}>
                  {/* Legacy, need to move to <Grid/> */}
                  <ContentContainer className="routerview-content-container flex-column-container">
                    <RouterView />
                  </ContentContainer>
                </Box>
              </Grid>
            </Grid>
          </GrowGrid>
        </GrowGrid>
      </GrowGrid>
    </Grid>
  );
};

export const TopLevelLayout = (props: TopLevelLayoutInterFace) => {
  const { registry } = useExternalConfigurationContext();
  const ExternalTopLevelLayout = registry?.topLevelLayout;

  if (ExternalTopLevelLayout) return <ExternalTopLevelLayout {...props} />;
  return <TopLevelLayoutGrid {...props} />;
};

export default TopLevelLayout;
