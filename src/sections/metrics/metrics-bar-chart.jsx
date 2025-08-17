import { memo } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { ChartClient } from './chart-client';

// ----------------------------------------------------------------------

function MetricsBarChartComponent({ title, subheader, series, categories, yAxisWidth }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title={title} 
        subheader={subheader}
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
            yAxisWidth={yAxisWidth}
            series={series}
            categories={categories}
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

MetricsBarChartComponent.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      data: PropTypes.arrayOf(PropTypes.number),
    })
  ),
  categories: PropTypes.arrayOf(PropTypes.string),
};

export const MetricsBarChart = memo(MetricsBarChartComponent);