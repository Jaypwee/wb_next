import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { fShortenNumber } from 'src/utils/format-number';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function ChartPie({ chart, showLegend = true }) {
  const theme = useTheme();

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
        console.log(chart, chart[opts.seriesIndex])
        return formattedValue;
      },
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#fff'],
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
          sx={{ p: 3, justifyContent: 'center' }}
        />
      )}

      <Chart
        type="pie"
        series={chart.series}
        options={chartOptions}
        sx={{
          my: 3,
          mx: 'auto',
          width: 240,
          height: 240,
        }}
      />
    </>
  );
}
