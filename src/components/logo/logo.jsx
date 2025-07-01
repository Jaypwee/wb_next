'use client';

import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export function Logo({ sx, disabled, className, href = '/', isSingle = true, isMini = false, ...other }) {
  const singleLogo = (
    <img
      alt="WB Logo"
      src={`${CONFIG.assetsDir}/assets/icons/apps/WB_icon_orange.png`}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        borderRadius: '8px',
        filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))',
      }}
    />
  );

  const fullLogo = (
    <img
      alt="WB Logo"
      src={`${CONFIG.assetsDir}/assets/icons/apps/WB_icon_orange.png`}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        borderRadius: '8px',
        filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))',
      }}
    />
  );

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 200,
          height: 80,
          ...(isMini && { width: 100, height: 40 }),
          ...(!isSingle && { width: 150, height: 54 }),
          ...(disabled && { pointerEvents: 'none' }),
          // Add hover effect
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

// ----------------------------------------------------------------------

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
