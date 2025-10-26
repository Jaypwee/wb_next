import { z } from 'zod';
import React, { useState, useTransition } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'src/lib/axios';
import { useUserContext } from 'src/context/user/context';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';
// Zod schema for validation
const userIdSchema = z.string()
  .min(1, 'User ID is required')
  .regex(/^\d+$/, 'User ID must contain only numbers')
  .refine((val) => val.length >= 6 && val.length <= 8, {
    message: 'User ID must be 6-8 digits long',
  });

const AddUsersDialog = ({ open, onClose, onSubmit }) => {
  const [inputs, setInputs] = useState([{ id: 1, value: '', disabled: false, error: '' }]);
  const [isPending, startTransition] = useTransition();
  const { loadUsers } = useUserContext();

  const handleInputChange = (id, value) => {
    setInputs(prevInputs =>
      prevInputs.map(input =>
        input.id === id
          ? { ...input, value, error: '' }
          : input
      )
    );
  };

  const handlePaste = (event, currentId) => {
    const clipboardText = event.clipboardData?.getData('text') || '';
    const tokens = clipboardText
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);

    // Only handle when multiple IDs are pasted; allow normal paste otherwise
    if (tokens.length <= 1) {
      return;
    }

    event.preventDefault();

    setInputs((prevInputs) => {
      const updatedInputs = [...prevInputs];
      const currentIndex = updatedInputs.findIndex((i) => i.id === currentId);
      if (currentIndex === -1) {
        return prevInputs;
      }

      const items = tokens.map((token) => {
        const validation = userIdSchema.safeParse(token);
        if (validation.success) {
          return { id: Date.now() + Math.random(), value: token, disabled: true, error: '' };
        }
        return { id: Date.now() + Math.random(), value: token, disabled: false, error: validation.error.issues[0].message };
      });

      const [firstItem, ...restItems] = items;

      // Replace current input with first item, preserving the id for stable keys
      updatedInputs[currentIndex] = { ...firstItem, id: updatedInputs[currentIndex].id };

      // Insert the rest right after the current position
      if (restItems.length > 0) {
        updatedInputs.splice(currentIndex + 1, 0, ...restItems);
      }

      // Ensure there's at least one empty enabled input for further entry
      const hasEmptyEnabled = updatedInputs.some((inp) => !inp.disabled && inp.value.trim() === '');
      if (!hasEmptyEnabled) {
        updatedInputs.push({ id: Date.now() + Math.random(), value: '', disabled: false, error: '' });
      }

      return updatedInputs;
    });
  };

  const handleAddInput = (currentId) => {
    // Validate current input before adding new one
    const currentInput = inputs.find(input => input.id === currentId);
    const validation = userIdSchema.safeParse(currentInput.value);
    
    if (!validation.success) {
      setInputs(prevInputs =>
        prevInputs.map(input =>
          input.id === currentId
            ? { ...input, error: validation.error.issues[0].message }
            : input
        )
      );
      return;
    }

    // Disable current input and add new one
    setInputs(prevInputs => [
      ...prevInputs.map(input =>
        input.id === currentId
          ? { ...input, disabled: true, error: '' }
          : input
      ),
      { id: Date.now(), value: '', disabled: false, error: '' }
    ]);
  };

  const handleSubmit = () => {
    // Validate all inputs
    const validatedInputs = [];
    let hasErrors = false;

    const updatedInputs = inputs.map(input => {
      if (input.value.trim() === '') {
        return { ...input, error: 'User ID is required' };
      }
      
      const validation = userIdSchema.safeParse(input.value);
      if (!validation.success) {
        hasErrors = true;
        return { ...input, error: validation.error.issues[0].message };
      }
      
      validatedInputs.push(input.value);
      return { ...input, error: '' };
    });

    setInputs(updatedInputs);

    if (hasErrors || validatedInputs.length === 0) {
      return;
    }

    // Check for duplicates
    const uniqueInputs = [...new Set(validatedInputs)];
    if (uniqueInputs.length !== validatedInputs.length) {
      // Find and mark duplicate inputs
      const duplicates = validatedInputs.filter((item, index) => validatedInputs.indexOf(item) !== index);
      const updatedInputsWithDuplicates = inputs.map(input => ({
        ...input,
        error: duplicates.includes(input.value) ? 'Duplicate User ID' : input.error
      }));
      setInputs(updatedInputsWithDuplicates);
      return;
    }

    // Use startTransition for the async operation
    startTransition(async () => {
      try {
        await makeAuthenticatedRequest(async () => axios.post('/api/user/edit', {
            uids: uniqueInputs,
        }));

        onSubmit(uniqueInputs);
        loadUsers();
        handleClose();
      } catch (error) {
        console.error('Error adding users:', error);
        // You might want to show an error message here
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setInputs([{ id: 1, value: '', disabled: false, error: '' }]);
      onClose();
    }
  };

  const hasValidInputs = inputs.some(input => input.value.trim() !== '');

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { minHeight: 300 }
        }
      }}
    >
      <DialogTitle>신규 유저 추가</DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          유저 ID(6-8자리)를 입력하세요.
        </Typography>
        
        <Stack spacing={2} sx={{ mt: 1 }}>
          {inputs.map((input) => (
            <Box key={input.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <TextField
                fullWidth
                label="User ID"
                value={input.value}
                onChange={(e) => handleInputChange(input.id, e.target.value)}
                onPaste={(e) => handlePaste(e, input.id)}
                disabled={input.disabled || isPending}
                error={!!input.error}
                helperText={input.error}
                placeholder="9-10자리 유저 ID 입력"
                slotProps={{
                  input: {
                    maxLength: 10,
                    pattern: '[0-9]*',
                  }
                }}
                onKeyDown={(e) => {
                  // Allow copy/paste shortcuts (Ctrl+C, Ctrl+V, Cmd+C, Cmd+V, Ctrl+A, Cmd+A)
                  if (e.ctrlKey || e.metaKey) {
                    return;
                  }
                  // Only allow numbers, backspace, delete, arrow keys, tab
                  if (!/[0-9]/.test(e.key) && 
                      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              
              {!input.disabled && (
                <IconButton
                  onClick={() => handleAddInput(input.id)}
                  disabled={isPending || input.value.trim() === ''}
                  color="primary"
                  sx={{ mt: 1 }}
                >
                  <AddIcon />
                </IconButton>
              )}
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!hasValidInputs || isPending}
          startIcon={isPending ? <CircularProgress size={20} /> : null}
        >
          {isPending ? '추가중...' : '추가'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUsersDialog; 