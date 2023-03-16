import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
} from 'chart.js';
import dayjs from 'dayjs';
import { Chart, ChartProps } from 'react-chartjs-2';
import { makeStyles, Theme } from '@material-ui/core';
import { sortBy } from 'lodash';

const useStyles = makeStyles((theme: Theme) => ({
  chartContainer: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 2,
  },
  title: {},
}));

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
);

export interface MultiChartProps extends ChartProps {
  title: string;
  CustomLegend?: React.ReactNode;
}

export const defaultOptions = {
  responsive: true,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        autoSkip: true,
        minRotation: 0,
        maxRotation: 0,
      },
    },
    y: {
      grid: {
        color: 'grey',
      },
      border: {
        dash: [2, 4],
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

const MultiChart = ({
  data,
  options = defaultOptions,
  ...props
}: MultiChartProps) => {
  const styles = useStyles();

  return (
    <div className={styles.chartContainer}>
      <div className={styles.titleContainer}>
        <div className={styles.title}>{props.title}</div>
        {props.CustomLegend}
      </div>
      <Chart data={data} options={options} {...props} />
    </div>
  );
};

export default MultiChart;

export const DummyMultiChart = () => {
  const now = dayjs();

  const metrics = [
    [1678785300, 0.7958298],
    [1678786200, 0.80871964],
    [1678787100, 0.7835764],
    [1678788000, 0.78029054],
    [1678788900, 0.8178427],
    [1678789800, 0.8367864],
    [1678790700, 0.76056075],
    [1678791600, 0.80932266],
    [1678792500, 0.804785],
    [1678793400, 0.7803947],
    [1678794300, 0.78798705],
    [1678795200, 0.783475],
    [1678796100, 0.7706686],
    [1678797000, 0.8360653],
  ];

  const sortedMetrics = sortBy(metrics, m => m[0]);

  const labels = sortedMetrics.map(m => now.diff(m[0], 'hour'));
  const metricsTransformed = sortedMetrics.map(m => m[1].toFixed(2));

  const data = {
    labels,
    datasets: [
      {
        type: 'line',
        fill: false,
        label: 'CPU Utilization',
        data: metricsTransformed,
        borderColor: '#FCB51F',
        backgroundColor: '#FCB51F',
      },
    ],
  };

  return <MultiChart type="bar" data={data} title="CPU Utilization" />;
};
