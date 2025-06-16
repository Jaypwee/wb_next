'use client';

import { use, useState } from 'react';

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

import { useTranslate } from 'src/locales';
import { fetchSeasonInfo } from 'src/services/season';

import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';

import { useFileUpload, useReportUpload } from '../hooks/admin';

// Create the Promise outside the component
const seasonInfoPromise = fetchSeasonInfo();

// ----------------------------------------------------------------------

const SeasonNameInput = ({ value, onChange }) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="h6">
        시즌 추가하기
      </Typography>
      <Button
        variant="contained"
        onClick={onChange}
        disabled={!value}
      >
        Submit
      </Button>
    </Box>
    <TextField
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="추가할 시즌 이름을 입력해주세요 (영어)"
    />
  </Box>
);

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
  const [seasonName, setSeasonName] = useState('');
  const { t } = useTranslate();
  
  const { total_seasons } = use(seasonInfoPromise) ?? [];
  console.log(total_seasons);

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

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        관리자 페이지
      </Typography>

      <Stack spacing={3}>
        <SeasonNameInput 
          value={seasonName} 
          onChange={setSeasonName} 
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
                Multiple Files Upload
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
      </Stack>
    </Container>
  );
} 