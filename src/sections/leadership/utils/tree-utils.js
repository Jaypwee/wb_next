
// Create a new node template
export function createNewNode(data = {}) {
  return {
    name: data.name || 'New Person',
    role: data.role || 'Employee',
    group: data.group || 'technology',
    avatarUrl: data.avatarUrl || '',
    children: data.children || undefined,
    ...data,
  };
}

// Generate path for each node in the tree (for identification)
export function addPathsToTree(tree, path = []) {
  const nodeWithPath = {
    ...tree,
    path: [...path],
    pathString: path.join('.'),
  };

  if (tree.children && tree.children.length > 0) {
    nodeWithPath.children = tree.children.map((child, index) =>
      addPathsToTree(child, [...path, index])
    );
  }

  return nodeWithPath;
}

// Find a node by path
export function findNodeByPath(tree, targetPath) {
  if (!targetPath || targetPath.length === 0) {
    return tree;
  }

  let current = tree;
  for (const index of targetPath) {
    if (!current.children || !current.children[index]) {
      return null;
    }
    current = current.children[index];
  }
  return current;
}

// Add a child node to a specific path
export function addChildNode(tree, parentPath, newNodeData) {
  const treeClone = JSON.parse(JSON.stringify(tree));
  const parentNode = findNodeByPath(treeClone, parentPath);
  
  if (!parentNode) {
    throw new Error('Parent node not found');
  }

  const newNode = createNewNode({
    ...newNodeData,
    group: newNodeData.group || parentNode.group, // Inherit group from parent
  });

  if (!parentNode.children) {
    parentNode.children = [];
  }
  
  parentNode.children.push(newNode);
  return treeClone;
}

// Add a sibling node (add to parent's children array)
export function addSiblingNode(tree, siblingPath, newNodeData) {
  if (!siblingPath || siblingPath.length === 0) {
    throw new Error('Cannot add sibling to root node');
  }

  const treeClone = JSON.parse(JSON.stringify(tree));
  const parentPath = siblingPath.slice(0, -1);
  const siblingIndex = siblingPath[siblingPath.length - 1];
  
  const parentNode = findNodeByPath(treeClone, parentPath);
  
  if (!parentNode || !parentNode.children) {
    throw new Error('Parent node not found or has no children');
  }

  const siblingNode = parentNode.children[siblingIndex];
  const newNode = createNewNode({
    ...newNodeData,
    group: newNodeData.group || siblingNode.group, // Inherit group from sibling
  });

  // Insert after the sibling
  parentNode.children.splice(siblingIndex + 1, 0, newNode);
  return treeClone;
}

// Remove a node by path
export function removeNode(tree, targetPath) {
  if (!targetPath || targetPath.length === 0) {
    throw new Error('Cannot remove root node');
  }

  const treeClone = JSON.parse(JSON.stringify(tree));
  const parentPath = targetPath.slice(0, -1);
  const nodeIndex = targetPath[targetPath.length - 1];
  
  const parentNode = findNodeByPath(treeClone, parentPath);
  
  if (!parentNode || !parentNode.children) {
    throw new Error('Parent node not found or has no children');
  }

  parentNode.children.splice(nodeIndex, 1);
  return treeClone;
}

// Update a node by path
export function updateNode(tree, targetPath, updateData) {
  const treeClone = JSON.parse(JSON.stringify(tree));
  const targetNode = findNodeByPath(treeClone, targetPath);
  
  if (!targetNode) {
    throw new Error('Target node not found');
  }

  Object.assign(targetNode, updateData);
  return treeClone;
}

// Get node statistics
export function getTreeStats(tree) {
  let totalNodes = 0;
  let maxDepth = 0;

  function traverse(node, depth = 0) {
    totalNodes++;
    maxDepth = Math.max(maxDepth, depth);
    
    if (node.children) {
      node.children.forEach(child => traverse(child, depth + 1));
    }
  }

  traverse(tree);
  
  return { totalNodes, maxDepth };
} 