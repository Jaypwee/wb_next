import PropTypes from 'prop-types';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { useTranslate } from 'src/locales';
import { formatTop300ForPieChart } from 'src/services/kvk';

import { ChartPie } from 'src/sections/chart-view/components/chart-pie';
import { MetricsBarChart } from 'src/sections/metrics/metrics-bar-chart';

// ----------------------------------------------------------------------

export function MultiDateKvkView({ data, startDate, endDate }) {
  const theme = useTheme();
  const { t } = useTranslate();

  if (!data || !data.data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {t('kvk.noData')}
        </Typography>
      </Box>
    );
  }

  const { 
    alliesTop300, 
    enemiesTop300, 
    chartData 
  } = data.data;

  // Format top300 data for pie charts
  const alliesTop300Charts = useMemo(() => ({
    merits: formatTop300ForPieChart(alliesTop300.merits),
    manaSpent: formatTop300ForPieChart(alliesTop300.manaSpent),
    unitsDead: formatTop300ForPieChart(alliesTop300.unitsDead),
  }), [Object.keys(alliesTop300).length, startDate, endDate]);

  const enemiesTop300Charts = useMemo(() => ({
    merits: formatTop300ForPieChart(enemiesTop300.merits),
    manaSpent: formatTop300ForPieChart(enemiesTop300.manaSpent),
    unitsDead: formatTop300ForPieChart(enemiesTop300.unitsDead),
  }), [Object.keys(enemiesTop300).length, startDate, endDate]);

  // Chart colors for allies and enemies
  const alliesColors = [
    hexAlpha(theme.palette.primary.main, 0.8),
    hexAlpha(theme.palette.info.main, 0.8),
    hexAlpha(theme.palette.success.main, 0.8),
    hexAlpha(theme.palette.warning.main, 0.8),
    hexAlpha(theme.palette.secondary.main, 0.8),
  ];

  const enemiesColors = [
    hexAlpha(theme.palette.error.main, 0.8),
    hexAlpha(theme.palette.warning.dark, 0.8),
    hexAlpha(theme.palette.grey[600], 0.8),
    hexAlpha(theme.palette.error.dark, 0.8),
    hexAlpha(theme.palette.grey[800], 0.8),
  ];

  const PieChartCard = ({ title, chart, colors, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title={title}
        subheader={subtitle}
      />
      <Box sx={{ p: 2 }}>
        <ChartPie 
          chart={{
            categories: chart.categories,
            series: chart.series,
            colors,
          }}
          showLegend
        />
      </Box>
    </Card>
  );

  return (
    <Box 
      sx={{ 
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
              {/* Row 1: Merits */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <PieChartCard
              title={t('kvk.top300.allies.merits')}
              subtitle={t('kvk.top300.subtitle.merits')}
              chart={alliesTop300Charts.merits}
              colors={alliesColors}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <PieChartCard
              title={t('kvk.top300.enemies.merits')}
              subtitle={t('kvk.top300.subtitle.merits')}
              chart={enemiesTop300Charts.merits}
              colors={enemiesColors}
            />
          </Box>
        </Box>

              {/* Row 2: Mana Spent */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <PieChartCard
              title={t('kvk.top300.allies.manaSpent')}
              subtitle={t('kvk.top300.subtitle.manaSpent')}
              chart={alliesTop300Charts.manaSpent}
              colors={alliesColors}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <PieChartCard
              title={t('kvk.top300.enemies.manaSpent')}
              subtitle={t('kvk.top300.subtitle.manaSpent')}
              chart={enemiesTop300Charts.manaSpent}
              colors={enemiesColors}
            />
          </Box>
        </Box>

              {/* Row 3: Units Dead */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <PieChartCard
              title={t('kvk.top300.allies.unitsDead')}
              subtitle={t('kvk.top300.subtitle.unitsDead')}
              chart={alliesTop300Charts.unitsDead}
              colors={alliesColors}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <PieChartCard
              title={t('kvk.top300.enemies.unitsDead')}
              subtitle={t('kvk.top300.subtitle.unitsDead')}
              chart={enemiesTop300Charts.unitsDead}
              colors={enemiesColors}
            />
          </Box>
        </Box>

              {/* Row 4: Bar charts - Power Loss and Merit AP */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <MetricsBarChart
              title={t('kvk.charts.powerLossByServer')}
              subheader={t('kvk.charts.powerLossSubheader')}
              series={[{
                name: t('kvk.series.powerLoss'),
                data: chartData.barCharts.powerLoss.series,
              }]}
              categories={chartData.barCharts.powerLoss.categories}
              yAxisWidth={150}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <MetricsBarChart
              title={t('kvk.charts.meritApByServer')}
              subheader={t('kvk.charts.meritApSubheader')}
              series={[{
                name: t('kvk.series.meritAp'),
                data: chartData.barCharts.meritAp.series,
              }]}
              categories={chartData.barCharts.meritAp.categories}
              yAxisWidth={120}
            />
          </Box>
        </Box>
    </Box>
  );
}

MultipleDateKvkView.propTypes = {
  data: PropTypes.shape({
    data: PropTypes.shape({
      alliesTop300: PropTypes.shape({
        merits: PropTypes.array,
        manaSpent: PropTypes.array,
        unitsDead: PropTypes.array,
      }),
      enemiesTop300: PropTypes.shape({
        merits: PropTypes.array,
        manaSpent: PropTypes.array,
        unitsDead: PropTypes.array,
      }),
      chartData: PropTypes.shape({
        barCharts: PropTypes.shape({
          powerLoss: PropTypes.shape({
            categories: PropTypes.array,
            series: PropTypes.array,
          }),
          meritAp: PropTypes.shape({
            categories: PropTypes.array,
            series: PropTypes.array,
          }),
        }),
      }),
    }),
  }),
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};
