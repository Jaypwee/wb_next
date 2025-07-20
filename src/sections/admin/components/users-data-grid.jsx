import React, { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import AddIcon from '@mui/icons-material/Add';
import LabelIcon from '@mui/icons-material/Label';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import LabelOffIcon from '@mui/icons-material/LabelOff';
import CircularProgress from '@mui/material/CircularProgress';
import {
  DataGrid,
  gridClasses,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';

import { toast } from 'src/components/snackbar';
import { BadgeCell } from 'src/components/badge-cell';
import { EmptyContent } from 'src/components/empty-content';

import AddUsersDialog from './add-users-dialog';
import AddLabelDialog from './add-label-dialog';
import DeleteConfirmationDialog from './delete-confirmation-dialog';

// ----------------------------------------------------------------------

// Memoized toolbar component to prevent unnecessary re-renders
const CustomToolbar = React.memo(({ setFilterButtonEl }) => (
    <GridToolbarContainer>
      <GridToolbarQuickFilter />
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton ref={setFilterButtonEl} />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  ));

const UsersDataGrid = React.memo(({ 
  users, 
  isLoading, 
  error, 
  selectedUsers, 
  onSelectionChange,
  onUsersAdded,
  onUsersDeleted,
  onLabelsReset
}) => {
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addLabelDialogOpen, setAddLabelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetLabelsDialogOpen, setResetLabelsDialogOpen] = useState(false);
  const [userToResetLabels, setUserToResetLabels] = useState(null);
  console.log('rendered')
  // Memoize rows conversion to prevent recreation on every render
  const rows = useMemo(() => {
    if (!users) return [];
    return Object.entries(users).map(([uid, userData]) => ({
      id: uid,
      uid,
      nickname: userData.nickname || 'N/A',
      labels: userData.labels || [],
      isInfantryGroup: userData.isInfantryGroup || false,
      highestPower: userData.highestPower || 0,
      unitsKilled: userData.unitsKilled || 0,
      unitsDead: userData.unitsDead || 0,
      manaSpent: userData.manaSpent || 0,
    }));
  }, [users]);

  // Memoize columns to prevent recreation and recalculation
  const columns = useMemo(() => [
    {
      field: 'uid',
      headerName: 'UID',
      width: 150,
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'medium', color: 'primary.main' }}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'nickname',
      headerName: 'Nickname',
      minWidth: 300,
      flex: 1,
      sortable: true,
      renderCell: (params) => (
        <BadgeCell 
          user={{
            uid: params.row.uid,
            nickname: params.value,
            isInfantryGroup: params.row.isInfantryGroup,
            labels: params.row.labels
          }}
          showNickname
        />
      ),
    },
    {
      field: 'highestPower',
      headerName: 'Highest Power',
      type: 'number',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ fontWeight: 'bold', color: 'success.main' }}>
          {params.value?.toLocaleString() || '0'}
        </Box>
      ),
    },
    {
      field: 'unitsKilled',
      headerName: 'Units Killed',
      type: 'number',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ color: 'text.secondary' }}>
          {params.value?.toLocaleString() || '0'}
        </Box>
      ),
    },
    {
      field: 'unitsDead',
      headerName: 'Units Dead',
      type: 'number',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ color: 'error.main' }}>
          {params.value?.toLocaleString() || '0'}
        </Box>
      ),
    },
    {
      field: 'manaSpent',
      headerName: 'Mana Spent',
      type: 'number',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      sortable: true,
      renderCell: (params) => (
        <Box sx={{ color: 'info.main' }}>
          {params.value?.toLocaleString() || '0'}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Tooltip title="Reset Labels">
          <IconButton
            size="small"
            onClick={() => handleResetLabelsClick(params.row)}
            disabled={!params.row.labels || params.row.labels.length === 0}
            color="warning"
          >
            <LabelOffIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ], [handleResetLabelsClick]);

  // Memoize toolbar props to prevent unnecessary re-renders
  const toolbarProps = useMemo(() => ({
    setFilterButtonEl,
  }), [setFilterButtonEl]);

  // Memoize panel props
  const panelProps = useMemo(() => ({
    anchorEl: filterButtonEl,
  }), [filterButtonEl]);

  // Memoize DataGrid sx prop to prevent style recalculation
  const dataGridSx = useMemo(() => ({
    height: 'calc(100% - 80px)', // Subtract header height
    [`& .${gridClasses.cell}`]: {
      alignItems: 'center',
      display: 'inline-flex',
      // Force override any height styles on direct children
      '& > * > .MuiLabel-root': {
        height: '24px !important',
      }
    },
    [`& .${gridClasses.row}`]: {
      '&:hover': {
        bgcolor: 'action.hover',
      },
    },
  }), []);

  // Handle dialog actions
  const handleAddUsers = (userIds) => {
    toast.info(`Added users: ${userIds.join(', ')}`);
    if (onUsersAdded) {
      onUsersAdded(userIds);
    }
  };

  const handleDeleteUsers = (userIds) => {
    toast.info(`Deleted users: ${userIds.join(', ')}`);
    if (onUsersDeleted) {
      onUsersDeleted(userIds);
    }
  };

  const handleLabelsAdded = (userIds, labelType) => {
    toast.info(`Added labels: ${labelType} to users: ${userIds.join(', ')}`);
    // Optionally refresh users data or handle success
  };

  const handleAddClick = () => {
    setAddDialogOpen(true);
  };

  const handleAddLabelClick = () => {
    if (selectedUsers.length === 0) {
      return;
    }
    setAddLabelDialogOpen(true);
  };

  const handleDeleteClick = () => {
    if (selectedUsers.length === 0) {
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleResetLabelsClick = useCallback((user) => {
    setUserToResetLabels(user);
    setResetLabelsDialogOpen(true);
  }, []);

  const handleResetLabels = (userId) => {
    toast.info(`Reset labels for user: ${userId}`);
    if (onLabelsReset) {
      onLabelsReset(userId);
    }
    setUserToResetLabels(null);
  };

  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader title="User Management" />
        <Box sx={{ p: 3 }}>
          <Typography color="error">
            Error loading users: {error}
          </Typography>
        </Box>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader title="User Management" />
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ height: 810 }}>
        <CardHeader 
          title="신규 연맹원 등록 및 삭제" 
          subheader={`총 인원: ${rows.length}`}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<LabelIcon />}
                onClick={handleAddLabelClick}
                disabled={selectedUsers.length === 0}
                size="small"
              >
                라벨 추가 ({selectedUsers.length})
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                size="small"
              >
                추가
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
                disabled={selectedUsers.length === 0}
                size="small"
              >
                삭제 ({selectedUsers.length})
              </Button>
            </Stack>
          }
        />

        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectedUsers}
          onRowSelectionModelChange={onSelectionChange}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[5, 10, 20, 50, { value: -1, label: 'All' }]}
          // Performance optimizations
          rowHeight={52}
          columnHeaderHeight={56}
          density="standard"
          disableColumnResize
          disableColumnReorder
          hideFooterSelectedRowCount
          slots={{
            toolbar: CustomToolbar,
            noRowsOverlay: () => <EmptyContent title="No users available" />,
            noResultsOverlay: () => <EmptyContent title="No results found" />,
          }}
          slotProps={{
            toolbar: toolbarProps,
            panel: panelProps,
          }}
          sx={dataGridSx}
        />
      </Card>
      
      {selectedUsers.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Selected users: {selectedUsers.length} ({selectedUsers.join(', ')})
          </Typography>
        </Box>
      )}

      {/* Add Users Dialog */}
      <AddUsersDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddUsers}
      />

      {/* Add Label Dialog */}
      <AddLabelDialog
        open={addLabelDialogOpen}
        onClose={() => setAddLabelDialogOpen(false)}
        selectedUsers={selectedUsers}
        users={users}
        onLabelsAdded={handleLabelsAdded}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        selectedUsers={selectedUsers}
        onConfirm={handleDeleteUsers}
      />

      {/* Reset Labels Confirmation Dialog */}
      <Dialog
        open={resetLabelsDialogOpen}
        onClose={() => setResetLabelsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Reset User Labels
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to reset all labels for user{' '}
            <strong>{userToResetLabels?.nickname}</strong> (UID: {userToResetLabels?.uid})?
          </Typography>
          {userToResetLabels?.labels && userToResetLabels.labels.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Current labels: {userToResetLabels.labels.join(', ')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetLabelsDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleResetLabels(userToResetLabels?.uid);
              setResetLabelsDialogOpen(false);
            }}
            variant="contained"
            color="warning"
          >
            Reset Labels
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

// Add display name for debugging
UsersDataGrid.displayName = 'UsersDataGrid';

export default UsersDataGrid; 