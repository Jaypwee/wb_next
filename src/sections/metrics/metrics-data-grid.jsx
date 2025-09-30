'use client'

import { memo, useMemo, useState } from 'react';

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

import { useTranslate } from 'src/locales';
import { METRIC_SERIES } from 'src/services/metrics';

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
function getTroopConfig(troopType, t) {
  // Default to infantry if undefined
  const troop = troopType || '';
  
  const troopConfig = {
    infantry: { icon: 'mdi:shield', color: '#1976d2', label: t('metrics.dataGrid.troops.infantryMain') },
    archer: { icon: 'mdi:bow-arrow', color: '#388e3c', label: t('metrics.dataGrid.troops.archerMain') },
    mage: { icon: 'mdi:magic-staff', color: '#7b1fa2', label: t('metrics.dataGrid.troops.mageMain') },
    cavalry: { icon: 'mdi:horse-variant', color: '#f57c00', label: t('metrics.dataGrid.troops.cavalryMain') }
  };

  return troopConfig[troop] || null;
}

function TroopIcon({ troopType, t }) {
  const config = getTroopConfig(troopType, t);
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

function MetricsDataGridComponent({ users, type = 'MERITS', gridData = [] }) {
  const { t } = useTranslate();
  const [filterButtonEl, setFilterButtonEl] = useState(null);

  // Get metric name for display
  const metricName = t(METRIC_SERIES[type]?.name) || 'Metrics';

  // Create localized text for DataGrid
  const localeText = useMemo(() => ({
    // Toolbar
    toolbarQuickFilterPlaceholder: t('metrics.dataGrid.toolbar.search'),
    toolbarColumns: t('metrics.dataGrid.toolbar.columns'),
    toolbarFilters: t('metrics.dataGrid.toolbar.filters'),
    toolbarDensity: t('metrics.dataGrid.toolbar.density'),
    toolbarExport: t('metrics.dataGrid.toolbar.export'),
    
    // Column menu
    columnMenuShowColumns: t('metrics.dataGrid.toolbar.showColumns'),
    columnMenuHideColumn: t('metrics.dataGrid.toolbar.hideColumns'),
    columnMenuFilter: t('metrics.dataGrid.toolbar.filterTable'),
    
    // Density
    toolbarDensityCompact: t('metrics.dataGrid.toolbar.densityCompact'),
    toolbarDensityStandard: t('metrics.dataGrid.toolbar.densityStandard'),
    toolbarDensityComfortable: t('metrics.dataGrid.toolbar.densityComfortable'),
    
    // Export
    toolbarExportLabel: t('metrics.dataGrid.toolbar.exportLabel'),
    toolbarExportCSV: t('metrics.dataGrid.toolbar.exportCSV'),
    toolbarExportPrint: t('metrics.dataGrid.toolbar.exportPrint'),
  }), [t]);

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
      headerName: t('metrics.dataGrid.rank'), 
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
      headerName: t('metrics.dataGrid.name'), 
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
            <TroopIcon troopType={userMainTroops} t={t} />
          </Box>
        );
      },
    },
    { 
      field: 'value', 
      headerName: metricName, 
      width: 150,
      valueGetter: (params) => {
        // If already a number, return it directly
        if (typeof params === 'number') {
          return params;
        }
        // Parse the formatted string to get the numeric value for sorting
        return parseInt(params?.replace(/,/g, ''), 10) || 0;
      },
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'bold', color: 'success.main' }}>
          {params.value.toLocaleString()}
        </Box>
      ),
    },
    { 
      field: 'highestPower', 
      headerName: t('metrics.dataGrid.highestPower'), 
      width: 150,
      valueGetter: (params) => {
        // If already a number, return it directly
        if (typeof params === 'number') {
          return params;
        }
        // Parse the formatted string to get the numeric value for sorting
        return parseInt(params?.replace(/,/g, ''), 10) || 0;
      },
      renderCell: (params) => (
        <Box sx={{ color: 'text.secondary' }}>
          {params.value.toLocaleString()}
        </Box>
      ),
    },
    { 
      field: 'currentPower', 
      headerName: t('metrics.dataGrid.currentPower'), 
      width: 260,
      valueGetter: (params) => {
        // If already a number, return it directly
        if (typeof params === 'number') {
          return params;
        }
        // Parse the formatted string to get the numeric value for sorting
        return parseInt(params?.replace(/,/g, ''), 10) || 0;
      },
      renderCell: (params) => {
        // Calculate the difference between highest and current power
        const highestPower = typeof params.row.highestPower === 'number' 
          ? params.row.highestPower 
          : parseInt(params.row.highestPower?.toString().replace(/,/g, '') || '0', 10) || 0;
        const currentPower = typeof params.value === 'number'
          ? params.value
          : parseInt(params.value?.toString().replace(/,/g, '') || '0', 10) || 0;
        const difference = currentPower - highestPower;
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: 'text.secondary' }}>
              {currentPower.toLocaleString()}
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
  ], [metricName, users, t]);

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title={`${metricName} ${t('metrics.dataGrid.leaderboardTitle')}`} 
        subheader={`${t('metrics.dataGrid.leaderboardSubheader')} ${metricName.toLowerCase()}`} 
      />

      <DataGrid
        rows={gridData}
        columns={columns}
        disableRowSelectionOnClick
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        pageSizeOptions={[5, 10, 20, 50, { value: -1, label: 'All' }]}
        localeText={localeText}
        slots={{
          toolbar: CustomToolbar,
          noRowsOverlay: () => <EmptyContent title={t('metrics.dataGrid.noDataAvailable')} />,
          noResultsOverlay: () => <EmptyContent title={t('metrics.dataGrid.noResultsFound')} />,
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
export const MetricsDataGrid = memo(MetricsDataGridComponent); 