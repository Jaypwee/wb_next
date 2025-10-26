'use client'

import { useRef, useMemo, useState, useEffect, useCallback, useTransition } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import { useRouter, usePathname, useSearchParams } from 'src/routes/hooks';

import axios from 'src/lib/axios';
import { useTranslate } from 'src/locales';
import { useUserContext } from 'src/context/user';
import { useMetricsContext } from 'src/context/metrics';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';

import { useSettingsContext } from 'src/components/settings';
import { MetricsDropdown } from 'src/components/metrics-dropdown';

import { MetricsBarChart } from 'src/sections/metrics/metrics-bar-chart';
import { MetricsDataGrid } from 'src/sections/metrics/metrics-data-grid';

// ----------------------------------------------------------------------

const TAB_OPTIONS = [
  { value: 'MERITS', label: 'metrics.series.merits', key: 'merits' },
  { value: 'UNITS_KILLED', label: 'metrics.series.unitsKilled', key: 'unitsKilled' },
  { value: 'UNITS_DEAD', label: 'metrics.series.unitsDead', key: 'unitsDead' },
  { value: 'MANA_SPENT', label: 'metrics.series.manaSpent', key: 'manaSpent' },
  { value: 'T5_KILL_COUNT', label: 'metrics.series.t5KillCount', key: 't5KillCount' },
];

// Helper function to format data for charts and grids
function formatKvkData(differences, selectedServers) {
  const formattedByType = {};
  
  TAB_OPTIONS.forEach(({ value, key }) => {
    // Filter users by selected servers
    const filteredUsers = Object.entries(differences)
      .filter(([_, userData]) => selectedServers.includes(userData.homeServer));
    
    // Sort all by the metric value using the camelCase key
    const sortedUsersAll = filteredUsers
      .sort((a, b) => b[1][key] - a[1][key]);
    const sortedUsersTop20 = sortedUsersAll.slice(0, 20); // Top 20 for chart
    
    // Format for chart
    const categories = sortedUsersTop20.map(([_, userData]) => userData.name);
    const data = sortedUsersTop20.map(([_, userData]) => userData[key]);
    
    formattedByType[value] = {
      chart: {
        title: `Top 20 by ${key}`,
        series: [{ name: key, data }],
        categories,
        yAxisWidth: 100,
      },
      grid: sortedUsersAll.map(([userId, userData], index) => ({
        id: userId,
        rank: index + 1,
        name: userData.name,
        value: userData[key],
        highestPower: userData.highestPower,
        currentPower: userData.currentPower,
        homeServer: userData.homeServer,
      })),
    };
  });
  
  return formattedByType;
}

