import React, { useEffect } from 'react';
import {
  Portal,
  Box,
  IconButton,
  Button,
  VStack,
  Text
} from '@chakra-ui/react';
import { FiX } from 'react-icons/fi';

export const BottomSheet = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
  }, []);

  if (!isOpen) return null;

  const heights = {
    sm: '40%',
    md: '60%',
    lg: '80%',
    full: '90%'
  };

  return (
    <Portal>
      <Box
        position="fixed"
        inset={0}
        bg="blackAlpha.600"
        zIndex="overlay"
        onClick={onClose}
      />
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg={{ base: 'white', _dark: 'gray.800' }}
        borderTopRadius="20px"
        boxShadow="0 -4px 20px rgba(0,0,0,0.15)"
        zIndex="modal"
        maxH={heights[size]}
        overflow="auto"
        animation="slideUp 0.3s ease-out"
      >
        <Box
          position="sticky"
          top={0}
          bg={{ base: 'white', _dark: 'gray.800' }}
          pt={4}
          pb={3}
          px={6}
          borderBottom="1px solid"
          borderColor="gray.200"
          _dark={{ borderColor: 'gray.700' }}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box
            w="12"
            h="1"
            bg="gray.300"
            borderRadius="full"
            position="absolute"
            top={2}
            left="50%"
            transform="translateX(-50%)"
          />
          <Text fontWeight="bold" fontSize="lg">
            {title}
          </Text>
          <IconButton
            icon={<FiX />}
            onClick={onClose}
            variant="ghost"
            size="sm"
            aria-label="Close"
          />
        </Box>
        <Box p={6}>
          {children}
        </Box>
      </Box>
    </Portal>
  );
};
