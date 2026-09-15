import React from 'react';
import {
  Dialog,
  Portal,
  CloseButton,
  Button,
  HStack,
} from '@chakra-ui/react';
import { useColorModeValue } from './ui/color-mode';

export default function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onConfirm,
  confirmText = 'Save',
  cancelText = 'Cancel',
  isLoading = false,
  hideFooter = false,
  size = 'md',
  isDestructive = false,
}) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const cancelBtnColor = useColorModeValue('gray.600', 'gray.300');
  const cancelBtnHoverBg = useColorModeValue('gray.100', 'gray.700');

  // We use open and onOpenChange for chakra-ui v3 Dialog
  const handleOpenChange = (e) => {
    if (!e.open && onClose) {
      onClose();
    }
  };

  return (
    <Dialog.Root lazyMount open={isOpen} onOpenChange={handleOpenChange}>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.400" backdropFilter="blur(4px)" />
        <Dialog.Positioner>
          <Dialog.Content
            borderRadius="2xl"
            bg={cardBg}
            maxW={size}
            p={{ base: 4, md: 6 }}
            shadow="xl"
            border="1px solid"
            borderColor={borderColor}
          >
            <Dialog.Header pb={4}>
              <Dialog.Title fontSize="xl" fontWeight="bold">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description mt={2} color={useColorModeValue('gray.600', 'gray.400')}>
                  {description}
                </Dialog.Description>
              )}
            </Dialog.Header>
            
            <Dialog.Body py={4}>
              {children}
            </Dialog.Body>

            {!hideFooter && (
              <Dialog.Footer pt={4}>
                <HStack justify="flex-end" gap={3} w="full">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={isLoading}
                    color={cancelBtnColor}
                    _hover={{ bg: cancelBtnHoverBg }}
                    borderRadius="xl"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    onClick={onConfirm}
                    variant={isDestructive ? 'solid' : 'primary'}
                    loading={isLoading}
                    colorPalette={isDestructive ? 'red' : 'blue'}
                    borderRadius="xl"
                    fontWeight="600"
                  >
                    {confirmText}
                  </Button>
                </HStack>
              </Dialog.Footer>
            )}

            <Dialog.CloseTrigger asChild>
              <CloseButton 
                size="sm" 
                position="absolute" 
                top={4} 
                right={4} 
                color={cancelBtnColor}
                _hover={{ bg: cancelBtnHoverBg }}
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
