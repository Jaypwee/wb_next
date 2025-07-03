'use client';

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';

import { UpcomingEventsCard } from './components/upcoming-events-card';

// ----------------------------------------------------------------------

export function DashboardHomeView() {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <UpcomingEventsCard />
        </Grid>
      </Grid>
    </Container>
  );
} 