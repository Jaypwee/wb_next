import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { useTranslate } from 'src/locales';

import { ChartPie } from 'src/sections/chart-view/components/chart-pie';
import { MetricsBarChart } from 'src/sections/metrics/metrics-bar-chart';
import { ChartLegends, baseChartOptions } from 'src/components/chart';

// ----------------------------------------------------------------------

export function SingleDateKvkView({ chartData }) {
  const theme = useTheme();
  const { t } = useTranslate();

  if (!chartData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {t('kvk.noData')}
        </Typography>
      </Box>
    );
  }

  const { totalsChartData, powerChartData } = chartData;

  // Format data for existing components
  const formatBarChartData = (data, title) => ({
    title,
    categories: data.categories,
    series: [{ name: title, data: data.series }],
  });

  const formatDonutChartData = (data) => {
    const chartColors = [
      hexAlpha(theme.palette.primary.main, 0.8),
      hexAlpha(theme.palette.secondary.main, 0.8),
      hexAlpha(theme.palette.warning.main, 0.8),
      hexAlpha(theme.palette.error.main, 0.8),
      hexAlpha(theme.palette.info.main, 0.8),
      hexAlpha(theme.palette.success.main, 0.8),
    ];

    return {
      categories: data.categories,
      series: data.series,
      colors: chartColors,
    };
  };

  // Title formatting
  const formatMetricTitle = (metric) => {
    switch (metric) {
      case 'merits':
        return t('kvk.charts.meritsByServer');
      case 'unitsKilled':
        return t('kvk.charts.unitsKilledByServer');
      case 'unitsDead':
        return t('kvk.charts.unitsDeadByServer');
      case 'manaSpent':
        return t('kvk.charts.manaSpentByServer');
      default:
        return metric;
    }
  };

  const formatPowerTitle = (powerKey) => {
    switch (powerKey) {
      case 100:
        return t('kvk.power.below100M');
      case 150:
        return t('kvk.power.range100to150M');
      case 200:
        return t('kvk.power.range150to200M');
      case 250:
        return t('kvk.power.range200to250M');
      case 300:
        return t('kvk.power.above250M');
      default:
        return t('kvk.power.generic', { power: powerKey });
    }
  };

  console.log(powerChartData)

  return (
    <Box sx={{ p: 3 }}>
      {/* Totals Bar Charts - 2 per row */}
      {totalsChartData && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            {t('kvk.sections.serverTotals')}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3,
            '& > *': { 
              flex: '1 1 calc(50% - 12px)',
              minWidth: { xs: '100%', md: 'calc(50% - 12px)' }
            }
          }}>
            {Object.entries(totalsChartData).map(([metric, data]) => (
              <Box key={metric} sx={{ width: '100%' }}>
                <MetricsBarChart
                  {...formatBarChartData(data, formatMetricTitle(metric))}
                  yAxisWidth={40}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Power Distribution Donut Charts - 3 in first row, 2 in second row */}
      {powerChartData && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            {t('kvk.sections.powerDistribution')}
          </Typography>
          <ChartLegends 
            labels={powerChartData[100].categories}
            colors={baseChartOptions(theme).colors}
            sx={{ mb: 3, justifyContent: 'center', p: 3 }}
          />

          {/* First row - 3 charts */}
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            mb: 3,
            '& > *': { 
              flex: '1 1 calc(33.33% - 16px)',
              minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.33% - 16px)' }
            }
          }}>
            {Object.entries(powerChartData).slice(0, 3).map(([powerKey, data]) => (
              <Box key={powerKey} sx={{ width: '100%', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  {formatPowerTitle(parseInt(powerKey, 10))}
                </Typography>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <ChartPie
                    chart={formatDonutChartData(data)}
                    showLegend={false}
                  />
                </Box>
              </Box>
            ))}
          </Box>

          {/* Second row - 2 charts */}
          <Box sx={{ 
            display: 'flex', 
            gap: 3,
            '& > *': { 
              flex: '1 1 calc(50% - 12px)',
              minWidth: { xs: '100%', md: 'calc(50% - 12px)' }
            }
          }}>
            {Object.entries(powerChartData).slice(3, 5).map(([powerKey, data]) => (
              <Box key={powerKey} sx={{ width: '100%', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  {formatPowerTitle(parseInt(powerKey, 10))}
                </Typography>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <ChartPie
                    chart={formatDonutChartData(data)}
                    showLegend={false}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

SingleDateKvkView.propTypes = {
  chartData: PropTypes.shape({
    totalsChartData: PropTypes.object,
    chartData: PropTypes.object,
  }),
};
