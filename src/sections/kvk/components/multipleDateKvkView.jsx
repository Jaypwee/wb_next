import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { useTranslate } from 'src/locales';
import { formatTop300ForPieChart } from 'src/services/kvk';

import { ChartPie } from 'src/sections/chart-view/components/chart-pie';
import { MetricsBarChart } from 'src/sections/metrics/metrics-bar-chart';


const PieChartCard = ({ title, chart, colors, subtitle, showLegend = true }) => (
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
        showLegend={showLegend}
      />
    </Box>
  </Card>
);

// ----------------------------------------------------------------------

export function MultiDateKvkView({ data, startDate, endDate }) {
  const theme = useTheme();
  const { t } = useTranslate();
  const [activeTopCount, setActiveTopCount] = useState(300);

  const alliesTop300Charts = useMemo(() => {
    if (!data?.data?.alliesTop300) return { merits: null, manaSpent: null, unitsDead: null };
    
    return {
      merits: formatTop300ForPieChart(data.data.alliesTop300.merits, activeTopCount),
      manaSpent: formatTop300ForPieChart(data.data.alliesTop300.manaSpent, activeTopCount),
      unitsDead: formatTop300ForPieChart(data.data.alliesTop300.unitsDead, activeTopCount),
    };
  }, [data?.data?.alliesTop300, activeTopCount]);

  const enemiesTop300Charts = useMemo(() => {
    if (!data?.data?.enemiesTop300) return { merits: null, manaSpent: null, unitsDead: null };
    console.log(data.data.enemiesTop300.merits)
    return {
      merits: formatTop300ForPieChart(data.data.enemiesTop300.merits, activeTopCount),
      manaSpent: formatTop300ForPieChart(data.data.enemiesTop300.manaSpent, activeTopCount),
      unitsDead: formatTop300ForPieChart(data.data.enemiesTop300.unitsDead, activeTopCount),
    };
  }, [data?.data?.enemiesTop300, activeTopCount]);

  if (!data || !data.data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {t('kvk.noData')}
        </Typography>
      </Box>
    );
  }

  const { chartData } = data.data;

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


  return (
    <Box 
      sx={{ 
        py: 3,
        px: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >

        {/* Row 0: Total Merits */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          <Box sx={{  flex: 1 }}>
            <PieChartCard
              title={t('kvk.total.merits')}
              chart={chartData.pieCharts.merits}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <PieChartCard
              title={t('kvk.total.manaSpent')}
              chart={chartData.pieCharts.manaSpent}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <PieChartCard
              title={t('kvk.total.unitsDead')}
              chart={chartData.pieCharts.unitsDead}
            />
          </Box>
        </Box>

        {/* Top Count Selection Buttons */}
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'center',
            margin: { xs: '16px 8px', md: '24px 16px' },
          }}
        >
          <ButtonGroup variant="outlined" size="medium">
            {[100, 200, 300].map((count) => (
              <Button
                key={count}
                variant={activeTopCount === count ? 'contained' : 'outlined'}
                onClick={() => setActiveTopCount(count)}
                sx={{
                  minWidth: { xs: '60px', md: '80px' },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                }}
              >
                {count}
              </Button>
            ))}
          </ButtonGroup>
        </Box>

              {/* Row 1: Merits */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          <Box sx={{  flex: 1 }}>
            <PieChartCard
              title={t('kvk.top300.allies.merits', { count: activeTopCount })}
              subtitle={t('kvk.top300.subtitle.merits')}
              chart={alliesTop300Charts.merits}
              colors={alliesColors}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <PieChartCard
              title={t('kvk.top300.enemies.merits', { count: activeTopCount })}
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
              title={t('kvk.top300.allies.manaSpent', { count: activeTopCount })}
              subtitle={t('kvk.top300.subtitle.manaSpent')}
              chart={alliesTop300Charts.manaSpent}
              colors={alliesColors}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <PieChartCard
              title={t('kvk.top300.enemies.manaSpent', { count: activeTopCount })}
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
              title={t('kvk.top300.allies.unitsDead', { count: activeTopCount })}
              subtitle={t('kvk.top300.subtitle.unitsDead')}
              chart={alliesTop300Charts.unitsDead}
              colors={alliesColors}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <PieChartCard
              title={t('kvk.top300.enemies.unitsDead', { count: activeTopCount })}
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
              yAxisWidth={30}
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
              yAxisWidth={30}
            />
          </Box>
        </Box>
    </Box>
  );
}

MultiDateKvkView.propTypes = {
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
