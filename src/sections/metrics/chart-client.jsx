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
      show: false,
      categories,
      range: 8,
      labels: {
        fontSize: 16,
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: 13,
        },
        minWidth: 120,
      }
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      formatter: (value) => value.toLocaleString(),

    },
    tooltip: {
      y: { 
        formatter: (value) => value.toLocaleString(),
        title: { formatter: () => '' }
      },
    },
    chart: {
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
        delay: 1000,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
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