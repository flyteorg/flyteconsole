import { Chart as ChartJS, registerables, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(...registerables, ChartDataLabels);

// Create positioner to put tooltip at cursor position
Tooltip.positioners.cursor = function (_chartElements, coordinates) {
  return coordinates;
};

const getOrCreateTooltip = (chart: any) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.style.background = 'rgba(225, 225, 225)';
    tooltipEl.style.borderRadius = '3px';
    tooltipEl.style.color = 'black';
    tooltipEl.style.opacity = 1;
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.transform = 'translate(-50%, 0)';
    tooltipEl.style.transition = 'all .1s ease';
    tooltipEl.style.padding = '12px 24px';

    const phaseIndicatorEl = document.createElement('div');
    phaseIndicatorEl.style.padding = '8px 12px';
    phaseIndicatorEl.style.textAlign = 'center';
    phaseIndicatorEl.className = 'phaseIndicator';

    const table = document.createElement('table');
    table.style.margin = '0px';

    tooltipEl.appendChild(phaseIndicatorEl);
    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }

  return tooltipEl;
};

const externalTooltipHandler = context => {
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

    const tableHead = document.createElement('thead');

    titleLines.forEach(title => {
      const tr = document.createElement('tr');
      tr.style.borderWidth = '0px';

      const th = document.createElement('th');
      th.style.borderWidth = '0px';
      const text = document.createTextNode(title);

      th.appendChild(text);
      tr.appendChild(th);
      tableHead.appendChild(tr);
    });

    const tableBody = document.createElement('tbody');

    const bodyLines = tooltip.body.flatMap(b => b.lines);

    bodyLines.forEach((body, i) => {
      if (i === 0) {
        return;
      }

      const tr = document.createElement('tr');
      tr.style.backgroundColor = 'inherit';
      tr.style.borderWidth = '0';

      const td = document.createElement('td');
      td.style.borderWidth = '0';
      td.style.fontWeight = 'bold';

      const text = document.createTextNode(body);

      td.appendChild(text);
      tr.appendChild(td);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector('table');

    const phaseIndicatorEl = tooltipEl.querySelector('.phaseIndicator');
    phaseIndicatorEl.innerText = bodyLines[0];

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
  executionMetricsTooltips: string[][],
) => {
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
        enabled: false,
        position: 'cursor',
        filter: function (tooltipItem) {
          // no tooltip for offsets
          return tooltipItem.datasetIndex !== 0;
        },
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;

            return tooltipLabels
              ? [`${tooltipLabels[index]}`, ...executionMetricsTooltips[index]]
              : '';
          },
          labelColor: function (context) {
            return {
              fontColor: 'white',
            };
          },
        },
        external: externalTooltipHandler,
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
