'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const GROUPS = [
  { value: 'territorial', label: 'Territorial' },
  { value: 'war lead', label: 'War Lead' },
  { value: 'events', label: 'Events' },
  { value: 'technology', label: 'Technology' },
  { value: 'infantry lead', label: 'Infantry Lead' },
  { value: 'cavalry lead', label: 'Cavalry Lead' },
  { value: 'international', label: 'International' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'communications', label: 'Communications' },
];

// Zod schema for form validation
const addNodeSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  uid: z
    .string()
    .min(1, 'Game UID is required')
    .regex(/^\d{7,8}$/, 'Game UID must be a 7-8 digit number'),
  roleKorean: z
    .string()
    .min(1, 'Korean role is required')
    .min(2, 'Korean role must be at least 2 characters')
    .max(100, 'Korean role must be less than 100 characters'),
  roleEnglish: z
    .string()
    .min(1, 'English role is required')
    .min(2, 'English role must be at least 2 characters')
    .max(100, 'English role must be less than 100 characters'),
  group: z
    .string()
    .min(1, 'Group is required'),
});

// ----------------------------------------------------------------------

export function AddNodeDialog({ 
  open, 
  onClose, 
  onAddNode, 
  defaultGroup = 'technology',
  mode = 'child', // 'child', 'sibling', or 'edit'
  parentName = '',
  existingData = null
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addNodeSchema),
    defaultValues: {
      name: '',
      uid: '',
      roleKorean: '',
      roleEnglish: '',
      group: defaultGroup,
    },
  });

  const watchedGroup = watch('group');

  // Reset form values when dialog opens or existingData changes
  useEffect(() => {
    if (open) {
      const formValues = {
        name: existingData?.name || '',
        uid: existingData?.uid || '',
        roleKorean: existingData?.roleKorean || existingData?.role || '',
        roleEnglish: existingData?.roleEnglish || existingData?.role || '',
        group: existingData?.group || defaultGroup,
      };

      reset(formValues);
    }
  }, [open, existingData, defaultGroup, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const nodeData = {
        name: data.name.trim(),
        uid: data.uid.trim(),
        roleKorean: data.roleKorean.trim(),
        roleEnglish: data.roleEnglish.trim(),
        group: data.group,
      };

      await onAddNode(nodeData);
      
      const successMessage = mode === 'edit' 
        ? `Successfully updated ${nodeData.name}`
        : `Successfully added ${nodeData.name} as ${mode === 'child' ? 'child' : 'sibling'}`;
      
      toast.success(successMessage);
      handleClose();
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'adding'} node:`, error);
      toast.error(`Failed to ${mode === 'edit' ? 'update' : 'add'} person`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDialogTitle = () => {
    if (mode === 'edit') {
      return `Edit ${existingData?.name || 'Person'}`;
    }
    return mode === 'child' 
      ? `Add Child${parentName ? ` to ${parentName}` : ''}`
      : `Add Sibling${parentName ? ` next to ${parentName}` : ''}`;
  };

  const getButtonText = () => {
    if (mode === 'edit') {
      return isSubmitting ? 'Updating...' : 'Update Person';
    }
    return isSubmitting ? 'Adding...' : `Add ${mode === 'child' ? 'Child' : 'Sibling'}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 2 },
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        {getDialogTitle()}
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Name and UID Fields */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                autoFocus
                fullWidth
                label="In-Game Name"
                placeholder="Enter person's name"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />

              <TextField
                fullWidth
                label="Game UID"
                placeholder="Enter 7-8 digit number"
                {...register('uid')}
                error={!!errors.uid}
                helperText={errors.uid?.message}
              />
            </Box>

            {/* Group Field */}
            <TextField
              select
              fullWidth
              label="Department/Group"
              value={watchedGroup}
              onChange={(e) => setValue('group', e.target.value)}
              error={!!errors.group}
              helperText={errors.group?.message}
            >
              {GROUPS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {/* Role Fields */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Role (Korean)"
                placeholder="Enter Korean role title"
                {...register('roleKorean')}
                error={!!errors.roleKorean}
                helperText={errors.roleKorean?.message}
              />

              <TextField
                fullWidth
                label="Role (English)"
                placeholder="Enter English role title"
                {...register('roleEnglish')}
                error={!!errors.roleEnglish}
                helperText={errors.roleEnglish?.message}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {getButtonText()}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 