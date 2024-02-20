import React from 'react';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import styled from '@mui/system/styled';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NavLink from './NavLink';
import { NavItem } from '../utils/navUtils';

const ThemedNavBarWrapper = styled(Grid)(({ theme }) => ({
  userSelect: 'none',
  '& a': {
    fontSize: '16px',
    color: theme.palette.common.flyteNav.icon_primary,
    cursor: 'pointer',
    position: 'relative',
    textDecoration: 'none',
    transition: 'all 0.125s ease',
    '& .icon-wrapper': {
      height: '36px',
      width: '36px',
      display: 'inline-flex',
      padding: 1.25,
      borderRadius: '5px',
      border: `2px solid transparent`,
      justifyContent: 'center',
      alignItems: 'center',
      color: theme.palette.common.flyteNav.icon_primary,
      transition: 'all 0.125s ease',
    },
    '&:not(.disabled):hover .icon-wrapper': {
      border: `2px solid ${theme.palette.common.flyteNav.icon_hover}`,
      color: theme.palette.common.flyteNav.icon_primary,
      background: theme.palette.common.flyteNav.icon_hover,
    },
    '&:not(.disabled):active .icon-wrapper': {
      border: `2px solid ${theme.palette.common.flyteNav.icon_selected}`,
    },
    '&.active': {
      color: theme.palette.common.flyteNav.icon_primary,

      /* Active icon background */
      '& .icon-wrapper': {
        color: theme.palette.common.flyteNav.icon_primary,
        background: theme.palette.common.flyteNav.icon_selected,
        border: `2px solid ${theme.palette.common.flyteNav.icon_selected}`,
      },
    },
    '&.disabled': {
      color: theme.palette.common.blue[3],

      '& .icon-wrapper': {
        color: theme.palette.common.blue[3],
      },
    },
  },
  '& .wrapped': {
    background: 'red !important',
  },
}));

const StyledNavStack = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
  '&': {
    fontSize: '16px',
    color: theme.palette.common.white,
    cursor: 'pointer',
    position: 'relative',
    textDecoration: 'none',
    fontWeight: 'bold',

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
      marginRight: theme.spacing(1),
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
export interface NavigationItemsProps {
  defaultNavigationItems: NavItem[];
  collapsedNavigationItems: string[];
  currentBasePath: string;
}

export const NavigationItems = ({
  defaultNavigationItems,
  currentBasePath,
  collapsedNavigationItems,
}: NavigationItemsProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {defaultNavigationItems.map((item) => {
        const { getMatchDetails } = item;
        const matchResult = getMatchDetails?.();
        const { projectId, domainId } = matchResult?.params || {};
        const isHidden = item.label !== 'Projects' && (!projectId || !domainId);
        return (
          <Grid
            item
            className={`colapseable-nav-link__${item.id}`}
            data-colapseable-nav-link={item.id}
            data-cy={`colapseable-nav-link-${item.id}`}
            sx={{ position: 'relative' }}
          >
            <ThemedNavBarWrapper
              sx={{
                display: collapsedNavigationItems.includes(item.id) ? 'none' : 'block',
              }}
              key={`nav-item__${item.id}__${
                collapsedNavigationItems.includes(item.id) ? 'none' : 'block'
              }`}
            >
              {!isHidden && (
                <NavLink
                  currentBasePath={currentBasePath}
                  navItem={item}
                  reload={currentBasePath !== item.id}
                >
                  <StyledNavStack spacing={1} alignItems="center">
                    <div className="icon-wrapper">{item.icon}</div>
                    <Typography variant="caption" display="block">
                      {item.label}
                    </Typography>
                  </StyledNavStack>
                </NavLink>
              )}
            </ThemedNavBarWrapper>
          </Grid>
        );
      })}

      <Grid
        item
        data-pinned-nav-link="collabsable-nav"
        data-cy="pinned-nav-link-collabsable-nav"
        justifyContent="center"
        alignItems="center"
        sx={{
          visibility: collapsedNavigationItems?.length ? 'visible' : 'hidden',
          width: '80px',
          padding: (theme) => theme.spacing(1, 0, 3, 0),
        }}
      >
        <Grid container justifyContent="center">
          <Grid item>
            <IconButton onClick={handleClick} size="small" sx={{ margin: '0 auto' }}>
              <MoreHorizIcon htmlColor="white" />
            </IconButton>
          </Grid>
        </Grid>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          elevation={12}
          sx={{
            '& .MuiPaper-root': {
              background: '#051238', // dark blue
              color: 'white',
              border: (theme) => `solid 1px ${theme.palette.common.grays[80]}`,
            },
          }}
        >
          {defaultNavigationItems.map((item) => {
            if (!collapsedNavigationItems.includes(item.id)) return null;
            return (
              <StyledNavLink
                key={item.id}
                currentBasePath={currentBasePath}
                navItem={item}
                reload={currentBasePath !== item.id}
              >
                <MenuItem value={item.id} selected={item.getMatchDetails?.()?.isActive}>
                  <ListItemIcon className="icon-wrapper">{item.icon}</ListItemIcon>
                  <ListItemText>{item.label}</ListItemText>
                </MenuItem>
              </StyledNavLink>
            );
          })}
        </Menu>
      </Grid>
    </>
  );
};

export default NavigationItems;
