'use client';

import { use, useState, useEffect, useTransition } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

import axios from 'src/lib/axios';
import { useTranslate } from 'src/locales';
import { fetchSeasonInfo } from 'src/services/season';
import { useUserContext } from 'src/context/user/context';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';

import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';

import { RoleBasedGuard } from 'src/auth/guard';

import UsersDataGrid from './components/users-data-grid';
import { useFileUpload, useReportUpload } from '../hooks/admin';
import { InfantryGroupManager } from './components/infantry-group-manager';

// Create the Promise outside the component
const seasonInfoPromise = fetchSeasonInfo();

// ----------------------------------------------------------------------

const SeasonNameInput = ({ value, onChange, onSeasonCreated }) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateSeason = () => {
    if (!value || value.trim() === '') {
      setError('시즌 이름을 입력해주세요');
      return;
    }

    setError('');
    setSuccess('');

    startTransition(async () => {
      try {
        await makeAuthenticatedRequest(async () => 
          axios.post('/api/season/names', {
            season_name: value.trim()
          })
        );

        setSuccess('시즌이 성공적으로 생성되었습니다!');
        onChange(''); // Clear the input
        
        // Notify parent component if callback provided
        if (onSeasonCreated) {
          onSeasonCreated();
        }
      } catch (err) {
        console.error('Error creating season:', err);
        
        // Handle specific error messages from the API
        if (err.response?.data?.error) {
          if (err.response.data.error === 'Season name already exists') {
            setError('이미 존재하는 시즌 이름입니다');
          } else if (err.response.data.error === 'Valid season_name is required') {
            setError('올바른 시즌 이름을 입력해주세요');
          } else {
            setError(err.response.data.error);
          }
        } else {
          setError('시즌 생성 중 오류가 발생했습니다');
        }
      }
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          시즌 추가하기
        </Typography>
        <Button
          variant="contained"
          onClick={handleCreateSeason}
          disabled={!value || isPending}
          startIcon={isPending ? <CircularProgress size={20} /> : null}
        >
          {isPending ? '생성중...' : '적용하기'}
        </Button>
      </Box>
      <TextField
        fullWidth
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setError(''); // Clear error when typing
          setSuccess(''); // Clear success when typing
        }}
        placeholder="추가할 시즌 이름을 입력해주세요 (영어)"
        error={!!error}
        helperText={error || success}
        disabled={isPending}
        sx={{
         '& .MuiFormHelperText-root': {
            color: success ? 'success.main' : undefined,
          },
        }}
      />
    </Box>
  );
};

