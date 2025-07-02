import { useRef, useState } from 'react';
import { useClientRect } from 'minimal-shared/hooks';
import { m, useSpring, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { styled, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/global-config';
import { useTranslate } from 'src/locales';

import { varFade, MotionViewport } from 'src/components/animate';

import { SectionTitle, SectionCaption } from './components/section-title';
import { FloatLine, FloatTriangleLeftIcon } from './components/svg-elements';

// ----------------------------------------------------------------------

const renderLines = () => (
  <>
    <FloatTriangleLeftIcon sx={{ top: 80, left: 80, opacity: 0.4 }} />
    <FloatLine vertical sx={{ top: 0, left: 80 }} />
  </>
);

export function HomeHugePackElements({ sx, ...other }) {
  const { t } = useTranslate();
  
  return (
    <Box
      component="section"
      sx={[
        () => ({
          pt: 10,
          position: 'relative',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <MotionViewport>
        {renderLines()}

        <Container sx={{ textAlign: { xs: 'center', md: 'left' } }}>
          <Grid container rowSpacing={{ xs: 3, md: 0 }} columnSpacing={{ xs: 0, md: 8 }}>
            <Grid size={{ xs: 12, md: 6, lg: 7 }}>
              <SectionCaption title={t('home.hugePack.caption')} />
              <SectionTitle title={t('home.hugePack.title_1')} txtGradient={t('home.hugePack.title_2')} sx={{ mt: 3 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 5 }}>
              <m.div variants={varFade('inUp', { distance: 24 })}>
                <Typography
                  sx={{ color: 'text.disabled', fontSize: { md: 20 }, lineHeight: { md: 36 / 20 } }}
                >
                  <Box component="span" sx={{ color: 'text.primary' }}>
                    {t('home.hugePack.description_1')}
                  </Box>
                  <br />
                  {t('home.hugePack.description_2')}
                </Typography>
              </m.div>
            </Grid>
          </Grid>
        </Container>
      </MotionViewport>
      <ScrollableContent />
    </Box>
  );
}

// ----------------------------------------------------------------------

function ScrollableContent() {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';

  const containerRef = useRef(null);
  const containerRect = useClientRect(containerRef);

  const scrollRef = useRef(null);
  const scrollRect = useClientRect(scrollRef);

  const [startScroll, setStartScroll] = useState(false);

  const { scrollYProgress } = useScroll({ target: containerRef });

  const physics = { damping: 16, mass: 0.16, stiffness: 50 };

  const scrollRange = (-scrollRect.scrollWidth + containerRect.width) * (isRtl ? -1 : 1);

  const x1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, scrollRange]), physics);
  const x2 = useSpring(useTransform(scrollYProgress, [0, 1], [scrollRange, 0]), physics);

  const background = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [
      theme.vars.palette.background.default,
      theme.vars.palette.background.neutral,
      theme.vars.palette.background.neutral,
      theme.vars.palette.background.neutral,
      theme.vars.palette.background.default,
    ]
  );

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest !== 0 && latest !== 1) {
      setStartScroll(true);
    } else {
      setStartScroll(false);
    }
  });

  // Images to loop through
  const images = [
    `${CONFIG.assetsDir}/assets/icons/apps/WB_tiger.png`,
    `${CONFIG.assetsDir}/assets/icons/apps/WB_icon_orange.png`,
  ];

  // Generate repeating image pattern for horizontal scrolling
  const generateImageRow = (rowImages, itemHeight) => {
    const repeatedImages = [];
    // TODO: Make this dynamic based on the size of the image list
    const totalRepeat = 50; // Number of times to repeat the pattern
    
    for (let i = 0; i < totalRepeat; i++) {
      rowImages.forEach((image, index) => {
        repeatedImages.push(
          <ImageItem
            key={`${i}-${index}`}
            src={image}
            alt={`Image ${i}-${index}`}
            sx={{
              height: itemHeight,
              width: itemHeight, // Make it square
              marginRight: theme.spacing(2),
            }}
          />
        );
      });
    }
    return repeatedImages;
  };

  return (
    <ScrollRoot ref={containerRef} sx={{ height: scrollRect.scrollWidth, minHeight: '100vh' }}>
      <ScrollContainer style={{ background }} data-scrolling={startScroll}>
        <ScrollContent ref={scrollRef} layout transition={{ ease: 'linear', duration: 0.25 }}>
          <ScrollItem
            style={{ x: x1 }}
            sx={{
              width: { xs: '600%', md: '200%'},
              height: { xs: 160, md: 180 },
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {generateImageRow(images, { xs: 120, md: 140 })}
          </ScrollItem>
          <ScrollItem
            style={{ x: x2 }}
            sx={{
              width: { xs: '600%', md: '200%'},
              height: { xs: 400, md: 480 },
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {generateImageRow([...images].reverse(), { xs: 300, md: 380 })}
          </ScrollItem>
        </ScrollContent>
      </ScrollContainer>
    </ScrollRoot>
  );
}

// ----------------------------------------------------------------------

const ScrollRoot = styled(m.div)(({ theme }) => ({
  zIndex: 9,
  position: 'relative',
  paddingTop: theme.spacing(5),
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(15),
  },
}));

const ScrollContainer = styled(m.div)(({ theme }) => ({
  top: 0,
  height: '100vh',
  display: 'flex',
  position: 'sticky',
  overflow: 'hidden',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  transition: theme.transitions.create(['background-color']),
  '&[data-scrolling="true"]': { justifyContent: 'center' },
}));

const ScrollContent = styled(m.div)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(5),
  },
}));

const ScrollItem = styled(m.div)({
  flexShrink: 0,
});

const ImageItem = styled('img')(({ theme }) => ({
  objectFit: 'contain',
  flexShrink: 0,
  borderRadius: theme.shape.borderRadius,
  filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
  transition: theme.transitions.create(['transform'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));
