import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { ChartClient } from './chart-client';

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
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title="Performance Metrics" 
        subheader="Monthly performance data visualization"
      />

      <Box sx={{ 
        height: '400px',
        overflow: 'hidden',
      }}>
        <Box sx={{ 
          height: '100%',
          overflowY: 'auto',
          '& .apexcharts-canvas': {
            minWidth: '100%',
          },
        }}>
          <ChartClient
            type="bar"
            series={CHART_DATA.series}
            categories={CHART_DATA.categories}
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