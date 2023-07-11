import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  Grid,
  styled,
  makeStyles,
  Box,
  useTheme,
  Toolbar,
} from '@material-ui/core';
import { ContentContainer } from 'components/common/ContentContainer';
import { useExternalConfigurationContext } from 'basics/ExternalConfigurationProvider';
import { sideNavGridWidth } from 'common/layout';
import debounce from 'lodash/debounce';
import { FeatureFlag, useFeatureFlagContext } from 'basics/FeatureFlags';
import { subnavBackgroundColor } from 'components/Theme/constants';
import { subnavBarContentId } from 'common/constants';
import { TopLevelLayoutContext } from './TopLevelLayoutState';

const StyledSubNavBarContent = styled(Toolbar)(() => ({
  minHeight: 'auto',
  padding: 0,
  margin: 0,

  '& > *': {
    alignItems: 'center',
    display: 'flex',
    maxWidth: '100%',
    padding: '24px 20px 24px 30px',
    background: subnavBackgroundColor,
  },
  '@media (min-width: 600px)': {
    minHeight: 'auto',
  },
}));

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
    noBounce: {
      '-webkit-overflow-scrolling':
        'touch' /* enables “momentum” (smooth) scrolling */,
    },
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
    headerZIndex: {
      zIndex: 2,
    },
    leftNavZIndex: {
      zIndex: 1,
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
      willChange: 'transform',
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
    closeSideNav,
    isLayoutHorizontal,
    rowLayout,
    columnLayout,
  } = React.useContext(TopLevelLayoutContext);

  // flip layout on narrow screen per flag and resizes
  useLayoutEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < theme.breakpoints.values.md) {
        rowLayout();
      } else {
        if (!userHorizontalPref) {
          rowLayout();
        } else {
          columnLayout();
        }
      }
    };

    handleResize();
    const debouncedResize = debounce(handleResize, 50);
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, []);

  // run on init
  useEffect(() => {
    if (isMobileNav || !isLayoutHorizontal || !userHorizontalPref) {
      rowLayout();
      closeSideNav();
    } else {
      columnLayout();
    }
  }, []);

  // ref to update offset on scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  // pin left nav to top of screen
  useLayoutEffect(() => {
    const handleScroll = () => {
      const scrollElement = scrollRef.current;
      const documentHeight =
        document.body.scrollHeight - document.body.clientHeight;

      if (scrollElement && window.scrollY + 1 < documentHeight) {
        const scroll = window.scrollY;
        scrollElement.style.transform = `translateY(${scroll}px)`;
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Grid
      className={`top-level-layout ${styles.h100} ${className} ${styles.noBounce}`}
      container
      direction={isLayoutHorizontal ? 'row' : 'column'}
      justifyContent="flex-start"
      alignItems="stretch"
    >
      <Grid
        item
        className={`sticky-header-container
          ${styles.sticky}
          ${styles.headerZIndex}
        `}
      >
        <HeaderComponent />
      </Grid>
      <GrowGrid item className={`${styles.above} ${styles.relative}`}>
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
                    <StyledSubNavBarContent
                      className="subnav"
                      id={subnavBarContentId}
                    />
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

  const { getFeatureFlag } = useFeatureFlagContext();
  const flag = getFeatureFlag(FeatureFlag.HorizontalLayout);

  const isHorizontalLayout = useMemo(
    () => flag || props.isHorizontalLayout,
    [flag, props.isHorizontalLayout],
  );

  if (ExternalTopLevelLayout)
    return (
      <ExternalTopLevelLayout
        {...props}
        isHorizontalLayout={isHorizontalLayout}
      />
    );
  return (
    <TopLevelLayoutGrid {...props} isHorizontalLayout={isHorizontalLayout} />
  );
};

export default TopLevelLayout;
