import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavLinkWithSearchProps extends React.ComponentProps<NavLink> {
  preserve?: string[];
}

/**
 * A NavLink that preserves the search params from the current location.
 *
 * @param preserve - An array of search param keys to preserve. If not specified, all search params will be preserved.
 */
export default function NavLinkWithSearch({
  preserve,
  ...props
}: NavLinkWithSearchProps) {
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  if (preserve && preserve.length) {
    for (const key of searchParams.keys()) {
      if (key in preserve) {
        continue;
      }

      searchParams.delete(key);
    }
  }

  const to = props.to + '?' + searchParams.toString();
  return <NavLink {...props} to={to} />;
}
