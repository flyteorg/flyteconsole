import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const isMobileInit = window.innerWidth < 960;

const initValues = {
  isSideNavOpen: false,
  isMobileNav: isMobileInit, // < md breakboint
  openSideNav: () => {},
  closeSideNav: () => {},
  isLayoutHorizontal: !isMobileInit,
  columnLayout: () => {},
  rowLayout: () => {},
  showMobileNav: () => {},
  hideMobileNav: () => {},
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

  const showMobileNav = useCallback(
    () => setIsMobileNav(true),
    [isMobileNav, setIsMobileNav],
  );
  const hideMobileNav = useCallback(
    () => setIsMobileNav(false),
    [isMobileNav, setIsMobileNav],
  );

  const value = useMemo(() => {
    return {
      isMobileNav,
      isSideNavOpen,
      openSideNav,
      closeSideNav,
      isLayoutHorizontal,
      columnLayout,
      rowLayout,
      showMobileNav,
      hideMobileNav,
    };
  }, [
    isMobileNav,
    isSideNavOpen,
    openSideNav,
    closeSideNav,
    isLayoutHorizontal,
    columnLayout,
    rowLayout,
    showMobileNav,
    hideMobileNav,
  ]);

  return (
    <TopLevelLayoutContext.Provider value={value}>
      <>{children}</>
    </TopLevelLayoutContext.Provider>
  );
};

export default TopLevelLayoutProvider;
