import React from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { Badge } from './badge';

// ----------------------------------------------------------------------

export function BadgeCell({ user, showNickname = false }) {
  if (!user) return null;

  const hasInfantryBadge = user.isInfantryGroup;
  const hasLabels = user.labels && user.labels.length > 0;

  // If no badges to show, return null or empty content
  if (!hasInfantryBadge && !hasLabels) {
    return showNickname ? (
      <Box sx={{ fontWeight: 'medium' }}>
        {user.nickname || 'N/A'}
      </Box>
    ) : null;
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
      {showNickname && (
        <Box sx={{ fontWeight: 'medium' }}>
          {user.nickname || 'N/A'}
        </Box>
      )}
      <Stack direction="row" spacing={0.5}>
        {/* Show infantry badge if user is in infantry group */}
        {hasInfantryBadge && (
          <Box
            sx={{
              display: 'inline-block',
              height: '24px',
              lineHeight: '24px',
              verticalAlign: 'middle',
            }}
          >
            <Badge type="infantry" />
          </Box>
        )}
        {/* Show other badges based on labels array */}
        {hasLabels && (
          <>
            {user.labels.map((label, index) => (
              <Box
                key={`${user.uid || user.id}-${label}-${index}`}
                sx={{
                  display: 'inline-block',
                  height: '24px',
                  lineHeight: '24px',
                  verticalAlign: 'middle',
                }}
              >
                <Badge type={label} />
              </Box>
            ))}
          </>
        )}
      </Stack>
    </Stack>
  );
} 