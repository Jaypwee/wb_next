import React, { useState, useTransition } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { updateUserLabels } from 'src/services/user';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';

import { Badge } from 'src/components/badge';
import { toast } from 'src/components/snackbar';

// Available badge types
// Ignore infantry group badge and king badge - they will be added automatically
const BADGE_TYPES = [
  { 
    type: 'builder', 
    label: '건축가',
    description: '건축 주축 멤버' 
  },
  { 
    type: 'officer', 
    label: '임원진',
    description: '연맹 임원진' 
  },
  { 
    type: 'destroyer', 
    label: '파괴자',
    description: '건물 파괴 전문 멤버' 
  }
];

const MAX_LABELS = 3;

const AddLabelDialog = ({ open, onClose, selectedUsers, users, onLabelsAdded }) => {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [isPending, startTransition] = useTransition();

  const handleBadgeSelect = (badgeType) => {
    setSelectedBadge(badgeType);
  };

  const handleSubmit = () => {
    if (!selectedBadge || selectedUsers.length === 0) {
      return;
    }

    startTransition(async () => {
      try {
        const results = [];
        const errors = [];
        const skippedUsers = [];

        // Process each selected user
        for (const uid of selectedUsers) {
          try {
            const userData = users[uid];
            const currentLabels = userData?.labels || [];
            
            // Check if user already has the maximum number of labels
            if (currentLabels.length >= MAX_LABELS) {
              skippedUsers.push({
                uid,
                nickname: userData?.nickname || uid,
                reason: 'max_labels'
              });
              continue;
            }
            
            // Check if badge already exists
            if (!currentLabels.includes(selectedBadge)) {
              const updatedLabels = [...currentLabels, selectedBadge];
              
              await makeAuthenticatedRequest(async () => 
                updateUserLabels(uid, updatedLabels)
              );
              
              results.push(uid);
            }
          } catch (error) {
            console.error(`Error updating labels for user ${uid}:`, error);
            errors.push({
              uid,
              nickname: users[uid]?.nickname || uid,
              reason: 'api_error'
            });
          }
        }

        // Show toast notifications
        if (results.length > 0) {
          toast.success(`${results.length}명의 사용자에게 라벨이 추가되었습니다.`);
        }

        if (skippedUsers.length > 0) {
          const skippedNames = skippedUsers.map(user => user.nickname).join(', ');
          toast.warning(`다음 사용자는 라벨 개수 제한(${MAX_LABELS}개)으로 인해 업데이트되지 않았습니다: ${skippedNames}`);
        }

        if (errors.length > 0) {
          const errorNames = errors.map(user => user.nickname).join(', ');
          toast.error(`다음 사용자 업데이트 중 오류가 발생했습니다: ${errorNames}`);
        }

        if (onLabelsAdded) {
          onLabelsAdded(results, selectedBadge);
        }

        handleClose();
      } catch (error) {
        console.error('Error updating user labels:', error);
        toast.error('라벨 업데이트 중 오류가 발생했습니다.');
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setSelectedBadge(null);
      onClose();
    }
  };

  const selectedUsersList = selectedUsers.map(uid => 
    users[uid]?.nickname || uid
  ).join(', ');

  // Check how many users would be affected by the label limit
  const usersAtLimit = selectedUsers.filter(uid => {
    const userData = users[uid];
    const currentLabels = userData?.labels || [];
    return currentLabels.length >= MAX_LABELS;
  });

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { minHeight: 400 }
        }
      }}
    >
      <DialogTitle>라벨 추가</DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          선택된 사용자({selectedUsers.length}명)에게 추가할 라벨을 선택하세요.
        </Typography>
        
        {usersAtLimit.length > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.dark">
              ⚠️ {usersAtLimit.length}명의 사용자가 이미 최대 라벨 개수({MAX_LABELS}개)에 도달했습니다. 
              이 사용자들은 업데이트되지 않습니다.
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            선택된 사용자:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            p: 2, 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            maxHeight: 80,
            overflow: 'auto'
          }}>
            {selectedUsersList}
          </Typography>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          사용 가능한 라벨:
        </Typography>
        
        <Stack spacing={2}>
          {BADGE_TYPES.map((badge) => (
            <Box
              key={badge.type}
              sx={{
                p: 2,
                border: 1,
                borderColor: selectedBadge === badge.type ? 'primary.main' : 'grey.300',
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: selectedBadge === badge.type ? 'primary.50' : 'transparent',
                '&:hover': {
                  borderColor: selectedBadge === badge.type ? 'primary.dark' : 'primary.main',
                },
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => handleBadgeSelect(badge.type)}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Badge type={badge.type} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">
                    {badge.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {badge.description}
                  </Typography>
                </Box>
                {selectedBadge === badge.type && (
                  <Chip 
                    label="선택됨" 
                    size="small" 
                    color="primary" 
                    variant="filled"
                  />
                )}
              </Stack>
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
          disabled={!selectedBadge || selectedUsers.length === 0 || isPending}
          startIcon={isPending ? <CircularProgress size={20} /> : null}
        >
          {isPending ? '추가중...' : `라벨 추가 (${selectedUsers.length}명)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLabelDialog; 