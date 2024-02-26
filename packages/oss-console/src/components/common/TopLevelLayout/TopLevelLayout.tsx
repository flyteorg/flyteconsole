import React, { PropsWithChildren, useEffect, useLayoutEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import debounce from 'lodash/debounce';
import styled from '@mui/system/styled';
import shadows from '@mui/system/shadows';
import { sideNavGridWidth } from '../../../common/layout';
import { ContentContainer } from '../ContentContainer';
import NavBar from '../../Navigation/NavBar';
import { TopLevelLayoutContext } from './TopLevelLayoutState';
import { BreadcrumbGlobalStyles } from '../../Breadcrumbs/components/breadcrumbGlobalStyles';

const GrowGrid = styled(Grid)(() => ({
  display: 'flex',
  flexGrow: 1,
}));

const StyledContainer = styled(Grid)(({ theme }) => ({
  height: '100vh',
  minHeight: '100vh',
  '& .noBounce': {
    webkitOverflowScrolling: 'touch' /* enables “momentum” (smooth) scrolling */,
  },
  '& .sticky': {
    position: 'sticky',
    top: 0,
  },
  '& .relative': {
    position: 'relative',
  },
  '& .absolute': {
    position: 'absolute',
  },
  '& .w100': {
    width: '100%',
  },
  '& .h100': {
    height: '100vh',
    minHeight: '100vh',
  },
  '& .headerZIndex': {
    zIndex: 2,
  },
  '& leftNavZIndex': {
    zIndex: 1,
  },
  '& .above': {
    zIndex: 1,
  },
  '& .nav': {
    top: 0,
    position: 'relative',
    height: '100%',
    minWidth: theme.spacing(sideNavGridWidth),
    background: theme.palette.background.paper,
    willChange: 'transform',
  },
  '& .mobileNav': {
    zIndex: 2,
    position: 'absolute',
    boxShadow: shadows[4],
  },
  '& .closeSideNav': {
    animationDirection: 'reverse',
    display: 'none',
  },
  '& .openSideNav': {
    animationDirection: 'normal',
  },
})) as typeof Grid;

export interface TopLevelLayoutInterFace {
  className?: string;
}

export const TopLevelLayoutGrid = ({
  className = '',
  children,
}: PropsWithChildren<TopLevelLayoutInterFace>) => {
  const theme = useTheme();

  const { isMobileNav, isSideNavOpen, closeSideNav, rowLayout, columnLayout } =
    React.useContext(TopLevelLayoutContext);

  // flip layout on narrow screen per flag and resizes
  useLayoutEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < theme.breakpoints.values.md) {
        rowLayout();
      } else {
        columnLayout();
      }
    };

    handleResize();
    const debouncedResize = debounce(handleResize, 50);
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, []);

  // run on init
  useEffect(() => {
    rowLayout();
    closeSideNav();
  }, []);

  // ref to update offset on scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  // pin left nav to top of screen
  useLayoutEffect(() => {
    const handleScroll = () => {
      const scrollElement = scrollRef.current;
      const documentHeight = document.body.scrollHeight - document.body.clientHeight;

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
    <StyledContainer
      className={`top-level-layout ${className} noBounce`}
      container
      // direction={isLayoutHorizontal ? 'row' : 'column'}
      direction="row"
      justifyContent="flex-start"
      alignItems="stretch"
    >
      <Grid item className="sticky-header-container sticky headerZIndex">
        <NavBar />
      </Grid>
      <GrowGrid item className="above relative" sx={{ flexWrap: 'nowrap' }}>
        {/* Grow X Axis */}
        <GrowGrid
          container
          direction="row"
          alignItems="stretch"
          justifyContent="flex-start"
          className="sticky"
        >
          <Grid
            item
            ref={scrollRef}
            className={`side-nav-container
              nav
              ${isMobileNav ? 'mobileNav' : ''}
              sideNavAnimation
              ${isSideNavOpen ? 'openSideNav' : 'closeSideNav'}
              `}
          ></Grid>
          <GrowGrid item className="relative" id="scroll-element" sx={{ overflowY: 'auto' }}>
            <Grid container>
              <Grid item className="absolute w100">
                <Box className="relative">
                  {/* Legacy, need to move to <Grid/> */}
                  <ContentContainer className="routerview-content-container flex-column-container">
                    {children}
                  </ContentContainer>
                </Box>
              </Grid>
            </Grid>
          </GrowGrid>
        </GrowGrid>
      </GrowGrid>
    </StyledContainer>
  );
};

const TopLevelLayoutGridStyled = styled(TopLevelLayoutGrid)(() => ({
  // second nth div css selector
  '& > div': {
    zIndex: 3,
  },
  '.side-nav-container': {
    animation: 'none',
  },
  overflow: 'hidden',
  '& header': {
    // overflowY: 'scroll',
  },
}));

export const TopLevelLayout: React.FC<PropsWithChildren<TopLevelLayoutInterFace>> = ({
  children,
}) => {
  return (
    <>
      <BreadcrumbGlobalStyles />
      <TopLevelLayoutGridStyled>{children}</TopLevelLayoutGridStyled>
    </>
  );
};

export default TopLevelLayout;
