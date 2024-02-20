import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import styled from '@mui/system/styled';
import NavLink, { NavLinkProps } from './NavLink';

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  '&': {
    fontSize: '16px',
    color: theme.palette.common.blue[1],
    cursor: 'pointer',
    position: 'relative',
    textDecoration: 'none',
    '& .icon-wrapper': {
      height: '36px',
      width: '36px',
      display: 'inline-flex',
      padding: 1.25,
      borderRadius: '5px',
      border: `2px solid transparent`,
      justifyContent: 'center',
      alignItems: 'center',
      color: theme.palette.common.blue[1],
    },
    '&:hover .icon-wrapper': {
      border: `2px solid ${theme.palette.common.blue[6]}`,
      color: theme.palette.common.blue[1],
      background: theme.palette.common.blue[6],
    },
    '&:active .icon-wrapper': {
      border: `2px solid ${theme.palette.common.blue[1]}`,
    },
    '&.active': {
      color: theme.palette.common.brand.cloud,
    },
    '&.active .icon-wrapper': {
      color: theme.palette.common.brand.cloud,
      background: theme.palette.common.blue[9],
      border: `2px solid ${theme.palette.common.brand.cloud}`,
    },
  },
}));

const NavLinkItem = (props: NavLinkProps) => {
  return (
    <StyledNavLink {...props}>
      <Stack spacing={1} alignItems="center">
        <div className="icon-wrapper">{props.navItem.icon}</div>
        <Typography variant="caption" display="block">
          {props.navItem.label}
        </Typography>
      </Stack>
    </StyledNavLink>
  );
};

export default NavLinkItem;
