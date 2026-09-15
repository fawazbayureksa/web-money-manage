import React from 'react';
import {
  VStack,
  Field,
  Input,
} from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import BaseModal from '../BaseModal';

export default function CategoryModal({
  open,
  onOpenChange,
  categoryName,
  setCategoryName,
  description,
  setDescription,
  onAddCategory,
  loading
}) {
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

  const handleClose = () => {
    onOpenChange({ open: false });
  };

  return (
    <BaseModal
      isOpen={open}
      onClose={handleClose}
      title="Create New Category"
      confirmText="Create Category"
      onConfirm={onAddCategory}
      isLoading={loading}
    >
      <VStack gap={4}>
        <Field.Root required w="full">
          <Field.Label fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color={subtitleColor} mb={1.5}>
            Category Name <Field.RequiredIndicator />
          </Field.Label>
          <Input
            placeholder="e.g., Food & Dining, Travel, Utilities"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            borderRadius="xl"
            size="md"
          />
        </Field.Root>

        <Field.Root w="full">
          <Field.Label fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color={subtitleColor} mb={1.5}>
            Description
          </Field.Label>
          <Input
            placeholder="Brief description of this category"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            borderRadius="xl"
            size="md"
          />
        </Field.Root>
      </VStack>
    </BaseModal>
  );
}
