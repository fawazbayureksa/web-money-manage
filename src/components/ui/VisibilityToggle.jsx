import React from 'react';
import { IconButton } from '@chakra-ui/react';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import { Tooltip } from './tooltip';

export function VisibilityToggle({ isHidden, onToggle, size = 'sm', ...props }) {
  return (
    <Tooltip content={isHidden ? 'Show values' : 'Hide values'}>
      <IconButton
        onClick={onToggle}
        variant="ghost"
        aria-label={isHidden ? 'Show values' : 'Hide values'}
        size={size}
        {...props}
      >
        {isHidden ? <LuEyeOff /> : <LuEye />}
      </IconButton>
    </Tooltip>
  );
}
