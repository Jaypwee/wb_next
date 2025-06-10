'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const CHART_DATA = {
  categories: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  series: [
    {
      name: 'Performance',
      data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380, 1500, 1600],
    },
  ],
};

export function MetricsBarChart() {
  const theme = useTheme();

  const chartColors = [hexAlpha(theme.palette.primary.dark, 0.8)];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: { width: 0 },
    xaxis: { 
      categories: CHART_DATA.categories,
      range: 8
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
      } 
    },
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title="Performance Metrics" 
        subheader="Monthly performance data visualization"
      />

      <Box sx={{ 
        height: '400px', // Subtract header height
        overflow: 'hidden', // Hide overflow
      }}>
        <Box sx={{ 
          height: '100%',
          overflowY: 'auto', // Enable vertical scrolling
          '& .apexcharts-canvas': {
            minWidth: '100%',
          },
        }}>
          <Chart
            type="bar"
            series={CHART_DATA.series}
            options={chartOptions}
            sx={{ 
              p: 3,
              minWidth: '100%',
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}