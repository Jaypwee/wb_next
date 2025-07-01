'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import { alpha, useTheme } from '@mui/material/styles';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useTranslate } from 'src/locales';

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// ----------------------------------------------------------------------

export function EventDetailsDialog({ open, onClose, event }) {
  const theme = useTheme();
  const { t } = useTranslate();

  if (!event) return null;

  // Format time and date for display - convert UTC to user's local timezone
  const formatEventDateTime = () => {
    try {
      if (event.datetime) {
        // New format: UTC datetime
        const utcDateTime = dayjs.utc(event.datetime);
        const localDateTime = utcDateTime.local();
        return {
          time: localDateTime.format('h:mm A'),
          date: localDateTime.format('dddd, MMMM D, YYYY'),
          dateString: localDateTime.format('YYYY-MM-DD')
        };
      } else if (event.date && event.startTime) {
        // Legacy format support
        const dateTime = dayjs(`${event.date}T${event.startTime}`);
        return {
          time: dateTime.format('h:mm A'),
          date: dateTime.format('dddd, MMMM D, YYYY'),
          dateString: event.date
        };
      }
      return {
        time: '',
        date: '',
        dateString: event.date || ''
      };
    } catch (error) {
      console.warn('Failed to format event datetime:', error);
      return {
        time: event.startTime || '',
        date: event.date ? dayjs(event.date).format('dddd, MMMM D, YYYY') : '',
        dateString: event.date || ''
      };
    }
  };

  const { time: displayTime, date: displayDate } = formatEventDateTime();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: event.color,
              flexShrink: 0,
            }}
          />
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {event.title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Date and Time */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('schedule.events.dateAndTime')}
            </Typography>
            <Typography variant="body1">
              {displayDate}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {displayTime}
            </Typography>
          </Box>

          {/* Description */}
          {event.description && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('schedule.events.description')}
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {event.description}
              </Typography>
            </Box>
          )}

          {/* Category/Type */}
          {event.category && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('schedule.events.category')}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: alpha(event.color, 0.15),
                  border: `1px solid ${alpha(event.color, 0.3)}`,
                }}
              >
                <Typography variant="body2" sx={{ color: event.color, fontWeight: 500 }}>
                  {event.category}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Location */}
          {event.location && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('schedule.events.location')}
              </Typography>
              <Typography variant="body2">
                {event.location}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 