'use client';

import { useState } from 'react';

import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export function CustomDropdown({ 
  options = [], 
  initialValue = '', 
  onChange 
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedValue, setSelectedValue] = useState(initialValue);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (value) => {
    setSelectedValue(value);
    onChange?.(value);
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          width: '200px',
          justifyContent: 'space-between',
          textTransform: 'none'
        }}
      >
        {selectedValue}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: '200px',
            maxHeight: 300
          }
        }}
      >
        {options.map((option) => (
          <MenuItem 
            key={option} 
            onClick={() => handleSelect(option)}
            sx={{
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
} 