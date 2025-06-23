import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import WarningIcon from '@mui/icons-material/Warning';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'src/lib/axios';
import { useUserContext } from 'src/context/user/context';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';

const DeleteConfirmationDialog = ({ open, onClose, selectedUsers, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { loadUsers } = useUserContext();

  const handleConfirm = async () => {
    setIsDeleting(true);
    
    try {
      await makeAuthenticatedRequest(async () => axios.delete('/api/user/edit', {
          data: { uids: selectedUsers },
        }));

      onConfirm(selectedUsers);
      handleClose();
    } catch (error) {
      console.error('Error deleting users:', error);
      // You might want to show an error message here
    } finally {
      setIsDeleting(false);
      loadUsers();
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color="warning" />
        Confirm Delete
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone. Are you sure you want to delete the selected users?
        </Alert>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          You are about to delete <strong>{selectedUsers.length}</strong> user{selectedUsers.length > 1 ? 's' : ''}:
        </Typography>
        
        <Box
          sx={{
            maxHeight: 200,
            overflow: 'auto',
            p: 1,
            bgcolor: 'grey.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.300',
          }}
        >
          {selectedUsers.map((uid, index) => (
            <Typography
              key={uid}
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                color: 'text.secondary',
                mb: index < selectedUsers.length - 1 ? 0.5 : 0,
              }}
            >
              • {uid}
            </Typography>
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={20} /> : null}
        >
          {isDeleting ? 'Deleting...' : 'Delete Users'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog; 