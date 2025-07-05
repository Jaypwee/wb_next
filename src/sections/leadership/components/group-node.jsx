'use client'

import { varAlpha } from 'minimal-shared/utils';
import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useTranslate } from 'src/locales';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function GroupNode({ 
  sx, 
  name, 
  role, 
  roleKorean,
  roleEnglish,
  depth, 
  group, 
  uid,
  avatarUrl, 
  totalChildren,
  path = [],
  onAddChild,
  onAddSibling,
  onDelete: onDeleteProp,
  onEdit: onEditProp
}) {
  const menuActions = usePopover();
  const { user } = useAuthContext();
  const { currentLang } = useTranslate();

  // Determine which role to display based on current locale
  const displayRole = () => {
    if (currentLang?.value === 'ko') {
      return roleKorean || role; // Fallback to legacy role field
    }
    return roleEnglish || role; // Fallback to legacy role field
  };

  const onDelete = () => {
    menuActions.onClose();
    if (onDeleteProp) {
      onDeleteProp(path, { name, role, roleKorean, roleEnglish, group });
    } else {
      toast.warning(`Delete action triggered for: ${name}`);
    }
  };

  const onEdit = () => {
    menuActions.onClose();
    if (onEditProp) {
      onEditProp(path, { name, role, roleKorean, roleEnglish, group, uid });
    } else {
      toast.info(`Edit action triggered for: ${name}`);
    }
  };

  const handleAddChild = () => {
    menuActions.onClose();
    if (onAddChild) {
      onAddChild(path, { name, role, roleKorean, roleEnglish, group });
    } else {
      toast.info(`Add child to: ${name}`);
    }
  };

  const handleAddSibling = () => {
    menuActions.onClose();
    if (onAddSibling) {
      onAddSibling(path, { name, role, roleKorean, roleEnglish, group });
    } else {
      toast.info(`Add sibling to: ${name}`);
    }
  };

  const styles = (theme, color) => ({
    color: theme.vars.palette[color].darker,
    bgcolor: varAlpha(theme.vars.palette[color].mainChannel, 0.08),
    border: `solid 1px ${varAlpha(theme.vars.palette[color].mainChannel, 0.24)}`,
    ...theme.applyStyles('dark', {
      color: theme.vars.palette[color].lighter,
    }),
  });

  const isLabel = depth === 2;

  const isRootGroup = group === 'root';
  const isTerritorialGroup = group === 'territorial';
  const isWarLeadGroup = group === 'war lead';
  const isEventsGroup = group === 'events';
  const isTechnologyGroup = group === 'technology';
  const isInfantryLeadGroup = group === 'infantry lead';
  const isCavalryLeadGroup = group === 'cavalry lead';
  const isInternationalGroup = group === 'international';
  const isRecruitmentGroup = group === 'recruitment';
  const isCommunicationsGroup = group === 'communications';

  const renderMenuActions = () => (
    <CustomPopover
      open={menuActions.open}
      anchorEl={menuActions.anchorEl}
      onClose={menuActions.onClose}
      slotProps={{ arrow: { placement: 'left-center' } }}
    >
      <MenuList>
        <MenuItem onClick={handleAddChild}>
          <Iconify icon="solar:user-plus-bold" />
          Add Child
        </MenuItem>

        {path.length > 0 && (
          <MenuItem onClick={handleAddSibling}>
            <Iconify icon="solar:users-group-two-rounded-bold" />
            Add Sibling
          </MenuItem>
        )}

        <MenuItem onClick={onEdit}>
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        {!isRootGroup && (
          <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        )}
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <Box
        sx={{
          alignItems: 'center',
          position: 'relative',
          display: 'inline-flex',
          flexDirection: 'column',
        }}
      >
        {!isLabel && (
          <Avatar
            alt={name}
            src={avatarUrl ?? ''}
            sx={[
              (theme) => ({
                mt: -3.5,
                zIndex: 9,
                width: 56,
                height: 56,
                position: 'absolute',
                border: `solid 4px ${theme.vars.palette.background.paper}`,
              }),
            ]}
          />
        )}

        <Card
          sx={[
            (theme) => ({
              pt: 5,
              pb: 3,
              minWidth: 200,
              borderRadius: 1.5,
              ...(isLabel && { py: 2 }),
              ...(isLabel && isTerritorialGroup && styles(theme, 'success')),
              ...(isLabel && isWarLeadGroup && styles(theme, 'error')),
              ...(isLabel && isEventsGroup && styles(theme, 'warning')),
              ...(isLabel && isTechnologyGroup && styles(theme, 'info')),
              ...(isLabel && isInfantryLeadGroup && styles(theme, 'primary')),
              ...(isLabel && isCavalryLeadGroup && styles(theme, 'secondary')),
              ...(isLabel && isInternationalGroup && styles(theme, 'info')),
              ...(isLabel && isRecruitmentGroup && styles(theme, 'success')),
              ...(isLabel && isCommunicationsGroup && styles(theme, 'secondary')),
            }),
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          {user?.role === 'admin' && (
            <IconButton
              disabled={user?.role !== 'admin'}
              color={menuActions.open ? 'inherit' : 'default'}
              onClick={menuActions.onOpen}
              sx={{
                top: 8,
                right: 8,
                position: 'absolute',
                ...(isLabel && { display: 'none' }),
              }}
            >
              <Iconify icon="eva:more-horizontal-fill" />
            </IconButton>
          )}

          {depth !== 1 && !isRootGroup && (
            <Box
              sx={{
                top: 0,
                left: 0,
                width: 1,
                height: 4,
                position: 'absolute',
                borderRadius: 1.5,
                ...(isTerritorialGroup && { bgcolor: 'success.light' }),
                ...(isWarLeadGroup && { bgcolor: 'error.light' }),
                ...(isEventsGroup && { bgcolor: 'warning.light' }),
                ...(isTechnologyGroup && { bgcolor: 'info.light' }),
                ...(isInfantryLeadGroup && { bgcolor: 'primary.light' }),
                ...(isCavalryLeadGroup && { bgcolor: 'secondary.light' }),
                ...(isInternationalGroup && { bgcolor: 'info.light' }),
                ...(isRecruitmentGroup && { bgcolor: 'success.light' }),
                ...(isCommunicationsGroup && { bgcolor: 'secondary.light' }),
              }}
            />
          )}

          <Typography variant={isLabel ? 'subtitle1' : 'subtitle2'} noWrap>
            {name}

            {isLabel && (
              <Label
                color={
                  (isTerritorialGroup && 'success') ||
                  (isWarLeadGroup && 'error') ||
                  (isEventsGroup && 'warning') ||
                  (isTechnologyGroup && 'info') ||
                  (isInfantryLeadGroup && 'primary') ||
                  (isCavalryLeadGroup && 'secondary') ||
                  (isInternationalGroup && 'info') ||
                  (isRecruitmentGroup && 'success') ||
                  (isCommunicationsGroup && 'secondary') ||
                  'primary'
                }
                sx={{ ml: 1 }}
              >
                {totalChildren}
              </Label>
            )}
          </Typography>

          {!isLabel && (
            <Typography
              component="div"
              variant="caption"
              sx={{ mt: 0.5, color: 'text.secondary' }}
            >
              {displayRole()}
            </Typography>
          )}
        </Card>
      </Box>

      {renderMenuActions()}
    </>
  );
}
