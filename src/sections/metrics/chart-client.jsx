'use client';

import { useMemo } from 'react';

import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';
import { fShortenNumber } from 'src/utils/format-number';

export function ChartClient({ type, series, categories, yAxisWidth = 120, sx }) {
  const theme = useTheme();
  
  const chartColors = useMemo(() => [
    hexAlpha(theme.palette.primary.dark, 0.8)
  ], [theme.palette.primary.dark]);

  const chartOptions = useChart({
    colors: chartColors,
    stroke: { width: 0 },
    xaxis: { 
      show: false,
      categories,
      range: 8,
      labels: {
        fontSize: 16,
        formatter: (value) => fShortenNumber(value),
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: 13,
        },
        minWidth: yAxisWidth,
      }
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      formatter: (value) => fShortenNumber(value),
    },
    tooltip: {
      y: { 
        formatter: (value) => fShortenNumber(value),
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