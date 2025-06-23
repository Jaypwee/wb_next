import { varAlpha } from 'minimal-shared/utils';

import { Label } from './label';
import { Iconify } from './iconify';
import { AnimateBorder } from './animate';

// ----------------------------------------------------------------------

// Infantry Corps Badge Component
export function InfantryGroupBadge() {
  return (
    <AnimateBorder
      duration={16}
      sx={{ borderRadius: 1 }}
      slotProps={{
        outlineColor: (theme) =>
          `linear-gradient(45deg, ${varAlpha('#C0C0C0', 0.2)}, ${varAlpha('#8A2BE2', 0.2)})`,
        primaryBorder: {
          size: 80,
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

// Main Badge component that exports both badges
export function Badge({ type }) {
  if (type === 'infantry') {
    return <InfantryGroupBadge />;
  }
  
  if (type === 'builder') {
    return <BuilderBadge />;
  }
  
  // Return null if type doesn't match any valid options
  return null;
} 