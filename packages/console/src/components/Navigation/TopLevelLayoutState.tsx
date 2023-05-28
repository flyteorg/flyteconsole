import React, { createContext, useCallback, useState } from 'react';

const initValues = {
  isSideNavOpen: false,
  openSideNav: () => {},
  closeSideNav: () => {},
};

export const TopLevelLayoutContext = createContext(initValues);

const TopLevelLayoutProvider = ({ children }) => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const openSideNav = useCallback(
    () => setIsSideNavOpen(true),
    [isSideNavOpen, setIsSideNavOpen],
  );
  const closeSideNav = useCallback(
    () => setIsSideNavOpen(false),
    [isSideNavOpen, setIsSideNavOpen],
  );

  const value = {
    isSideNavOpen,
    openSideNav,
    closeSideNav,
  };

  return (
    <TopLevelLayoutContext.Provider value={value}>
      {children}
    </TopLevelLayoutContext.Provider>
  );
};

export default TopLevelLayoutProvider;
