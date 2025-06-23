import { varAlpha } from 'minimal-shared/utils';

import { Label } from './label';
import { Iconify } from './iconify';
import { AnimateBorder } from './animate';

// ----------------------------------------------------------------------

// Infantry Corps Badge Component
export function InfantryGroupBadge() {
  return (
    <AnimateBorder
      duration={12}
      sx={{ borderRadius: 1 }}
      slotProps={{
        outlineColor: (theme) =>
            `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.04)}, ${varAlpha(theme.vars.palette.warning.mainChannel, 0.04)})`,
        primaryBorder: {
          size: 50,
          width: '2px',
          sx: () => ({
            color: '#C0C0C0', // Silver
          }),
        },
        secondaryBorder: {
          sx: () => ({
            color: '#8A2BE2', // Purple
          }),
        },
      }}
    >
      <Label
        variant="outlined"
        startIcon={<Iconify icon="mdi:shield" />}
        sx={{
          color: 'text.primary',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: 'inherit',
        }}
      >
        보병단
      </Label>
    </AnimateBorder>
  );
}

// Architect Badge Component
export function BuilderBadge() {
  return (
    <Label
      variant="filled"
      color="warning"
      startIcon={<Iconify icon="mdi:hammer" />}
    >
      건축가
    </Label>
  );
}

// Officer Badge Component
export function OfficerBadge() {
  return (
    <Label
      variant="filled"
      color="success"
      startIcon={<Iconify icon="mdi:star-outline" />}
      sx={{
        backgroundColor: '#4caf50', // Light green
        color: 'white',
      }}
    >
      임원진
    </Label>
  );
}

// King Badge Component
export function KingBadge() {
  return (
    <AnimateBorder
      duration={10}
      sx={{ borderRadius: 1 }}
      slotProps={{
        outlineColor: (theme) =>
            `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.06)}, ${varAlpha(theme.vars.palette.warning.mainChannel, 0.06)})`,
        primaryBorder: {
          size: 50,
          width: '2px',
          sx: () => ({
            color: '#FFD700', // Gold
          }),
        },
        secondaryBorder: {
          sx: () => ({
            color: '#C0C0C0', // Silver
          }),
        },
      }}
    >
      <Label
        variant="outlined"
        startIcon={<Iconify icon="mdi:crown" />}
        sx={{
          color: '#FFD700', // Gold text
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: 'inherit',
          fontWeight: 'bold',
        }}
      >
        국왕
      </Label>
    </AnimateBorder>
  );
}

// Destroyer Badge Component
export function DestroyerBadge() {
  return (
    <Label
      variant="filled"
      startIcon={<Iconify icon="mdi:mace" />}
      sx={{
        backgroundColor: '#b71c1c', // Dark red
        color: 'white',
        fontWeight: 'bold',
      }}
    >
      파괴자
    </Label>
  );
}

// Main Badge component that exports all badges
export function Badge({ type }) {
  if (type === 'infantry') {
    return <InfantryGroupBadge />;
  }
  
  if (type === 'builder') {
    return <BuilderBadge />;
  }

  if (type === 'officer') {
    return <OfficerBadge />;
  }

  if (type === 'king') {
    return <KingBadge />;
  }

  if (type === 'destroyer') {
    return <DestroyerBadge />;
  }
  
  // Return null if type doesn't match any valid options
  return null;
} 