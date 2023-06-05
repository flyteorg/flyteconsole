import { useTheme } from 'components/Theme/useTheme';
import debounce from 'lodash/debounce';
import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

const initValues = {
  isSideNavOpen: false,
  isMobileNav: window.innerWidth < 1120,
  openSideNav: () => {},
  closeSideNav: () => {},
  isLayoutHorizontal: false,
  columnLayout: () => {},
  rowLayout: () => {},
};

export const TopLevelLayoutContext = createContext(initValues);

export const useTopLevelLayoutContext = () => {
  return useContext(TopLevelLayoutContext);
};

const TopLevelLayoutProvider = ({ children }) => {
  const [isMobileNav, setIsMobileNav] = useState(initValues.isMobileNav);
  const [isSideNavOpen, setIsSideNavOpen] = useState(initValues.isMobileNav);
  const [isLayoutHorizontal, setisLayoutHorizontal] = useState(
    initValues.isLayoutHorizontal,
  );

  const openSideNav = useCallback(
    () => setIsSideNavOpen(true),
    [isSideNavOpen, setIsSideNavOpen],
  );
  const closeSideNav = useCallback(
    () => setIsSideNavOpen(false),
    [isSideNavOpen, setIsSideNavOpen],
  );

  const columnLayout = useCallback(
    () => setisLayoutHorizontal(true),
    [isLayoutHorizontal, setisLayoutHorizontal],
  );
  const rowLayout = useCallback(
    () => setisLayoutHorizontal(false),
    [isLayoutHorizontal, setisLayoutHorizontal],
  );

  useLayoutEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1120) {
        if (!isMobileNav) setIsMobileNav(true);
      } else {
        if (!isMobileNav) setIsMobileNav(false);
      }
    };
    const debouncedResize = debounce(handleResize, 50);

    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, []);

  const theme = useTheme();

  useLayoutEffect(() => {
    const handleResize = () => {
      if (isLayoutHorizontal) {
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

  const value = useMemo(() => {
    return {
      isMobileNav,
      isSideNavOpen,
      openSideNav,
      closeSideNav,
      isLayoutHorizontal,
      columnLayout,
      rowLayout,
    };
  }, [
    isMobileNav,
    isSideNavOpen,
    openSideNav,
    closeSideNav,
    isLayoutHorizontal,
    columnLayout,
    rowLayout,
  ]);

  return (
    <TopLevelLayoutContext.Provider value={value}>
      <>{children}</>
    </TopLevelLayoutContext.Provider>
  );
};

export default TopLevelLayoutProvider;
