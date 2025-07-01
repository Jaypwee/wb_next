'use client'

import { useState, useEffect, useTransition } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Loading from 'src/app/loading';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';
import { fetchLeadership, updateLeadership } from 'src/services/home';

import { toast } from 'src/components/snackbar';
import { OrganizationalChart } from 'src/components/organizational-chart';

import { GroupNode } from './components/group-node';
import { AddNodeDialog } from './components/add-node-dialog';
import { 
  removeNode, 
  updateNode, 
  addChildNode, 
  addPathsToTree,
  addSiblingNode
} from './utils/tree-utils';

// Utility function to remove paths from tree data before sending to API
const removePathsFromTree = (tree) => {
  if (!tree) return tree;
  
  const cleanTree = { ...tree };
  
  // Remove path-related properties
  delete cleanTree.path;
  delete cleanTree.pathString;
  
  // Recursively clean children
  if (cleanTree.children && cleanTree.children.length > 0) {
    cleanTree.children = cleanTree.children.map(child => removePathsFromTree(child));
  }
  
  return cleanTree;
};

// ----------------------------------------------------------------------

export function LeadershipView() {
  // State for tree data with paths
  const [treeData, setTreeData] = useState(null);
  const [isPending, startTransition] = useTransition();
  
  // Dialog state
  const [dialogState, setDialogState] = useState({
    open: false,
    mode: 'child', // 'child', 'sibling', or 'edit'
    targetPath: [],
    parentName: '',
    defaultGroup: 'technology',
    existingData: null, // For edit mode
  });

  // Fetch leadership data on component mount
  useEffect(() => {
    const loadLeadershipData = async () => {
      startTransition(async () => {
        try {
          const leadershipData = await fetchLeadership();
          
          // If no data exists in the database, use the default GROUP_DATA
          const dataToUse = leadershipData;
          const treeWithPaths = addPathsToTree(dataToUse);
          setTreeData(treeWithPaths);
        } catch (error) {
          console.error('Error fetching leadership data:', error);
          toast.error('Failed to load leadership data. Please reload the page.');
        }
      });
    };

    loadLeadershipData();
  }, []);

  // Handle adding a child node
  const handleAddChild = (path, nodeInfo) => {
    setDialogState({
      open: true,
      mode: 'child',
      targetPath: path,
      parentName: nodeInfo.name,
      defaultGroup: nodeInfo.group,
    });
  };

  // Handle adding a sibling node
  const handleAddSibling = (path, nodeInfo) => {
    setDialogState({
      open: true,
      mode: 'sibling',
      targetPath: path,
      parentName: nodeInfo.name,
      defaultGroup: nodeInfo.group,
    });
  };

  // Handle edit person
  const handleEditPerson = (path, nodeInfo) => {
    console.log('Edit person:', nodeInfo);
    setDialogState({
      open: true,
      mode: 'edit',
      targetPath: path,
      parentName: '', // Not needed for edit
      defaultGroup: nodeInfo.group,
      existingData: {
        name: nodeInfo.name,
        uid: nodeInfo.uid || '',
        role: nodeInfo.role,
        group: nodeInfo.group,
      },
    });
  };

  // Handle delete person
  const handleDeletePerson = async (path, nodeInfo) => {
    startTransition(async () => {
      try {
        const updatedTree = removeNode(treeData, path);
        const treeWithPaths = addPathsToTree(updatedTree);
        setTreeData(treeWithPaths);
        
        // Update the database with clean tree structure (no paths)
        const cleanTreeData = removePathsFromTree(treeWithPaths);
        await makeAuthenticatedRequest(() => updateLeadership(cleanTreeData));
        toast.success(`Successfully removed ${nodeInfo.name}`);
      } catch (error) {
        console.error('Error deleting node:', error);
        toast.error('Failed to delete person');
      }
    });
  };

  const handleAddNode = async (newNodeData) => {
    startTransition(async () => {
      try {
        // Get the updated tree data
        let updatedTree;
        
        if (dialogState.mode === 'edit') {
          // For edit mode, we need to update the existing node
          updatedTree = updateNode(treeData, dialogState.targetPath, newNodeData);
        } else if (dialogState.mode === 'child') {
          updatedTree = addChildNode(treeData, dialogState.targetPath, newNodeData);
        } else {
          updatedTree = addSiblingNode(treeData, dialogState.targetPath, newNodeData);
        }
        
        // Add paths to the updated tree
        const treeWithPaths = addPathsToTree(updatedTree);
        setTreeData(treeWithPaths);
        
        // Update the database with clean tree structure (no paths)
        const cleanTreeData = removePathsFromTree(treeWithPaths);
        await makeAuthenticatedRequest(() => updateLeadership(cleanTreeData));
        
      } catch (error) {
        console.error('Error updating node:', error);
        toast.error('Failed to update leadership');
      }
    });
  }

  // Close dialog
  const handleCloseDialog = () => {
    setDialogState(prev => ({ ...prev, open: false }));
  };

  // Show loading state while fetching initial data or if no tree data
  if (!treeData) {
    return (
      <Loading />
    );
  }

  return (
    <Container maxWidth="fit-content" sx={{ py: 3, minHeight: '100vh' }}>
      <Box
        sx={{
          paddingTop: 4,
          display: 'flex',
          justifyContent: 'center',
          overflowX: 'auto',
          overflowY: 'visible',
          minWidth: 'fit-content',
          opacity: isPending ? 0.7 : 1,
          transition: 'opacity 0.2s ease-in-out',
        }}
      >
        <OrganizationalChart 
          lineHeight="64px"
          data={treeData} 
          nodeItem={(props) => (
            <GroupNode 
              {...props}
              path={props.path}
              onAddChild={handleAddChild}
              onAddSibling={handleAddSibling}
              onEdit={handleEditPerson}
              onDelete={handleDeletePerson}
              disabled={isPending}
            />
          )} 
        />
      </Box>

      <AddNodeDialog
        open={dialogState.open}
        onClose={handleCloseDialog}
        onAddNode={handleAddNode}
        mode={dialogState.mode}
        parentName={dialogState.parentName}
        defaultGroup={dialogState.defaultGroup}
        existingData={dialogState.existingData}
        disabled={isPending}
      />
    </Container>
  );
}
