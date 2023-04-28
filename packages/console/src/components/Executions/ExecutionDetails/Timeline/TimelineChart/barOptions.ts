import { Chart as ChartJS, registerables, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getMuiTheme } from 'components/Theme/muiTheme';

ChartJS.register(...registerables, ChartDataLabels);

// Create positioner to put tooltip at cursor position
Tooltip.positioners.cursor = function (_chartElements, coordinates) {
  return coordinates;
};

const getOrCreateTooltip = (chart: any) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
    tooltipEl.style.borderRadius = '3px';
    tooltipEl.style.color = 'white';
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .1s ease';

    const table = document.createElement('table');
    table.style.margin = '0px';

    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = (context: any) => {
  // Tooltip Element
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }

  // Set Text
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map(b => b.lines);

    const tableHead = document.createElement('thead');

    titleLines.forEach(title => {
      const tr = document.createElement('tr');
      tr.style.borderWidth = '0';

      const th = document.createElement('th');
      th.style.borderWidth = '0';
      const text = document.createTextNode(title);

      th.appendChild(text);
      tr.appendChild(th);
      tableHead.appendChild(tr);
    });

    const tableBody = document.createElement('tbody');
    bodyLines.forEach((body, i) => {
      const colors = tooltip.labelColors[i];

      const span = document.createElement('span');
      span.style.background = colors.backgroundColor;
      span.style.borderColor = colors.borderColor;
      span.style.borderWidth = '2px';
      span.style.marginRight = '10px';
      span.style.height = '10px';
      span.style.width = '10px';
      span.style.display = 'inline-block';

      const tr = document.createElement('tr');
      tr.style.backgroundColor = 'inherit';
      tr.style.borderWidth = '0';

      const td = document.createElement('td');
      td.style.borderWidth = '0';

      const text = document.createTextNode(body);

      td.appendChild(span);
      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector('table');

    // Remove old children
    while (tableRoot.firstChild) {
      tableRoot.firstChild.remove();
    }

    // Add new children
    tableRoot.appendChild(tableHead);
    tableRoot.appendChild(tableBody);
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  tooltipEl.style.top = positionY + tooltip.caretY + 'px';
  tooltipEl.style.font = tooltip.options.bodyFont.string;
  tooltipEl.style.padding =
    tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
};

export const getBarOptions = (
  chartTimeIntervalSec: number,
  tooltipLabels: string[][],
  tooltips: string[][],
) => {
  const theme = getMuiTheme(undefined);

  return {
    animation: false as const,
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        // Setting up tooltip: https://www.chartjs.org/docs/latest/configuration/tooltip.html
        enabled: true,
        position: 'cursor',
        includeInvisible: true,
        // disables the squares in the tooltip
        displayColors: false,
        bodyFont: () => {
          return {
            size: 10,
            weight: '500',
            lineHeight: '1.4',
            style: 'normal',
          };
        },
        footerFont: () => {
          return {
            size: 10,
            weight: '500',
            lineHeight: '120%',
            style: 'normal',
          };
        },
        footerColor: 'rgb(0, 0, 0, 0.3)',
        backgroundColor: theme.palette.grey[200],
        borderWidth: 1,
        titleColor: theme.palette.common.black,
        titleAlign: 'center',
        bodyColor: theme.palette.common.black,
        padding: 12,
        caretPadding: 8,
        filter: function (tooltipItem) {
          // no tooltip for offsets
          return tooltipItem.datasetIndex !== 0;
        },
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const datasetIndex = context.datasetIndex;

            if (datasetIndex === 1) {
              return tooltipLabels[index] ?? '';
            }

            return tooltips[index] ?? '';
          },
          labelColor: function (context) {
            return {
              fontColor: 'white',
            };
          },
        },
        // external: externalTooltipHandler
      },
    },
    scales: {
      x: {
        format: Intl.DateTimeFormat,
        position: 'top' as const,
        ticks: {
          display: false,
          autoSkip: false,
          stepSize: chartTimeIntervalSec,
        },
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };
};
