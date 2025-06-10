'use client'

import { useState } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';

import { MetricsBarChart } from './metrics-bar-chart';
import { MetricsDataGrid } from './metrics-data-grid';

// ----------------------------------------------------------------------

export function MetricsView() {
  const settings = useSettingsContext();

  const [selectedMetrics, setSelectedMetrics] = useState([]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          minHeight: '45vh',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <MetricsBarChart />
        </Box>

        <Box sx={{ flex: 1, minHeight: '45vh' }}>
          <MetricsDataGrid 
            selectedMetrics={selectedMetrics}
            onSelectionChange={setSelectedMetrics}
          />
        </Box>
      </Box>
    </Container>
  );
} 