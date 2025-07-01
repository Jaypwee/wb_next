import { useDropzone } from 'react-dropzone';
import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';

import { Iconify } from '../iconify';
import { uploadClasses } from './classes';
import { RejectionFiles } from './components/rejection-files';

// ----------------------------------------------------------------------

export function UploadAvatar({
  sx,
  file,
  error,
  disabled,
  onDrop,
  onDelete,
  helperText,
  className,
  currentAvatar,
  ...other
}) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    onDrop,
    disabled,
    accept: { 'image/*': [] },
    multiple: false,
    ...other,
  });

  const hasFile = !!file;
  const hasError = isDragReject || !!error;
  
  // Get preview URL for the selected file or current avatar
  const previewUrl = hasFile 
    ? (typeof file === 'string' ? file : URL.createObjectURL(file))
    : currentAvatar;

  return (
    <Box
      className={mergeClasses([uploadClasses.uploadAvatar, className])}
      sx={[{ width: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box
        {...getRootProps()}
        sx={[
          (theme) => ({
            p: 2,
            width: 144,
            height: 144,
            margin: 'auto',
            cursor: 'pointer',
            overflow: 'hidden',
            borderRadius: '50%',
            position: 'relative',
            border: `2px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.32)}`,
            transition: theme.transitions.create(['opacity', 'padding']),
            '&:hover': { 
              opacity: 0.72,
              '& .upload-placeholder': { opacity: 1 }
            },
            ...(isDragActive && { opacity: 0.72 }),
            ...(disabled && { opacity: 0.48, pointerEvents: 'none' }),
            ...(hasError && {
              color: 'error.main',
              borderColor: 'error.main',
              bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.08),
            }),
            ...(hasFile && { padding: 0, border: 'none' }),
          }),
        ]}
      >
        <input {...getInputProps()} />

        {previewUrl ? (
          <Avatar
            src={previewUrl}
            sx={{
              width: 1,
              height: 1,
              '& img': { objectFit: 'cover' }
            }}
          />
        ) : (
          <Box
            className="upload-placeholder"
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center',
              height: 1,
              opacity: 0.64,
              transition: 'opacity 0.3s',
            }}
          >
            <Iconify icon="solar:camera-add-bold" width={32} />
            <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
              Upload photo
            </Typography>
          </Box>
        )}

        {previewUrl && (
          <Box
            className="upload-placeholder"
            sx={{
              top: 0,
              left: 0,
              width: 1,
              height: 1,
              zIndex: 9,
              opacity: 0,
              display: 'flex',
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'common.white',
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.48),
              transition: 'opacity 0.3s',
              borderRadius: '50%',
            }}
          >
            <Iconify icon="solar:camera-add-bold" width={32} />
            <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
              {hasFile ? 'Change photo' : 'Upload photo'}
            </Typography>
          </Box>
        )}
      </Box>

      {hasFile && (
        <IconButton
          size="small"
          onClick={onDelete}
          sx={{
            top: 16,
            right: 16,
            zIndex: 9,
            position: 'absolute',
            color: (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.8),
            bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.72),
            '&:hover': {
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.48),
            },
          }}
        >
          <Iconify icon="mingcute:close-line" width={18} />
        </IconButton>
      )}

      {helperText && (
        <FormHelperText error={!!error} sx={{ px: 2, textAlign: 'center', mt: 2 }}>
          {helperText}
        </FormHelperText>
      )}

      {!!fileRejections.length && <RejectionFiles files={fileRejections} />}
    </Box>
  );
} 