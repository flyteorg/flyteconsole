import debounce from 'lodash/debounce';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

const initValues = {
  isSideNavOpen: false,
  isMobileNav: window.innerWidth < 1120,
  openSideNav: () => {},
  closeSideNav: () => {},
};

export const TopLevelLayoutContext = createContext(initValues);

const TopLevelLayoutProvider = ({ children }) => {
  const [isMobileNav, setIsMobileNav] = useState(initValues.isMobileNav);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const openSideNav = useCallback(
    () => setIsSideNavOpen(true),
    [isSideNavOpen, setIsSideNavOpen],
  );
  const closeSideNav = useCallback(
    () => setIsSideNavOpen(false),
    [isSideNavOpen, setIsSideNavOpen],
  );

  useEffect(() => {
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

  const value = useMemo(() => {
    return { isMobileNav, isSideNavOpen, openSideNav, closeSideNav };
  }, [isMobileNav, isSideNavOpen, openSideNav, closeSideNav]);

  return (
    <TopLevelLayoutContext.Provider value={value}>
      <>{children}</>
    </TopLevelLayoutContext.Provider>
  );
};

export default TopLevelLayoutProvider;
