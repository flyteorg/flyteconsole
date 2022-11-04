import React, { useState } from 'react';
import { Theme, Typography, IconButton, Select, MenuItem, Box, styled } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

const ThemedNavBarSelect = styled(Select)(({ theme }: { theme: Theme }) => ({
  display: 'none',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  marginLeft: theme.spacing(6),
  [theme.breakpoints.down('sm')]: {
    display: 'inline-flex',
  },
  [theme.breakpoints.down('xs')]: {
    marginLeft: theme.spacing(2),
  },
  '& .MuiSelect-select': {
    color: 'white',
    fontWeight: 500,
  },
  '& .MuiSelect-icon': {
    color: 'white',
  },
}));

const useStyles = makeStyles((theme: Theme) => ({
  middleBox: {
    flexGrow: 1,
  },
  navList: {
    marginLeft: theme.spacing(6),
    userSelect: 'none',
    '& span': {
      fontSize: '16px',
      marginRight: theme.spacing(1.5),
      color: '#67696D',
      cursor: 'pointer',
      position: 'relative',
      '&:hover': {
        color: 'white',
      },
      '&.active': {
        color: 'white',
        '&::after': {
          display: 'inline-block',
          content: '""',
          width: '2px',
          height: '2px',
          background: 'white',
          borderRadius: '50%',
          left: 'calc(50% - 1px)',
          position: 'absolute',
          bottom: '-4px',
        },
      },
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  rightBox: {
    [theme.breakpoints.only('xs')]: {
      display: 'none',
    },
  },
  lyftLogo: {
    height: '32px',
  },
  unionLogo: {
    height: '36px',
  },
  logoDivider: {
    minWidth: '6px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    margin: theme.spacing(0, 1.5),
    background: 'white',
  },
  userName: {
    marginRight: theme.spacing(1.5),
    fontWeight: 500,
    fontSize: '14px',
  },
  infoButton: {
    paddingRight: 0,
  },
}));

interface NavItem {
  id: string;
  label: string;
}

const items: NavItem[] = [
  { id: 'console', label: 'Console' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'hub', label: 'Hub' },
];

export const TestNavBar = () => {
  const styles = useStyles();
  const [current, setCurrent] = useState<string>('dashboard');

  return (
    <>
      <Link to="/" className={styles.lyftLogo}>
        <svg
          width="48"
          height="32"
          viewBox="0 0 48 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M45.1112 7.67377H47.4854V13.9515H45.1077V15.3665C45.1077 16.627 46.1912 17.8693 47.4854 17.8751V24.1528V24.6497V24.9375H47.1908C44.793 24.8627 42.4962 23.5566 40.8496 21.9163C39.1278 20.1954 37.9887 18.0246 37.9887 15.5209V8.85085C37.9887 7.17599 36.0102 6.4967 34.4274 7.28142C33.7692 7.60772 33.2403 8.12609 33.2403 8.8628V10.8126H36.4059V17.8751H33.636C33.636 19.665 32.8707 21.1623 31.6227 22.4573C30.3805 23.7465 28.9881 24.8627 27.1797 24.9375H26.9023V24.2564V24.1528V8.8628C26.9023 5.44978 29.2423 1.80272 32.4489 0.611334C38.2034 -1.53547 44.077 2.24633 45.1112 7.67377ZM7.1359 18.8788V0.651209H0V17.7396C0 22.4332 3.23494 24.575 6.24391 24.575C7.14185 24.575 8.03978 24.3756 8.84257 24.0168C8.9615 23.9655 9.15179 23.8516 9.15179 23.8516C9.15179 23.8516 8.9734 23.6693 8.89609 23.5895C7.75435 22.3421 7.1359 20.7244 7.1359 18.8788ZM18.203 16.6213C18.203 16.9091 18.0675 17.1854 17.8361 17.3465C16.9271 17.9969 15.0374 17.3408 15.0374 16.4602V6.88916H8.72656V18.7624C8.72656 21.9337 11.2614 24.5179 14.3721 24.5179C15.7158 24.5179 17.0199 24.0287 18.0418 23.1366C17.9345 23.9884 17.4772 24.6906 16.7094 25.1798C15.9924 25.6402 15.0553 25.8819 14.0052 25.8819C12.9212 25.8819 11.6948 25.6455 10.6955 25.1563C10.6955 25.1563 10.5149 25.07 10.2891 24.9376V31.073C11.7964 31.6946 13.5761 32.0001 15.1738 32.0001C17.703 32.0001 20.0121 31.1943 21.6775 29.7266C23.5462 28.0863 24.5342 25.6863 24.5342 22.7912V6.88916H18.203V16.6213Z"
            fill="white"
          />
        </svg>
      </Link>
      <span className={styles.logoDivider} />
      <Link to="/" className={styles.unionLogo}>
        <svg
          width="86"
          height="36"
          viewBox="0 0 86 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_1540_38079)">
            <path
              d="M0.45459 18.4627V8.55273H5.2497V21.7756C5.2497 22.3649 5.55777 22.6963 6.10604 22.6963H13.054C13.6018 22.6963 13.9099 22.3649 13.9099 21.7756V8.55273H18.7385V18.4627C18.7385 23.8768 14.63 28.0004 9.59652 28.0004C4.56301 28.0004 0.45459 23.8749 0.45459 18.4627Z"
              fill="white"
            />
            <path
              d="M38.7688 17.5377V26.9689H33.9737V13.746C33.9737 13.1567 33.6657 12.8248 33.1174 12.8248H26.1346C25.5863 12.8248 25.2783 13.1567 25.2783 13.746V26.9689H20.4832V17.5377C20.4832 12.1231 24.592 8 29.6251 8C34.6581 8 38.7688 12.1251 38.7688 17.5377Z"
              fill="white"
            />
            <path d="M45.8215 26.9693H41.0264V8.55273H45.8215V26.9693Z" fill="white" />
            <path
              d="M66.3554 17.9445C66.3554 23.58 62.3148 28 57.1791 28C52.0433 28 48.071 23.58 48.071 17.9445C48.071 12.3484 52.0429 8 57.1791 8C62.3153 8 66.3554 12.3465 66.3554 17.9445ZM52.796 21.8122C52.795 21.9334 52.8164 22.0537 52.859 22.166C52.9017 22.2783 52.9647 22.3802 53.0445 22.466C53.1242 22.5517 53.219 22.6195 53.3234 22.6653C53.4278 22.7111 53.5396 22.7341 53.6524 22.7328H60.7057C60.8184 22.7341 60.9303 22.7111 61.0346 22.6653C61.139 22.6195 61.2338 22.5517 61.3135 22.4659C61.3932 22.3802 61.4562 22.2782 61.4988 22.166C61.5414 22.0537 61.5628 21.9334 61.5616 21.8122V14.1878C61.5628 14.0666 61.5414 13.9463 61.4988 13.834C61.4562 13.7218 61.3932 13.6198 61.3135 13.5341C61.2338 13.4483 61.139 13.3805 61.0346 13.3347C60.9303 13.2889 60.8184 13.2659 60.7057 13.2672H53.6524C53.5396 13.2659 53.4278 13.2889 53.3234 13.3347C53.219 13.3805 53.1242 13.4483 53.0445 13.534C52.9647 13.6198 52.9017 13.7217 52.859 13.834C52.8164 13.9463 52.795 14.0666 52.796 14.1878V21.8122Z"
              fill="white"
            />
            <path
              d="M86.3158 17.5377V26.9689H81.5207V13.746C81.5207 13.1567 81.2126 12.8248 80.6644 12.8248H73.6798C73.1315 12.8248 72.8234 13.1567 72.8234 13.746V26.9689H68.0283V17.5377C68.0283 12.1231 72.1372 8 77.1703 8C82.2033 8 86.3158 12.1251 86.3158 17.5377Z"
              fill="white"
            />
          </g>
          <defs>
            <clipPath id="clip0_1540_38079">
              <rect width="86" height="36" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </Link>
      <Box className={styles.middleBox}>
        <Box className={styles.navList}>
          {items.map((item) => (
            <span
              key={item.id}
              className={classNames({ active: item.id === current })}
              onClick={() => setCurrent(item.id)}
            >
              {item.label}
            </span>
          ))}
        </Box>
        <ThemedNavBarSelect
          value={current}
          onChange={(e: any) => setCurrent(e.target.value as string)}
          displayEmpty
          disableUnderline
        >
          {items.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.label}
            </MenuItem>
          ))}
        </ThemedNavBarSelect>
      </Box>
      <Box className={styles.rightBox}>
        <Typography variant="h5" component="span" className={styles.userName}>
          Jamie Brown
        </Typography>
        <IconButton aria-label="settings" color="inherit">
          <svg
            width="21"
            height="20"
            viewBox="0 0 21 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.4714 12.8977V7.07437C13.4706 7.00439 13.4558 6.93529 13.4277 6.87116C13.3997 6.80703 13.3591 6.74916 13.3084 6.701C13.2576 6.65283 13.1977 6.61533 13.1322 6.59073C13.0667 6.56613 12.9969 6.55492 12.927 6.55777H7.10359C6.96658 6.55777 6.83518 6.6122 6.73829 6.70908C6.64141 6.80596 6.58699 6.93736 6.58699 7.07437V12.8977C6.58699 13.1972 6.83201 13.4954 7.10359 13.4954H12.927C13.2264 13.4954 13.4714 13.1959 13.4714 12.8977ZM0.0013278 7.91766H3.32138C3.43765 7.50154 3.60211 7.10042 3.81142 6.72244L1.47145 4.40903L4.41036 1.44356L6.69588 3.75631C7.07703 3.53851 7.48473 3.40239 7.92032 3.26627V0H12.1109V3.26494C12.5253 3.3977 12.9257 3.57095 13.3061 3.7822L15.6189 1.44223L18.5305 4.4077L16.2178 6.72112C16.3811 7.10226 16.5989 7.53719 16.6826 7.91634H20.0027V12.1069H16.6826C16.5498 12.488 16.3831 12.8958 16.2178 13.2497L18.5305 15.6169L15.6195 18.5305L13.3068 16.2995C12.9279 16.5068 12.527 16.6709 12.1116 16.7888V20H7.91899V16.8161C7.48875 16.6773 7.07021 16.5046 6.66733 16.2995L4.40969 18.5305L1.47078 15.6189L3.81076 13.2789C3.62019 12.8977 3.42961 12.49 3.34595 12.1089H0L0.0013278 7.91766Z"
              fill="white"
            />
          </svg>
        </IconButton>
        <IconButton aria-label="settings" color="inherit" className={styles.infoButton}>
          <svg
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.0029 23C5.92739 23 1.00293 18.0744 1.00293 12C1.00293 5.92562 5.92739 1 12.0029 1C18.0772 1 23.0029 5.92569 23.0029 12C23.0029 18.0743 18.0772 23 12.0029 23Z"
              stroke="#E6E7E8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12.0047 17.249L12.0047 11.5163"
              stroke="#E6E7E8"
              strokeWidth="1.94595"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12.0073 7.3992L11.9943 7.3992"
              stroke="#E6E7E8"
              strokeWidth="1.94595"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
      </Box>
    </>
  );
};
