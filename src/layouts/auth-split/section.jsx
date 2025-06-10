'use client';

import { m } from 'framer-motion';
import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { useTranslate } from 'src/locales';
// ----------------------------------------------------------------------

const BANNER_TITLES = [
  'auth.signIn.banner_title_1',
  'auth.signIn.banner_title_2',
  'auth.signIn.banner_title_3',
  'auth.signIn.banner_title_4',
];

// ----------------------------------------------------------------------

export function AuthSplitSection({
  sx,
  layoutQuery = 'md',
  subtitle = 'More effectively with optimized workflows.',
  ...other
}) {
  const { t } = useTranslate();

  const randomTitle = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * BANNER_TITLES.length);
    return BANNER_TITLES[randomIndex];
  }, []); 

  return (
    <Box
      component={m.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={[
        (theme) => ({
          background: theme.palette.background.default,
          px: 3,
          pb: 3,
          width: 1,
          maxWidth: 480,
          display: 'none',
          position: 'relative',
          pt: 'var(--layout-header-desktop-height)',
          [theme.breakpoints.up(layoutQuery)]: {
            gap: 6,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* Decorative elements */}
      <Box
        component={m.div}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: (theme) => `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.background.default, 0)} 70%)`,
          zIndex: 0,
        }}
      />

      <Box 
        component={m.img}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        alt="WB Logo"
        src={`${CONFIG.assetsDir}/assets/images/home/WB_cover_1.webp`}
        sx={{
          width: 1,
          objectFit: 'cover',
          borderRadius: 2,
          position: 'relative',
          zIndex: 1,
        }}
      />

      <Box
        component={m.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            color: 'text.primary',
            mb: 2,
          }}
        >
          {t(randomTitle)}
        </Typography>

        {subtitle && (
          <Typography
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
              maxWidth: 400,
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