// Fetch function for KVK season data
async function fetchKvkSeasonData({ seasonName, startDate, endDate }) {
  const params = new URLSearchParams({
    season_name: seasonName,
    start_date: startDate,
  });
  
  if (endDate) {
    params.append('end_date', endDate);
  }
  
  try {
    const response = await axios.get(`/api/metrics/kvk/season/detailed?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch KVK season data');
  }
}

export function KvkDetailedView({ type: initialType = 'MERITS' }) {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const [isPending, startTransition] = useTransition();
  const [formattedData, setFormattedData] = useState({});
  const [currentType, setCurrentType] = useState(initialType);
  const [rawKvkData, setRawKvkData] = useState(null);
  const [selectedServers, setSelectedServers] = useState([]);
  const [availableServers, setAvailableServers] = useState([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasProcessedInitialParams = useRef(false);
  
  const {
    selectedSeason,
    startDate,
    endDate,
    setSelectedSeason,
    setStartDate,
    setEndDate,
    setError,
  } = useMetricsContext();

  // Use user context
  const { users, loadUsers } = useUserContext();

  // Helper function to fetch and process metrics data
  const fetchAndProcessMetrics = useCallback(async (seasonName, startDateParam, endDateParam) => {
    const response = await makeAuthenticatedRequest(async () => fetchKvkSeasonData({
      seasonName,
      startDate: startDateParam,
      endDate: endDateParam,
    }));

    // Store raw data
    setRawKvkData(response.data);
    
    // Compute servers actually present in data and initialize selection
    const serversInData = Array.from(new Set(
      Object.values(response.data.differences || {})
        .map((userData) => userData.homeServer)
        .filter(Boolean)
    ));
    setAvailableServers(serversInData);
    setSelectedServers(serversInData);
    
    // Format data with all servers initially selected
    const formatted = formatKvkData(response.data.differences, serversInData);
    setFormattedData(formatted);
  }, []);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Initialize from query params and auto-fetch if all params exist (only once)
  useEffect(() => {
    if (hasProcessedInitialParams.current) return;

    const seasonName = searchParams.get('seasonName');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Update context with query params if they exist
    if (seasonName) {
      setSelectedSeason(seasonName);
    }
    if (startDateParam) {
      setStartDate(startDateParam);
    }
    if (endDateParam) {
      setEndDate(endDateParam);
    }

    // Auto-fetch metrics if all required params exist
    if (seasonName && startDateParam) {
      const fetchMetricsFromParams = async () => {
        try {
          setError(null);
          
          startTransition(async () => {
            await fetchAndProcessMetrics(seasonName, startDateParam, endDateParam);
          });
        } catch (error) {
          console.error('Error fetching KVK metrics from params:', error);
          setError(error.message);
        }
      };

      fetchMetricsFromParams();
    }
    hasProcessedInitialParams.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only depend on searchParams on initial load

  const handleApply = async () => {
    try {
      setError(null);

      startTransition(async () => {
        await fetchAndProcessMetrics(selectedSeason, startDate, endDate);
        
        // Update URL query parameters
        const params = new URLSearchParams();
        params.set('seasonName', selectedSeason);
        params.set('startDate', startDate);
        if (endDate) {
          params.set('endDate', endDate);
        }
        
        router.push(`${pathname}?${params.toString()}`);
      });
    } catch (error) {
      console.error('Error fetching KVK metrics:', error);
      setError(error.message);
    }
  };

  const handleTabChange = useCallback((event, newValue) => {
    setCurrentType(newValue);
  }, []);

  // Handle server filter toggle
  const handleServerToggle = useCallback((server) => {
    setSelectedServers((prev) => {
      const newSelected = prev.includes(server)
        ? prev.filter(s => s !== server)
        : [...prev, server];
      
      // Re-format data with new server selection
      if (rawKvkData) {
        const formatted = formatKvkData(rawKvkData.differences, newSelected);
        setFormattedData(formatted);
      }
      
      return newSelected;
    });
  }, [rawKvkData]);
  
  // Memoize current formatted data to prevent unnecessary re-renders
  const currentFormattedChartData = useMemo(() => 
    formattedData[currentType]?.chart || null,
    [formattedData, currentType]
  );
  
  const currentFormattedGridData = useMemo(() => 
    formattedData[currentType]?.grid || [],
    [formattedData, currentType]
  );


  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        {!rawKvkData ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: { xs: '50vh', md: '60vh' },
              px: { xs: 2, sm: 3 },
            }}
          >
            <Box
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                mx: { xs: 1, sm: 2 },
                width: { xs: '100%', sm: 'auto' },
                maxWidth: { xs: '100%', sm: '800px' },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.paper',
                boxShadow: 1,
              }}
            >
              <MetricsDropdown
                selectedSeason={selectedSeason}
                startDate={startDate}
                endDate={endDate}
                metricType='individual'
                onSeasonChange={setSelectedSeason}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onApply={handleApply}
                isPending={isPending}
              />
            </Box>
          </Box>
        ) : (
          <>
            <MetricsDropdown
              selectedSeason={selectedSeason}
              startDate={startDate}
              endDate={endDate}
              metricType='individual'
              onSeasonChange={setSelectedSeason}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onApply={handleApply}
              isPending={isPending}
            />

            {/* Server Filter Chips (only show when servers exist in data) */}
            {availableServers.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {availableServers.map((server) => (
                  <Chip
                    key={server}
                    label={server}
                    onClick={() => handleServerToggle(server)}
                    color={selectedServers.includes(server) ? 'primary' : 'default'}
                    variant={selectedServers.includes(server) ? 'filled' : 'outlined'}
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: selectedServers.includes(server) ? 'bold' : 'normal',
                      width: '150px',
                      height: '36px',
                    }}
                  />
                ))}
              </Box>
            )}

            <Box
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2,
              }}
            >
              <Tabs
                value={currentType}
                onChange={handleTabChange}
                aria-label="KVK metrics type tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                {TAB_OPTIONS.map((tab) => (
                  <Tab
                    key={tab.value}
                    label={t(tab.label)}
                    value={tab.value}
                  />
                ))}
              </Tabs>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                minHeight: '45vh',
              }}
            >
              {
                currentFormattedChartData && (
                  <Box sx={{ flex: 1 }}>
                    <MetricsBarChart {...currentFormattedChartData} />
                  </Box>
                )
              }

              {
                currentFormattedGridData && (
                  <Box sx={{ flex: 1, minHeight: '45vh' }}>
                    <MetricsDataGrid 
                      type={currentType}
                      users={users}
                      gridData={currentFormattedGridData}
                    />
                  </Box>
                )
              }
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
}
