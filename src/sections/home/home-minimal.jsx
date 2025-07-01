'use client';

import { m } from 'framer-motion';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales/use-locales';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionViewport } from 'src/components/animate';

import { UserOverview } from 'src/sections/chart-view/user-overview';

import { SectionTitle } from './components/section-title';
import { CircleSvg, FloatLine, FloatPlusIcon } from './components/svg-elements';

// ----------------------------------------------------------------------

const renderLines = () => (
  <>
    <FloatPlusIcon sx={{ top: 72, left: 72 }} />
    <FloatPlusIcon sx={{ bottom: 72, left: 72 }} />
    <FloatLine sx={{ top: 80, left: 0 }} />
    <FloatLine sx={{ bottom: 80, left: 0 }} />
    <FloatLine vertical sx={{ top: 0, left: 80 }} />
  </>
);

export function HomeMinimal({ sx, ...other }) {
  const { t } = useTranslate();

  const renderDescription = () => (
    <>
      <SectionTitle
        caption={t('home.minimal.caption')}
        title={t('home.minimal.title_1')}
        txtGradient={t('home.minimal.title_2')}
        sx={{ mb: { xs: 5, md: 8 }, textAlign: { xs: 'center', md: 'left' } }}
      />

      <Stack spacing={6} sx={{ maxWidth: { sm: 560, md: 500 }, mx: { xs: 'auto', md: 'unset' } }}>
        {ITEMS.map((item) => (
          <Box
            component={m.div}
            variants={varFade('inUp', { distance: 24 })}
            key={item.title}
            sx={[{ gap: 3, display: 'flex' }]}
          >
            <SvgIcon sx={{ width: 40, height: 40 }}>{item.icon}</SvgIcon>
            <Stack spacing={1}>
              <Typography variant="h5" component="h6">
                {t(item.title)}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>{t(item.description)}</Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </>
  );

  const renderImage = () => (
    <Stack
      component={m.div}
      variants={varFade('inRight', { distance: 24 })}
      sx={{
        height: 1,
        alignItems: 'center',
        position: 'relative',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={[
          (theme) => ({
            left: 0,
            width: 720,
            borderRadius: 2,
            position: 'absolute',
            bgcolor: 'background.default',
            boxShadow: `-40px 40px 80px 0px ${varAlpha(
              theme.vars.palette.grey['500Channel'],
              0.32
            )}`,
            ...theme.applyStyles('dark', {
              boxShadow: `-40px 40px 80px 0px ${varAlpha(
                theme.vars.palette.common.blackChannel,
                0.32
              )}`,
            }),
          }),
        ]}
      >
        <UserOverview 
          title="Live Analytics"
          subheader="Real-time user distribution and engagement metrics"
        />
      </Box>
    </Stack>
  );

  return (
    <Box
      component="section"
      sx={[
        {
          overflow: 'hidden',
          position: 'relative',
          py: { xs: 10, md: 20 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <MotionViewport>
        {renderLines()}

        <Container sx={{ position: 'relative' }}>
          <Grid container columnSpacing={{ xs: 0, md: 8 }} sx={{ position: 'relative', zIndex: 9 }}>
            <Grid size={{ xs: 12, md: 6, lg: 7 }}>{renderDescription()}</Grid>

            <Grid sx={{ display: { xs: 'none', md: 'block' } }} size={{ md: 6, lg: 5 }}>
              {renderImage()}
            </Grid>
          </Grid>

          <CircleSvg variants={varFade('in')} sx={{ display: { xs: 'none', md: 'block' } }} />
        </Container>
      </MotionViewport>
    </Box>
  );
}

// ----------------------------------------------------------------------

const ITEMS = [
  {
    title: 'home.minimal.infantry_title',
    description: 'home.minimal.infantry_description',
    icon: <Iconify icon="mdi:shield-sword-outline" />,
  },
  {
    title: 'home.minimal.leadership_title',
    description: 'home.minimal.leadership_description',
    icon: (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.48"
          d="M24 22C27.3 22 30 19.3 30 16C30 12.7 27.3 10 24 10C20.7 10 18 12.7 18 16C18 19.3 20.7 22 24 22ZM16 38H32C32 32.5 28.4 28 24 28C19.6 28 16 32.5 16 38Z"
          fill="currentColor"
        />
        <path
          d="M24 2L27.09 8.26L34 9.27L29 14.14L30.18 21.02L24 17.77L17.82 21.02L19 14.14L14 9.27L20.91 8.26L24 2ZM36 32C38.2 32 40 30.2 40 28C40 25.8 38.2 24 36 24C33.8 24 32 25.8 32 28C32 30.2 33.8 32 36 32ZM12 32C14.2 32 16 30.2 16 28C16 25.8 14.2 24 12 24C9.8 24 8 25.8 8 28C8 30.2 9.8 32 12 32ZM46 42C46 38.7 43.3 36 40 36H32C31.4 36 30.8 36.1 30.3 36.3C31.4 37.4 32 38.8 32 40.5V42H46ZM16 42V40.5C16 38.8 16.6 37.4 17.7 36.3C17.2 36.1 16.6 36 16 36H8C4.7 36 2 38.7 2 42H16Z"
          fill="currentColor"
        />
        <path
          d="M24 26C19.6 26 16 29.6 16 34V40.5C16 41.3 16.7 42 17.5 42H30.5C31.3 42 32 41.3 32 40.5V34C32 29.6 28.4 26 24 26ZM30 40H18V34C18 30.7 20.7 28 24 28C27.3 28 30 30.7 30 34V40Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    title: 'home.minimal.multinational_title',
    description: 'home.minimal.multinational_description',
    icon: (
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.48"
          d="M24 44C35.05 44 44 35.05 44 24C44 12.95 35.05 4 24 4C12.95 4 4 12.95 4 24C4 35.05 12.95 44 24 44Z"
          fill="currentColor"
        />
        <path
          d="M8 14H16V6H8V14ZM10 8H14V12H10V8ZM32 14H40V6H32V14ZM34 8H38V12H34V8ZM8 42H16V34H8V42ZM10 36H14V40H10V36ZM32 42H40V34H32V42ZM34 36H38V40H34V36ZM20 30H28V22H20V30ZM22 24H26V28H22V24Z"
          fill="currentColor"
        />
        <path
          d="M24 2C30.6 2 36.5 5.1 40.4 10H36C34.3 7.8 31.9 6.1 29.2 5.1L28 8H20L18.8 5.1C16.1 6.1 13.7 7.8 12 10H7.6C11.5 5.1 17.4 2 24 2ZM40.4 38C36.5 42.9 30.6 46 24 46C17.4 46 11.5 42.9 7.6 38H12C13.7 40.2 16.1 41.9 18.8 42.9L20 40H28L29.2 42.9C31.9 41.9 34.3 40.2 36 38H40.4Z"
          fill="currentColor"
        />
        <path
          d="M2 24C2 17.4 5.1 11.5 10 7.6V12C7.8 13.7 6.1 16.1 5.1 18.8L8 20V28L5.1 29.2C6.1 31.9 7.8 34.3 10 36V40.4C5.1 36.5 2 30.6 2 24ZM46 24C46 30.6 42.9 36.5 38 40.4V36C40.2 34.3 41.9 31.9 42.9 29.2L40 28V20L42.9 18.8C41.9 16.1 40.2 13.7 38 12V7.6C42.9 11.5 46 17.4 46 24Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];
