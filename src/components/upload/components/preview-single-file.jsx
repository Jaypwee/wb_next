import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { Iconify } from '../../iconify';
import { uploadClasses } from '../classes';

// ----------------------------------------------------------------------

export function SingleFilePreview({ file, sx, className, ...other }) {
  const fileName = typeof file === 'string' ? file : file.name;
  const fileType = typeof file === 'string' ? '' : file.type;
  const isExcel = fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  fileType === 'application/vnd.ms-excel' ||
                  fileName.endsWith('.xlsx') || 
                  fileName.endsWith('.xls');

  const previewUrl = typeof file === 'string' ? file : URL.createObjectURL(file);

  const renderPreview = () => {
    if (isExcel) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
          }}
        >
          <Iconify icon="vscode-icons:file-type-excel" width={48} height={48} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {fileName}
          </Typography>
        </Box>
      );
    }

    return <img alt={fileName} src={previewUrl} />;
  };

  return (
    <PreviewRoot
      className={mergeClasses([uploadClasses.uploadSinglePreview, className])}
      sx={sx}
      {...other}
    >
      {renderPreview()}
    </PreviewRoot>
  );
}

// ----------------------------------------------------------------------

const PreviewRoot = styled('div')(({ theme }) => ({
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  position: 'absolute',
  padding: theme.spacing(1),
  '& > img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
  },
}));

// ----------------------------------------------------------------------

export function DeleteButton({ sx, ...other }) {
  return (
    <IconButton
      size="small"
      sx={[
        (theme) => ({
          top: 16,
          right: 16,
          zIndex: 9,
          position: 'absolute',
          color: varAlpha(theme.vars.palette.common.whiteChannel, 0.8),
          bgcolor: varAlpha(theme.vars.palette.grey['900Channel'], 0.72),
          '&:hover': { bgcolor: varAlpha(theme.vars.palette.grey['900Channel'], 0.48) },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Iconify icon="mingcute:close-line" width={18} />
    </IconButton>
  );
}
