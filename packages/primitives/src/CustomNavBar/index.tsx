import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar, { toolbarClasses } from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import styled from '@mui/system/styled';
import { useLocation } from 'react-router';
import HomeButtons from './HomeButtons';
import { Actions } from './Actions';
import NavigationItems from './NavigationItems';
import { ensurePrefixSlash, getBasePathFromUrl, NavItem } from '../utils/navUtils';
import { LoginPanel } from '../SessionManagent';
import { useUserIdentity } from '../hooks/IdentityProvider/useUserIdentity';

const ThemedAppBar = styled(AppBar)(({ theme }) => ({
  width: '80px',
  height: '100%',
  padding: '0 !important',
  position: 'fixed',
  inset: '0',
  background: theme.palette.common.primary.flyte,
  fontFamily: 'Roboto Condensed',
  overflow: 'visible',
  textAlign: 'center',

  '&, & *': {
    '&::-webkit-scrollbar': {
      width: 0,
      backgroundColor: 'transparent',
    },
  },

  span: {
    fontFamily: 'Roboto',
    fontSize: '12px',
    WebkitFontSmoothing: 'subpixel-antialiased',
    letterSpacing: '0.1px',
  },
}));

const InlineSpacer = styled('div')(() => ({
  width: '80px',
}));

const StyledToolbar = styled(Toolbar)(() => ({
  height: '100%',
  minHeight: '100%',
  padding: '0px !important',
  display: 'flex',
  alignItems: 'flex-start',

  [`& .${toolbarClasses.root}`]: {
    padding: '0 !important',
  },
}));

interface CustomNavBarInterface {
  navigationItems: NavItem[];
  isSideNavOpen: boolean;
  isMobileNav: boolean;
  openSideNav: () => void;
  closeSideNav: () => void;
  rowLayout: () => void;
  isLayoutHorizontal: boolean;
  columnLayout: () => void;
}

let collapsableItemsPositionCache: Record<string, number> = {};

