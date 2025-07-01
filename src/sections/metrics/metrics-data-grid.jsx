'use client'

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
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

import { METRIC_SERIES, formatDataGridData } from 'src/services/metrics';

import { Iconify } from 'src/components/iconify';
import { BadgeCell } from 'src/components/badge-cell';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

function CustomToolbar({ setFilterButtonEl }) {
  return (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton ref={setFilterButtonEl} />
      <GridToolbarDensitySelector />
      <GridToolbarExport 
        csvOptions={{ 
          delimiter: ',',
          utf8WithBom: true,
          includeHeaders: true, 
        }}
        printOptions={{ disableToolbarButton: true }}
      />
    </GridToolbarContainer>
  );
}

// Medal component for top 3 ranks
function MedalIcon({ rank }) {
  const medalConfig = {
    1: { icon: 'mdi:medal', color: '#FFD700' }, // Gold
    2: { icon: 'mdi:medal', color: '#C0C0C0' }, // Silver
    3: { icon: 'mdi:medal', color: '#CD7F32' }, // Bronze
  };

  const config = medalConfig[rank];
  if (!config) return null;

  return (
    <Iconify
      icon={config.icon}
      sx={{
        color: config.color,
        width: 20,
        height: 20,
        mr: 1,
      }}
    />
  );
}

// Nationality flag component
function NationalityFlag({ nationality }) {
  if (!nationality) return null;
  
  if (nationality === 'korean') {
    return (
      <Iconify
        icon="twemoji:flag-south-korea"
        sx={{
          width: 28,
          height: 28,
        }}
      />
    );
  }
  
  if (nationality === 'vietnam') {
    return (
      <Iconify
        icon="twemoji:flag-vietnam"
        sx={{
          width: 28,
          height: 28,
        }}
      />
    );
  }
  
  if (nationality === 'russia') {
    return (
      <Iconify
        icon="twemoji:flag-russia"
        sx={{
          width: 28,
          height: 28,
        }}
      />
    );
  }
  
  if (nationality === 'usa') {
    return (
      <Iconify
        icon="twemoji:flag-united-states"
        sx={{
          width: 28,
          height: 28,
        }}
      />
    );
  }
  
  if (nationality === 'china') {
    return (
      <Iconify
        icon="twemoji:flag-china"
        sx={{
          width: 28,
          height: 28,
        }}
      />
    );
  }
  
  if (nationality === 'international') {
    return (
      <Iconify
        icon="mdi:earth"
        sx={{
          width: 28,
          height: 28,
          color: 'primary.main',
        }}
      />
    );
  }
  
  return null;
}

// Troop type icon component
function getTroopConfig(troopType) {
  // Default to infantry if undefined
  const troop = troopType || '';
  
  const troopConfig = {
    infantry: { icon: 'mdi:shield', color: '#1976d2', label: 'Infantry Main' },
    archer: { icon: 'mdi:bow-arrow', color: '#388e3c', label: 'Archer Main' },
    mage: { icon: 'mdi:magic-staff', color: '#7b1fa2', label: 'Mage Main' },
    cavalry: { icon: 'mdi:horse-variant', color: '#f57c00', label: 'Cavalry Main' }
  };

  return troopConfig[troop] || null;
}

function TroopIcon({ troopType }) {
  const config = getTroopConfig(troopType);
  if (!config) return null;

  return (
    <Tooltip title={config.label}>
      <Iconify
        icon={config.icon}
        sx={{
          width: 28,
          height: 28,
          color: config.color,
        }}
      />
    </Tooltip>
  );
}

export function MetricsDataGrid({ selectedMetrics, users, type = 'MERITS' }) {
  const [filterButtonEl, setFilterButtonEl] = useState(null);

  // Format data for DataGrid
  const gridData = useMemo(() => {
    if (!selectedMetrics?.data) return [];
    return formatDataGridData({ data: selectedMetrics.data, type });
  }, [selectedMetrics, type]);

  // Get metric name for display
  const metricName = METRIC_SERIES[type]?.name || 'Metrics';

  // Define columns
  const columns = useMemo(() => [
    { 
      field: 'nationality', 
      headerName: '', 
      width: 28,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const userId = params.row.id;
        const userNationality = users?.[userId]?.nationality;
        return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <NationalityFlag nationality={userNationality} />
          </Box>
        );
      },
    },
    { 
      field: 'rank', 
      headerName: 'Rank', 
      width: 60,
      type: 'number',
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          #{params.value}
        </Box>
      ),
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      minWidth: 300,
      flex: 1,
      renderCell: (params) => {
        const userId = params.row.id;
        const userData = users?.[userId];
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MedalIcon rank={params.row.rank} />
            <Box sx={{ fontWeight: 'medium', mr: 1 }}>
              {params.value}
            </Box>
            {userData && (
              <BadgeCell 
                user={{
                  uid: userId,
                  id: userId,
                  isInfantryGroup: userData.isInfantryGroup,
                  labels: userData.labels
                }}
                showNickname={false}
              />
            )}
          </Box>
        );
      },
    },
    { 
      field: 'mainTroops', 
      headerName: '', 
      width: 28,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        const userId = params.row.id;
        const userMainTroops = users?.[userId]?.mainTroops;
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <TroopIcon troopType={userMainTroops} />
          </Box>
        );
      },
    },
    { 
      field: 'value', 
      headerName: metricName, 
      width: 150,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'bold', color: 'success.main' }}>
          {params.value}
        </Box>
      ),
    },
    { 
      field: 'highestPower', 
      headerName: 'Highest Power', 
      width: 150,
      renderCell: (params) => (
        <Box sx={{ color: 'text.secondary' }}>
          {params.value}
        </Box>
      ),
    },
    { 
      field: 'currentPower', 
      headerName: 'Current Power', 
      width: 260,
      renderCell: (params) => {
        // Calculate the difference between highest and current power
        const highestPower = parseInt(params.row.highestPower.replace(/,/g, ''), 10) || 0;
        const currentPower = parseInt(params.value.replace(/,/g, ''), 10) || 0;
        const difference = currentPower - highestPower;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: 'text.secondary' }}>
              {params.value}
            </Box>
            {difference !== 0 && (
              <Box 
                sx={{ 
                  color: difference === 0 ? 'text.disabled' : 'rgba(211, 47, 47, 0.7)',
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                }}
              >
                ({difference > 0 ? '+' : ''}{difference.toLocaleString()})
              </Box>
            )}
            {difference === 0 && (
              <Box 
                sx={{ 
                  color: 'text.disabled',
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                }}
              >
                (0)
              </Box>
            )}
          </Box>
        );
      },
    },
  ], [metricName, users]);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title={`${metricName} Leaderboard`} 
        subheader={`Top performers ranked by ${metricName.toLowerCase()}`} 
      />

      <DataGrid
        rows={gridData}
        columns={columns}
        disableRowSelectionOnClick
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        pageSizeOptions={[5, 10, 20, 50, { value: -1, label: 'All' }]}
        slots={{
          toolbar: CustomToolbar,
          noRowsOverlay: () => <EmptyContent title="No data available" />,
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
          [`& .${gridClasses.row}`]: {
            '&:hover': {
              bgcolor: 'action.hover',
            },
          },
        }}
      />
    </Card>
  );
} 