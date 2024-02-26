import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import styled from '@mui/system/styled';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import classNames from 'classnames';

const StyledContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(3),
  paddingTop: theme.spacing(1),
  gap: theme.spacing(1),
  minHeight: '72px',

  '.wrapper': {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(2.5),
  },
  '.header': {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(0.75),
    fontSize: CommonStylesConstants.smallFontSize,
    border: 'none',
  },
  '.body': {
    display: 'flex',
    alignItems: 'stretch',
    borderLeft: '1.04174px dashed #C1C1C1',
    borderRight: '1.04174px dashed #C1C1C1',
    minHeight: theme.spacing(9),
  },
  '.item': {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    '&:last-child': {
      marginRight: 0,
    },
  },
  '.itemBar': {
    borderRadius: 2,
    marginRight: theme.spacing(0.25),
    minHeight: theme.spacing(0.75),
    cursor: 'pointer',
    width: '80%',
    marginLeft: '10%',
  },
}));

export interface BarChartData {
  value: number;
  className: string;
  metadata?: any;
  tooltip?: React.ReactChild;
}

interface BarChartItemProps extends BarChartData {
  onClick?: () => void;
  isSelected: boolean;
}

interface BarChartProps {
  title: string;
  data: BarChartData[];
  startDate?: string;
  onClickItem?: (item: any) => void;
  chartIds: string[];
}

/**
 * Display individual chart item for the BarChart component
 * @param value
 * @param color
 * @constructor
 */
export const BarChartItem: React.FC<BarChartItemProps> = ({
  value,
  className,
  isSelected,
  tooltip,
  onClick,
}) => {
  const content = (
    <div
      className={classNames('itemBar', className)}
      style={{
        height: `${value}%`,
        opacity: isSelected ? '100%' : '50%',
      }}
      onClick={onClick}
    />
  );

  return (
    <div className="item">
      {tooltip ? (
        <Tooltip title={<>{tooltip}</>} TransitionComponent={Zoom}>
          {content}
        </Tooltip>
      ) : (
        content
      )}
    </div>
  );
};

/**
 * Display information as bar chart with value and color
 * @param data
 * @param startDate
 * @constructor
 */
export const BarChart: React.FC<BarChartProps> = ({
  title,
  chartIds,
  data,
  startDate,
  onClickItem,
}) => {
  const maxHeight = React.useMemo(() => {
    return Math.max(...data.map((x) => Math.log2(x.value)));
  }, [data]);

  const handleClickItem = React.useCallback(
    (item) => () => {
      if (onClickItem) {
        onClickItem(item);
      }
    },
    [onClickItem],
  );

  return (
    <StyledContainer>
      <Typography variant="label" sx={{ color: (theme) => theme.palette.common.grays[40] }}>
        {title}
      </Typography>

      <div className="wrapper">
        <div className="header">
          <Typography
            variant="caption"
            sx={{
              color: (theme) => theme.palette.common.grays[40],
            }}
          >
            {startDate}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: (theme) => theme.palette.common.grays[40],
            }}
          >
            Most Recent
          </Typography>
        </div>
        <div className="body">
          {data.map((item, index) => (
            <BarChartItem
              value={(Math.log2(item.value) / maxHeight) * 100}
              className={item.className}
              tooltip={item.tooltip}
              onClick={handleClickItem(item)}
              // eslint-disable-next-line react/no-array-index-key
              key={`bar-chart-item-${index}`}
              isSelected={
                chartIds.length === 0
                  ? true
                  : item.metadata && chartIds.includes(item.metadata.name)
              }
            />
          ))}
        </div>
      </div>
    </StyledContainer>
  );
};
