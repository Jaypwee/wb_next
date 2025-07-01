'use client';

import dayjs from 'dayjs';
import { useState } from 'react';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import { EventDetailsDialog } from './event-details-dialog';

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// ----------------------------------------------------------------------

export function CalendarEvent({ event, onEdit, readOnly = false }) {
  const { t } = useTranslate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDragStart = (e) => {
    if (readOnly) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', event.id);
    e.stopPropagation();
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (readOnly) {
      setDialogOpen(true);
    } else {
      onEdit(event);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Format time for display - convert UTC to user's local timezone
  const formatDisplayTime = () => {
    try {
      if (event.datetime) {
        // New format: UTC datetime
        const utcDateTime = dayjs.utc(event.datetime);
        const localDateTime = utcDateTime.local();
        return localDateTime.format('HH:mm');
      }
      return '';
    } catch (error) {
      console.warn('Failed to format event time:', error);
      return event.startTime || '';
    }
  };

  const displayTime = formatDisplayTime();

  return (
    <>
      <Box
        draggable={!readOnly}
        onDragStart={handleDragStart}
        onClick={handleClick}
        sx={{
          p: 0.5,
          mb: 0.5,
          borderRadius: 0.5,
          bgcolor: alpha(event.color, 0.15),
          border: `1px solid ${event.color}`,
          cursor: readOnly ? 'pointer' : 'pointer',
          position: 'relative',
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          '&:hover': {
          bgcolor: alpha(event.color, 0.25),
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: event.color,
            fontWeight: 500,
            fontSize: '0.7rem',
            lineHeight: 1.2,
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayTime} | {event.title}
        </Typography>
      </Box>

      {readOnly && (
        <EventDetailsDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          event={event}
        />
      )}
    </>
  );
} 