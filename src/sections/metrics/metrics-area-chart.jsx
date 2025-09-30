'use client'

import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export function MetricsAreaChart({ title, subheader, series, categories, height = 400 }) {
  const chartOptions = useChart({
    xaxis: {
      categories,
    },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          {
            offset: 0,
            color: undefined,
            opacity: 0.3
          },
          {
            offset: 100,
            color: undefined,
            opacity: 0.1
          }
        ]
      }
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2.5,
      curve: 'smooth',
    },
    grid: {
      show: true,
    },
    tooltip: {
      x: {
        show: true,
      },
    },
  });

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title={title} 
        subheader={subheader}
      />

        <Chart
          type="area"
          series={series}
          options={chartOptions}
          sx={{ 
            width: '100%',
            height: 320,
          }}
        />
      {/* </Box> */}
    </Card>
  );
}

MetricsAreaChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      data: PropTypes.arrayOf(PropTypes.number),
    })
  ),
  categories: PropTypes.arrayOf(PropTypes.string),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
}; 