const ReportControls = ({ 
  seasonName, 
  title, 
  date, 
  onSeasonNameChange, 
  onTitleChange, 
  onDateChange,
  seasonInfo 
}) => (
  <Stack direction="row" spacing={2} alignItems="center">
    <FormControl size="small">
      <InputLabel>시즌 선택</InputLabel>
      <Select
        value={seasonName}
        label="시즌 선택"
        onChange={(e) => onSeasonNameChange(e.target.value)}
        sx={{ minWidth: 120 }}
      >
        {seasonInfo?.map((season) => (
          <MenuItem key={season} value={season}>
            {season}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <RadioGroup
      value={title}
      onChange={(e) => onTitleChange(e.target.value)}
      row
    >
      <FormControlLabel value="start" control={<Radio />} label="시작" />
      <FormControlLabel value="final" control={<Radio />} label="결산" />
      <FormControlLabel value="inProgress" control={<Radio />} label="시즌 중" />
    </RadioGroup>

    {title === 'inProgress' && (
      <DesktopDatePicker
        value={date}
        onChange={onDateChange}
        slotProps={{
          textField: {
            size: 'small',
            placeholder: '데이터 추출 날짜',
            sx: { width: 200 }
          }
        }}
      />
    )}
  </Stack>
);

// ----------------------------------------------------------------------

export function AdminView() {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newSeasonName, setNewSeasonName] = useState('');
  const { t } = useTranslate();
  
  // User context integration
  const { users, loadUsers, isLoading: usersLoading, error: usersError } = useUserContext();
  
  const { total_seasons } = use(seasonInfoPromise) ?? [];

  const {
    singleFile,
    multipleFiles,
    setSingleFile,
    setMultipleFiles,
    handleDelete,
    handleMultipleDelete,
    handleDrop,
  } = useFileUpload();

  const {
    individualReportSeasonName,
    setIndividualReportSeasonName,
    kvkReportSeasonName,
    setKvkReportSeasonName,
    individualReportTitle,
    setIndividualReportTitle,
    kvkReportTitle,
    setKvkReportTitle,
    individualReportDate,
    setIndividualReportDate,
    kvkReportDate,
    setKvkReportDate,
    handleUpload,
    uploadMutation,
  } = useReportUpload();

  // Load users when component mounts
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle selection change from DataGrid
  const handleSelectionChange = (newSelection) => {
    setSelectedUsers(newSelection);
  };

  // Handle season creation success
  const handleSeasonCreated = async () => {
    // For now, we'll just show a message about refreshing
    // In a production app, you might want to refetch the season list
    await fetchSeasonInfo();
  };

  return (
    <RoleBasedGuard allowedRoles={['admin']}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          관리자 페이지
        </Typography>

        <Stack spacing={3}>
          <SeasonNameInput 
            value={newSeasonName} 
            onChange={setNewSeasonName}
            onSeasonCreated={handleSeasonCreated}
          />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h6">
                  {t('dashboard.admin.individualReportUpload')}
                </Typography>
                <ReportControls
                  seasonName={individualReportSeasonName}
                  title={individualReportTitle}
                  date={individualReportDate}
                  onSeasonNameChange={setIndividualReportSeasonName}
                  onTitleChange={setIndividualReportTitle}
                  onDateChange={setIndividualReportDate}
                  seasonInfo={total_seasons}
                />
              </Stack>
              <Button
                variant="contained"
                startIcon={uploadMutation.isPending && uploadMutation.variables?.type === 'single' ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Iconify icon="eva:cloud-upload-fill" />
                )}
                onClick={() => handleUpload('single', singleFile)}
                disabled={!singleFile || !individualReportSeasonName || !individualReportTitle || (individualReportTitle === 'inProgress' && !individualReportDate) || uploadMutation.isPending}
              >
                {uploadMutation.isPending && uploadMutation.variables?.type === 'single' ? 'Uploading...' : 'Upload'}
              </Button>
            </Box>
            <Upload
              value={singleFile}
              onDelete={() => handleDelete('single')}
              onChange={(file) => setSingleFile(file)}
              onDrop={(files) => handleDrop(files, 'single')}
              disabled={uploadMutation.isPending}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h6">
                  KvK 분쟁 시즌 데이터 업로드
                </Typography>
                <ReportControls
                  seasonName={kvkReportSeasonName}
                  title={kvkReportTitle}
                  date={kvkReportDate}
                  onSeasonNameChange={setKvkReportSeasonName}
                  onTitleChange={setKvkReportTitle}
                  onDateChange={setKvkReportDate}
                  seasonInfo={total_seasons}
                />
              </Stack>
              <Button
                variant="contained"
                startIcon={uploadMutation.isPending && uploadMutation.variables?.type === 'multiple' ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Iconify icon="eva:cloud-upload-fill" />
                )}
                onClick={() => handleUpload('multiple', null, multipleFiles)}
                disabled={!multipleFiles.length || !kvkReportSeasonName || !kvkReportTitle || (kvkReportTitle === 'inProgress' && !kvkReportDate) || uploadMutation.isPending}
              >
                {uploadMutation.isPending && uploadMutation.variables?.type === 'multiple' ? 'Uploading...' : 'Upload'}
              </Button>
            </Box>
            <Upload
              multiple
              value={multipleFiles}
              onRemove={handleMultipleDelete}
              onUpload={() => handleUpload('multiple', null, multipleFiles)}
              onRemoveAll={() => handleDelete('multiple')}
              onChange={(files) => setMultipleFiles(files)}
              onDrop={(files) => handleDrop(files, 'multiple')}
              disabled={uploadMutation.isPending}
            />
          </Box>

          {/* User Management DataGrid */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              연맹원 목록
            </Typography>
            
            <UsersDataGrid
              users={users}
              isLoading={usersLoading}
              error={usersError}
              selectedUsers={selectedUsers}
              onSelectionChange={handleSelectionChange}
            />
          </Box>

          {/* Infantry Group Management */}
          <InfantryGroupManager users={users} />
        </Stack>
      </Container>
    </RoleBasedGuard>
  );
} 