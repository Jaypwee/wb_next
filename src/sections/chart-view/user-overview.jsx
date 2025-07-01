'use client';

import { useEffect, useTransition } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { fetchUserOverview } from 'src/services/user';
import { useMetricsContext } from 'src/context/metrics';

import { EmptyContent } from 'src/components/empty-content';

import { ChartDonut } from './components/chart-donut';

// ----------------------------------------------------------------------

export function UserOverview({ 
  title = "User Overview",
  subheader = "Distribution of users by main troops and nationality",
  showTotalUsers = true,
  sx = {},
  ...other 
}) {
  const { overview, setOverview, setError } = useMetricsContext();
  const [isPending, startTransition] = useTransition();

  // Fetch overview data on component mount
  useEffect(() => {
    const loadOverviewData = async () => {
      if (overview) return; // Don't fetch if data already exists

      startTransition(async () => {
        try {
          setError(null);
          
          const data = await fetchUserOverview();
          setOverview(data);
        } catch (error) {
          console.error('Error fetching overview data:', error);
          setError(error.message);
        }
      });
    };

    loadOverviewData();
  }, [overview, setOverview, setError]);

  // Format data for main troops donut chart
  const formatMainTroopsData = (mainTroops) => {
    if (!mainTroops) return null;

    const troopLabels = {
      infantry: 'Infantry',
      archer: 'Archer',
      mage: 'Mage',
      cavalry: 'Cavalry',
      unknown: 'Unknown'
    };

    const troopColors = {
      infantry: '#1976d2',    // Blue
      archer: '#66bb6a',      // Light Green
      mage: '#7b1fa2',        // Purple
      cavalry: '#f44336',     // Red
      unknown: '#bdbdbd'      // Light Gray
    };

    const categories = [];
    const series = [];
    const colors = [];

    Object.entries(mainTroops).forEach(([key, value]) => {
      if (value > 0) {
        categories.push(troopLabels[key] || key);
        series.push(value);
        colors.push(troopColors[key] || '#bdbdbd');
      }
    });

    return {
      categories,
      series,
      colors
    };
  };

  // Format data for nationality donut chart
  const formatNationalityData = (nationality) => {
    if (!nationality) return null;

    const nationalityLabels = {
      korean: 'Korean',
      vietnam: 'Vietnam',
      russia: 'Russia',
      usa: 'USA',
      china: 'China',
      international: 'International',
      unknown: 'Unknown'
    };

    const nationalityColors = {
      korean: '#1976d2',      // Blue
      vietnam: '#f44336',     // Red
      russia: '#ffffff',      // White
      usa: '#00acc1',         // Teal
      china: '#ffeb3b',       // Yellow
      international: '#9c27b0', // Purple (for international)
      unknown: '#bdbdbd'      // Light Gray
    };

    const categories = [];
    const series = [];
    const colors = [];

    Object.entries(nationality).forEach(([key, value]) => {
      if (value > 0) {
        categories.push(nationalityLabels[key] || key);
        series.push(value);
        colors.push(nationalityColors[key] || '#bdbdbd');
      }
    });

    return {
      categories,
      series,
      colors
    };
  };

  if (isPending) {
    return (
      <Card sx={{ height: '100%', ...sx }} {...other}>
        <CardHeader title={title} subheader={subheader} />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  if (!overview) {
    return (
      <Card sx={{ height: '100%', ...sx }} {...other}>
        <CardHeader title={title} subheader={subheader} />
        <EmptyContent title="No overview data available" />
      </Card>
    );
  }

  const mainTroopsChart = formatMainTroopsData(overview.mainTroops);
  const nationalityChart = formatNationalityData(overview.nationality);

  return (
      <Box sx={{ p: 3 }}>
        {/* Total Users Summary */}
        {showTotalUsers && overview.totalUsers && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" color="primary.main">
              {overview.totalUsers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Active Fighters
            </Typography>
          </Box>
        )}

        {/* Charts Side by Side */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 3,
            flexDirection: { xs: 'column', md: 'row' },
            '& > *': { flex: 1 }
          }}
        >
          {/* Main Troops Chart */}
          {mainTroopsChart && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, textAlign: 'center' }}>
                Troop Types
              </Typography>
              <ChartDonut chart={mainTroopsChart} />
            </Box>
          )}

          {/* Nationality Chart */}
          {nationalityChart && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, textAlign: 'center' }}>
                Nationalities
              </Typography>
              <ChartDonut chart={nationalityChart} />
            </Box>
          )}
        </Box>
      </Box>
  );
} 