export const CustomNavBar = (props: CustomNavBarInterface) => {
  const { navigationItems, isLayoutHorizontal, columnLayout } = props;
  const [currentBasePath, setCurrentBasePath] = useState<string>('');
  const location = useLocation();
  const { profile: profileResult } = useUserIdentity();
  const { data: profile, isLoading } = profileResult;

  const navigationItemsFormatted = useMemo(() => {
    return navigationItems.map((item) => ({
      ...item,
      id: ensurePrefixSlash(item.id),
    }));
  }, []);

  useEffect(() => {
    setCurrentBasePath(getBasePathFromUrl(location.pathname) || navigationItems[0].id);
  }, []);

  useEffect(() => {
    if (!currentBasePath) {
      return;
    }

    const newBasePath = getBasePathFromUrl(location.pathname);
    if (currentBasePath !== newBasePath) {
      setCurrentBasePath(newBasePath);
    }
  }, [location]);
  /**
   * TODO: Remove once mobile nav is implemented
   */
  useLayoutEffect(() => {
    if (!isLayoutHorizontal) {
      columnLayout();
    }
  }, [isLayoutHorizontal]);

  const collapsableRef = React.useRef<HTMLDivElement>(null);
  const [collapsedNavigationItems, setCollapsedNavigationItems] = React.useState<string[]>([]);

  /**
   * Calculates which navigation items should be collapsed based
   * on the current availible space in the header.
   *
   * Grid items can be marked for pinning or collapsing by adding the
   * data-pinned-nav-link or data-colapseable-nav-link attributes.
   */
  function handleResize(entry: ResizeObserverEntry, _observer: ResizeObserver) {
    const expanderElement = document.getElementById('nav-item-expander');
    if (!collapsableRef.current) return;
    if (!expanderElement) return;
    expanderElement.style.setProperty('display', 'none'); // height 0

    // parent.style.minHeight = `unset`;
    const { height: parentHeight } = entry.contentRect;

    const items = [...entry.target.querySelectorAll('[data-colapseable-nav-link]')];
    const pinnedItems = [...entry.target.querySelectorAll('[data-pinned-nav-link]')];

    if (!items?.length || !pinnedItems?.length) return;

    // sum of fixed height items that are "pinned" to the bottom of the screen
    const pinnedItemHeights = Array.from(pinnedItems || []).reduce((acc, item) => {
      const { height } = item.getBoundingClientRect();
      return acc + height;
    }, 0);

    // accomidates for customer and Union logos
    const logoOffset = items[0]?.getBoundingClientRect()?.y || 0;
    const heightThreshold = parentHeight - pinnedItemHeights;

    // point on the screne where items should start to collapse
    // used for the expender element
    const collapseOffset =
      (items[items.length - 1]?.getBoundingClientRect()?.y || -1) +
      (items[items.length - 1]?.getBoundingClientRect()?.height || -1);

    const cache = { ...collapsableItemsPositionCache };

    let toCollapse: string[] = [];

    for (let index = items.length - 1; index > -1; index--) {
      const item = items[index] as HTMLElement;
      const id = item.dataset.colapseableNavLink || 'undefined';
      const rect = item.getBoundingClientRect();
      const bottomPosition = rect.y + rect.height;

      // update last non-zero position
      // display: none === rect.height = 0
      if (!cache[id] && rect.height > 0 && cache[id] !== 0) {
        cache[id] = bottomPosition;
      }
      const value = cache[id] || 0;

      if (value >= heightThreshold) {
        // threshold reached items
        toCollapse = [...toCollapse, `${item.dataset.colapseableNavLink || ''}`];
      }
    }

    // console.table({ cache, toCollapse });
    collapsableItemsPositionCache = cache;
    setCollapsedNavigationItems(() => [...toCollapse]);

    expanderElement.style.setProperty('display', 'block'); // height 0
    expanderElement.style.setProperty(
      'height',
      `${parentHeight - heightThreshold - collapseOffset}px`,
    ); // height 0

    // set parent minhieght
    (entry.target as HTMLElement).style.setProperty(
      'min-height',
      `${heightThreshold + logoOffset}px`,
    );
  }

  // resize watch
  useEffect(() => {
    const observer = new ResizeObserver(
      (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
        for (let index = 0; index < entries.length; index++) {
          const entry = entries[index];
          handleResize(entry, observer);
        }
      },
    );

    if (collapsableRef.current) observer.observe(collapsableRef.current);
    return () => observer.disconnect();
  }, [collapsableRef.current]);

  // new children watch
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const target = mutation.target as HTMLElement;
          if (target.id === 'nav-bar-collapseable-container') {
            const entry = {
              target,
              contentRect: target.getBoundingClientRect(),
            } as unknown as ResizeObserverEntry;
            handleResize(entry, {} as ResizeObserver);
          }
        }
      });
    });
    if (collapsableRef.current) observer.observe(collapsableRef.current, { childList: true });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <InlineSpacer />
      <ThemedAppBar position="fixed" elevation={0}>
        <StyledToolbar>
          <Grid
            container
            direction="column"
            justifyContent="flex-start"
            sx={{
              width: '100%',
              height: '100%',
              flexWrap: 'nowrap',
              padding: (theme) => `${theme.spacing(2)} 0`,
            }}
            ref={collapsableRef}
            id="nav-bar-collapseable-container"
          >
            <HomeButtons />

            <NavigationItems
              defaultNavigationItems={navigationItemsFormatted}
              currentBasePath={currentBasePath}
              collapsedNavigationItems={collapsedNavigationItems}
            />

            {/* Expander */}
            <Grid item id="nav-item-expander" sx={{ display: 'flex', flexGrow: 1 }} />

            {/* Expects <Grid item />'s */}
            <Actions loading={!!isLoading} profile={profile} />
          </Grid>
        </StyledToolbar>

        <LoginPanel />
      </ThemedAppBar>
    </>
  );
};

export default CustomNavBar;
