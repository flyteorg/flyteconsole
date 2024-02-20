import React, { PropsWithChildren } from 'react';
import omit from 'lodash/omit';
import classnames from 'classnames';
import { useHistory } from 'react-router';
import Link from '@mui/material/Link';
import styled from '@mui/system/styled';
import { NavItem } from '../utils/navUtils';

const StyledMuiLink = styled(Link)(({ theme }) => ({
  padding: 0,
  margin: 0,
  '&.disabled': {
    color: theme.palette.common.blue[3],
    cursor: 'default',
  },
})) as typeof Link;

export type NavLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  PropsWithChildren<{
    navItem: NavItem;
    currentBasePath?: string;
    reload?: boolean;
    height?: number;
    preserveBasePath?: boolean;
  }>;

export const NavLink = (props: NavLinkProps) => {
  const { navItem, height, className, children } = props;
  const { id, getUrl, getMatchDetails } = navItem;
  const history = useHistory();
  const newProps = omit(props, ['navItem', 'currentBasePath', 'reload']);

  const matchResult = getMatchDetails?.();

  const { projectId, domainId } = matchResult?.params || {};

  const makeHref = () => {
    if (getUrl) {
      return getUrl(projectId!, domainId!);
    }
    return id;
  };

  const handler = (event: React.SyntheticEvent<HTMLAnchorElement, MouseEvent>) => {
    // open in new tab on cmd+click
    event.preventDefault();
    if (event.nativeEvent.metaKey) {
      window.open(makeHref(), '_blank');
    } else {
      history.push(makeHref());
    }
  };

  const activeClass = matchResult?.isActive ? 'active' : '';

  return (
    <StyledMuiLink
      {...newProps}
      tabIndex={0}
      key={id}
      role="link"
      // right-click to open in new tab
      href={makeHref()}
      className={classnames(className, activeClass)}
      onClick={handler}
      sx={{ height }}
    >
      {children}
    </StyledMuiLink>
  );
};

export default NavLink;
