'use client';

import { useState, useTransition } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { List, Alert, ListItem, IconButton, ListItemText } from '@mui/material';

import { useUserContext } from 'src/context/user/context';
import { updateUserInfantryGroup } from 'src/services/user';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function InfantryGroupManager({ users }) {
  const [inputUid, setInputUid] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [isPending, startTransition] = useTransition();
  const [deletingUid, setDeletingUid] = useState(null);
  
  const { loadUsers } = useUserContext();

  // Convert users object to array for easier handling
  const usersArray = users ? Object.entries(users).map(([uid, userData]) => ({
    uid,
    ...userData
  })) : [];

  // Filter users who are already in infantry group
  const infantryGroupUsers = usersArray.filter(user => user.isInfantryGroup);

  const handleAddToInfantryGroup = () => {
    if (!inputUid.trim()) {
      setMessage('UID를 입력해주세요.');
      setMessageType('error');
      return;
    }

    // Check if UID exists in users list
    const userExists = usersArray.some(user => user.uid === inputUid.trim());
    if (!userExists) {
      setMessage('입력한 UID가 사용자 목록에 존재하지 않습니다.');
      setMessageType('error');
      return;
    }

    // Check if user is already in infantry group
    const isAlreadyInGroup = usersArray.some(user => user.uid === inputUid.trim() && user.isInfantryGroup);
    if (isAlreadyInGroup) {
      setMessage('해당 사용자는 이미 보병단에 속해있습니다.');
      setMessageType('warning');
      return;
    }

    startTransition(async () => {
      try {
        setMessage('');
        
        await makeAuthenticatedRequest(() => updateUserInfantryGroup(inputUid.trim(), true));
        
        setMessage('사용자가 보병단에 성공적으로 추가되었습니다.');
        setMessageType('success');
        setInputUid('');
        
        // Reload users to update the list using the context
        await loadUsers();
        
      } catch (error) {
        console.error('Error adding user to infantry group:', error);
        setMessage('보병단 추가 중 오류가 발생했습니다.');
        setMessageType('error');
      }
    });
  };

  const handleRemoveFromInfantryGroup = (uid) => {
    startTransition(async () => {
      try {
        setMessage('');
        setDeletingUid(uid);
        
        await makeAuthenticatedRequest(() => updateUserInfantryGroup(uid, false));
        
        setMessage('사용자가 보병단에서 성공적으로 제거되었습니다.');
        setMessageType('success');
        
        // Reload users to update the list using the context
        await loadUsers();
        
      } catch (error) {
        console.error('Error removing user from infantry group:', error);
        setMessage('보병단 제거 중 오류가 발생했습니다.');
        setMessageType('error');
      } finally {
        setDeletingUid(null);
      }
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleAddToInfantryGroup();
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        보병단 관리
      </Typography>
      
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {/* Left side - Infantry group users list */}
        <Box sx={{ width: 400, border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            보병단 구성원 ({infantryGroupUsers.length}명)
          </Typography>
          
          {infantryGroupUsers.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              보병단에 속한 사용자가 없습니다.
            </Typography>
          ) : (
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
              {infantryGroupUsers.map((user) => (
                <ListItem 
                  key={user.uid} 
                  sx={{ px: 1 }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveFromInfantryGroup(user.uid)}
                      disabled={isPending}
                      size="small"
                    >
                      {deletingUid === user.uid ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Iconify icon="eva:trash-2-outline" width={16} />
                      )}
                    </IconButton>
                  }
                >
                  <ListItemText 
                    primary={`${user.nickname || '이름 없음'} (${user.uid})`}
                    sx={{ 
                      '& .MuiListItemText-primary': { 
                        fontSize: '0.875rem' 
                      } 
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Right side - Add user form */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            보병단에 사용자 추가
          </Typography>
          
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="사용자 UID"
              value={inputUid}
              onChange={(e) => setInputUid(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="추가할 사용자의 UID를 입력하세요"
              disabled={isPending}
              size="small"
            />
            
            <Button
              variant="contained"
              onClick={handleAddToInfantryGroup}
              disabled={isPending || !inputUid.trim()}
              startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="eva:plus-fill" />}
              sx={{ alignSelf: 'flex-start' }}
            >
              {isPending ? '추가 중...' : '보병단에 추가'}
            </Button>

            {message && (
              <Alert severity={messageType} sx={{ mt: 1 }}>
                {message}
              </Alert>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
} 