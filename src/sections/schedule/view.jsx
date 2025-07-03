'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';
import { EventsProvider } from 'src/context/events';
import { DashboardContent } from 'src/layouts/dashboard';

import { useAuthContext } from 'src/auth/hooks';

import { ScheduleCalendar } from './schedule-calendar';

// ----------------------------------------------------------------------

export function ScheduleView() {
  const { t } = useTranslate();
  const { user } = useAuthContext();
  
  // Check if user is admin - if not, make calendar read-only
  const isReadOnly = user?.role !== 'admin';

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('schedule.title')}
      </Typography>
      
      <Box
        sx={{
          height: '100%',
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <EventsProvider>
          <ScheduleCalendar readOnly={isReadOnly} />
        </EventsProvider>
      </Box>
    </DashboardContent>
  );
} 