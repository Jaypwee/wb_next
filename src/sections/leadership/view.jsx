'use client'

import { useRef, useState, useEffect, useTransition } from 'react';

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
  
  // Drag-to-scroll state
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  
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

  // Drag-to-scroll event handlers
  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    });
    setScrollStart({
      x: scrollContainerRef.current.scrollLeft,
      y: scrollContainerRef.current.scrollTop,
    });
    
    // Prevent text selection while dragging
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    scrollContainerRef.current.scrollLeft = scrollStart.x - deltaX;
    scrollContainerRef.current.scrollTop = scrollStart.y - deltaY;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart, scrollStart]);

  // Center the chart initially when tree data is loaded
  useEffect(() => {
    if (treeData && scrollContainerRef.current) {
      // Use a small timeout to ensure the chart is fully rendered
      const timer = setTimeout(() => {
        const container = scrollContainerRef.current;
        if (container) {
          // Calculate center position
          const centerX = (container.scrollWidth - container.clientWidth) / 2;
          const centerY = (container.scrollHeight - container.clientHeight) / 2;
          
          // Scroll to center
          container.scrollTo({
            left: centerX,
            top: centerY,
            behavior: 'smooth'
          });
        }
      }, 100); // Small delay to ensure rendering is complete

      return () => clearTimeout(timer);
    }
    
    return undefined;
  }, [treeData]);

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
        roleKorean: nodeInfo.roleKorean,
        roleEnglish: nodeInfo.roleEnglish,
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
    <Container maxWidth={false} sx={{ py: 3, minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Box
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        sx={{
          paddingTop: 4,
          overflowX: 'auto',
          overflowY: 'visible',
          height: '100vh',
          opacity: isPending ? 0.7 : 1,
          transition: 'opacity 0.2s ease-in-out',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          // Hide scrollbar while keeping scroll functionality
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // Internet Explorer 10+
          '&::-webkit-scrollbar': {
            display: 'none', // Safari and Chrome
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            minWidth: 'fit-content',
            width: '100%',
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
