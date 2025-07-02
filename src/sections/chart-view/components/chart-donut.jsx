import { useTheme, alpha as hexAlpha } from '@mui/material/styles';

import { useTranslate } from 'src/locales';

import { Chart, useChart, ChartLegends } from 'src/components/chart';

// ----------------------------------------------------------------------

export function ChartDonut({ chart }) {
  const theme = useTheme();
  const { t } = useTranslate();

  const chartColors = chart.colors ?? [
    hexAlpha(theme.palette.primary.dark, 0.8),
    theme.palette.warning.main,
    theme.palette.info.dark,
    theme.palette.error.main,
  ];

  // Filter out 'unknown' categories from both chart and legend
  const filteredData = chart.categories.reduce((acc, category, index) => {
    if (category.toLowerCase() !== 'unknown') {
      acc.categories.push(category);
      acc.series.push(chart.series[index]);
      acc.colors.push(chartColors[index]);
    }
    return acc;
  }, { categories: [], series: [], colors: [] });

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    colors: filteredData.colors,
    labels: filteredData.categories,
    stroke: { width: 0 },
    plotOptions: { 
      pie: { 
        donut: { 
          size: '72%',
          labels: {
            show: true,
            total: {
              show: true,
              label: t('dashboard.userOverview.registered'),
              fontSize: '14px',
              fontWeight: 600,
              color: theme.palette.text.primary,
            }
          }
        } 
      } 
    },
  });

  return (
    <>
      <Chart
        type="donut"
        series={filteredData.series}
        options={chartOptions}
        sx={{
          my: 2,
          mx: 'auto',
          width: 240,
          height: 240,
        }}
      />

      <ChartLegends
        labels={filteredData.categories}
        colors={filteredData.colors}
        slotProps={{
          item: {
            sx: {
              minWidth: 'auto',
              maxWidth: 80,
              '& .MuiStack-root': {
                gap: 0.3,
                alignItems: 'center',
              },
              '& .MuiBox-root': {
                width: 8,
                height: 8,
                minWidth: 8,
                borderRadius: 0.5,
              }
            }
          }
        }}
        sx={{
          px: 0.5,
          py: 0.5,
          gap: 0.8,
          display: 'flex',
          flexWrap: 'nowrap',
          justifyContent: 'center',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}
      />
    </>
  );
}
