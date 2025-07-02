'use client';

import { useRef, useState } from 'react';
import { m, useScroll, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';
import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { varFade, MotionContainer } from 'src/components/animate';

import { HeroBackground } from './components/hero-background';

// ----------------------------------------------------------------------

const smKey = 'sm';
const mdKey = 'md';
const lgKey = 'lg';

const motionProps = {
  variants: varFade('inUp', { distance: 24 }),
};

export function HomeHero({ sx, ...other }) {
  const scrollProgress = useScrollPercent();
  const { t } = useTranslate();

  const mdUp = useMediaQuery((theme) => theme.breakpoints.up(mdKey));

  const distance = mdUp ? scrollProgress.percent : 0;

  const y1 = useTransformY(scrollProgress.scrollY, distance * -7);
  const y2 = useTransformY(scrollProgress.scrollY, distance * -6);
  const y3 = useTransformY(scrollProgress.scrollY, distance * -5);
  const y4 = useTransformY(scrollProgress.scrollY, distance * -4);
  const y5 = useTransformY(scrollProgress.scrollY, distance * -3);

  const opacity = useTransform(
    scrollProgress.scrollY,
    [0, 1],
    [1, mdUp ? Number((1 - scrollProgress.percent / 100).toFixed(1)) : 1]
  );

  const renderHeading = () => (
    <m.div {...motionProps}>
      <Box
        component="h1"
        sx={[
          (theme) => ({
            my: 0,
            mx: 'auto',
            maxWidth: 880,
            display: 'flex',
            flexWrap: 'wrap',
            typography: 'h2',
            justifyContent: 'center',
            fontFamily: theme.typography.fontSecondaryFamily,
            [theme.breakpoints.up(lgKey)]: {
              fontSize: theme.typography.pxToRem(72),
              lineHeight: '90px',
            },
          }),
        ]}
      >
        <Box component="span" sx={{ width: 1, opacity: 0.24 }}>
          { t('home.hero.title_1') }
        </Box>
        { t('home.hero.title_2') }
        <Box
          component={m.span}
          animate={{ backgroundPosition: '200% center' }}
          transition={{
            duration: 20,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          sx={[
            (theme) => ({
              ...theme.mixins.textGradient(
                `300deg, ${theme.vars.palette.primary.main} 0%, ${theme.vars.palette.warning.main} 25%, ${theme.vars.palette.primary.main} 50%, ${theme.vars.palette.warning.main} 75%, ${theme.vars.palette.primary.main} 100%`
              ),
              backgroundSize: '400%',
              ml: { xs: 0.75, md: 1, xl: 1.5 },
            }),
          ]}
        >
          WAR BEASTS
        </Box>
      </Box>
    </m.div>
  );

  const renderText = () => (
    <m.div {...motionProps}>
      <Typography
        variant="body2"
        sx={[
          (theme) => ({
            mx: 'auto',
            [theme.breakpoints.up(smKey)]: { whiteSpace: 'pre' },
            [theme.breakpoints.up(lgKey)]: { fontSize: 20, lineHeight: '36px' },
          }),
        ]}
      >
        {t('home.hero.subtitle')}
      </Typography>
    </m.div>
  );

  const renderButtons = () => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: { xs: 1.5, sm: 2 },
      }}
    >
      <m.div {...motionProps}>
        <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
          <Button
            component={RouterLink}
            href={paths.dashboard.root}
            color="inherit"
            size="large"
            variant="contained"
            startIcon={<Iconify width={24} icon="custom:flash-outline" />}
          >
            <span>
              <Box
                component="small"
                sx={[
                  (theme) => ({
                    mt: '-3px',
                    opacity: 0.64,
                    display: 'flex',
                    fontSize: theme.typography.pxToRem(10),
                    fontWeight: theme.typography.fontWeightMedium,
                  }),
                ]}
              >
                {t('home.hero.sign_up_caption')}
              </Box>
              {t('home.hero.sign_up')}
            </span>
          </Button>

          <Link
            color="inherit"
            variant="body2"
            href='#'
            underline="always"
            sx={{ gap: 0.75, alignItems: 'center', display: 'inline-flex' }}
          >
            <Iconify width={16} icon="eva:external-link-fill" />
            {t('home.hero.check_out_faq')}
          </Link>
        </Stack>
      </m.div>

      <m.div {...motionProps}>
        <Button
          color="inherit"
          size="large"
          variant="outlined"
          target="_blank"
          rel="noopener"
          href={paths.figmaUrl}
          startIcon={<Iconify width={24} icon="game-icons:crossed-swords" />}
          sx={{ borderColor: 'text.primary' }}
        >
          {t('home.hero.apply_now')}
        </Button>
      </m.div>
    </Box>
  );

  const renderTigerImage = () => (
    <Box
      component={m.div}
      style={{ y: y3 }}
      sx={[
        (theme) => ({
          position: 'absolute',
          right: { xs: -20, sm: 0, md: 20, lg: 100 },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
          pointerEvents: 'none',
        }),
      ]}
      initial={{ opacity: 0, x: 100, y: -50 }}
      animate={{ 
        opacity: 0.8, 
        x: 0,
        y: [0, 20, 0, 15, 0, 10, 0, 5, 0]
      }}
      transition={{ 
        opacity: { duration: 1, ease: 'easeOut', delay: 0.5 },
        x: { duration: 1, ease: 'easeOut', delay: 0.5 },
        y: { 
          duration: 1, 
          ease: 'easeOut',
          delay: 0.5,
          times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.85, 0.95, 1]
        }
      }}
    >
      <Box
        component="img"
        src="/assets/icons/apps/WB_tiger.png"
        alt="War Beast Tiger"
        sx={[
          (theme) => ({
            width: { xs: 200, sm: 250, md: 300, lg: 400, xl: 500 },
            height: 'auto',
            maxWidth: '100%',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))',
            mixBlendMode: 'multiply',
            ...theme.applyStyles('dark', {
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 20px 40px rgba(255,255,255,0.1)) brightness(1.2)',
            }),
          }),
        ]}
      />
    </Box>
  );

  const renderIcons = () => (
    <Stack spacing={3} sx={{ textAlign: 'center' }}>
      <m.div {...motionProps}>
        <Typography variant="overline" sx={{ opacity: 0.4 }}>
          Available For
        </Typography>
      </m.div>

      <Box sx={{ gap: 2.5, display: 'flex' }}>
        {['js', 'ts', 'nextjs', 'vite', 'figma'].map((platform) => (
          <m.div {...motionProps} key={platform}>
            <Box
              component="img"
              alt={platform}
              src={`${CONFIG.assetsDir}/assets/icons/platforms/ic-${platform}.svg`}
              sx={[
                (theme) => ({
                  width: 24,
                  height: 24,
                  ...theme.applyStyles('dark', {
                    ...(platform === 'nextjs' && { filter: 'invert(1)' }),
                  }),
                }),
              ]}
            />
          </m.div>
        ))}
      </Box>
    </Stack>
  );

  return (
    <Box
      ref={scrollProgress.elementRef}
      component="section"
      sx={[
        (theme) => ({
          overflow: 'hidden',
          position: 'relative',
          [theme.breakpoints.up(mdKey)]: {
            minHeight: 760,
            height: '100vh',
            maxHeight: 1440,
            display: 'block',
            willChange: 'opacity',
            mt: 'calc(var(--layout-header-desktop-height) * -1)',
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        component={m.div}
        style={{ opacity }}
        sx={[
          (theme) => ({
            width: 1,
            display: 'flex',
            position: 'relative',
            flexDirection: 'column',
            transition: theme.transitions.create(['opacity']),
            [theme.breakpoints.up(mdKey)]: {
              height: 1,
              position: 'fixed',
              maxHeight: 'inherit',
            },
          }),
        ]}
      >
        <Container
          component={MotionContainer}
          sx={[
            (theme) => ({
              py: 3,
              gap: 5,
              zIndex: 9,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              [theme.breakpoints.up(mdKey)]: {
                flex: '1 1 auto',
                justifyContent: 'center',
                py: 'var(--layout-header-desktop-height)',
              },
            }),
          ]}
        >
          <Stack spacing={3} sx={{ textAlign: 'center' }}>
            <m.div style={{ y: y1 }}>{renderHeading()}</m.div>
            <m.div style={{ y: y2 }}>{renderText()}</m.div>
          </Stack>

          {/* <m.div style={{ y: y3 }}>{renderRatings()}</m.div> */}
          <m.div style={{ y: y4 }}>{renderButtons()}</m.div>
          {/* <m.div style={{ y: y5 }}>{renderIcons()}</m.div> */}
        </Container>

        {renderTigerImage()}
        <HeroBackground />
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

function useTransformY(value, distance) {
  const physics = {
    mass: 0.1,
    damping: 20,
    stiffness: 300,
    restDelta: 0.001,
  };

  return useSpring(useTransform(value, [0, 1], [0, distance]), physics);
}

function useScrollPercent() {
  const elementRef = useRef(null);

  const { scrollY } = useScroll();

  const [percent, setPercent] = useState(0);

  useMotionValueEvent(scrollY, 'change', (scrollHeight) => {
    let heroHeight = 0;

    if (elementRef.current) {
      heroHeight = elementRef.current.offsetHeight;
    }

    const scrollPercent = Math.floor((scrollHeight / heroHeight) * 100);

    if (scrollPercent >= 100) {
      setPercent(100);
    } else {
      setPercent(Math.floor(scrollPercent));
    }
  });

  return { elementRef, percent, scrollY };
}
