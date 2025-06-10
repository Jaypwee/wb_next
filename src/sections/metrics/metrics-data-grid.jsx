'use client'

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import {
  DataGrid,
  gridClasses,
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';

import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

const MOCK_DATA = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  metric: `Metric ${index + 1}`,
  value: Math.floor(Math.random() * 1000),
  status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
  lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
  trend: Math.floor(Math.random() * 100) - 50,
}));

const COLUMNS = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'metric', headerName: 'Metric Name', flex: 1, minWidth: 200 },
  { 
    field: 'value', 
    headerName: 'Value', 
    width: 130,
    type: 'number',
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 130,
    renderCell: (params) => (
      <Box
        sx={{
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.75rem',
          fontWeight: 'bold',
          bgcolor: (theme) => {
            const color = {
              active: theme.palette.success.main,
              inactive: theme.palette.error.main,
              pending: theme.palette.warning.main,
            }[params.value];
            return color;
          },
          color: 'white',
        }}
      >
        {params.value}
      </Box>
    ),
  },
  { 
    field: 'lastUpdated', 
    headerName: 'Last Updated', 
    width: 180,
    type: 'dateTime',
    valueGetter: (params) => new Date(params.value),
  },
  { 
    field: 'trend', 
    headerName: 'Trend', 
    width: 130,
    type: 'number',
    renderCell: (params) => (
      <Box
        sx={{
          color: params.value >= 0 ? 'success.main' : 'error.main',
          fontWeight: 'bold',
        }}
      >
        {params.value >= 0 ? '+' : ''}{params.value}%
      </Box>
    ),
  },
];

function CustomToolbar({ setFilterButtonEl }) {
  return (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton ref={setFilterButtonEl} />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export function MetricsDataGrid({ selectedMetrics, onSelectionChange }) {
  const [filterButtonEl, setFilterButtonEl] = useState(null);

  const columns = useMemo(() => COLUMNS, []);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Metrics Data" subheader="Detailed metrics information" />

      <DataGrid
        rows={MOCK_DATA}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={onSelectionChange}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        pageSizeOptions={[5, 10, 20, 50, { value: -1, label: 'All' }]}
        slots={{
          toolbar: CustomToolbar,
          noRowsOverlay: () => <EmptyContent />,
          noResultsOverlay: () => <EmptyContent title="No results found" />,
        }}
        slotProps={{
          toolbar: { setFilterButtonEl },
          panel: { anchorEl: filterButtonEl },
        }}
        sx={{
          height: 'calc(100% - 80px)', // Subtract header height
          [`& .${gridClasses.cell}`]: {
            alignItems: 'center',
            display: 'inline-flex',
          },
        }}
      />
    </Card>
  );
} 