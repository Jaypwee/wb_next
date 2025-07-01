'use client';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import { getUserTimezone, formatTimeWithTimezone } from '../utils/timezone';

// ----------------------------------------------------------------------

export function CalendarEvent({ event, onEdit, readOnly = false }) {
  const { t } = useTranslate();

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
    if (!readOnly) {
      onEdit(event);
    }
  };

  const displayTime = formatTimeWithTimezone(
    event.date, 
    event.startTime, 
    event.timezone || getUserTimezone()
  );

  const showTimezoneIndicator = event.timezone && event.timezone !== getUserTimezone();

  return (
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
        cursor: readOnly ? 'default' : 'pointer',
        position: 'relative',
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
        {displayTime} {event.title}
      </Typography>
      
      {showTimezoneIndicator && (
        <Box
          sx={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: 'warning.main',
            opacity: 0.8,
          }}
          title={t('schedule.events.eventInTimezone', { timezone: event.timezone })}
        />
      )}
    </Box>
  );
} 