'use client';

import Stack from '@mui/material/Stack';

import { BackToTopButton } from 'src/components/animate/back-to-top-button';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

import { HomeHero } from '../home-hero';
// ----------------------------------------------------------------------

export function HomeView() {
  const pageProgress = useScrollProgress();

  return (
    <>
      <ScrollProgress
        variant="linear"
        progress={pageProgress.scrollYProgress}
        sx={[(theme) => ({ position: 'fixed', zIndex: theme.zIndex.appBar + 1 })]}
      />

      <BackToTopButton />

      <BackToTopButton />

      <HomeHero />

      <Stack sx={{ position: 'relative', bgcolor: 'background.default' }}>
        {/* <HomeMinimal /> */}

        {/* <HomeHugePackElements /> */}

        {/* <HomeForDesigner /> */}

        {/* <HomeHighlightFeatures /> */}

        {/* <HomeIntegrations /> */}

        {/* <HomeTestimonials /> */}

        {/* <HomeFAQs /> */}

        {/* <HomeZoneUI /> */}

        {/* <HomeAdvertisement /> */}
      </Stack>
    </>
  );
}
