'use client';

import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';

export function ChartClient({ type, series, categories, sx }) {
  const theme = useTheme();
  const chartColors = [hexAlpha(theme.palette.primary.dark, 0.8)];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: { width: 0 },
    xaxis: { 
      categories,
      range: 8
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'end',
    },
    tooltip: {
      y: { 
        formatter: (value) => `${value} units`,
        title: { formatter: () => '' }
      },
    },
    plotOptions: { 
      bar: { 
        horizontal: true,
        barHeight: '70%',
        borderRadius: 2,
        columnWidth: '30px'
      } 
    },
  });

  return (
    <Chart
      type={type}
      series={series}
      options={chartOptions}
      sx={sx}
    />
  );
} 