
import { fShortenNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function ChartPie({ chart, showLegend = true }) {

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    labels: chart.categories,
    stroke: { width: 0 },
    dataLabels: { 
      enabled: true, 
      dropShadow: { enabled: false },
      formatter: (val, opts) => {
        const value = chart.series[opts.seriesIndex];
        const formattedValue = fShortenNumber(value);
        return formattedValue;
      },
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#fff'],
      },
    },
    tooltip: {
      y: { 
        formatter: (value, opts) => fShortenNumber(value)
      },
    },
    plotOptions: { pie: { donut: { labels: { show: false } } } },
  });

  return (
    <>
      {showLegend && (
        <ChartLegends
          labels={chartOptions?.labels}
          colors={chartOptions?.colors}
          sx={{ p: 1, justifyContent: 'center' }}
        />
      )}

      <Chart
        type="pie"
        series={chart.series}
        options={chartOptions}
        sx={{
          my: 1,
          mx: 'auto',
          width: 300,
          height: 300,
        }}
      />
    </>
  );
}
