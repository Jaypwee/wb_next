'use client';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import { useTranslate } from 'src/locales';

import { getUserTimezone, getCommonTimezones, getTimezoneDisplayName } from '../utils/timezone';

// ----------------------------------------------------------------------

const COLOR_OPTIONS = [
  { name: 'primary', value: '#00A76F' },
  { name: 'secondary', value: '#8E33FF' },
  { name: 'error', value: '#FF5630' },
  { name: 'warning', value: '#FFAB00' },
  { name: 'info', value: '#00B8D9' },
  { name: 'success', value: '#22C55E' },
];

// ----------------------------------------------------------------------

export function EventDialog({ open, event, date, onSave, onDelete, onClose, readOnly = false }) {
  const { t } = useTranslate();
  const [formData, setFormData] = useState({
    title: '',
    date: null,
    startTime: dayjs().hour(9).minute(0),
    endTime: dayjs().hour(10).minute(0),
    timezone: getUserTimezone(),
    color: COLOR_OPTIONS[0].value,
    description: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        date: event.date ? dayjs(event.date) : null,
        startTime: event.startTime ? dayjs(event.startTime, 'HH:mm') : dayjs().hour(9).minute(0),
        endTime: event.endTime ? dayjs(event.endTime, 'HH:mm') : dayjs().hour(10).minute(0),
        timezone: event.timezone || getUserTimezone(),
        color: event.color || COLOR_OPTIONS[0].value,
        description: event.description || '',
      });
    } else if (date) {
      setFormData(prev => ({
        ...prev,
        date: dayjs(date),
        title: '',
        description: '',
        timezone: getUserTimezone(),
      }));
    }
  }, [event, date]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleDateTimeChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      color,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return; // Prevent submission in read-only mode
    
    if (formData.title.trim() && formData.date) {
      const eventData = {
        title: formData.title,
        date: formData.date.format('YYYY-MM-DD'),
        startTime: formData.startTime.format('HH:mm'),
        endTime: formData.endTime.format('HH:mm'),
        timezone: formData.timezone,
        color: formData.color,
        description: formData.description,
      };
      onSave(eventData);
    }
  };

  const handleDelete = () => {
    if (readOnly) return; // Prevent deletion in read-only mode
    
    if (event?.id) {
      onDelete(event.id);
    }
  };

  // Don't render dialog in read-only mode
  if (readOnly) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleSubmit,
        },
      }}
    >
      <DialogTitle>
        {event ? t('schedule.eventDialog.editEvent') : t('schedule.eventDialog.addEvent')}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label={t('schedule.eventDialog.eventTitle')}
            value={formData.title}
            onChange={handleChange('title')}
            required
            fullWidth
            autoFocus
          />

          <DatePicker
            label={t('schedule.eventDialog.date')}
            value={formData.date}
            onChange={handleDateTimeChange('date')}
            slotProps={{
              textField: {
                required: true,
                fullWidth: true,
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TimePicker
              label={t('schedule.eventDialog.startTime')}
              value={formData.startTime}
              onChange={handleDateTimeChange('startTime')}
              slotProps={{
                textField: {
                  required: true,
                  sx: { flex: 1 },
                },
              }}
            />
            <TimePicker
              label={t('schedule.eventDialog.endTime')}
              value={formData.endTime}
              onChange={handleDateTimeChange('endTime')}
              slotProps={{
                textField: {
                  required: true,
                  sx: { flex: 1 },
                },
              }}
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel>{t('schedule.eventDialog.timezone')}</InputLabel>
            <Select
              value={formData.timezone}
              onChange={handleChange('timezone')}
              label={t('schedule.eventDialog.timezone')}
            >
              <MenuItem value={getUserTimezone()}>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {getTimezoneDisplayName(getUserTimezone())}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t('schedule.eventDialog.yourLocalTime')}
                  </Typography>
                </Box>
              </MenuItem>
              {getCommonTimezones()
                .filter(tz => tz !== getUserTimezone())
                .map((timezone) => (
                  <MenuItem key={timezone} value={timezone}>
                    {getTimezoneDisplayName(timezone)}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('schedule.eventDialog.color')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map((color) => (
                <Box
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: color.value,
                    cursor: 'pointer',
                    border: formData.color === color.value ? '3px solid' : '1px solid',
                    borderColor: formData.color === color.value ? 'text.primary' : alpha(color.value, 0.3),
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                  title={t(`schedule.colorOptions.${color.name}`)}
                />
              ))}
            </Box>
          </Box>

          <TextField
            label={t('schedule.eventDialog.description')}
            value={formData.description}
            onChange={handleChange('description')}
            multiline
            rows={3}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        {event && (
          <Button
            onClick={handleDelete}
            color="error"
            variant="outlined"
            sx={{ mr: 'auto' }}
          >
            {t('schedule.eventDialog.delete')}
          </Button>
        )}
        <Button onClick={onClose}>
          {t('schedule.eventDialog.cancel')}
        </Button>
        <Button 
          type="submit" 
          variant="contained"
          disabled={!formData.title.trim() || !formData.date}
        >
          {event ? t('schedule.eventDialog.saveChanges') : t('schedule.eventDialog.addEventButton')}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 